'use client'

import { usePathname } from 'next/navigation'
import { useAdi } from './AdiProvider'
import { useAuth } from '@/contexts/AuthContext'
import { AdiMascot } from './AdiMascot'
import { AdiNudge } from './AdiNudge'

const HIDDEN_PATHS = ['/signup', '/auth/reset-password', '/auth/update-password', '/auth/callback']

export function AdiBubble() {
  const { toggle, isOpen, nudgeText, dismissNudge } = useAdi()
  const { user, isLoading: authLoading } = useAuth()
  const pathname = usePathname()

  if (isOpen || HIDDEN_PATHS.some((p) => pathname.startsWith(p))) return null

  const handleClick = () => {
    if (!authLoading && !user) {
      window.location.href = '/signup'
      return
    }
    toggle()
  }

  return (
    <>
      {nudgeText && <AdiNudge text={nudgeText} onDismiss={dismissNudge} />}
      <div className="adi-bubble" onClick={handleClick} role="button" tabIndex={0} aria-label="Open Adi chat">
        <AdiMascot size={72} />
      </div>
    </>
  )
}
