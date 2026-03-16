/**
 * GET /api/cron/reengagement
 * D+3 re-engagement: candidates registered 3 days ago with no application
 * Called by Vercel Cron (vercel.json) at 09:00 SAST daily
 * Auth: CRON_SECRET header required
 */
import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendNotification, MESSAGES, selectReengagementVariant, normalisePhone } from '@/lib/messaging'

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Find candidates: registered 3 days ago, no applications, WhatsApp opted in, phone verified
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(`
      id, full_name, phone, phone_verified,
      candidates!inner(
        id, whatsapp_opt_in, sms_opt_in, preferred_channel,
        applications(id)
      )
    `)
    .gte('created_at', twoDaysAgo)
    .lte('created_at', threeDaysAgo)

  if (error) {
    console.error('Reengagement query error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let sent = 0
  let skipped = 0

  for (const profile of (profiles || [])) {
    const candidate = profile.candidates?.[0]
    if (!candidate) { skipped++; continue }

    // Skip if already applied
    if ((candidate.applications || []).length > 0) { skipped++; continue }

    // Skip if no phone or not opted in
    if (!profile.phone || !profile.phone_verified) { skipped++; continue }
    if (!candidate.whatsapp_opt_in && !candidate.sms_opt_in) { skipped++; continue }

    // Get a top match for personalisation
    const { data: topMatch } = await supabase
      .from('opportunities')
      .select('title, employers(company_name)')
      .eq('is_active', true)
      .limit(1)
      .single()

    // Select A/B/C variant by user hash (consistent assignment)
    const variant = selectReengagementVariant(profile.id)
    const matchCount = 5 // TODO: query real match count
    const matchScore = 78 // TODO: query real match score

    let message = ''
    if (variant === 'A' && topMatch) {
      message = MESSAGES.reengagementA(
        profile.full_name || 'there',
        topMatch.title,
        (topMatch.employers as any)?.company_name || 'SA employer',
        matchScore
      )
    } else if (variant === 'B') {
      message = MESSAGES.reengagementB(profile.full_name || 'there', matchCount)
    } else {
      message = MESSAGES.reengagementC(
        profile.full_name || 'there',
        topMatch?.title || 'a great SA role',
        matchScore
      )
    }

    // Send WhatsApp (fallback to SMS)
    const preferWhatsApp = candidate.preferred_channel === 'whatsapp' || candidate.whatsapp_opt_in
    const result = await sendNotification(profile.phone, message, preferWhatsApp)

    // Log notification
    await supabase.from('notification_log').insert({
      profile_id: profile.id,
      channel: result.channel,
      phone: profile.phone,
      message_type: `reengagement_d3_variant_${variant}`,
      status: result.success ? 'sent' : 'failed',
      provider_id: result.messageId,
    })

    if (result.success) sent++
    else skipped++
  }

  return NextResponse.json({
    success: true,
    processed: (profiles || []).length,
    sent,
    skipped,
    timestamp: new Date().toISOString(),
  })
}
