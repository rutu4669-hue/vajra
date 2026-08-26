'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bot, X, Send, User, Navigation, Sparkles, Mic, MicOff, Volume2, VolumeX, PlayCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'

// ── Types ──────────────────────────────────────────────────────────────────────
interface Message {
  id: number
  type: string
  text: string
  isNav?: boolean
  isVoice?: boolean
}

type VoiceState = 'idle' | 'wake-listening' | 'awake' | 'command-listening' | 'processing'

// ── Navigation Routes ──────────────────────────────────────────────────────────
const NAV_ROUTES: { keywords: string[]; path: string; label: string }[] = [
  { keywords: ['dashboard', 'home', 'main', 'overview', 'start'], path: '/', label: 'Dashboard' },
  { keywords: ['threat intelligence', 'threat intel', 'intelligence'], path: '/threat-intelligence', label: 'Threat Intelligence' },
  { keywords: ['actors', 'threat actors', 'active actors'], path: '/threat-intelligence/actors', label: 'Top Active Threat Actors' },
  { keywords: ['industries', 'targeted industries', 'industry'], path: '/threat-intelligence/industries', label: 'Most Targeted Industries' },
  { keywords: ['ransomware', 'ransom', 'ransomware live'], path: '/ransomware', label: 'Ransomware Live' },
  { keywords: ['alerts', 'alert', 'security alerts'], path: '/alerts', label: 'Security Alerts' },
  { keywords: ['executive summary', 'executive', 'summary', 'exec summary'], path: '/executive-summary', label: 'Executive Summary' },
  { keywords: ['settings', 'setting', 'config', 'configuration'], path: '/settings', label: 'Settings' },
  { keywords: ['admin', 'admin panel', 'administration'], path: '/admin', label: 'Admin Panel' },
]

const NAV_PREFIXES = [
  'go to', 'navigate to', 'open', 'show me', 'take me to', 'show', 'launch',
  'switch to', 'load', 'bring up', 'head to', 'i want to see', 'take me',
]

function detectNavIntent(text: string): { path: string; label: string } | null {
  const lower = text.toLowerCase().trim()
  for (const route of NAV_ROUTES) {
    for (const kw of route.keywords) {
      for (const prefix of NAV_PREFIXES) {
        if (lower.includes(`${prefix} ${kw}`) || lower === `${prefix} ${kw}`) {
          return { path: route.path, label: route.label }
        }
      }
      if (lower === kw || lower === `the ${kw}`) {
        return { path: route.path, label: route.label }
      }
    }
  }
  return null
}

const WAKE_WORDS = [
  // "hey" variants
  'hey phoenix', 'hey phenix', 'hey pheonix', 'hey fenix',
  // "hi" variants
  'hi phoenix', 'hi phenix', 'hi pheonix', 'hi fenix',
  // "hello" variants
  'hello phoenix', 'hello phenix',
  // "ok / okay" variants
  'ok phoenix', 'okay phoenix',
  // bare name
  'phoenix',
]

// ── Stop command detection ────────────────────────────────────────────────────
const STOP_WORDS = [
  'stop', 'stop it', 'stop talking', 'stop speaking', 'be quiet',
  'quiet', 'silence', 'shut up', 'enough', 'cancel', 'pause',
]
function isStopCommand(text: string): boolean {
  const lower = text.toLowerCase().trim()
  return STOP_WORDS.some(sw => lower === sw || lower.startsWith(sw + ' '))
}

const QUICK_COMMANDS = [
  { label: '🏠 Dashboard', cmd: 'Go to dashboard' },
  { label: '⚡ Alerts', cmd: 'Open alerts' },
  { label: '🦠 Ransomware', cmd: 'Show ransomware' },
  { label: '🎯 Threat Intel', cmd: 'Go to threat intelligence' },
  { label: '📊 Executive', cmd: 'Show executive summary' },
  { label: '⚙️ Settings', cmd: 'Go to settings' },
]

