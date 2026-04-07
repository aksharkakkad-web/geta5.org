'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { shouldBlockAccess } from '@/utils/freeTrialGate'

interface AuthGuardProps {
  children: React.ReactNode
  /**
   * When true, any unauthenticated user is redirected to /signup regardless
   * of their free-question count. Used for features that always require auth
   * (practice test, FRQ). Defaults to false (freemium gate behaviour).
   */
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = false }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const blocked = !isAuthenticated && (requireAuth || shouldBlockAccess())

  useEffect(() => {
    if (isLoading) return
    if (blocked) {
      router.replace(`/signup?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, isLoading, blocked, router, pathname])

  // While loading auth state, show nothing (prevents flash)
  if (isLoading) return null

  // If blocked, show nothing while redirect happens
  if (blocked) return null

  return <>{children}</>
}
