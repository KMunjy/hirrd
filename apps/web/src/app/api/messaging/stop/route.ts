/**
 * POST /api/messaging/stop
 * Twilio inbound webhook — handles WhatsApp/SMS STOP replies
 * POPIA compliance: immediately opt-out the user when they reply STOP
 * Configure in Twilio console as webhook URL for incoming messages
 */
import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { normalisePhone } from '@/lib/messaging'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const params = new URLSearchParams(body)

    const from = params.get('From') || ''
    const messageBody = (params.get('Body') || '').trim().toUpperCase()

    // Only handle explicit opt-out keywords
    const STOP_WORDS = ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT']
    if (!STOP_WORDS.includes(messageBody)) {
      // Not an opt-out — return empty TwiML (no reply)
      return new Response('<Response/>', { headers: { 'Content-Type': 'text/xml' } })
    }

    // Normalise phone number
    const phone = from.replace('whatsapp:', '')
    const normalised = normalisePhone(phone) || phone

    const supabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Find profile by phone and opt them out
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', normalised)
      .single()

    if (profile) {
      await supabase.from('candidates').update({
        whatsapp_opt_in: false,
        sms_opt_in: false,
        preferred_channel: 'email',
      }).eq('profile_id', profile.id)

      // Log the opt-out
      await supabase.from('notification_log').insert({
        profile_id: profile.id,
        channel: from.startsWith('whatsapp:') ? 'whatsapp' : 'sms',
        phone: normalised,
        message_type: 'opt_out_stop',
        status: 'delivered',
      })
    }

    // TwiML response confirming opt-out (POPIA: must confirm)
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>You have been unsubscribed from Hirrd job alerts. Reply START any time to re-subscribe. Your data remains protected under POPIA. hirrd-web.vercel.app</Message>
</Response>`

    return new Response(twiml, { headers: { 'Content-Type': 'text/xml' } })
  } catch (err: any) {
    console.error('STOP handler error:', err)
    return new Response('<Response/>', { headers: { 'Content-Type': 'text/xml' } })
  }
}
