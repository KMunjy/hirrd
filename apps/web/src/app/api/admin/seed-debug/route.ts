import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET'
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'NOT_SET'
  const pubKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'NOT_SET'

  const keyToUse = svcKey !== 'NOT_SET' ? svcKey : null
  let testResult = 'skipped'

  if (keyToUse && url !== 'NOT_SET') {
    try {
      const res = await fetch(`${url}/rest/v1/opportunities?select=id&limit=1`, {
        headers: { 'apikey': keyToUse, 'Authorization': `Bearer ${keyToUse}` }
      })
      const body = await res.text()
      testResult = `${res.status}: ${body.slice(0, 150)}`
    } catch (e: any) {
      testResult = `error: ${e.message}`
    }
  }

  return NextResponse.json({
    url_set: url !== 'NOT_SET',
    svc_key_set: svcKey !== 'NOT_SET',
    svc_key_starts: svcKey.slice(0, 25),
    pub_key_starts: pubKey.slice(0, 25),
    rest_test: testResult,
  })
}
