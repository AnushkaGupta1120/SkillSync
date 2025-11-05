import './globals.css'
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
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
// import '../styles/global.css' // Change this line - use relative path to globals.css in app folder
// import type { Metadata } from 'next'
// import { Inter } from 'next/font/google'
// import { Providers } from './providers'

// const inter = Inter({ subsets: ['latin'] })

// export const metadata: Metadata = {
//   title: 'SkillSync AI - Next-Gen Tech Platform',
//   description: 'AI-powered platform for DSA practice, interviews, and resume optimization',
//   keywords: 'coding, interviews, DSA, AI, jobs, tech careers',
// }

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className={inter.className}>
//         <Providers>
//           {children}
//         </Providers>
//       </body>
//     </html>
//   )
// }