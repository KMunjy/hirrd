/**
 * HIRRD Auth Guard — Exchange-Grade Role Enforcement
 * Agent 3 (Security) + Agent 4 (Independent Review): B1, B4
 *
 * Provides server-side role assertions for all protected routes.
 * Never trust client-side role checks alone.
 */
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export type UserRole =
  | 'candidate' | 'employer' | 'admin' | 'compliance'
  | 'support_agent' | 'risk_officer' | 'fraud_investigator'
  | 'auditor' | 'exec' | 'regulator'

export interface AuthContext {
  userId: string
  role: UserRole
  accountStatus: string
  kycLevel: string
}

/**
 * Assert the calling user has one of the required roles.
 * Returns auth context on success, throws 401/403 on failure.
 */
export async function requireRole(
  allowedRoles: UserRole[],
  options: { require2FA?: boolean } = {}
): Promise<AuthContext> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Response(JSON.stringify({ error: 'Unauthenticated' }), {
      status: 401, headers: { 'Content-Type': 'application/json' }
    })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, account_status, kyc_level, two_fa_enabled')
    .eq('id', user.id)
    .single()

  if (!profile) {
    throw new Response(JSON.stringify({ error: 'Profile not found' }), {
      status: 403, headers: { 'Content-Type': 'application/json' }
    })
  }

  if (profile.account_status !== 'active') {
    throw new Response(JSON.stringify({ error: `Account is ${profile.account_status}` }), {
      status: 403, headers: { 'Content-Type': 'application/json' }
    })
  }

  if (!allowedRoles.includes(profile.role as UserRole)) {
    throw new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
      status: 403, headers: { 'Content-Type': 'application/json' }
    })
  }

  return {
    userId: user.id,
    role: profile.role as UserRole,
    accountStatus: profile.account_status,
    kycLevel: profile.kyc_level,
  }
}

/**
 * Log an event to the immutable audit log.
 * Call this for every state-changing action.
 */
export async function logAuditEvent({
  actorId,
  actorRole,
  action,
  entityType,
  entityId,
  oldValues,
  newValues,
  ipAddress,
  userAgent,
  metadata = {},
}: {
  actorId?: string
  actorRole?: string
  action: string
  entityType: string
  entityId: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, unknown>
}) {
  const supabase = await createClient()
  await supabase.from('audit_log').insert({
    actor_id: actorId,
    actor_role: actorRole,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_values: oldValues,
    new_values: newValues,
    ip_address: ipAddress,
    user_agent: userAgent,
    metadata,
  })
}

/**
 * Check a circuit breaker.
 * Returns { tripped: boolean, count: number }
 */
export async function checkCircuitBreaker(
  breakerName: string,
  actorId: string
): Promise<{ tripped: boolean; action: string }> {
  const supabase = await createClient()

  const { data: breaker } = await supabase
    .from('circuit_breakers')
    .select('threshold, window_minutes, action, is_active')
    .eq('name', breakerName)
    .eq('is_active', true)
    .single()

  if (!breaker) return { tripped: false, action: 'none' }

  // Count recent events in the window
  const windowStart = new Date(Date.now() - breaker.window_minutes * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('audit_log')
    .select('id', { count: 'exact', head: true })
    .eq('actor_id', actorId)
    .eq('action', breakerName.toUpperCase())
    .gte('created_at', windowStart)

  const tripped = (count || 0) >= breaker.threshold

  if (tripped) {
    // Update trip count
    await supabase
      .from('circuit_breakers')
      .update({ trip_count: (count || 0) + 1, last_tripped_at: new Date().toISOString() })
      .eq('name', breakerName)

    // If action is suspend, update account status
    if (breaker.action === 'suspend') {
      await supabase
        .from('profiles')
        .update({ account_status: 'suspended' })
        .eq('id', actorId)
    }
  }

  return { tripped, action: breaker.action }
}

/**
 * Validate cv_url is from Supabase storage only (SSRF guard).
 * Agent 3: A10 SSRF mitigation.
 */
export function validateCvUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const allowedHosts = [
      process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '') || '',
    ]
    return allowedHosts.some(host => host && parsed.hostname.endsWith(host))
  } catch {
    return false
  }
}
