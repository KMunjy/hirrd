import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, institutionLeadReceivedEmail } from '@/lib/email'
import { leadSubmitRatelimit, getRateLimitKey, rateLimitResponse } from '@/lib/ratelimit'

export async function POST(request: Request) {
  // Rate limiting
  const key = getRateLimitKey(request, 'institution-lead')
  const { success, reset } = await leadSubmitRatelimit.limit(key)
  if (!success) return rateLimitResponse(reset)

  try {
    const body = await request.json()
    const {
      legal_name, trading_name, institution_type, dhet_reg_number,
      seta_name, saqa_id, website, physical_address,
      contact_name, contact_title, contact_email, contact_phone,
      programmes_summary, tos_accepted_at,
    } = body

    if (!legal_name || !institution_type || !physical_address || !contact_name || !contact_email) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase.from('institutions').insert({
      legal_name, trading_name, institution_type,
      dhet_reg_number, seta_name, saqa_id, website,
      physical_address, contact_name, contact_title,
      contact_email, contact_phone, programmes_summary,
      tos_accepted_at, account_status: 'pending',
    })

    if (error) {
      console.error('institution insert error:', error)
      return NextResponse.json({ error: 'Failed to save. Please try again.' }, { status: 500 })
    }

    // Confirmation email to institution
    sendEmail({
      to: contact_email,
      subject: 'Your Hirrd institution application is received',
      html: institutionLeadReceivedEmail(legal_name, contact_email),
    }).catch(console.error)

    // Admin alert
    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail) {
      sendEmail({
        to: adminEmail,
        subject: `New institution lead: ${legal_name}`,
        html: `<p>New institution application: <strong>${legal_name}</strong> (${institution_type}). Contact: ${contact_email}. <a href="https://hirrd-web.vercel.app/admin">Review in admin</a></p>`,
      }).catch(console.error)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
