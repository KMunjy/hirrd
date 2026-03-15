import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  sendEmail,
  employerLeadReceivedEmail,
  adminNewLeadEmail,
} from '@/lib/email'
import { leadSubmitRatelimit, getRateLimitKey, rateLimitResponse } from '@/lib/ratelimit'

export async function POST(request: Request) {
  // Rate limiting
  const key = getRateLimitKey(request, 'employer-lead')
  const { success, reset } = await leadSubmitRatelimit.limit(key)
  if (!success) return rateLimitResponse(reset)

  try {
    const body = await request.json()
    const {
      company_name, work_email, contact_name, contact_title, phone,
      company_size, market, industry, cipc_number, website,
      risk_flags, marketing_consent,
    } = body

    if (!company_name || !work_email || !contact_name) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(work_email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase.from('employer_leads').insert({
      company_name, work_email, contact_name, contact_title, phone,
      company_size, market, industry, cipc_number, website,
      risk_flags: risk_flags || [],
      status: 'new',
      notes: risk_flags?.length > 0 ? `Risk flags: ${risk_flags.join(', ')}` : null,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    })

    if (error) {
      console.error('employer_leads insert error:', error)
      return NextResponse.json({ error: 'Failed to save — please try again' }, { status: 500 })
    }

    // Send confirmation to employer (non-blocking)
    sendEmail({
      to: work_email,
      subject: 'Your Hirrd employer application is received',
      html: employerLeadReceivedEmail(company_name, work_email),
    }).catch(console.error)

    // Alert admin if risk flags or always (non-blocking)
    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail) {
      sendEmail({
        to: adminEmail,
        subject: `New employer lead: ${company_name}${risk_flags?.length ? ' ⚠️ Risk flags' : ''}`,
        html: adminNewLeadEmail(company_name, risk_flags || [], adminEmail),
      }).catch(console.error)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('employer-leads API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