// ── Strip markdown for TTS ────────────────────────────────────────────────────
function stripMarkdownForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, 'code block omitted')  // code blocks
    .replace(/`([^`]+)`/g, '$1')                        // inline code
    .replace(/\*\*([^*]+)\*\*/g, '$1')                  // bold
    .replace(/\*([^*]+)\*/g, '$1')                      // italic
    .replace(/^#{1,6}\s+/gm, '')                        // headers
    .replace(/^[-*•]\s+/gm, '')                         // bullets
    .replace(/^\d+\.\s+/gm, '')                         // numbered lists
    .replace(/^>\s+/gm, '')                             // blockquotes
    .replace(/---+/g, '')                               // hr
    .replace(/\n{2,}/g, '. ')                           // double newlines to pause
    .replace(/\n/g, ' ')                                // single newlines
    .replace(/✈️|🎙️|🏠|⚡|🦠|🎯|📊|⚙️|👋/g, '')       // emojis
    .trim()
}

// ── TTS Engine ────────────────────────────────────────────────────────────────
let ttsVoice: SpeechSynthesisVoice | null = null

function loadPreferredVoice() {
  if (typeof window === 'undefined') return
  const voices = window.speechSynthesis.getVoices()
  // Prefer a high-quality English female/neutral voice
  const preferred = [
    'Google UK English Female',
    'Google US English',
    'Microsoft Zira - English (United States)',
    'Microsoft Jenny Online (Natural) - English (United States)',
    'Samantha',
    'Karen',
    'Google UK English Male',
  ]
  for (const name of preferred) {
    const match = voices.find(v => v.name === name)
    if (match) { ttsVoice = match; return }
  }
  // Fallback: first English voice
  ttsVoice = voices.find(v => v.lang.startsWith('en')) || null
}

function speakText(text: string, onStart?: () => void, onEnd?: () => void) {
  if (typeof window === 'undefined') return
  window.speechSynthesis.cancel()
  const clean = stripMarkdownForSpeech(text)
  if (!clean) return

  // Chunk into sentences to avoid SpeechSynthesis cutting off long text
  const sentences = clean.match(/[^.!?]+[.!?]*/g) || [clean]
  let idx = 0

  const speakNext = () => {
    if (idx >= sentences.length) { onEnd?.(); return }
    const utterance = new SpeechSynthesisUtterance(sentences[idx].trim())
    if (ttsVoice) utterance.voice = ttsVoice
    utterance.rate = 0.95
    utterance.pitch = 1.05
    utterance.volume = 1
    utterance.lang = 'en-US'
    if (idx === 0) utterance.onstart = () => onStart?.()
    utterance.onend = () => { idx++; speakNext() }
    utterance.onerror = () => { idx++; speakNext() }
    window.speechSynthesis.speak(utterance)
  }

  speakNext()
}

// ── Markdown Renderer ─────────────────────────────────────────────────────────
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.trim() === '') { elements.push(<div key={`gap-${i}`} className="h-1" />); i++; continue }
    if (line.startsWith('# ')) { elements.push(<h1 key={i} className="text-sm font-bold text-foreground mb-1 mt-1 border-b border-border/40 pb-1">{inlineFormat(line.slice(2))}</h1>); i++; continue }
    if (line.startsWith('## ')) { elements.push(<h2 key={i} className="text-xs font-bold text-primary mb-1 mt-2">{inlineFormat(line.slice(3))}</h2>); i++; continue }
    if (line.startsWith('### ')) { elements.push(<h3 key={i} className="text-xs font-semibold text-accent mb-0.5 mt-1.5">{inlineFormat(line.slice(4))}</h3>); i++; continue }
    if (line.startsWith('```')) {
      const codeLines: string[] = []; i++
      while (i < lines.length && !lines[i].startsWith('```')) { codeLines.push(lines[i]); i++ }
      elements.push(<pre key={`code-${i}`} className="bg-background/80 border border-border/60 rounded-md p-2.5 my-1.5 overflow-x-auto"><code className="text-[10px] font-mono text-success leading-relaxed">{codeLines.join('\n')}</code></pre>)
      i++; continue
    }
    if (/^[-*•] /.test(line)) {
      const bullets: string[] = []
      while (i < lines.length && /^[-*•] /.test(lines[i])) { bullets.push(lines[i].replace(/^[-*•] /, '')); i++ }
      elements.push(<ul key={`ul-${i}`} className="space-y-0.5 my-1 pl-1">{bullets.map((b, bi) => (<li key={bi} className="flex items-start gap-1.5 text-[11px] text-secondary leading-relaxed"><span className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" /><span>{inlineFormat(b)}</span></li>))}</ul>)
      continue
    }
    if (/^\d+\. /.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, '')); i++ }
      elements.push(<ol key={`ol-${i}`} className="space-y-0.5 my-1 pl-1">{items.map((item, idx) => (<li key={idx} className="flex items-start gap-2 text-[11px] text-secondary leading-relaxed"><span className="text-[9px] font-bold text-primary bg-primary/10 rounded w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">{idx + 1}</span><span>{inlineFormat(item)}</span></li>))}</ol>)
      continue
    }
    if (line.startsWith('> ')) { elements.push(<blockquote key={i} className="border-l-2 border-primary/60 pl-2.5 my-1 text-[11px] text-secondary italic">{inlineFormat(line.slice(2))}</blockquote>); i++; continue }
    if (/^---+$/.test(line.trim())) { elements.push(<hr key={i} className="border-border/40 my-2" />); i++; continue }
    elements.push(<p key={i} className="text-[11px] text-secondary leading-relaxed">{inlineFormat(line)}</p>)
    i++
  }
  return <div className="space-y-0.5">{elements}</div>
}

