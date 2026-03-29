import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'

export const metadata: Metadata = {
  metadataBase: new URL('https://geta5.org'),
  title: 'Get a 5 — Free AP Exam Prep',
  description: 'Free AP practice questions, drills, and study guides. No signup, no paywall, completely free.',
  openGraph: {
    title: 'Get a 5 — Free AP Exam Prep',
    description: 'Free AP practice questions, drills, and study guides for AP Psychology, AP World History, AP Calculus, AP Chemistry, and more. No signup, completely free.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100dvh' }}>
        <Header />
        <main style={{ paddingTop: '56px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
