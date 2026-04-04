# Auth & Freemium System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Supabase Auth (Google OAuth + email/password), a 5-question freemium gate, localStorage-to-Supabase data migration, dual-write persistence, and admin user management.

**Architecture:** Supabase Auth via `@supabase/ssr` for cookie-based sessions. Auth state managed client-side via React context. All user data flows through Next.js API routes (server-side Supabase client). Freemium gate checks localStorage counter client-side and redirects to `/signup` when limit reached.

**Tech Stack:** Next.js 14 App Router, Supabase Auth + `@supabase/ssr`, TypeScript, Tailwind v4

**Spec:** `docs/superpowers/specs/2026-04-04-auth-freemium-design.md`

---

## File Map

### New Files
| File | Responsibility |
|------|---------------|
| `lib/supabase-browser.ts` | Client-side Supabase client for auth operations |
| `lib/supabase-server.ts` | Server-side Supabase client for API routes + middleware |
| `middleware.ts` | Refresh Supabase auth session on every request |
| `contexts/AuthContext.tsx` | React context providing `{ user, isLoading, isAuthenticated }` |
| `utils/freeTrialGate.ts` | Check free trial limit, redirect logic |
| `utils/persistence.ts` | Dual-write layer (localStorage + Supabase for authed users) |
| `utils/dataMigration.ts` | One-time localStorage → Supabase migration |
| `app/signup/page.tsx` | Signup/login page with Google OAuth + email/password |
| `app/auth/callback/route.ts` | OAuth code exchange route handler |
| `app/auth/reset-password/page.tsx` | Password reset request page |
| `app/auth/update-password/page.tsx` | Password update page (from email link) |
| `app/api/user/migrate/route.ts` | Migration endpoint: localStorage → Supabase |
| `app/api/user/progress/route.ts` | Upsert user_progress after session completion |
| `app/api/user/stats/route.ts` | Update user_stats (total_questions, streak) |
| `app/api/user/sync/route.ts` | Fetch all user data for localStorage hydration |
| `app/api/admin/users/route.ts` | List all users with stats |
| `app/api/admin/user/[id]/route.ts` | Per-user detail with progress breakdown |
| `components/auth/AuthGuard.tsx` | Wrapper component for freemium gate on question pages |

### Modified Files
| File | Change |
|------|--------|
| `app/layout.tsx` | Wrap with `<AuthProvider>` |
| `components/layout/Header.tsx` | Add user display name + sign out button when authenticated |
| `utils/drillSession.ts` | Call `persistence.saveProgress()` + `persistence.saveStats()` instead of direct `lsSet` |
| `utils/mcqSession.ts` | Same as above |
| `utils/testSession.ts` | Same as above |
| `utils/analytics.ts` | Include `user_id` for authenticated users |
| `utils/localStorage.ts` | Add `migrated` key to `LS_KEYS` |
| `app/[subject]/drills/page.tsx` | Wrap with `<AuthGuard>` |
| `app/[subject]/practice/page.tsx` | Wrap with `<AuthGuard>` |
| `app/[subject]/practice-test/page.tsx` | Wrap with `<AuthGuard>` |
| `app/page.tsx` | Update marketing copy |
| `app/admin/page.tsx` | Add users tab + user detail view |

---

## Task 1: Install `@supabase/ssr` and Create Supabase Clients

**Files:**
- Modify: `package.json`
- Create: `lib/supabase-browser.ts`
- Create: `lib/supabase-server.ts`

- [ ] **Step 1: Install `@supabase/ssr`**

Run: `npm install @supabase/ssr`
Expected: Package added to dependencies in package.json

- [ ] **Step 2: Create `lib/supabase-browser.ts`**

```typescript
// lib/supabase-browser.ts
// Client-side Supabase client — used for auth operations only
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 3: Create `lib/supabase-server.ts`**

```typescript
// lib/supabase-server.ts
// Server-side Supabase client — used in API routes and middleware
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignored in Server Components — only works in Route Handlers/Server Actions
          }
        },
      },
    }
  )
}
```

- [ ] **Step 4: Verify build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds (no import errors)

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json lib/supabase-browser.ts lib/supabase-server.ts
git commit -m "feat: add @supabase/ssr with browser and server client helpers"
```

---

## Task 2: Create Middleware for Session Refresh

**Files:**
- Create: `middleware.ts` (project root)

- [ ] **Step 1: Create `middleware.ts`**

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — do not remove this call
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    // Match all routes except static files and _next internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 2: Verify dev server starts**

