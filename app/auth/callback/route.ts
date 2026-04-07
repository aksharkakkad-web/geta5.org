// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'email' | 'recovery' | 'invite' | 'magiclink' | null
  const redirect = searchParams.get('redirect') || '/'

  // OAuth flow (Google sign-in)
  // IMPORTANT: cookies must be set on the response object, not via next/headers cookies()
  if (code) {
    const redirectResponse = NextResponse.redirect(`${origin}${redirect}`)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) =>
            cookiesToSet.forEach(({ name, value, options }) =>
              redirectResponse.cookies.set(name, value, options)
            ),
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return redirectResponse
    }
  }

  // Email confirmation / password recovery flow
  if (token_hash && type) {
    const dest = type === 'recovery' ? `${origin}/auth/update-password` : `${origin}${redirect}`
    const otpResponse = NextResponse.redirect(dest)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) =>
            cookiesToSet.forEach(({ name, value, options }) =>
              otpResponse.cookies.set(name, value, options)
            ),
        },
      }
    )
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      return otpResponse
    }
  }

  // Auth error — redirect to signup with error flag
  return NextResponse.redirect(`${origin}/signup?error=auth_failed`)
}
