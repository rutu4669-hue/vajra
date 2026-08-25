'use client'

import { useEffect } from 'react'
import { useLanguageStore } from '@/store/languageStore'
import { DICTIONARY, LanguageCode } from '@/i18n/translations'

export default function LanguageTranslator() {
  const { currentLanguage } = useLanguageStore()

  useEffect(() => {
    if (typeof window === 'undefined' || !document.body) return

    const dict = DICTIONARY[currentLanguage] || {}
    const isDefault = currentLanguage === 'en'

    // Map of sorted keys (longest first to avoid partial replacements)
    const sortedKeys = Object.keys(dict).sort((a, b) => b.length - a.length)

    function translateText(text: string): string {
      let result = text
      for (const key of sortedKeys) {
        if (result.includes(key)) {
          result = result.split(key).join(dict[key])
        }
      }
      return result
    }

    function processNode(node: Node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue
        if (text && text.trim().length > 0) {
          // If we haven't stored original text, store it in a WeakMap or attribute
          const parent = node.parentElement
          if (parent) {
            const tagName = parent.tagName.toLowerCase()
            if (['script', 'style', 'noscript', 'code', 'pre'].includes(tagName)) return

            // Check if element has original text saved
            if (!parent.hasAttribute('data-orig-text')) {
              parent.setAttribute('data-orig-text', parent.innerText || text)
            }

            if (!isDefault) {
              const translated = translateText(text)
              if (translated !== text) {
                node.nodeValue = translated
              }
            }
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement
        const tagName = el.tagName.toLowerCase()
        if (['script', 'style', 'noscript'].includes(tagName)) return

        // Translate placeholders
        if (el.hasAttribute('placeholder')) {
          const ph = el.getAttribute('placeholder')
          if (ph) {
            if (!el.hasAttribute('data-orig-ph')) {
              el.setAttribute('data-orig-ph', ph)
            }
            if (!isDefault) {
              el.setAttribute('placeholder', translateText(ph))
            } else if (el.hasAttribute('data-orig-ph')) {
              el.setAttribute('placeholder', el.getAttribute('data-orig-ph')!)
            }
          }
        }

        // Process children
        el.childNodes.forEach(processNode)
      }
    }

    // Run initial pass
    processNode(document.body)

    // Observe dynamic changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(processNode)
        } else if (mutation.type === 'characterData') {
          processNode(mutation.target)
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => {
      observer.disconnect()
    }
  }, [currentLanguage])

  return null
}
