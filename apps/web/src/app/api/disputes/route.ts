/**
 * POST /api/disputes — Raise a dispute
 * GET  /api/disputes — List own disputes
 * Agent 4: Missing requirement — Grievance/complaint handling
 */
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { requireRole, logAuditEvent } from '@/lib/auth-guard'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(['candidate','employer'])
    const body = await req.json()
    const { category, description, application_id, placement_id, respondent_id } = body

    if (!category || !description) {
      return NextResponse.json({ error: 'category and description are required' }, { status: 400 })
    }

    const validCategories = ['FRAUDULENT_LISTING','UNFAIR_REJECTION','NON_PAYMENT','DATA_BREACH','OTHER']
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('disputes')
      .insert({
        applicant_id: auth.userId,
        respondent_id,
        application_id,
        placement_id,
        category,
        description: description.slice(0, 2000),
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    await logAuditEvent({
      actorId: auth.userId,
      actorRole: auth.role,
      action: 'CREATE_DISPUTE',
      entityType: 'disputes',
      entityId: data.id,
      newValues: { category, description: '[redacted for log]' },
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ dispute: data }, { status: 201 })
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(['candidate','employer','admin','compliance','support_agent'])
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('disputes')
      .select('*')
      .or(auth.role === 'admin' || auth.role === 'compliance' || auth.role === 'support_agent'
        ? 'id.neq.00000000-0000-0000-0000-000000000000'  // all
        : `applicant_id.eq.${auth.userId},respondent_id.eq.${auth.userId}`)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ disputes: data })
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
