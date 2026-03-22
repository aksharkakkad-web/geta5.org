import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ascendly — Free AP Exam Prep',
  description: 'Free AP practice questions, drills, and study guides. No signup required.',
  openGraph: {
    title: 'Ascendly — Free AP Exam Prep',
    description: 'Free AP practice questions, drills, and study guides for AP Psychology, AP World History, AP Calculus, AP Chemistry, and more. No signup required.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        {children}
      </body>
    </html>
  )
}