Run: `npx next dev &` then `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`
Expected: 200

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat: add middleware for Supabase auth session refresh"
```

---

## Task 3: Create AuthContext Provider

**Files:**
- Create: `contexts/AuthContext.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create `contexts/AuthContext.tsx`**

```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
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
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s)
        setUser(s?.user ?? null)
        setIsLoading(false)
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
```

- [ ] **Step 2: Wrap layout with AuthProvider**

Modify `app/layout.tsx`. The layout must remain a server component, so import `AuthProvider` and wrap the body content:

```typescript
import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { PageTransition } from '@/components/ui/PageTransition'
import { AuthProvider } from '@/contexts/AuthContext'

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://geta5.app'),
  title: 'geta5.app — Free AP Exam Prep',
  description: 'Free AP practice questions, drills, and study guides. No signup, no paywall, completely free.',
  openGraph: {
    title: 'geta5.app — Free AP Exam Prep',
    description: 'Free AP practice questions, drills, and study guides for AP Psychology, AP World History, AP Calculus, AP Chemistry, and more. No signup, completely free.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100dvh', fontFamily: 'var(--font-outfit), -apple-system, BlinkMacSystemFont, sans-serif' }}>
        <AuthProvider>
          <Header />
          <main style={{ paddingTop: '56px' }}>
            <PageTransition>{children}</PageTransition>
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add contexts/AuthContext.tsx app/layout.tsx
git commit -m "feat: add AuthContext provider with Supabase session management"
```

---

## Task 4: Create Signup/Login Page

**Files:**
- Create: `app/signup/page.tsx`

- [ ] **Step 1: Create the signup page**

```typescript
'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { useAuth } from '@/contexts/AuthContext'
import { Suspense } from 'react'

function SignupForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const redirect = searchParams.get('redirect') || '/'

  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  // If already authenticated, redirect immediately
  if (isAuthenticated) {
    router.replace(redirect)
    return null
  }

  const handleGoogle = async () => {
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    })
    if (err) setError(err.message)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()

    if (mode === 'signup') {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}` },
      })
      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }
      // Supabase auto-signs in on signup when email confirm is disabled
      router.replace(redirect)
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }
      router.replace(redirect)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      setError('Enter your email address first')
      return
    }
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })
    if (err) setError(err.message)
    else setResetSent(true)
  }

  return (
    <div style={{
      minHeight: 'calc(100dvh - 56px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '16px',
        padding: '40px 32px',
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: '8px',
          color: 'var(--text-primary)',
        }}>
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h1>
        <p style={{
          fontSize: '0.875rem',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          marginBottom: '32px',
        }}>
          {mode === 'signup'
            ? 'Sign up to unlock unlimited practice'
            : 'Log in to continue practicing'}
        </p>

        {/* Google OAuth */}
        <button
          onClick={handleGoogle}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          margin: '24px 0',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.03)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.03)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />

          {error && (
            <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: 0 }}>{error}</p>
          )}

          {resetSent && (
            <p style={{ color: '#22c55e', fontSize: '0.8rem', margin: 0 }}>
              Password reset email sent. Check your inbox.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.15s ease',
            }}
          >
            {loading ? 'Please wait...' : mode === 'signup' ? 'Sign up' : 'Log in'}
          </button>
        </form>

        {/* Mode toggle + forgot password */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          {mode === 'login' && (
            <button
              onClick={handleResetPassword}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                marginBottom: '12px',
                display: 'block',
                width: '100%',
              }}
            >
              Forgot your password?
            </button>
          )}
          <button
            onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); setResetSent(false) }}
            style={{
              background: 'none',
              border: 'none',
              color: '#a78bfa',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {mode === 'signup'
              ? 'Already have an account? Log in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/signup/page.tsx
git commit -m "feat: add signup/login page with Google OAuth and email/password"
```

---

## Task 5: Create OAuth Callback Route

**Files:**
- Create: `app/auth/callback/route.ts`

- [ ] **Step 1: Create the callback route**

```typescript
// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${redirect}`)
    }
  }

  // Auth error — redirect to signup with error
  return NextResponse.redirect(`${origin}/signup?error=auth_failed`)
}
```

- [ ] **Step 2: Commit**

```bash
git add app/auth/callback/route.ts
git commit -m "feat: add OAuth callback route for code exchange"
```

---

## Task 6: Create Password Reset Pages

**Files:**
- Create: `app/auth/reset-password/page.tsx`
- Create: `app/auth/update-password/page.tsx`

- [ ] **Step 1: Create reset password request page**

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })

    if (err) setError(err.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: 'calc(100dvh - 56px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '16px',
        padding: '40px 32px',
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '8px', color: 'var(--text-primary)' }}>
          Reset your password
        </h1>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#22c55e', fontSize: '0.9rem', marginBottom: '24px' }}>
              Check your email for a password reset link.
            </p>
            <Link href="/signup" style={{ color: '#a78bfa', fontSize: '0.85rem' }}>
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.03)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: 0 }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
            <Link href="/signup" style={{ color: '#a78bfa', fontSize: '0.85rem', textAlign: 'center' }}>
              Back to login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create update password page**

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    router.replace('/')
  }

  return (
    <div style={{
      minHeight: 'calc(100dvh - 56px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '16px',
        padding: '40px 32px',
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '24px', color: 'var(--text-primary)' }}>
          Set new password
        </h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.03)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: 0 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/auth/reset-password/page.tsx app/auth/update-password/page.tsx
git commit -m "feat: add password reset and update pages"
```

