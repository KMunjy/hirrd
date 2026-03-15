/**
 * POST /api/auth/verify-phone
 * Sends OTP to candidate's SA mobile number via SMS
 * Rate limited: 3 OTPs per phone per hour
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendOTP, normalisePhone } from '@/lib/messaging'
import { authRatelimit, getRateLimitKey, rateLimitResponse } from '@/lib/ratelimit'
import * as crypto from 'crypto'

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000)) // 6-digit
}

function hashOTP(otp: string): string {
  return crypto.createHash('sha256').update(otp + process.env.OTP_SALT || 'hirrd-otp').digest('hex')
}

export async function POST(request: Request) {
  const rateLimitKey = getRateLimitKey(request, 'verify-phone')
  const { success, reset } = await authRatelimit.limit(rateLimitKey)
  if (!success) return rateLimitResponse(reset)

  try {
    const { phone } = await request.json()
    const normalised = normalisePhone(phone)
    if (!normalised) {
      return NextResponse.json({ error: 'Please enter a valid SA mobile number (e.g. 082 123 4567)' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const otp = generateOTP()
    const otpHash = hashOTP(otp)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store hashed OTP
    await supabase.from('otp_verifications').insert({
      profile_id: user.id,
      phone: normalised,
      otp_hash: otpHash,
      purpose: 'phone_verify',
      expires_at: expiresAt.toISOString(),
    })

    // Update phone on profile
    await supabase.from('profiles').update({ phone: normalised }).eq('id', user.id)

    // Send OTP via SMS
    const result = await sendOTP(normalised, otp)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Could not send verification SMS. Please check your number and try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, channel: result.channel })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
