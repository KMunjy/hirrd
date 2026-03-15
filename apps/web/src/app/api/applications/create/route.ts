import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { opportunity_id } = await request.json()
    if (!opportunity_id) return NextResponse.json({ error: 'opportunity_id required' }, { status: 400 })

    // Get candidate record
    const { data: candidate } = await supabase
      .from('candidates').select('id').eq('profile_id', user.id).single()
    if (!candidate) return NextResponse.json({ error: 'No candidate profile found' }, { status: 404 })

    // Check not already applied
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('candidate_id', candidate.id)
      .eq('opportunity_id', opportunity_id)
      .single()
    if (existing) return NextResponse.json({ error: 'Already applied', code: 'duplicate' }, { status: 409 })

    // Create application
    const { error } = await supabase.from('applications').insert({
      candidate_id: candidate.id,
      opportunity_id,
      status: 'applied',
    })
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
