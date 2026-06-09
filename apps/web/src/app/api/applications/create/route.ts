/**
 * POST /api/applications/create
 * Agent 3: Application velocity circuit breaker
 * Agent 3: Audit log on every application
 * Agent 1: Settlement preparation — dual-confirmation model
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAuditEvent, checkCircuitBreaker } from '@/lib/auth-guard'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

    // Circuit breaker: max 20 applications per hour
    const { tripped, action } = await checkCircuitBreaker('apply_velocity', user.id)
    if (tripped) {
      if (action === 'block') {
        return NextResponse.json({
          error: 'Application rate limit reached. Please wait before applying to more opportunities.',
          code: 'CIRCUIT_BREAKER_TRIPPED'
        }, { status: 429 })
      }
      // 'flag' action — allow but log
      await supabase.from('fraud_flags').insert({
        profile_id: user.id,
        flag_type: 'VELOCITY_APPLY',
        severity: 'medium',
        description: 'High application velocity detected',
        evidence: { triggered_at: new Date().toISOString() },
      })
    }

    const { opportunity_id, cover_note } = await req.json()
    if (!opportunity_id) return NextResponse.json({ error: 'opportunity_id required' }, { status: 400 })

    // Check opportunity exists and is active
    const { data: opp } = await supabase
      .from('opportunities')
      .select('id, title, type, employer_id, is_active, expires_at')
      .eq('id', opportunity_id)
      .single()

    if (!opp) return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    if (!opp.is_active) return NextResponse.json({ error: 'Opportunity is no longer active' }, { status: 410 })
    if (opp.expires_at && new Date(opp.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Opportunity has expired' }, { status: 410 })
    }

    // Get candidate
    const { data: candidate } = await supabase
      .from('candidates')
      .select('id, cv_status')
      .eq('profile_id', user.id)
      .single()

    if (!candidate) return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 })

    // Duplicate check
    const { data: existing } = await supabase
      .from('applications')
      .select('id, status')
      .eq('candidate_id', candidate.id)
      .eq('opportunity_id', opportunity_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already applied', application: existing }, { status: 409 })
    }

    // Create application
    const { data: application, error } = await supabase
      .from('applications')
      .insert({
        candidate_id: candidate.id,
        opportunity_id,
        cover_note: cover_note?.slice(0, 1000),
        status: 'applied',
        applied_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Immutable audit log
    await logAuditEvent({
      actorId: user.id,
      action: 'CREATE_APPLICATION',
      entityType: 'applications',
      entityId: application.id,
      newValues: { opportunity_id, has_cover_note: !!cover_note },
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({ success: true, application }, { status: 201 })
  } catch (err) {
    console.error('[applications/create]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
