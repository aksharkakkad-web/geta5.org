'use client'

import { useState, useEffect } from 'react'
import { useAdi } from './AdiProvider'
import { AdiIcon } from './AdiMascot'

interface AdiIdleNudgeProps {
  delay?: number
}

export function AdiIdleNudge({ delay = 60 }: AdiIdleNudgeProps) {
  const { open, nudgeDismissCount } = useAdi()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (nudgeDismissCount >= 3) return

    const timer = setTimeout(() => setVisible(true), delay * 1000)
    return () => clearTimeout(timer)
  }, [delay, nudgeDismissCount])

  if (!visible) return null

  return (
    <div className="adi-idle-bar">
      <div style={{ cursor: 'pointer' }} onClick={open}>
        <AdiIcon size={36} />
      </div>
      <div className="adi-idle-bar-text" style={{ cursor: 'pointer' }} onClick={open}>
        <strong>Need a hand?</strong> I can quiz you on this or explain anything here.
      </div>
      <button className="adi-idle-bar-x" onClick={() => setVisible(false)} aria-label="Dismiss">
        ✕
      </button>
    </div>
  )
}
