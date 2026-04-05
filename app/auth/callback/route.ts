// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'email' | 'recovery' | 'invite' | 'magiclink' | null
  const redirect = searchParams.get('redirect') || '/'

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // OAuth flow (Google sign-in)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${redirect}`)
    }
  }

  // Email confirmation / password recovery flow
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      // Password recovery goes to update-password page
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/auth/update-password`)
      }
      return NextResponse.redirect(`${origin}${redirect}`)
    }
  }

  // Auth error — redirect to signup with error
  return NextResponse.redirect(`${origin}/signup?error=auth_failed`)
}
