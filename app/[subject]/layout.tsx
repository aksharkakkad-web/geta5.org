'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { shouldBlockAccess } from '@/utils/freeTrialGate'

export default function SubjectLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return
    if (isAuthenticated) return
    if (shouldBlockAccess()) {
      router.replace(`/signup?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, isLoading, router, pathname])

  // Always render children — returning null from a layout breaks the routing tree
  // in Next.js App Router. The redirect fires from useEffect above.
  return <>{children}</>
}
