'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export default function DomainAnalysisPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(200)
  const [mounted, setMounted] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="w-64 bg-card border-r border-border h-screen animate-pulse" />
        <div className="flex-1 flex flex-col">
          <div className="h-16 bg-card border-b border-border animate-pulse" />
          <main className="flex-1 p-6">
            <div className="h-96 bg-card rounded-lg animate-pulse" />
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
        <main className="flex-1 overflow-hidden relative">
          {/* Loading indicator while iframe loads */}
          {!iframeLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-secondary text-sm">Loading DomainPulse Engine...</p>
              </div>
            </div>
          )}
          {/* 
            Using iframe for full CSS/JS isolation: 
            - DomainPulse has its own CSS reset, font imports, and body styles
            - These would conflict with Next.js if injected into the DOM directly
            - iframe ensures DOMContentLoaded fires properly for app.js
          */}
          <iframe
            src="/domain-analysis/index.html"
            className="w-full h-full border-0"
            style={{
              minHeight: 'calc(100vh - 64px)',
              opacity: iframeLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
            }}
            onLoad={() => setIframeLoaded(true)}
            title="DomainPulse - Domain Analysis & Security Telemetry"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </main>
      </div>
    </div>
  )
}
