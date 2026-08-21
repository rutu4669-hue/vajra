'use client'

import { useState } from 'react'
import { Shield, Mail, Lock, User, KeyRound, ArrowLeft, RefreshCw } from 'lucide-react'
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

  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInfoMessage('')

    try {
      if (isMfaStep) {
        // Step 2: Verify OTP
        console.log('Verifying MFA OTP code:', otpCode)
        const tokenResponse = await authService.verifyOtp(email, otpCode, mfaSession)
        console.log('MFA Verification Success:', tokenResponse)
        setAuth(tokenResponse.user, tokenResponse.access_token, tokenResponse.refresh_token)
        router.push('/')
      } else if (isLogin) {
        // Step 1: Login Credentials
        console.log('Attempting login with:', email)
        const response = await authService.login(email, password)
        console.log('Login response:', response)

        if (response.mfa_required) {
          setIsMfaStep(true)
          setMfaSession(response.mfa_session || '')
          setInfoMessage(response.message || 'MFA OTP verification code sent to your email.')
        } else if (response.token) {
          setAuth(response.token.user, response.token.access_token, response.token.refresh_token)
          router.push('/')
        } else if (response.access_token) {
          setAuth(response.user, response.access_token, response.refresh_token)
          router.push('/')
        }
      } else {
        // Registration
        await authService.register(email, password, name)
        setIsLogin(true)
        setInfoMessage('Registration successful! Please login.')
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
    try {
      const res = await authService.sendOtp(email)
      setMfaSession(res.mfa_session || mfaSession)
      setInfoMessage('New MFA OTP code sent to your email!')
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
  }

  return (
    <div className="relative min-h-screen bg-gray-950 flex items-center justify-center p-4 overflow-hidden">
      {/* Sunset Airplane Hero Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat filter brightness-75 scale-105 transition-transform duration-1000"
        style={{ backgroundImage: `url('/login_hero_bg.png')` }}
      />

      {/* Dark Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-gray-950/60 z-0" />

      {/* Glassmorphism Login / MFA Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/80">
          
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wider">VAJRA</h1>
          </div>

          {!isMfaStep ? (
            <div className="flex gap-2 mb-6 p-1 bg-gray-950/60 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                  isLogin
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                  !isLogin
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div className="mb-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 mx-auto flex items-center justify-center mb-3">
                <KeyRound className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">2-Step MFA Verification</h2>
              <p className="text-xs text-gray-400 mt-1">
                Enter the 6-digit verification code sent to <span className="text-blue-300 font-mono">{email}</span>
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-xs text-red-400 font-medium">{error}</p>
            </div>
          )}

          {infoMessage && (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-xs text-blue-300 font-medium">{infoMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isMfaStep ? (
              <>
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-2">Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-gray-950/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full bg-gray-950/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-gray-950/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">6-Digit OTP Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP code"
                    className="w-full bg-gray-950/80 border border-blue-500/40 rounded-xl pl-10 pr-4 py-3 text-lg font-mono text-center tracking-widest text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/50 transition-all"
                    required
                    autoFocus
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-semibold text-sm shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
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
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={resetToLogin}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Resend Code
              </button>
            </div>
          )}

          {!isMfaStep && (
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-400 hover:text-blue-300 font-medium ml-1"
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
