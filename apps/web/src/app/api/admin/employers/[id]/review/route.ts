import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, employerApprovedEmail, employerRejectedEmail } from '@/lib/email'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { action, reason } = await request.json()
    const newStatus = action === 'approve' ? 'converted' : action === 'reject' ? 'rejected' : 'contacted'

    // Get the lead to send email
    const { data: lead } = await supabase
      .from('employer_leads')
      .select('company_name, work_email')
      .eq('id', params.id)
      .single()

    const { error } = await supabase.from('employer_leads').update({
      status: newStatus,
      notes: reason || null,
      updated_at: new Date().toISOString(),
    }).eq('id', params.id)

    if (error) throw error

    // Send notification email to employer
    if (lead?.work_email) {
      if (action === 'approve') {
        sendEmail({
          to: lead.work_email,
          subject: '✓ Your Hirrd employer account is verified',
          html: employerApprovedEmail(lead.company_name),
        }).catch(console.error)
      } else if (action === 'reject') {
        sendEmail({
          to: lead.work_email,
          subject: 'Your Hirrd employer application update',
          html: employerRejectedEmail(lead.company_name, reason),
        }).catch(console.error)
      }
    }

    return NextResponse.json({ success: true, status: newStatus })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
