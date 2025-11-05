import '../styles/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SkillSync AI - Next-Gen Tech Platform',
  description: 'AI-powered platform for DSA practice, interviews, and resume optimization',
  keywords: 'coding, interviews, DSA, AI, jobs, tech careers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}