'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import type { AdiContext } from '@/utils/adiPrompt'

export function useAdiContext(): AdiContext {
  const pathname = usePathname()

  return useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const subject = segments[0] ?? ''
    const mode = segments[1] ?? ''

    const pageMap: Record<string, AdiContext['page']> = {
      drills: 'drill',
      practice: 'mcq',
      'practice-test': 'practice-test',
      'study-guide': 'study-guide',
    }

    return {
      subject,
      unit: '',
      page: pageMap[mode] ?? 'home',
    }
  }, [pathname])
}