function inlineFormat(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g
  let last = 0; let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const token = match[0]
    if (token.startsWith('**')) parts.push(<strong key={match.index} className="font-semibold text-foreground">{token.slice(2, -2)}</strong>)
    else if (token.startsWith('`')) parts.push(<code key={match.index} className="bg-background/80 border border-border/50 px-1 py-0.5 rounded text-[10px] font-mono text-primary">{token.slice(1, -1)}</code>)
    else if (token.startsWith('*')) parts.push(<em key={match.index} className="italic text-secondary">{token.slice(1, -1)}</em>)
    last = match.index + token.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length === 0 ? text : <>{parts}</>
}

function getVoiceLabel(state: VoiceState): string {
  switch (state) {
    case 'wake-listening': return 'Listening for "Hey Phoenix"...'
    case 'awake': return 'Phoenix is awake! Speak your command...'
    case 'command-listening': return 'Listening...'
    case 'processing': return 'Processing...'
    default: return ''
  }
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PhoenixButton() {
  const pathname = usePathname()
  
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [ttsSupported, setTtsSupported] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(true)       // TTS on by default
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speakingMsgId, setSpeakingMsgId] = useState<number | null>(null)
  const [interimText, setInterimText] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      text: "Hi! I'm **phoenix** — your AI assistant.\n\nAsk me anything about cybersecurity, or use navigation commands:\n- **\"go to dashboard\"**\n- **\"open alerts\"**\n- **\"show ransomware\"**\n\nSay **\"Hey Phoenix\"** to wake me with your voice, and I'll respond out loud! 🎙️",
      isNav: false,
    }
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const wakeRecognitionRef = useRef<any>(null)
  const commandRecognitionRef = useRef<any>(null)
  const wakeTimeoutRef = useRef<any>(null)
  const isAwakeRef = useRef(false)
  const ttsEnabledRef = useRef(true)
  const isSpeakingRef = useRef(false)

  // Keep refs in sync with state
  useEffect(() => { ttsEnabledRef.current = ttsEnabled }, [ttsEnabled])
  useEffect(() => { isSpeakingRef.current = isSpeaking }, [isSpeaking])

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SR) setVoiceSupported(true)
    if ('speechSynthesis' in window) {
      setTtsSupported(true)
      // Load voices (they load async in some browsers)
      loadPreferredVoice()
      window.speechSynthesis.onvoiceschanged = loadPreferredVoice
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom() }, [messages, isLoading, interimText])

  // ── TTS: Speak a bot reply ───────────────────────────────────────────────────
  const speakReply = useCallback((text: string, msgId: number) => {
    if (!ttsEnabledRef.current || typeof window === 'undefined') return
    setSpeakingMsgId(msgId)
    setIsSpeaking(true)
    speakText(
      text,
      () => { setSpeakingMsgId(msgId); setIsSpeaking(true) },
      () => { setIsSpeaking(false); setSpeakingMsgId(null) }
    )
  }, [])

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined') window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setSpeakingMsgId(null)
  }, [])

  // ── Stop all voice ───────────────────────────────────────────────────────────
  const stopAll = useCallback(() => {
    try { wakeRecognitionRef.current?.stop() } catch {}
    try { commandRecognitionRef.current?.stop() } catch {}
    clearTimeout(wakeTimeoutRef.current)
    isAwakeRef.current = false
    setVoiceState('idle')
    setInterimText('')
  }, [])

  // ── Process spoken command ───────────────────────────────────────────────────
  const processSpeechCommand = useCallback(async (text: string) => {
    if (!text.trim()) return
    stopAll()
    setVoiceState('processing')
    setInterimText('')

    const voiceMsg: Message = { id: Date.now(), type: 'user', text, isNav: false, isVoice: true }
    setMessages(prev => [...prev, voiceMsg])
    setIsLoading(true)

    const navMatch = detectNavIntent(text)
    if (navMatch) {
      await new Promise(r => setTimeout(r, 300))
      const navReply = `Navigating to ${navMatch.label}`
      const replyId = Date.now() + 1
      const replyMsg: Message = { id: replyId, type: 'bot', text: `✈️ Navigating to **${navMatch.label}**...`, isNav: true }
      setMessages(prev => [...prev, replyMsg])
      setIsLoading(false)
      setVoiceState('idle')
      speakReply(navReply, replyId)
      setTimeout(() => { router.push(navMatch.path); setIsOpen(false) }, 900)
      return
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vajra-9pjh.onrender.com'
      const response = await fetch(`${API_URL}/api/ai/cloudsec-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      })
      const data = await response.json()
      const replyText = response.ok
        ? (data.response || data.answer || data.message || 'No response received')
        : `Error: ${data.detail || 'Failed to get response'}`
      const replyId = Date.now() + 1
      setMessages(prev => [...prev, { id: replyId, type: 'bot', text: replyText, isNav: false }])
      speakReply(replyText, replyId)
    } catch (err) {
      const errText = `Connection error: ${err instanceof Error ? err.message : 'Failed to connect'}`
      const replyId = Date.now() + 1
      setMessages(prev => [...prev, { id: replyId, type: 'bot', text: `**Connection Error:** ${err instanceof Error ? err.message : 'Failed to connect'}`, isNav: false }])
      speakReply(errText, replyId)
    } finally {
      setIsLoading(false)
      setVoiceState('idle')
    }
  }, [router, speakReply, stopSpeaking])

  // ── Start command listener ───────────────────────────────────────────────────
  const startCommandListener = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const recognition = new SR()
    commandRecognitionRef.current = recognition
    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    setVoiceState('command-listening')
    setInterimText('')

    recognition.onresult = (event: any) => {
      let interim = ''; let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) final += t
        else interim += t
      }
      setInterimText(interim || final)
      if (final) {
        // ── Stop command: cancel TTS immediately ───────────────────────────
        if (isStopCommand(final.trim())) {
          try { recognition.stop() } catch {}
          clearTimeout(wakeTimeoutRef.current)
          isAwakeRef.current = false
          setVoiceState('idle')
          setInterimText('')
          stopSpeaking()
          if (voiceEnabled) setTimeout(() => startWakeWordListener(), 400)
          return
        }
        processSpeechCommand(final.trim())
      }
    }
    recognition.onerror = () => { setVoiceState('idle'); setInterimText('') }
    recognition.onend = () => { if (isAwakeRef.current) { setVoiceState('idle'); setInterimText('') } }

    wakeTimeoutRef.current = setTimeout(() => {
      try { recognition.stop() } catch {}
      setVoiceState('idle'); setInterimText('')
    }, 8000)

    recognition.start()
  }, [processSpeechCommand, stopSpeaking])

  // ── Start wake word listener ─────────────────────────────────────────────────
  const startWakeWordListener = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    try { wakeRecognitionRef.current?.stop() } catch {}
    const recognition = new SR()
    wakeRecognitionRef.current = recognition
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 3

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim()

        // ── Stop command: cancel TTS even while passively listening ────────
        if (isStopCommand(transcript) && isSpeakingRef.current) {
          stopSpeaking()
          return
        }

        // ── Wake word detection ────────────────────────────────────────────
        if (WAKE_WORDS.some(w => transcript.includes(w)) && !isAwakeRef.current) {
          isAwakeRef.current = true
          try { recognition.stop() } catch {}
          setIsOpen(true)
          setVoiceState('awake')
          speakText("Yes? I'm listening.")
          setTimeout(() => { if (isAwakeRef.current) startCommandListener() }, 1200)
          return
        }
      }
    }
    recognition.onerror = (e: any) => {
      if (e.error !== 'aborted') setTimeout(() => { if (voiceEnabled) startWakeWordListener() }, 1500)
    }
    recognition.onend = () => {
      if (!isAwakeRef.current) setTimeout(() => { if (voiceEnabled) startWakeWordListener() }, 500)
    }

    setVoiceState('wake-listening')
    try { recognition.start() } catch {}
  }, [startCommandListener, voiceEnabled])

  // ── Toggle mic wake word ─────────────────────────────────────────────────────
  const toggleVoice = useCallback(() => {
    if (voiceEnabled) {
      stopAll(); setVoiceEnabled(false)
    } else {
      setVoiceEnabled(true)
    }
  }, [voiceEnabled, stopAll])

  useEffect(() => {
    if (voiceEnabled) startWakeWordListener()
    return () => { if (!voiceEnabled) stopAll() }
  }, [voiceEnabled, startWakeWordListener, stopAll])

  useEffect(() => { return () => { stopAll() } }, [stopAll])

  // ── Text send ────────────────────────────────────────────────────────────────
  const sendTextMessage = async (text: string) => {
    if (!text.trim() || isLoading) return
    // Stop any playing TTS before sending
    stopSpeaking()

    const userMessage: Message = { id: Date.now(), type: 'user', text, isNav: false }
    setMessages(prev => [...prev, userMessage])
    setMessage('')
    setIsLoading(true)

    const navMatch = detectNavIntent(text)
    if (navMatch) {
      await new Promise(r => setTimeout(r, 350))
      const replyId = Date.now() + 1
      const replyMsg: Message = { id: replyId, type: 'bot', text: `✈️ Navigating to **${navMatch.label}**...`, isNav: true }
      setMessages(prev => [...prev, replyMsg])
      setIsLoading(false)
      speakReply(`Navigating to ${navMatch.label}`, replyId)
      setTimeout(() => { router.push(navMatch.path); setIsOpen(false) }, 700)
      return
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vajra-9pjh.onrender.com'
      const response = await fetch(`${API_URL}/api/ai/cloudsec-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      })
      const data = await response.json()
      const replyText = response.ok
        ? (data.response || data.answer || data.message || 'No response received')
        : `**Error:** ${data.detail || 'Failed to get response from AI'}`
      const replyId = Date.now() + 1
      setMessages(prev => [...prev, { id: replyId, type: 'bot', text: replyText, isNav: false }])
      speakReply(replyText, replyId)
    } catch (err) {
      const replyId = Date.now() + 1
      setMessages(prev => [...prev, { id: replyId, type: 'bot', text: `**Connection Error:** ${err instanceof Error ? err.message : 'Failed to connect'}`, isNav: false }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    stopSpeaking()
    setIsOpen(false)
    setMessages([{
      id: 1, type: 'bot',
      text: "Hi! I'm **phoenix** — your AI assistant.\n\nAsk me anything about cybersecurity, or use navigation commands:\n- **\"go to dashboard\"**\n- **\"open alerts\"**\n- **\"show ransomware\"**\n\nSay **\"Hey Phoenix\"** to wake me with your voice, and I'll respond out loud! 🎙️",
      isNav: false,
    }])
    setMessage(''); setInterimText('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendTextMessage(message) }
  }

  const handleMicClick = () => {
    if (voiceState === 'command-listening') {
      try { commandRecognitionRef.current?.stop() } catch {}
      setVoiceState('idle'); setInterimText('')
    } else {
      stopSpeaking()
      isAwakeRef.current = true
      try { wakeRecognitionRef.current?.stop() } catch {}
      startCommandListener()
    }
  }

  const handleReplaySpeech = (msg: Message) => {
    if (isSpeaking && speakingMsgId === msg.id) {
      stopSpeaking()
    } else {
      stopSpeaking()
      setTimeout(() => speakReply(msg.text, msg.id), 100)
    }
  }

  // Hide AI chat bot completely on login, signup, and authentication pages
  const isAuthPage = Boolean(
    pathname && (
      pathname === '/login' ||
      pathname === '/signup' ||
      pathname === '/register' ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/signup') ||
      pathname.startsWith('/register') ||
      pathname.startsWith('/auth')
    )
  )

  if (isAuthPage) {
    return null
  }

  const fabRing = voiceState === 'awake' || voiceState === 'command-listening'
    ? 'ring-4 ring-danger/60 ring-offset-2 ring-offset-transparent'
    : voiceState === 'wake-listening' ? 'ring-2 ring-success/40' : ''

  return (
    <>
      {/* Wake ambient ring */}
      {voiceState === 'wake-listening' && !isOpen && (
        <motion.div
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full border border-success/30 z-40"
          animate={{ scale: [1, 1.7, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
      )}

      {/* ── Stop Button (appears beside FAB when speaking) ────────────── */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.button
            key="stop-fab"
            initial={{ opacity: 0, scale: 0.5, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={stopSpeaking}
            title="Stop speaking"
            className="fixed bottom-6 right-24 z-50 flex items-center gap-2 bg-danger hover:bg-danger/80 text-white text-xs font-bold px-4 py-3 rounded-full shadow-lg transition-colors"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
          >
            {/* Animated sound bars */}
            <span className="flex gap-0.5 items-end h-4">
              {[1,2,3].map(n => (
                <motion.span
                  key={n}
                  className="w-0.5 bg-white/80 rounded-full"
                  animate={{ height: [`${4 + n * 2}px`, `${10 + n * 2}px`, `${4 + n * 2}px`] }}
                  transition={{ duration: 0.5 + n * 0.1, repeat: Infinity, delay: n * 0.1 }}
                />
              ))}
            </span>
            Stop
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => isOpen ? handleClose() : setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-glow glow-hover z-50 transition-all ${fabRing}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X className="w-6 h-6 text-white" />
          : isSpeaking ? <Volume2 className="w-6 h-6 text-white animate-pulse" />
          : voiceState === 'command-listening' || voiceState === 'awake' ? <Mic className="w-6 h-6 text-white animate-pulse" />
          : <Bot className="w-6 h-6 text-white" />
        }
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 w-[480px] bg-card border border-border rounded-2xl shadow-glow z-50 flex flex-col overflow-hidden"
            style={{ maxHeight: '78vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border flex-shrink-0 bg-card/95 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <motion.div
                    className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-glow"
                    animate={isSpeaking ? { boxShadow: ['0 0 0px rgba(99,102,241,0.4)', '0 0 20px rgba(99,102,241,0.7)', '0 0 0px rgba(99,102,241,0.4)'] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {isSpeaking
                      ? <Volume2 className="w-4 h-4 text-white animate-pulse" />
                      : voiceState === 'command-listening' || voiceState === 'awake'
                        ? <Mic className="w-4 h-4 text-white animate-pulse" />
                        : <Bot className="w-4 h-4 text-white" />
                    }
                  </motion.div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${isSpeaking ? 'bg-primary' : voiceState !== 'idle' ? 'bg-danger' : 'bg-success'} animate-pulse`} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm font-bold text-foreground">phoenix</h3>
                    <span className="text-[9px] font-semibold bg-primary/15 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-2 h-2" /> AI
                    </span>
                    {voiceEnabled && <span className="text-[9px] font-semibold bg-success/15 text-success border border-success/20 px-1.5 py-0.5 rounded-full flex items-center gap-1"><Mic className="w-2 h-2" /> Voice</span>}
                    {ttsEnabled && ttsSupported && <span className="text-[9px] font-semibold bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-full flex items-center gap-1"><Volume2 className="w-2 h-2" /> Audio</span>}
                  </div>
                  <p className="text-[10px] text-secondary">
                    {isSpeaking ? <span className="text-primary font-medium">🔊 Speaking...</span>
                      : voiceState !== 'idle' ? <span className="text-warning font-medium">{getVoiceLabel(voiceState)}</span>
                      : 'Navigation · Cybersecurity assistant'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* TTS toggle */}
                {ttsSupported && (
                  <button
                    onClick={() => { if (ttsEnabled) stopSpeaking(); setTtsEnabled(!ttsEnabled) }}
                    title={ttsEnabled ? 'Mute Phoenix audio' : 'Enable Phoenix audio responses'}
                    className={`p-1.5 rounded-lg transition-all ${ttsEnabled ? 'bg-primary/15 text-primary hover:bg-primary/25' : 'hover:bg-background text-secondary'}`}
                  >
                    {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  </button>
                )}
                {/* Mic wake toggle */}
                {voiceSupported && (
                  <button
                    onClick={toggleVoice}
                    title={voiceEnabled ? 'Disable "Hey Phoenix" wake word' : 'Enable "Hey Phoenix" wake word'}
                    className={`p-1.5 rounded-lg transition-all ${voiceEnabled ? 'bg-success/15 text-success hover:bg-success/25' : 'hover:bg-background text-secondary'}`}
                  >
                    {voiceEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  </button>
                )}
                <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-background transition-colors text-secondary hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Voice status bar */}
            <AnimatePresence>
              {(voiceState !== 'idle' && voiceState !== 'processing') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className={`flex-shrink-0 overflow-hidden ${voiceState === 'wake-listening' ? 'bg-success/5 border-b border-success/20' : voiceState === 'awake' ? 'bg-warning/5 border-b border-warning/20' : 'bg-danger/5 border-b border-danger/20'}`}
                >
                  <div className="px-4 py-2 flex items-center gap-2">
                    <div className="flex gap-0.5 items-end h-4">
                      {[1,2,3,4,5].map(n => (
                        <motion.div key={n}
                          className={`w-0.5 rounded-full ${voiceState === 'wake-listening' ? 'bg-success/60' : voiceState === 'awake' ? 'bg-warning/70' : 'bg-danger/70'}`}
                          animate={{ height: voiceState === 'command-listening' ? ['4px','14px','6px','16px','4px'] : ['4px','8px','4px'] }}
                          transition={{ duration: 0.8 + n * 0.1, repeat: Infinity, delay: n * 0.1 }}
                        />
                      ))}
                    </div>
                    <span className={`text-[10px] font-medium ${voiceState === 'wake-listening' ? 'text-success' : voiceState === 'awake' ? 'text-warning' : 'text-danger'}`}>{getVoiceLabel(voiceState)}</span>
                    {interimText && <span className="text-[10px] text-secondary italic ml-1 truncate max-w-[180px]">&quot;{interimText}&quot;</span>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Speaking status bar */}
            <AnimatePresence>
              {isSpeaking && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="flex-shrink-0 overflow-hidden bg-primary/5 border-b border-primary/20"
                >
                  <div className="px-4 py-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5 items-end h-4">
                        {[1,2,3,4,5,6,7].map(n => (
                          <motion.div key={n} className="w-0.5 bg-primary/70 rounded-full"
                            animate={{ height: [`${3 + n % 3 * 3}px`, `${8 + n % 4 * 4}px`, `${3 + n % 2 * 3}px`] }}
                            transition={{ duration: 0.5 + n * 0.08, repeat: Infinity, delay: n * 0.07 }}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-medium text-primary">Phoenix is speaking...</span>
                    </div>
                    <button onClick={stopSpeaking} className="text-[9px] text-secondary hover:text-danger px-2 py-0.5 rounded border border-border/50 hover:border-danger/40 transition-all">
                      Stop
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Nav Chips */}
            <div className="px-4 pt-3 pb-2.5 flex flex-wrap gap-1.5 flex-shrink-0 border-b border-border/40 bg-background/30">
              <span className="text-[9px] text-secondary uppercase tracking-wider font-semibold w-full flex items-center gap-1 mb-1">
                <Navigation className="w-2.5 h-2.5" /> Quick Navigate
              </span>
              {QUICK_COMMANDS.map(q => (
                <button key={q.cmd} onClick={() => sendTextMessage(q.cmd)}
                  className="text-[10px] bg-background border border-border/70 text-secondary hover:text-primary hover:border-primary/50 hover:bg-primary/5 px-2.5 py-1 rounded-full transition-all"
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4 min-h-[240px] max-h-[360px]">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  {msg.type === 'bot' ? (
                    <div className={`w-7 h-7 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5 transition-all ${speakingMsgId === msg.id ? 'ring-2 ring-primary/50' : ''}`}>
                      {speakingMsgId === msg.id
                        ? <Volume2 className="w-3.5 h-3.5 text-white animate-pulse" />
                        : <Bot className="w-3.5 h-3.5 text-white" />
                      }
                    </div>
                  ) : (
                    <div className="w-7 h-7 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                      {msg.isVoice ? <Mic className="w-3 h-3 text-white" /> : <User className="w-3.5 h-3.5 text-white" />}
                    </div>
                  )}

                  {/* Bubble */}
                  <div className={`group rounded-xl px-3.5 py-2.5 max-w-[360px] relative ${
                    msg.type === 'user'
                      ? `${msg.isVoice ? 'bg-warning/15 border border-warning/25' : 'bg-primary/20 border border-primary/20'} text-foreground text-[11px] leading-relaxed`
                      : msg.isNav
                        ? 'bg-success/10 border border-success/25 text-success text-[11px] font-medium'
                        : 'bg-background border border-border/60 text-foreground w-full'
                  }`}>
                    {msg.type === 'user' || msg.isNav
                      ? <span className="text-[11px] flex items-center gap-1.5">
                          {msg.isVoice && <Mic className="w-2.5 h-2.5 text-warning flex-shrink-0" />}
                          {msg.text.replace(/\*\*(.*?)\*\*/g, '$1')}
                        </span>
                      : <>
                          {renderMarkdown(msg.text)}
                          {/* TTS replay button on bot messages */}
                          {ttsSupported && (
                            <button
                              onClick={() => handleReplaySpeech(msg)}
                              title={speakingMsgId === msg.id ? 'Stop speaking' : 'Play this response'}
                              className={`mt-2 flex items-center gap-1 text-[9px] transition-all rounded px-1.5 py-0.5 ${
                                speakingMsgId === msg.id
                                  ? 'text-primary bg-primary/10 border border-primary/20'
                                  : 'text-secondary/50 hover:text-primary opacity-0 group-hover:opacity-100 hover:bg-primary/5'
                              }`}
                            >
                              {speakingMsgId === msg.id
                                ? <><VolumeX className="w-2.5 h-2.5" /> Stop</>
                                : <><PlayCircle className="w-2.5 h-2.5" /> Play</>
                              }
                            </button>
                          )}
                        </>
                    }
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-background border border-border/60 rounded-xl px-4 py-3">
                    <div className="flex gap-1.5 items-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3.5 border-t border-border flex-shrink-0 bg-card/80 backdrop-blur-sm">
              <div className="flex gap-2 items-center">
                {voiceSupported && (
                  <button onClick={handleMicClick}
                    title={voiceState === 'command-listening' ? 'Stop listening' : 'Click to speak'}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all flex-shrink-0 ${
                      voiceState === 'command-listening'
                        ? 'bg-danger/20 border border-danger/30 text-danger'
                        : 'bg-background border border-border hover:border-primary/50 text-secondary hover:text-primary'
                    }`}
                  >
                    <Mic className={`w-4 h-4 ${voiceState === 'command-listening' ? 'animate-pulse' : ''}`} />
                  </button>
                )}
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={voiceState === 'command-listening' ? '🎙️ Listening...' : 'Ask phoenix or say "go to alerts"...'}
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all"
                />
                <button
                  onClick={() => sendTextMessage(message)}
                  disabled={isLoading || !message.trim()}
                  className="w-9 h-9 flex items-center justify-center bg-primary hover:bg-primary-hover disabled:opacity-40 rounded-xl transition-all shadow-glow"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-[9px] text-secondary/50">Enter to send</p>
                <p className="text-[9px] text-secondary/50">
                  {voiceEnabled ? '🎙️ "Hey Phoenix" active' : ''}
                  {voiceEnabled && ttsEnabled ? ' · ' : ''}
                  {ttsEnabled && ttsSupported ? '🔊 Audio on' : ''}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
