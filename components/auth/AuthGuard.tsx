'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { shouldBlockAccess } from '@/utils/freeTrialGate'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated && shouldBlockAccess()) {
      router.replace(`/signup?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, isLoading, router, pathname])

  // While loading auth state, show nothing (prevents flash)
  if (isLoading) return null

  // If blocked, show nothing while redirect happens
  if (!isAuthenticated && shouldBlockAccess()) return null

  return <>{children}</>
}
