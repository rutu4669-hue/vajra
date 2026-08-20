import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import PhoenixButton from '@/components/PhoenixButton'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VAJRA',
  description: 'AI Powered Threat Intelligence & Risk Analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
        <PhoenixButton />
      </body>
    </html>
  )
}
