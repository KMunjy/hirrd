/**
 * GET  /api/admin/risk — Risk dashboard data
 * POST /api/admin/risk — Manually set risk score / suspend account
 * Agent 1: Market surveillance + Agent 3: Fraud prevention
 */
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { requireRole, logAuditEvent } from '@/lib/auth-guard'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(['admin','compliance','risk_officer','fraud_investigator'])
    const supabase = await createClient()

    const [flags, scores, disputes] = await Promise.all([
      supabase.from('fraud_flags').select('*').eq('status','open').order('created_at', { ascending: false }).limit(50),
      supabase.from('risk_scores').select('*,profiles(email,full_name)').in('risk_level',['high','critical']).limit(50),
      supabase.from('disputes').select('*').in('status',['submitted','under_review']).order('sla_due_at').limit(50),
    ])

    return NextResponse.json({
      open_flags: flags.data || [],
      high_risk_accounts: scores.data || [],
      open_disputes: disputes.data || [],
    })
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(['admin','risk_officer'])
    const body = await req.json()
    const { profile_id, action, reason, risk_level, risk_score } = body

    if (!profile_id || !action) {
      return NextResponse.json({ error: 'profile_id and action required' }, { status: 400 })
    }

    const supabase = await createClient()

    if (action === 'suspend') {
      await supabase.from('profiles').update({ account_status: 'suspended' }).eq('id', profile_id)
    } else if (action === 'set_risk') {
      await supabase.from('risk_scores').upsert({
        profile_id,
        risk_level: risk_level || 'high',
        score: risk_score || 75,
        notes: reason,
        last_evaluated: new Date().toISOString(),
      }, { onConflict: 'profile_id' })
    } else if (action === 'clear_flags') {
      await supabase.from('fraud_flags')
        .update({ status: 'resolved', resolved_by: auth.userId, resolved_at: new Date().toISOString(), resolution_note: reason })
        .eq('profile_id', profile_id).eq('status', 'open')
    }

    await logAuditEvent({
      actorId: auth.userId,
      actorRole: auth.role,
      action: `ADMIN_${action.toUpperCase()}`,
      entityType: 'profiles',
      entityId: profile_id,
      newValues: { action, reason },
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Response) return err
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
