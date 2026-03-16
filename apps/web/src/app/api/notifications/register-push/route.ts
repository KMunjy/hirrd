/**
 * POST /api/notifications/register-push
 * Saves FCM push token for the authenticated user
 * Enables server-side push notification delivery (alternative to WhatsApp)
 *
 * DELETE /api/notifications/register-push
 * Removes FCM token (POPIA opt-out)
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { authRatelimit, getRateLimitKey, rateLimitResponse } from '@/lib/ratelimit'

export async function POST(request: Request) {
  const rlKey = getRateLimitKey(request, 'push-register')
  const { success, reset } = await authRatelimit.limit(rlKey)
  if (!success) return rateLimitResponse(reset)

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { token, platform } = await request.json()

    if (!token || typeof token !== 'string' || token.length < 10) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    // Store FCM token — never log token value
    const { error } = await supabase.from('candidates').update({
      push_opt_in: true,
      push_subscription: { token, platform: platform || 'web', registered_at: new Date().toISOString() },
      preferred_channel: 'push', // Promote push as preferred if user explicitly registered
    }).eq('profile_id', user.id)

    if (error) throw error

    // Log opt-in (no token value in log)
    await supabase.from('notification_log').insert({
      profile_id: user.id,
      channel: 'push',
      message_type: 'push_token_registered',
      status: 'sent',
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await supabase.from('candidates').update({
      push_opt_in: false,
      push_subscription: null,
    }).eq('profile_id', user.id)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
