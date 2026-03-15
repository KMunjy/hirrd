import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const start = Date.now()
  const checks: Record<string, any> = { status: 'ok', timestamp: new Date().toISOString() }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('profiles').select('id').limit(1)
    checks.database = error ? { status: 'degraded', error: error.message } : { status: 'ok' }
  } catch (err: any) {
    checks.database = { status: 'error', error: err.message }
  }

  checks.config = {
    supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    resend: !!process.env.RESEND_API_KEY,
    twilio: !!process.env.TWILIO_ACCOUNT_SID,
    sentry: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
    upstash: !!process.env.UPSTASH_REDIS_REST_URL,
  }

  checks.latencyMs = Date.now() - start
  const healthy = checks.database?.status === 'ok'

  return NextResponse.json(checks, { status: healthy ? 200 : 503 })
}
