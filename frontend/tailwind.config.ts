import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0e17',
        foreground: '#e2e8f0',
        card: '#111827',
        'card-hover': '#1f2937',
        border: '#1f2937',
        primary: '#3b82f6',
        'primary-hover': '#2563eb',
        secondary: '#64748b',
        accent: '#06b6d4',
        danger: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981',
        'glow-blue': 'rgba(59, 130, 246, 0.6)',
        'glow-red': 'rgba(239, 68, 68, 0.6)',
        'glow-cyan': 'rgba(6, 182, 212, 0.6)',
        'glow-green': 'rgba(16, 185, 129, 0.6)',
        'glow-purple': 'rgba(139, 92, 246, 0.6)',
        'glow-orange': 'rgba(249, 115, 22, 0.6)',
      },
      boxShadow: {
        glow: '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.5)',
        'glow-strong': '0 0 30px rgba(59, 130, 246, 0.7)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.5)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.5)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.5)',
        'glow-intense': '0 0 40px rgba(59, 130, 246, 0.8)',
        'glow-text': '0 0 10px rgba(59, 130, 246, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
