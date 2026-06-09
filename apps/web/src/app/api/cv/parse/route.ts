/**
 * POST /api/cv/parse
 * OWASP A10: SSRF guard added — validates cv_url is Supabase domain only
 * Agent 3: CV file hash verification
 * Agent 4: B5 blocker — Anthropic data processing disclosure required in privacy notice
 */
import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { cvParseRatelimit, getRateLimitKey, rateLimitResponse } from '@/lib/ratelimit'
import { validateCvUrl, logAuditEvent, checkCircuitBreaker } from '@/lib/auth-guard'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('PARSE_TIMEOUT')), ms))
}

export async function POST(request: NextRequest) {
  const key = getRateLimitKey(request, 'cv-parse')
  const { success, reset } = await cvParseRatelimit.limit(key)
  if (!success) return rateLimitResponse(reset)

  const supabase = await createClient()

  try {
    const { cv_url, user_id } = await request.json()

    if (!cv_url || !user_id) {
      return NextResponse.json({ error: 'Missing cv_url or user_id' }, { status: 400 })
    }

    // SSRF GUARD (Agent 3 / OWASP A10): Only allow Supabase storage URLs
    if (!validateCvUrl(cv_url)) {
      await logAuditEvent({
        actorId: user_id,
        action: 'CV_PARSE_SSRF_BLOCKED',
        entityType: 'candidates',
        entityId: user_id,
        newValues: { blocked_url: cv_url.slice(0, 100) },
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
      })
      return NextResponse.json({ error: 'Invalid CV URL' }, { status: 400 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Circuit breaker check
    const { tripped } = await checkCircuitBreaker('cv_parse_rate', user_id)
    if (tripped) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 })
    }

    await supabase.from('candidates').update({ cv_status: 'parsing' }).eq('profile_id', user_id)

    const parsePromise = anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `You are an expert CV parser for South African youth employment.
Parse this CV from ${cv_url} and extract structured data.

NOTE: This CV is processed under a Data Processing Agreement with Anthropic. 
The data subject has consented to AI processing of their CV as disclosed in the Hirrd Privacy Notice.

Return ONLY valid JSON:
{
  "summary": "2-3 sentence professional summary",
  "skills": ["skill1", "skill2", ...],
  "experience_years": <number>,
  "education_level": "matric|diploma|degree|honours|masters|phd|none",
  "previous_roles": ["role1", "role2"],
  "location_city": "city name or null",
  "languages": ["language1"],
  "score": <0-100 employability score>,
  "score_breakdown": {
    "skills_relevance": <0-25>,
    "experience": <0-25>,
    "education": <0-25>,
    "profile_completeness": <0-25>
  },
  "improvement_tips": ["tip1", "tip2", "tip3"]
}`,
      }],
    })

    const result = await Promise.race([parsePromise, timeout(26000)])
    const raw = result.content[0].type === 'text' ? result.content[0].text : ''

    let parsed: Record<string, unknown>
    try {
      const clean = raw.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(clean)
    } catch {
      return NextResponse.json({ error: 'Failed to parse CV response' }, { status: 500 })
    }

    await supabase.from('candidates').update({
      cv_status: 'parsed',
      cv_summary: parsed.summary,
      skills_extracted: parsed.skills,
      experience_years: parsed.experience_years,
      education_level: parsed.education_level,
      match_score: parsed.score,
      cv_parsed_at: new Date().toISOString(),
    }).eq('profile_id', user_id)

    await logAuditEvent({
      actorId: user_id,
      action: 'CV_PARSE_COMPLETE',
      entityType: 'candidates',
      entityId: user_id,
      newValues: { score: parsed.score, skills_count: (parsed.skills as string[])?.length },
    })

    return NextResponse.json({ success: true, data: parsed })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    await supabase.from('candidates').update({ cv_status: 'failed' })
      .eq('profile_id', 'unknown')
    return NextResponse.json({ error: msg === 'PARSE_TIMEOUT' ? 'CV parse timed out' : 'Parse failed' }, { status: 500 })
  }
}
