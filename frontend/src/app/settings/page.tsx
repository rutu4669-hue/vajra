'use client'

import { useState, useEffect } from 'react'
import { Shield, Bell, Globe, Lock, User, Database } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(200)
  const { user } = useAuthStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="w-64 bg-card border-r border-border h-screen animate-pulse" />
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-card border-b border-border animate-pulse" />
          <main className="flex-1 p-6 space-y-6">
            <div className="h-8 w-48 bg-card rounded animate-pulse" />
            <div className="h-64 bg-card rounded-xl animate-pulse" />
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
        sidebarWidth={sidebarWidth}
        setSidebarWidth={setSidebarWidth}
      />
      <div 
        className="flex-1 flex flex-col transition-all duration-300 overflow-hidden"
        style={{ marginLeft: sidebarCollapsed ? '64px' : `${sidebarWidth}px` }}
      >
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground text-glow">Settings</h1>
              <p className="text-secondary text-sm mt-1">Manage your account and application settings</p>
            </div>

            {/* Profile Section */}
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Profile</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-secondary mb-2">Name</label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xs text-secondary mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xs text-secondary mb-2">Role</label>
                  <input
                    type="text"
                    value={user?.role || ''}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Email Notifications</span>
                  <button className="w-12 h-6 bg-primary rounded-full relative">
                    <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Push Notifications</span>
              <button className="w-12 h-6 bg-primary rounded-full relative">
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Critical Alerts Only</span>
              <button className="w-12 h-6 bg-background border border-border rounded-full relative">
                <span className="absolute left-1 top-1 w-4 h-4 bg-secondary rounded-full" />
              </button>
            </div>
          </div>
        </div>

            {/* Security */}
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Security</h2>
              </div>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground hover:border-primary transition-colors">
                  Change Password
                </button>
                <button className="w-full text-left px-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground hover:border-primary transition-colors">
                  Two-Factor Authentication
                </button>
                <button className="w-full text-left px-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground hover:border-primary transition-colors">
                  Session Management
                </button>
              </div>
            </div>

            {/* API Settings */}
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">API Configuration</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-secondary mb-2">API Endpoint</label>
                  <input
                    type="text"
                    value={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xs text-secondary mb-2">WebSocket Endpoint</label>
                  <input
                    type="text"
                    value={process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Language */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Language & Region</h2>
              </div>
              <div>
                <label className="block text-xs text-secondary mb-2">Language</label>
                <select className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
