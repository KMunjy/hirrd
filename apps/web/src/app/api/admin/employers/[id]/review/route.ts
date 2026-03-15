import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { action, reason } = await request.json()
    const newStatus = action === 'approve' ? 'converted' : action === 'reject' ? 'rejected' : 'contacted'

    const { error } = await supabase.from('employer_leads').update({
      status: newStatus,
      notes: reason || null,
      updated_at: new Date().toISOString(),
    }).eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ success: true, status: newStatus })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
