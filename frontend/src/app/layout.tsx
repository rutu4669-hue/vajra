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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function purgeNetlify() {
                  const selectors = [
                    '#netlify-drawer',
                    'netlify-drawer',
                    '[data-netlify-drawer]',
                    'iframe#netlify-drawer',
                    '.netlify-badge',
                    '#netlify-badge'
                  ];
                  selectors.forEach(sel => {
                    document.querySelectorAll(sel).forEach(el => el.remove());
                  });
                }
                if (typeof window !== 'undefined') {
                  purgeNetlify();
                  window.addEventListener('DOMContentLoaded', purgeNetlify);
                  window.addEventListener('load', purgeNetlify);
                  const observer = new MutationObserver(purgeNetlify);
                  observer.observe(document.documentElement, { childList: true, subtree: true });
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <PhoenixButton />
      </body>
    </html>
  )
}

