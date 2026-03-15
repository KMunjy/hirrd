import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { company_name, work_email, contact_name, contact_title, phone,
            company_size, market, industry, cipc_number, website,
            risk_flags, marketing_consent } = body

    if (!company_name || !work_email || !contact_name) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    // Basic email validation
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(work_email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase.from('employer_leads').insert({
      company_name, work_email, contact_name, contact_title, phone,
      company_size, market, industry, cipc_number, website,
      risk_flags: risk_flags || [],
      status: risk_flags?.length > 0 ? 'new' : 'new',
      notes: risk_flags?.length > 0 ? `Risk flags: ${risk_flags.join(', ')}` : null,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    })

    if (error) {
      console.error('employer_leads insert error:', error)
      return NextResponse.json({ error: 'Failed to save — please try again' }, { status: 500 })
    }

    // TODO: Send admin notification email when high risk flags present
    // TODO: Send confirmation email to employer

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('employer-leads API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