---

## Task 7: Create User Data API Routes

**Files:**
- Create: `app/api/user/progress/route.ts`
- Create: `app/api/user/stats/route.ts`
- Create: `app/api/user/sync/route.ts`
- Create: `app/api/user/migrate/route.ts`

- [ ] **Step 1: Create progress upsert route**

```typescript
// app/api/user/progress/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subject, unit, drillAccuracy, mcqAccuracy, totalAttempts } = await req.json()

  const { error } = await supabase
    .from('user_progress')
    .upsert(
      {
        user_id: user.id,
        subject,
        unit,
        drill_accuracy: drillAccuracy,
        mcq_accuracy: mcqAccuracy,
        total_attempts: totalAttempts,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,subject,unit' }
    )

  if (error) {
    console.error('user/progress upsert error:', error.message)
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Create stats update route**

```typescript
// app/api/user/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { totalQuestions, streakCount, streakLastDate } = await req.json()

  const { error } = await supabase
    .from('user_stats')
    .upsert(
      {
        user_id: user.id,
        total_questions: totalQuestions,
        streak_count: streakCount,
        streak_last_date: streakLastDate,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (error) {
    console.error('user/stats upsert error:', error.message)
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Create sync route (fetch all user data)**

```typescript
// app/api/user/sync/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [progressResult, statsResult] = await Promise.all([
    supabase.from('user_progress').select('*').eq('user_id', user.id),
    supabase.from('user_stats').select('*').eq('user_id', user.id).single(),
  ])

  return NextResponse.json({
    progress: progressResult.data ?? [],
    stats: statsResult.data ?? { total_questions: 0, streak_count: 0, streak_last_date: null },
  })
}
```

- [ ] **Step 4: Create migration route**

```typescript
// app/api/user/migrate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

interface MasteryPayload {
  subject: string
  unit: string
  drillAccuracy: number
  mcqAccuracy: number
  totalAttempts: number
}

interface MigrationPayload {
  mastery: MasteryPayload[]
  totalQuestions: number
  streakCount: number
  streakLastDate: string | null
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload: MigrationPayload = await req.json()

  // Check if user already has stats (already migrated or has data from another device)
  const { data: existingStats } = await supabase
    .from('user_stats')
    .select('total_questions')
    .eq('user_id', user.id)
    .single()

  // Merge strategy: take higher values
  const mergedTotalQuestions = Math.max(
    payload.totalQuestions,
    existingStats?.total_questions ?? 0
  )

  // Upsert stats
  await supabase
    .from('user_stats')
    .upsert({
      user_id: user.id,
      total_questions: mergedTotalQuestions,
      streak_count: payload.streakCount,
      streak_last_date: payload.streakLastDate,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  // Upsert progress rows — merge with existing
  for (const m of payload.mastery) {
    const { data: existing } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('subject', m.subject)
      .eq('unit', m.unit)
      .single()

    await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        subject: m.subject,
        unit: m.unit,
        drill_accuracy: Math.max(m.drillAccuracy, existing?.drill_accuracy ?? 0),
        mcq_accuracy: Math.max(m.mcqAccuracy, existing?.mcq_accuracy ?? 0),
        total_attempts: (existing?.total_attempts ?? 0) + m.totalAttempts,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,subject,unit' })
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 5: Commit**

```bash
git add app/api/user/progress/route.ts app/api/user/stats/route.ts app/api/user/sync/route.ts app/api/user/migrate/route.ts
git commit -m "feat: add user data API routes (progress, stats, sync, migrate)"
```

---

## Task 8: Create Persistence Layer and Data Migration

**Files:**
- Create: `utils/persistence.ts`
- Create: `utils/dataMigration.ts`
- Modify: `utils/localStorage.ts` (add `migrated` key)

- [ ] **Step 1: Add `migrated` key to LS_KEYS**

In `utils/localStorage.ts`, add to the `LS_KEYS` object:

```typescript
export const LS_KEYS = {
  streak: 'ascendly_streak',
  mastery: (subject: string, unit: string) => `ascendly_mastery_${subject}_${unit}`,
  score: (subject: string) => `ascendly_score_${subject}`,
  totalQuestions: 'ascendly_total_questions',
  activeSubject: 'ascendly_active_subject',
  drillDraft: (subject: string) => `ascendly_draft_drill_${subject}`,
  mcqDraft: (subject: string) => `ascendly_draft_mcq_${subject}`,
  testDraft: (subject: string) => `ascendly_draft_test_${subject}`,
  migrated: 'ascendly_migrated',
} as const
```

- [ ] **Step 2: Create `utils/persistence.ts`**

```typescript
// utils/persistence.ts
// Dual-write layer: always writes localStorage, also fires to Supabase if authenticated.
// Supabase writes are fire-and-forget — never block UI.

import { lsGet, lsSet, LS_KEYS } from '@/utils/localStorage'

interface MasteryData {
  drillAccuracy: number
  mcqAccuracy: number
  totalAttempts: number
}

let _isAuthenticated = false

export function setAuthState(authenticated: boolean): void {
  _isAuthenticated = authenticated
}

export function saveProgress(subject: string, unit: string, data: MasteryData): void {
  // Always write localStorage first (instant UI)
  lsSet(LS_KEYS.mastery(subject, unit), data)

  if (_isAuthenticated) {
    fetch('/api/user/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, unit, ...data }),
    }).catch(() => {})
  }
}

export function saveStats(totalQuestions: number, streakCount: number, streakLastDate: string | null): void {
  // localStorage writes handled by callers (drillSession, mcqSession, etc.)
  // This only handles the Supabase sync
  if (_isAuthenticated) {
    fetch('/api/user/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ totalQuestions, streakCount, streakLastDate }),
    }).catch(() => {})
  }
}

export function syncFromSupabase(): void {
  if (!_isAuthenticated) return

  fetch('/api/user/sync')
    .then(res => res.json())
    .then(data => {
      // Hydrate localStorage from Supabase data
      if (data.stats) {
        lsSet(LS_KEYS.totalQuestions, data.stats.total_questions)
        if (data.stats.streak_count > 0) {
          lsSet(LS_KEYS.streak, {
            count: data.stats.streak_count,
            lastPracticeDate: data.stats.streak_last_date,
          })
        }
      }

      if (data.progress) {
        for (const row of data.progress) {
          const existing = lsGet(LS_KEYS.mastery(row.subject, row.unit), {
            drillAccuracy: 0, mcqAccuracy: 0, totalAttempts: 0,
          })
          // Take the higher values (Supabase may have data from another device)
          lsSet(LS_KEYS.mastery(row.subject, row.unit), {
            drillAccuracy: Math.max(row.drill_accuracy, existing.drillAccuracy),
            mcqAccuracy: Math.max(row.mcq_accuracy, existing.mcqAccuracy),
            totalAttempts: Math.max(row.total_attempts, existing.totalAttempts),
          })
        }
      }
    })
    .catch(() => {})
}
```

- [ ] **Step 3: Create `utils/dataMigration.ts`**

```typescript
// utils/dataMigration.ts
// One-time migration of localStorage data to Supabase on first sign-in.

import { lsGet, lsSet, LS_KEYS } from '@/utils/localStorage'

interface StreakData {
  count: number
  lastPracticeDate: string
}

export async function migrateLocalStorageToSupabase(): Promise<void> {
  // Check if already migrated
  if (lsGet<boolean>(LS_KEYS.migrated, false)) return

  if (typeof window === 'undefined') return

  // Collect all mastery keys
  const mastery: { subject: string; unit: string; drillAccuracy: number; mcqAccuracy: number; totalAttempts: number }[] = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith('ascendly_mastery_')) continue

    // Parse subject and unit from key: ascendly_mastery_{subject}_{unit}
    const parts = key.replace('ascendly_mastery_', '').split('_')
    // Subject slugs contain hyphens, unit slugs contain hyphens
    // Key format: ascendly_mastery_ap-psychology_unit-1
    // We need to find where subject ends and unit begins
    // Subjects always start with "ap-" so find the second segment starting point
    const raw = key.replace('ascendly_mastery_', '')
    const unitSep = raw.lastIndexOf('_')
    if (unitSep === -1) continue

    const subject = raw.slice(0, unitSep)
    const unit = raw.slice(unitSep + 1)

    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}')
      mastery.push({
        subject,
        unit,
        drillAccuracy: data.drillAccuracy ?? 0,
        mcqAccuracy: data.mcqAccuracy ?? 0,
        totalAttempts: data.totalAttempts ?? 0,
      })
    } catch {
      // Skip malformed entries
    }
  }

  const totalQuestions = lsGet<number>(LS_KEYS.totalQuestions, 0)
  const streak = lsGet<StreakData | null>(LS_KEYS.streak, null)

  try {
    const res = await fetch('/api/user/migrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mastery,
        totalQuestions,
        streakCount: streak?.count ?? 0,
        streakLastDate: streak?.lastPracticeDate ?? null,
      }),
    })

    if (res.ok) {
      lsSet(LS_KEYS.migrated, true)
    }
  } catch {
    // Migration failed — will retry on next sign-in
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add utils/localStorage.ts utils/persistence.ts utils/dataMigration.ts
git commit -m "feat: add persistence layer (dual-write) and localStorage migration utility"
```

---

## Task 9: Wire AuthContext to Persistence and Migration

**Files:**
- Modify: `contexts/AuthContext.tsx`

- [ ] **Step 1: Update AuthContext to trigger migration and sync**

Replace the `useEffect` in `AuthContext.tsx` to trigger migration on first sign-in and sync on every sign-in:

```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { setAuthState, syncFromSupabase } from '@/utils/persistence'
import { migrateLocalStorageToSupabase } from '@/utils/dataMigration'
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
      setIsLoading(false)

      if (s?.user) {
        // Migrate localStorage to Supabase (no-op if already migrated)
        migrateLocalStorageToSupabase().then(() => syncFromSupabase())
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, s) => {
        setSession(s)
        setUser(s?.user ?? null)
        setAuthState(!!s?.user)
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
```

- [ ] **Step 2: Commit**

```bash
git add contexts/AuthContext.tsx
git commit -m "feat: wire AuthContext to data migration and Supabase sync"
```

---

## Task 10: Create Freemium Gate Component

**Files:**
- Create: `utils/freeTrialGate.ts`
- Create: `components/auth/AuthGuard.tsx`

- [ ] **Step 1: Create `utils/freeTrialGate.ts`**

```typescript
// utils/freeTrialGate.ts
import { lsGet, LS_KEYS } from '@/utils/localStorage'

export const FREE_QUESTION_LIMIT = 5

export function shouldBlockAccess(): boolean {
  const total = lsGet<number>(LS_KEYS.totalQuestions, 0)
  return total >= FREE_QUESTION_LIMIT
}
```

- [ ] **Step 2: Create `components/auth/AuthGuard.tsx`**

```typescript
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
```

- [ ] **Step 3: Commit**

```bash
git add utils/freeTrialGate.ts components/auth/AuthGuard.tsx
git commit -m "feat: add freemium gate with AuthGuard component"
```

---

## Task 11: Wire AuthGuard into Question Pages

**Files:**
- Modify: `app/[subject]/drills/page.tsx`
- Modify: `app/[subject]/practice/page.tsx`
- Modify: `app/[subject]/practice-test/page.tsx`

- [ ] **Step 1: Add AuthGuard to drills page**

At the top of `app/[subject]/drills/page.tsx`, add the import:

```typescript
import { AuthGuard } from '@/components/auth/AuthGuard'
```

Then wrap the page's return JSX with `<AuthGuard>`. Find the `return (` in the component and wrap:

```typescript
return (
  <AuthGuard>
    {/* existing JSX */}
  </AuthGuard>
)
```

- [ ] **Step 2: Add AuthGuard to practice page**

Same pattern in `app/[subject]/practice/page.tsx`:

```typescript
import { AuthGuard } from '@/components/auth/AuthGuard'
```

Wrap the return JSX with `<AuthGuard>`.

- [ ] **Step 3: Add AuthGuard to practice-test page**

Same pattern in `app/[subject]/practice-test/page.tsx`:

```typescript
import { AuthGuard } from '@/components/auth/AuthGuard'
```

Wrap the return JSX with `<AuthGuard>`.

- [ ] **Step 4: Verify build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add app/[subject]/drills/page.tsx app/[subject]/practice/page.tsx app/[subject]/practice-test/page.tsx
git commit -m "feat: add AuthGuard to drills, practice, and practice-test pages"
```

---

## Task 12: Update Session Handlers to Use Persistence Layer

**Files:**
- Modify: `utils/drillSession.ts:113-156`
- Modify: `utils/mcqSession.ts:80-137`
- Modify: `utils/testSession.ts:168-198`

- [ ] **Step 1: Update `utils/drillSession.ts`**

Add import at the top:

```typescript
import { saveProgress, saveStats } from '@/utils/persistence'
```

Replace the `handleSessionComplete` function body. After the existing `lsSet` calls for mastery, add `saveProgress()` calls. After the `lsSet` for `totalQuestions`, add a `saveStats()` call.

Specifically, after each `lsSet(LS_KEYS.mastery(...), ...)` call, add a corresponding `saveProgress()` call. The `lsSet` stays for localStorage, and `saveProgress` sends to Supabase if authenticated.

In the single-unit branch (line ~129), after `lsSet(LS_KEYS.mastery(...), ...)`:

```typescript
const updatedMastery = {
  ...existing,
  drillAccuracy,
  totalAttempts: existing.totalAttempts + totalCards,
}
lsSet(LS_KEYS.mastery(subject, session.unitSlug), updatedMastery)
saveProgress(subject, session.unitSlug, updatedMastery)
```

In the Study All branch (line ~149), after each `lsSet(LS_KEYS.mastery(...), ...)`:

```typescript
const updatedMastery = {
  ...existing,
  drillAccuracy,
  totalAttempts: existing.totalAttempts + total,
}
lsSet(LS_KEYS.mastery(subject, unitSlug), updatedMastery)
saveProgress(subject, unitSlug, updatedMastery)
```

After the `lsSet(LS_KEYS.totalQuestions, ...)` call (line ~119), add:

```typescript
const newTotal = prevTotal + totalCards
lsSet(LS_KEYS.totalQuestions, newTotal)

// Sync stats to Supabase
const streak = lsGet<{ count: number; lastPracticeDate: string } | null>(LS_KEYS.streak, null)
saveStats(newTotal, streak?.count ?? 0, streak?.lastPracticeDate ?? null)
```

- [ ] **Step 2: Update `utils/mcqSession.ts`**

Same pattern. Add import:

```typescript
import { saveProgress, saveStats } from '@/utils/persistence'
```

After each `lsSet(LS_KEYS.mastery(...), ...)` in `handleMCQSessionComplete`, add the corresponding `saveProgress()` call.

After `lsSet(LS_KEYS.totalQuestions, ...)`, add `saveStats()`.

- [ ] **Step 3: Update `utils/testSession.ts`**

Add import:

```typescript
import { saveStats } from '@/utils/persistence'
```

After `lsSet(LS_KEYS.totalQuestions, ...)` in `handleTestComplete` (line ~182), add:

```typescript
const newTotal = prevTotal + totalQuestions
lsSet(LS_KEYS.totalQuestions, newTotal)

const streak = lsGet<{ count: number; lastPracticeDate: string } | null>(LS_KEYS.streak, null)
saveStats(newTotal, streak?.count ?? 0, streak?.lastPracticeDate ?? null)
```

Note: `handleTestComplete` does NOT write mastery keys (by design — D-24), so no `saveProgress` call needed here.

- [ ] **Step 4: Verify build and existing tests**

Run: `npx next build 2>&1 | tail -20 && npm test 2>&1 | tail -30`
Expected: Build succeeds, existing tests pass (persistence calls are fire-and-forget, tests mock lsSet)

- [ ] **Step 5: Commit**

```bash
git add utils/drillSession.ts utils/mcqSession.ts utils/testSession.ts
git commit -m "feat: wire session handlers to dual-write persistence layer"
```

---

## Task 13: Update Header with User State

**Files:**
- Modify: `components/layout/Header.tsx`

- [ ] **Step 1: Update Header to show auth state**

Replace `components/layout/Header.tsx`:

```typescript
'use client'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const { direction, isAtTop } = useScrollDirection(50)
  const [hovered, setHovered] = useState(false)
  const { user, isAuthenticated, isLoading, signOut } = useAuth()
  const visible = isAtTop || direction === 'up' || hovered

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setHovered(e.clientY < 20)
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  const displayName = user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || ''

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '56px',
      backgroundColor: 'rgba(5, 5, 8, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '24px',
      paddingRight: '24px',
      justifyContent: 'space-between',
      zIndex: 50,
      transform: visible ? 'translateY(0)' : 'translateY(-100%)',
      transition: 'transform 0.3s ease',
    }}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: '1px' }}>
        <span style={{ fontWeight: 700, fontSize: '1.125rem', color: '#d4d4d4', letterSpacing: '-0.01em' }}>
          geta
        </span>
        <span style={{
          fontWeight: 800,
          fontSize: '1.35rem',
          background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.01em',
        }}>
          5
        </span>
        <span style={{ fontWeight: 700, fontSize: '1.125rem', color: '#d4d4d4', letterSpacing: '-0.01em' }}>
          .app
        </span>
      </Link>

      {/* Auth section */}
      {!isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isAuthenticated ? (
            <>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayName}
              </span>
              <button
                onClick={signOut}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)')}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/signup"
              style={{
                fontSize: '0.8rem',
                color: '#a78bfa',
                textDecoration: 'none',
              }}
            >
              Sign in
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add components/layout/Header.tsx
git commit -m "feat: add user auth state to header (display name + sign out)"
```

---

## Task 14: Update Analytics with User ID

**Files:**
- Modify: `utils/analytics.ts`

- [ ] **Step 1: Update analytics to include user_id when authenticated**

```typescript
// utils/analytics.ts
// Fire-and-forget — NEVER awaited by UI code, NEVER throws to caller

interface EventPayload {
  event_type: string
  subject: string
  unit?: string
  metadata?: Record<string, unknown>
}

function getAnonId(): string {
  const key = 'ascendly_anon_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

let _userId: string | null = null

export function setAnalyticsUserId(userId: string | null): void {
  _userId = userId
}

export function logEvent(payload: EventPayload): void {
  if (typeof window === 'undefined') return
  const anon_id = getAnonId()
  fetch('/api/log-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      metadata: { ...payload.metadata, anon_id, ...(_userId ? { user_id: _userId } : {}) },
    }),
  }).catch(() => {
    // Silently ignore all failures — never block UI
  })
}
```

- [ ] **Step 2: Wire analytics user_id from AuthContext**

In `contexts/AuthContext.tsx`, add import and call:

```typescript
import { setAnalyticsUserId } from '@/utils/analytics'
```

In the `onAuthStateChange` callback, after setting user:

```typescript
setAnalyticsUserId(s?.user?.id ?? null)
```

And in the initial `getSession` block, after setting user:

```typescript
setAnalyticsUserId(s?.user?.id ?? null)
```

- [ ] **Step 3: Commit**

```bash
git add utils/analytics.ts contexts/AuthContext.tsx
git commit -m "feat: include user_id in analytics events for authenticated users"
```

---

## Task 15: Update Marketing Copy

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update homepage metadata**

In `app/page.tsx`, update the metadata:

```typescript
export const metadata: Metadata = {
  title: 'geta5.app — Free AP Exam Prep',
  description: 'Free AP practice questions, drills, and study guides for 7 AP subjects. Free to try, sign up to unlock unlimited practice.',
}
```

- [ ] **Step 2: Update layout metadata**

In `app/layout.tsx`, update the metadata description:

```typescript
description: 'Free AP practice questions, drills, and study guides. Free to try, sign up to unlock unlimited practice.',
```

And in openGraph:

```typescript
description: 'Free AP practice questions, drills, and study guides for AP Psychology, AP World History, AP Calculus, AP Chemistry, and more. Free to try, sign up for unlimited access.',
```

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx app/layout.tsx
git commit -m "feat: update marketing copy for freemium model"
```

---

## Task 16: Create Admin User Management API Routes

**Files:**
- Create: `app/api/admin/users/route.ts`
- Create: `app/api/admin/user/[id]/route.ts`

- [ ] **Step 1: Create admin users list route**

```typescript
// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ascendly-admin-2026'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('x-admin-password')
  if (auth !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, display_name, created_at')
    .order('created_at', { ascending: false })

  const { data: stats } = await supabase
    .from('user_stats')
    .select('user_id, total_questions, streak_count, updated_at')

  // Join profiles with stats
  const statsMap = new Map((stats ?? []).map(s => [s.user_id, s]))

  const users = (profiles ?? []).map(p => ({
    id: p.id,
    email: p.email,
    displayName: p.display_name,
    createdAt: p.created_at,
    totalQuestions: statsMap.get(p.id)?.total_questions ?? 0,
    streakCount: statsMap.get(p.id)?.streak_count ?? 0,
    lastActive: statsMap.get(p.id)?.updated_at ?? p.created_at,
  }))

  return NextResponse.json({ users, total: users.length })
}
```

- [ ] **Step 2: Create admin user detail route**

```typescript
// app/api/admin/user/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ascendly-admin-2026'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = req.headers.get('x-admin-password')
  if (auth !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createClient()

  const [profileResult, progressResult, statsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('user_progress').select('*').eq('user_id', id).order('subject'),
    supabase.from('user_stats').select('*').eq('user_id', id).single(),
  ])

  if (!profileResult.data) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({
    profile: profileResult.data,
    progress: progressResult.data ?? [],
    stats: statsResult.data ?? { total_questions: 0, streak_count: 0 },
  })
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/users/route.ts app/api/admin/user/[id]/route.ts
git commit -m "feat: add admin API routes for user list and user detail"
```

---

## Task 17: Add Users Tab to Admin Dashboard

**Files:**
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Add Users tab to admin dashboard**

This is a larger UI change to the existing admin page. Add a tab system at the top (Analytics | Users), and a users table with click-to-detail. The exact implementation depends on the current admin page structure, but the key additions:

1. Add `tab` state: `'analytics' | 'users'`
2. Add tab buttons at the top
3. When `tab === 'users'`, fetch from `/api/admin/users` with the `x-admin-password` header
4. Render a table with columns: Email, Display Name, Total Questions, Streak, Last Active, Signed Up
5. Click a row to fetch `/api/admin/user/[id]` and show detail modal/panel
6. Add summary stats at top: Total Users, Active Today, Conversion Rate

The implementation should follow the existing admin page's styling and patterns.

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat: add users tab to admin dashboard with user list and detail view"
```

---

## Task 18: Database Setup (Manual Steps)

This task requires manual action in the Supabase dashboard. The engineer should:

- [ ] **Step 1: Run SQL schema in Supabase SQL Editor**

Copy the SQL from `docs/superpowers/specs/2026-04-04-auth-freemium-design.md` Section 2 and run it in the Supabase SQL Editor. This creates:
- `profiles` table
- `user_progress` table
- `user_stats` table
- RLS policies
- `handle_new_user()` trigger

- [ ] **Step 2: Enable Google OAuth in Supabase Auth**

Go to Authentication > Providers > Google:
- Enable it
- Add Google OAuth Client ID and Secret (from Google Cloud Console)

- [ ] **Step 3: Add redirect URLs**

Go to Authentication > URL Configuration:
- Add `http://localhost:3000/auth/callback` to Redirect URLs
- Add `https://geta5.app/auth/callback` to Redirect URLs

- [ ] **Step 4: Add `ADMIN_PASSWORD` to `.env.local`**

```
ADMIN_PASSWORD=your-secure-admin-password
```

- [ ] **Step 5: Verify end-to-end**

1. Start dev server: `npm run dev`
2. Open `http://localhost:3000`
3. Answer 5 questions
4. Verify redirect to `/signup`
5. Sign up with email/password
6. Verify redirect back to content
7. Verify mastery data persisted
8. Check Supabase tables have data

---

## Summary

| Task | Description | Dependencies |
|------|-------------|-------------|
| 1 | Install @supabase/ssr, create client helpers | None |
| 2 | Create middleware for session refresh | Task 1 |
| 3 | Create AuthContext provider | Task 1 |
| 4 | Create signup/login page | Task 1, 3 |
| 5 | Create OAuth callback route | Task 1 |
| 6 | Create password reset pages | Task 1 |
| 7 | Create user data API routes | Task 1 |
| 8 | Create persistence layer + migration utility | Task 1 |
| 9 | Wire AuthContext to persistence + migration | Task 3, 7, 8 |
| 10 | Create freemium gate + AuthGuard | Task 3 |
| 11 | Wire AuthGuard into question pages | Task 10 |
| 12 | Update session handlers for dual-write | Task 8 |
| 13 | Update Header with auth state | Task 3 |
| 14 | Update analytics with user_id | Task 3 |
| 15 | Update marketing copy | None |
| 16 | Create admin user management API routes | Task 1 |
| 17 | Add Users tab to admin dashboard | Task 16 |
| 18 | Database setup (manual) | Before end-to-end testing |
