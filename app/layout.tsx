import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import { Providers } from '@/components/Providers'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { PageTransition } from '@/components/ui/PageTransition'
import { AuthProvider } from '@/contexts/AuthContext'
import { AdiProvider } from '@/components/adi/AdiProvider'
import { AdiBubble } from '@/components/adi/AdiBubble'
import { AdiChatPanel } from '@/components/adi/AdiChatPanel'
import ActiveTimeTracker from '@/components/ActiveTimeTracker'
import { ChangelogModal } from '@/components/Changelog/ChangelogModal'

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
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('ascendly-theme'),e=document.documentElement;if(t==='light'){e.setAttribute('data-theme','light');var l={'--bg-primary':'#fafafa','--bg-secondary':'#f2f2f8','--bg-card':'#ffffff','--bg-card-hover':'#ebebf5','--bg-border':'#ddddf0','--text-primary':'#111118','--text-secondary':'#555566','--text-muted':'#9494a8','--mastery-empty':'#e2e2f0','--bg-header-alpha':'rgba(250,250,250,0.9)','--bg-overlay':'rgba(255,255,255,0.92)','--bg-overlay-subtle':'rgba(255,255,255,0.7)','--border-subtle':'rgba(0,0,0,0.05)','--border-medium':'rgba(0,0,0,0.07)','--border-strong':'rgba(0,0,0,0.09)','--border-interactive':'rgba(0,0,0,0.12)','--border-interactive-hover':'rgba(0,0,0,0.20)'};for(var k in l)e.style.setProperty(k,l[k]);}else{e.setAttribute('data-theme','dark');}}catch(ex){}` }} />
      </head>
      <body style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100dvh', fontFamily: 'var(--font-outfit), -apple-system, BlinkMacSystemFont, sans-serif' }}>
        <Providers>
          <AuthProvider>
            <AdiProvider>
              <Header />
              <main style={{ paddingTop: '56px' }}>
                <PageTransition>{children}</PageTransition>
              </main>
              <AdiBubble />
              <AdiChatPanel />
              <ActiveTimeTracker />
              <ChangelogModal />
            </AdiProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
