'use client'

import { useEffect } from 'react'

interface AdiNudgeProps {
  text: string
  onDismiss: () => void
}

export function AdiNudge({ text, onDismiss }: AdiNudgeProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className="adi-nudge">
      <div className="adi-nudge-text">
        <strong>{text.split('—')[0]?.trim()}</strong>
        {text.includes('—') && ` — ${text.split('—').slice(1).join('—').trim()}`}
      </div>
    </div>
  )
}
