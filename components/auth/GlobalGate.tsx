'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { shouldBlockAccess } from '@/utils/freeTrialGate'

// Pages that are always accessible — never redirect these
const PUBLIC_PATHS = ['/signup', '/login', '/auth']

export function GlobalGate() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Wait until auth is resolved
    if (isLoading) return
    // Signed-in users always pass through
    if (isAuthenticated) return
    // Never redirect on auth pages (would cause a loop)
    if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) return
    // Block if free trial exhausted
    if (shouldBlockAccess()) {
      router.replace(`/signup?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, isLoading, pathname, router])

  return null
}
