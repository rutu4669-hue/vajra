'use client'

import { useState } from 'react'
import { Shield, Mail, Lock, User, KeyRound, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react'
import { authService } from '../../services/auth.service'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  
  // MFA States
  const [isMfaStep, setIsMfaStep] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [mfaSession, setMfaSession] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInfoMessage('')
    setSuccessMessage('')

    try {
      if (isMfaStep) {
        // Step 2: Verify OTP
        console.log('Verifying MFA OTP code:', otpCode)
        const tokenResponse = await authService.verifyOtp(email, otpCode, mfaSession)
        console.log('MFA Verification Success:', tokenResponse)
        setSuccessMessage('Login successful! Redirecting to dashboard...')
        setAuth(tokenResponse.user, tokenResponse.access_token, tokenResponse.refresh_token)
        window.location.href = '/'
      } else if (isLogin) {
        // Step 1: Login Credentials
        console.log('Attempting login with:', email)
        const response = await authService.login(email, password)
        console.log('Login response:', response)

        if (response.mfa_required) {
          setIsMfaStep(true)
          setMfaSession(response.mfa_session || '')
          setSuccessMessage(response.message || 'Login successful! 6-digit MFA OTP code sent to your registered email.')
        } else if (response.token) {
          setSuccessMessage('Login successful! Redirecting...')
          setAuth(response.token.user, response.token.access_token, response.token.refresh_token)
          window.location.href = '/'
        } else if (response.access_token) {
          setSuccessMessage('Login successful! Redirecting...')
          setAuth(response.user, response.access_token, response.refresh_token)
          window.location.href = '/'
        }
      } else {
        // Registration
        await authService.register(email, password, name)
        setIsLogin(true)
        setSuccessMessage('Registration successful! Please enter your password to login.')
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err.response?.data?.detail || err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setLoading(true)
    setError('')
    setSuccessMessage('')
    try {
      const res = await authService.sendOtp(email)
      setMfaSession(res.mfa_session || mfaSession)
      setSuccessMessage('New MFA OTP code sent to your email!')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const resetToLogin = () => {
    setIsMfaStep(false)
    setOtpCode('')
    setError('')
    setInfoMessage('')
    setSuccessMessage('')
  }

  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
      {/* High Visibility 100% Crisp Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat filter brightness-100 scale-100 transition-all duration-1000"
        style={{ backgroundImage: `url('/login_hero_bg.png')` }}
      />

      {/* Subtle Light Vignette for Maximum Background Visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-black/20 z-0 pointer-events-none" />

      {/* Liquid Glassmorphism Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-900/35 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] shadow-blue-500/10 relative overflow-hidden">
          
          {/* Refraction Light Sheen Overlays */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col items-center justify-center gap-2 mb-6 relative z-10">
            <img src="/vajra_logo.jpg" alt="VAJRA Logo" className="h-16 w-auto object-contain rounded-2xl shadow-lg shadow-blue-500/20 border border-white/20" />
            <h1 className="text-xl font-bold text-white tracking-wider drop-shadow-md">VAJRA</h1>
          </div>

          {!isMfaStep ? (
            <div className="flex gap-2 mb-6 p-1 bg-slate-950/50 backdrop-blur-md rounded-xl border border-white/10 relative z-10">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(''); setSuccessMessage(''); }}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                  isLogin
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 border border-white/10'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(''); setSuccessMessage(''); }}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                  !isLogin
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 border border-white/10'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div className="mb-6 text-center relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 backdrop-blur-md mx-auto flex items-center justify-center mb-3 shadow-lg shadow-blue-500/20">
                <KeyRound className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">2-Step MFA Verification</h2>
              <p className="text-xs text-gray-300 mt-1">
                Enter the 6-digit verification code sent to <span className="text-blue-300 font-mono font-bold">{email}</span>
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 backdrop-blur-md border border-red-500/40 rounded-xl relative z-10">
              <p className="text-xs text-red-300 font-medium">{error}</p>
            </div>
          )}

          {/* Green Success Notifications */}
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/50 rounded-xl flex items-center gap-2.5 shadow-lg shadow-emerald-500/10 relative z-10">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-300 font-semibold tracking-wide">{successMessage}</p>
            </div>
          )}

          {infoMessage && (
            <div className="mb-4 p-3 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/50 rounded-xl flex items-center gap-2.5 relative z-10">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-300 font-medium">{infoMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10" autoComplete="off">
            {!isMfaStep ? (
              <>
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-medium text-gray-200 mb-1.5">Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        className="w-full bg-slate-950/50 backdrop-blur-md border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-slate-950/70 focus:ring-1 focus:ring-blue-400/50 transition-all"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-200 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      className="w-full bg-slate-950/50 backdrop-blur-md border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-slate-950/70 focus:ring-1 focus:ring-blue-400/50 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-200 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      className="w-full bg-slate-950/50 backdrop-blur-md border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-slate-950/70 focus:ring-1 focus:ring-blue-400/50 transition-all"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-200 mb-1.5">6-Digit OTP Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP code"
                    autoComplete="one-time-code"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    className="w-full bg-slate-950/70 backdrop-blur-md border border-blue-400/50 rounded-xl pl-10 pr-4 py-3 text-lg font-mono text-center tracking-widest text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/50 transition-all"
                    required
                    autoFocus
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-semibold text-sm shadow-lg shadow-blue-600/35 backdrop-blur-md border border-white/15 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading 
                ? 'Processing...' 
                : isMfaStep 
                ? 'Verify & Complete Login' 
                : isLogin 
                ? 'Login' 
                : 'Sign Up'
              }
            </button>
          </form>

          {isMfaStep && (
            <div className="mt-4 flex items-center justify-between relative z-10">
              <button
                type="button"
                onClick={resetToLogin}
                className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-blue-300 hover:text-blue-200 transition-colors disabled:opacity-50 font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Resend Code
              </button>
            </div>
          )}

          {!isMfaStep && (
            <div className="mt-6 text-center relative z-10">
              <p className="text-xs text-gray-300">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-300 hover:text-blue-200 font-semibold ml-1"
                >
                  {isLogin ? 'Sign up' : 'Login'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
