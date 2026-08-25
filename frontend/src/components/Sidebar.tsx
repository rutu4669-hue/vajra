'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Shield,
  AlertTriangle,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  Users,
  Building2,
  Globe,
  GripVertical,
  Network,
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useLanguageStore } from '@/store/languageStore'

interface SidebarProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  sidebarWidth: number
  setSidebarWidth: (width: number) => void
}

export default function Sidebar({ collapsed, setCollapsed, sidebarWidth, setSidebarWidth }: SidebarProps) {
  const [activeMenu, setActiveMenu] = useState('Dashboard')
  const [isResizing, setIsResizing] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLanguageStore()

  useEffect(() => {
    if (pathname === '/') setActiveMenu('Dashboard')
    else if (pathname === '/threat-intelligence') setActiveMenu('Threat Intel')
    else if (pathname === '/ransomware') setActiveMenu('Ransomware')
    else if (pathname === '/executive-summary') setActiveMenu('Executive')
    else if (pathname === '/settings') setActiveMenu('Settings')
    else if (pathname === '/admin') setActiveMenu('Admin')
    else if (pathname === '/companies') setActiveMenu('Companies')
    else if (pathname === '/domain-analysis') setActiveMenu('Domain')
    else if (pathname === '/threat-intelligence/actors') setActiveMenu('Actors')
    else if (pathname === '/threat-intelligence/industries') setActiveMenu('Industries')
    else if (pathname === '/soc-integration') setActiveMenu('SOC')
  }, [pathname])

  const menuItems = [
    { icon: LayoutDashboard, label: t('dashboard', 'Dashboard'), key: 'Dashboard', path: '/' },
    { icon: Building2, label: t('companyMonitor', 'Companies'), key: 'Companies', path: '/companies' },
    { icon: Shield, label: t('threatIntelligence', 'Threat Intel'), key: 'Threat Intel', path: '/threat-intelligence' },
    { icon: AlertTriangle, label: t('ransomwareLive', 'Ransomware'), key: 'Ransomware', path: '/ransomware' },
    { icon: Users, label: t('threatActors', 'Actors'), key: 'Actors', path: '/threat-intelligence/actors' },
    { icon: Building2, label: t('targetedIndustries', 'Industries'), key: 'Industries', path: '/threat-intelligence/industries' },
    { icon: Globe, label: t('domainPulse', 'Domain Pulse'), key: 'Domain', path: '/domain-analysis' },
    { icon: Activity, label: t('executiveSummary', 'Executive'), key: 'Executive', path: '/executive-summary' },
    { icon: Network, label: 'SOC Connect', key: 'SOC', path: '/soc-integration' },
    { icon: Users, label: t('adminCenter', 'Admin'), key: 'Admin', path: '/admin' },
    { icon: Settings, label: t('settings', 'Settings'), key: 'Settings', path: '/settings' },
  ]

  const handleMenuClick = (item: any) => {
    setActiveMenu(item.label)
    if (item.path) {
      router.push(item.path)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = Math.max(160, Math.min(320, e.clientX))
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, setSidebarWidth])

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : sidebarWidth }}
      className="fixed left-0 top-0 h-full bg-card border-r border-border z-50 transition-all duration-300"
    >
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <img src="/logo.png" alt="VAJRA Logo" className="h-10 w-auto object-contain" onError={(e) => { console.error('Sidebar logo failed to load:', e); (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div className="space-y-0.5">
                  <h1 className="text-lg font-bold text-primary text-glow">VAJRA</h1>
                  <p className="text-xs text-secondary">Threat Intelligence Platform</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center"
              >
                <img src="/logo.png" alt="VAJRA Logo" className="h-8 w-auto object-contain" onError={(e) => { console.error('Collapsed sidebar logo failed to load:', e); (e.target as HTMLImageElement).style.display = 'none'; }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.label} className="flex items-center gap-1">
              <button
                onClick={() => handleMenuClick(item)}
                className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  activeMenu === item.key || activeMenu === item.label
                    ? 'bg-primary text-white shadow-glow glow-hover'
                    : 'text-foreground hover:bg-card-hover hover:text-primary hover:shadow-glow'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-xs font-medium uppercase whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          ))}
        </nav>

        {/* Collapse Button */}
        <div className="p-2 border-t border-border flex items-center gap-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-lg bg-card hover:bg-card-hover transition-all duration-200 text-foreground"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Resize Handle */}
      {!collapsed && (
        <div
          onMouseDown={handleMouseDown}
          className="absolute right-0 top-0 h-full w-1 cursor-ew-resize hover:bg-primary/50 transition-colors z-50 flex items-center justify-center"
        >
          <GripVertical className="w-4 h-4 text-secondary opacity-50 hover:opacity-100" />
        </div>
      )}
    </motion.aside>
  )
}
