'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { setAuthState, syncFromSupabase } from '@/utils/persistence'
import { migrateLocalStorageToSupabase } from '@/utils/dataMigration'
import { setAnalyticsUserId } from '@/utils/analytics'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextValue {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  signOut: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      setAuthState(!!s?.user)
      setAnalyticsUserId(s?.user?.id ?? null)
      setIsLoading(false)

      if (s?.user) {
        migrateLocalStorageToSupabase().then(() => syncFromSupabase())
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, s) => {
        setSession(s)
        setUser(s?.user ?? null)
        setAuthState(!!s?.user)
        setAnalyticsUserId(s?.user?.id ?? null)
        setIsLoading(false)

        if (event === 'SIGNED_IN' && s?.user) {
          migrateLocalStorageToSupabase().then(() => syncFromSupabase())
        }

        if (event === 'SIGNED_OUT') {
          setAuthState(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      isAuthenticated: !!user,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
