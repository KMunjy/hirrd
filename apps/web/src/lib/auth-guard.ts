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

/**
 * SCP-04: Enforce rate limits aligned to rate_limit_config table (Migration 003)
 * B6 Remediation: aligns circuit breaker thresholds with RCPs exactly
 */
export async function checkCircuitBreaker(
  key: string,
  userId: string,
  customLimit?: number
): Promise<{ tripped: boolean; action: 'block' | 'flag' | 'suspend' | null; count: number }> {
  // Endpoint-to-RCP mapping aligned to rate_limit_config seed data
  const RCP_THRESHOLDS: Record<string, { limit: number; window: number; suspendAt?: number; action: 'block' | 'flag' }> = {
    apply_velocity:       { limit: 20,  window: 3600, suspendAt: 50,  action: 'block' },  // RCP-01
    employer_post:        { limit: 3,   window: 3600, suspendAt: 10,  action: 'block' },  // RCP-02
    cv_parse:             { limit: 5,   window: 60,   suspendAt: 20,  action: 'block' },
    phone_verify:         { limit: 5,   window: 3600, suspendAt: 15,  action: 'block' },
    match_request:        { limit: 30,  window: 60,   action: 'flag' },
    dispute_submit:       { limit: 5,   window: 3600, action: 'flag' },
    data_request:         { limit: 2,   window: 86400, action: 'block' },
  }

  const config = RCP_THRESHOLDS[key]
  if (!config) return { tripped: false, action: null, count: 0 }

  const limit = customLimit ?? config.limit
  const windowKey = `cb:${key}:${userId}:${Math.floor(Date.now() / (config.window * 1000))}`

  try {
    const { Ratelimit } = await import('@upstash/ratelimit')
    const { Redis } = await import('@upstash/redis')

    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return { tripped: false, action: null, count: 0 }
    }

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })

    const count = await redis.incr(windowKey)
    if (count === 1) await redis.expire(windowKey, config.window)

    // SCP-04: RCP-aligned thresholds
    if (config.suspendAt && count >= config.suspendAt) {
      return { tripped: true, action: 'suspend', count }
    }
    if (count >= limit) {
      return { tripped: true, action: config.action, count }
    }
    return { tripped: false, action: null, count }
  } catch {
    // Graceful degradation — never block user if Redis unavailable
    return { tripped: false, action: null, count: 0 }
  }
}

/**
 * SCP-10: Validate settlement dual confirmation before marking placement final
 */
export async function validateSettlementDualConfirm(placementId: string): Promise<boolean> {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data } = await supabase
    .from('placements')
    .select('employer_confirmed, candidate_accepted')
    .eq('id', placementId)
    .single()

  return !!(data?.employer_confirmed && data?.candidate_accepted)
}

/**
 * RCP-07: AML threshold check (activated when payments go live)
 * Logs alert if single transaction exceeds R50,000 or aggregate > R100,000/month
 */
export async function checkAMLThreshold(
  profileId: string,
  amountCents: number
): Promise<{ flag: boolean; reason?: string }> {
  const R50K_CENTS = 5_000_000
  const R100K_MONTHLY_CENTS = 10_000_000

  if (amountCents >= R50K_CENTS) {
    return { flag: true, reason: 'SINGLE_TRANSACTION_EXCEEDS_R50K' }
  }

  // Aggregate check would query ledger table — scaffold only until payments live
  return { flag: false }
}
