/**
 * POST /api/data-request — Submit POPIA data subject request
 * GET  /api/data-request — List own requests
 * Agent 2: POPIA s.23 data subject rights
 * Agent 4: Missing requirement — data portability + deletion
 */
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { logAuditEvent } from '@/lib/auth-guard'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const body = await req.json()
    const { request_type, description, email_provided } = body

    const validTypes = ['access','correction','deletion','portability','objection']
    if (!validTypes.includes(request_type)) {
      return NextResponse.json({ error: 'Invalid request_type' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('data_subject_requests')
      .insert({
        profile_id: user?.id,
        request_type,
        description: description?.slice(0, 1000),
        email_provided: !user ? email_provided : undefined,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    if (user?.id) {
      await logAuditEvent({
        actorId: user.id,
        action: `DSR_${request_type.toUpperCase()}`,
        entityType: 'data_subject_requests',
        entityId: data.id,
        ipAddress: req.headers.get('x-forwarded-for') || undefined,
      })
    }

    return NextResponse.json({
      request: data,
      message: 'Your request has been received. We will respond within 30 days as required by POPIA.',
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

    const { data, error } = await supabase
      .from('data_subject_requests')
      .select('id,created_at,request_type,status,sla_due_at,completed_at')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ requests: data })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
