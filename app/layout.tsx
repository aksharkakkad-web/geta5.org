import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { PageTransition } from '@/components/ui/PageTransition'
import { AuthProvider } from '@/contexts/AuthContext'

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://geta5.app'),
  title: 'geta5.app — Free AP Exam Prep',
  description: 'Free AP practice questions, drills, and study guides. Free to try, sign up to unlock unlimited practice.',
  openGraph: {
    title: 'geta5.app — Free AP Exam Prep',
    description: 'Free AP practice questions, drills, and study guides for AP Psychology, AP World History, AP Calculus, AP Chemistry, and more. Free to try, sign up for unlimited access.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100dvh', fontFamily: 'var(--font-outfit), -apple-system, BlinkMacSystemFont, sans-serif' }}>
        <AuthProvider>
          <Header />
          <main style={{ paddingTop: '56px' }}>
            <PageTransition>{children}</PageTransition>
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
