'use client'

import { useState } from 'react'
import { Shield, Mail, Lock, User } from 'lucide-react'
import { authService } from '../../services/auth.service'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Attempting login with:', email)
      if (isLogin) {
        const response = await authService.login(email, password)
        console.log('Login response:', response)
        setAuth(response.user, response.access_token, response.refresh_token)
        router.push('/')
      } else {
        await authService.register(email, password, name)
        setIsLogin(true)
        setError('Registration successful! Please login.')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.response?.data?.detail || err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
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

      {/* Glassmorphism Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/80">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wider">VAJRA</h1>
          </div>

          <div className="flex gap-2 mb-6 p-1 bg-gray-950/60 rounded-xl border border-white/5">
            <button
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

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-xs text-red-400 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-semibold text-sm shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-400 hover:text-blue-300 font-medium ml-1"
              >
                {isLogin ? 'Sign up' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
