'use client'
import { AmbientBlobs } from '@/components/ui/AmbientBlobs'
import type { ReactNode } from 'react'

export function SubjectHubClient({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <AmbientBlobs />
      {children}
    </div>
  )
}
