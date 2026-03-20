import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // If explicit redirect specified, honour it
      if (redirect) return NextResponse.redirect(`${origin}${redirect}`)

      // Check if candidate has completed onboarding (has a candidate row)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: candidate } = await supabase
          .from('candidates')
          .select('id, cv_url')
          .eq('profile_id', user.id)
          .single()

        // No candidate row = brand new user, send to build-profile
        if (!candidate) {
          return NextResponse.redirect(`${origin}/build-profile`)
        }

        // Has candidate but no CV = nudge to profile
        if (!candidate.cv_url) {
          return NextResponse.redirect(`${origin}/dashboard?welcome=1`)
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
