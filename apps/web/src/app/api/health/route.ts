/**
 * GET /api/health
 * Platform health check — returns actual connectivity status
 * Used by: uptime monitors, CI/CD, Capacitor app startup check
 * 
 * Returns status without exposing any secrets or internal details
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const started = Date.now()
  
  const health: Record<string, any> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    services: {
      database: 'unknown',
      cache: 'unknown',
      storage: 'unknown',
    },
    config: {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      twilio: !!process.env.TWILIO_ACCOUNT_SID,
      resend: !!process.env.RESEND_API_KEY,
      upstash: !!process.env.UPSTASH_REDIS_REST_URL,
      sentry: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
      firebase: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      photo_enabled: process.env.NEXT_PUBLIC_PHOTO_ENABLED === 'true',
    },
  }

  // Check database connectivity
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('profiles').select('id').limit(1)
    health.services.database = error ? 'error' : 'connected'
  } catch {
    health.services.database = 'error'
    health.status = 'degraded'
  }

  // Check cache (Upstash) — lazy check
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const r = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/ping`, {
        headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
        signal: AbortSignal.timeout(2000),
      })
      health.services.cache = r.ok ? 'connected' : 'error'
    } catch {
      health.services.cache = 'unavailable'
    }
  } else {
    health.services.cache = 'not_configured'
  }

  health.services.storage = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'not_configured'
  health.latency_ms = Date.now() - started

  const statusCode = health.status === 'ok' ? 200 : 503
  return NextResponse.json(health, { status: statusCode })
}
