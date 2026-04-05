'use client'

import { useAdi } from './AdiProvider'
import { AdiMascot } from './AdiMascot'
import { AdiNudge } from './AdiNudge'

export function AdiBubble() {
  const { toggle, isOpen, nudgeText, dismissNudge } = useAdi()

  if (isOpen) return null

  return (
    <>
      {nudgeText && <AdiNudge text={nudgeText} onDismiss={dismissNudge} />}
      <div className="adi-bubble" onClick={toggle} role="button" tabIndex={0} aria-label="Open Adi chat">
        <AdiMascot size={72} />
      </div>
    </>
  )
}
