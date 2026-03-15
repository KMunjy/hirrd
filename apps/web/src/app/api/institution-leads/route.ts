import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
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

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
