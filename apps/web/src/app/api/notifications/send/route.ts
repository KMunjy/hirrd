/**
 * POST /api/notifications/send
 * Internal API to send WhatsApp/SMS notifications
 * Called by: CV parse complete, new match, employer verified, etc.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendNotification, MESSAGES } from '@/lib/messaging'

type NotificationType = 'cv_parsed' | 'new_match' | 'employer_verified' | 'application_received'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { type, data: payload }: { type: NotificationType; data: Record<string, any> } = await request.json()

    // Get phone + preferences
    const { data: profile } = await supabase
      .from('profiles').select('phone, phone_verified, full_name').eq('id', user.id).single()

    const { data: candidate } = await supabase
      .from('candidates').select('whatsapp_opt_in, sms_opt_in, preferred_channel').eq('profile_id', user.id).single()

    if (!profile?.phone || !profile?.phone_verified) {
      return NextResponse.json({ skipped: true, reason: 'Phone not verified' })
    }

    // Check opt-in
    const canSendWhatsApp = candidate?.whatsapp_opt_in || candidate?.preferred_channel === 'whatsapp'
    const canSendSMS = candidate?.sms_opt_in || true // SMS on by default

    if (!canSendWhatsApp && !canSendSMS) {
      return NextResponse.json({ skipped: true, reason: 'Not opted in' })
    }

    // Build message based on type
    let message = ''
    switch (type) {
      case 'cv_parsed':
        message = MESSAGES.cvParsed(profile.full_name || 'there', payload.cv_score, payload.match_count)
        break
      case 'new_match':
        message = MESSAGES.newMatch(profile.full_name || 'there', payload.job_title, payload.company, payload.match_score)
        break
      case 'employer_verified':
        message = MESSAGES.employerVerified(payload.company_name)
        break
      case 'application_received':
        message = MESSAGES.applicationReceived(profile.full_name || 'there', payload.job_title)
        break
      default:
        return NextResponse.json({ error: 'Unknown notification type' }, { status: 400 })
    }

    const result = await sendNotification(profile.phone, message, canSendWhatsApp)

    // Log notification
    await supabase.from('notification_log').insert({
      profile_id: user.id,
      channel: result.channel,
      phone: profile.phone,
      message_type: type,
      status: result.success ? 'sent' : 'failed',
      provider_id: result.messageId,
    })

    return NextResponse.json({ success: result.success, channel: result.channel })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
