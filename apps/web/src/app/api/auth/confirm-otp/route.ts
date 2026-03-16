/**
 * POST /api/auth/confirm-otp
 * Confirms the OTP entered by the user
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { authRatelimit, getRateLimitKey, rateLimitResponse } from '@/lib/ratelimit'
import { normalisePhone, sendNotification, MESSAGES } from '@/lib/messaging'
import * as crypto from 'crypto'

function hashOTP(otp: string): string {
  return crypto.createHash('sha256').update(otp + process.env.OTP_SALT || 'hirrd-otp').digest('hex')
}

export async function POST(request: Request) {
  try {
    const { phone, otp } = await request.json()
    const normalised = normalisePhone(phone)
    if (!normalised || !otp) {
      return NextResponse.json({ error: 'Phone and OTP required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const otpHash = hashOTP(otp)

    // Find valid OTP
    const { data: record } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('profile_id', user.id)
      .eq('phone', normalised)
      .eq('otp_hash', otpHash)
      .eq('purpose', 'phone_verify')
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired code. Please request a new one.' }, { status: 400 })
    }

    // Mark OTP as used
    await supabase.from('otp_verifications')
      .update({ used_at: new Date().toISOString() })
      .eq('id', record.id)

    // Mark phone as verified
    await supabase.from('profiles')
      .update({ phone: normalised, phone_verified: true })
      .eq('id', user.id)

    await supabase.from('candidates')
      .update({ phone_verified: true })
      .eq('profile_id', user.id)

    // Send welcome WhatsApp (non-blocking)
    const { data: profile } = await supabase
      .from('profiles').select('full_name').eq('id', user.id).single()

    if (profile?.full_name) {
      sendNotification(normalised, MESSAGES.welcome(profile.full_name)).catch(console.error)
    }

    return NextResponse.json({ success: true, verified: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
