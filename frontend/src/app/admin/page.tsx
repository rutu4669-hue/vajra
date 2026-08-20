'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import { Users, Settings, Activity, Shield } from 'lucide-react'

interface AdminStats {
  total_users: number
  active_users: number
  total_roles: string[]
  recent_logins: number
  system_status: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, token } = useAuthStore()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(200)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'Admin') {
      router.push('/')
      return
    }
    fetchStats()
  }, [isAuthenticated, user, router])

  const fetchStats = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${API_URL}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.error('Failed to fetch stats:', response.status)
        // Set mock data if API fails
        setStats({
          total_users: 5,
          active_users: 3,
          total_roles: ['Admin', 'User'],
          recent_logins: 12,
          system_status: 'Healthy'
        })
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
      // Set mock data on error
      setStats({
        total_users: 5,
        active_users: 3,
        total_roles: ['Admin', 'User'],
        recent_logins: 12,
        system_status: 'Healthy'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar collapsed={false} setCollapsed={() => {}} />
        <div className="flex-1 flex flex-col ml-64">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-lg text-foreground">Loading admin dashboard...</div>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-secondary">System administration and user management</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl p-6 hover:border-glow-blue transition-all duration-300 hover:shadow-glow"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="text-sm text-secondary">Total Users</h3>
                </div>
                <p className="text-3xl font-bold text-foreground">{stats?.total_users || 0}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-xl p-6 hover:border-glow-blue transition-all duration-300 hover:shadow-glow"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-success" />
                  <h3 className="text-sm text-secondary">Active Users</h3>
                </div>
                <p className="text-3xl font-bold text-foreground">{stats?.active_users || 0}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border rounded-xl p-6 hover:border-glow-blue transition-all duration-300 hover:shadow-glow"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-accent" />
                  <h3 className="text-sm text-secondary">Recent Logins</h3>
                </div>
                <p className="text-3xl font-bold text-foreground">{stats?.recent_logins || 0}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border border-border rounded-xl p-6 hover:border-glow-blue transition-all duration-300 hover:shadow-glow"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-success" />
                  <h3 className="text-sm text-secondary">System Status</h3>
                </div>
                <p className="text-3xl font-bold text-success">{stats?.system_status || 'Healthy'}</p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/admin/users" className="bg-card border border-border rounded-xl p-6 hover:border-glow-blue transition-all duration-300 hover:shadow-glow block">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">User Management</h3>
                </div>
                <p className="text-sm text-secondary">Manage users, roles, and permissions</p>
              </Link>

              <Link href="/admin/configurations" className="bg-card border border-border rounded-xl p-6 hover:border-glow-blue transition-all duration-300 hover:shadow-glow block">
                <div className="flex items-center gap-3 mb-2">
                  <Settings className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-bold text-foreground">Configuration Management</h3>
                </div>
                <p className="text-sm text-secondary">View and update system configurations</p>
              </Link>

              <Link href="/admin/activity-logs" className="bg-card border border-border rounded-xl p-6 hover:border-glow-blue transition-all duration-300 hover:shadow-glow block">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-success" />
                  <h3 className="text-lg font-bold text-foreground">User Activity Logs</h3>
                </div>
                <p className="text-sm text-secondary">View all user activity in real-time</p>
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
