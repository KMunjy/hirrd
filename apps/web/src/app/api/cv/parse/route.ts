import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { cvParseRatelimit, getRateLimitKey, rateLimitResponse } from '@/lib/ratelimit'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('PARSE_TIMEOUT')), ms)
  )
}

export async function POST(request: Request) {
  // Rate limiting
  const key = getRateLimitKey(request, 'cv-parse')
  const { success, reset } = await cvParseRatelimit.limit(key)
  if (!success) return rateLimitResponse(reset)

  let userId: string | null = null
  const supabase = await createClient()

  try {
    const { cv_url, user_id } = await request.json()

    if (!cv_url || !user_id) {
      return NextResponse.json({ error: 'Missing cv_url or user_id' }, { status: 400 })
    }
    userId = user_id

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await supabase.from('candidates')
      .update({ cv_status: 'parsing' })
      .eq('profile_id', user_id)

    const parsePromise = anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `You are a CV parser for South African job seekers. A candidate has uploaded their CV.
CV URL: ${cv_url}

Extract and return a structured profile. Return ONLY valid JSON, no markdown fences:
{
  "headline": "Professional headline (e.g. Senior Data Analyst | 5 years SA banking experience)",
  "summary": "2-3 sentence professional summary mentioning SA market context",
  "years_experience": 3,
  "skills": ["SQL", "Python", "Excel"],
  "languages": ["English", "Zulu"],
  "education": [{"institution": "University of Johannesburg", "qualification": "BCom", "field": "Information Systems", "year_completed": 2020}],
  "work_history": [{"company": "FNB", "title": "Data Analyst", "start_date": "2020-01", "end_date": null, "is_current": true, "description": "Role at SA bank", "achievements": ["Reduced reporting time by 40%"]}],
  "certifications": [],
  "desired_roles": ["Data Analyst", "Business Analyst"],
  "cv_score": 65
}`
      }],
    })

    const message = await Promise.race([parsePromise, timeout(28000)])
    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const cleanJson = responseText.replace(/```json|```/g, '').trim()

    let parsed: any
    try {
      parsed = JSON.parse(cleanJson)
    } catch {
      throw new Error('PARSE_JSON_FAILED')
    }

    await supabase.from('candidates').update({
      cv_status: 'parsed',
      cv_parsed_at: new Date().toISOString(),
      cv_score: Math.min(100, Math.max(0, parsed.cv_score || 0)),
      headline: parsed.headline || '',
      summary: parsed.summary || '',
      years_experience: parsed.years_experience || 0,
      skills: parsed.skills || [],
      languages: parsed.languages || [],
      education: parsed.education || [],
      work_history: parsed.work_history || [],
      certifications: parsed.certifications || [],
      desired_roles: parsed.desired_roles || [],
    }).eq('profile_id', user_id)

    // Trigger WhatsApp/SMS notification (non-blocking)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://hirrd-web.vercel.app'}/api/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: '' },
      body: JSON.stringify({
        type: 'cv_parsed',
        data: { cv_score: parsed.cv_score, match_count: parsed.skills?.length || 0 },
      }),
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      cv_score: parsed.cv_score,
      skills_found: parsed.skills?.length || 0,
    })

  } catch (error: any) {
    console.error('CV parse error:', error.message)

    if (userId) {
      try {
        await supabase.from('candidates')
          .update({ cv_status: 'failed' })
          .eq('profile_id', userId)
      } catch {}
    }

    if (error.message === 'PARSE_TIMEOUT') {
      return NextResponse.json(
        { error: 'parsing_timeout', message: 'CV analysis took too long. Please try again.' },
        { status: 408 }
      )
    }
    if (error.message === 'PARSE_JSON_FAILED') {
      return NextResponse.json(
        { error: 'parsing_failed', message: 'Could not read CV structure. Please ensure it is a text-based PDF.' },
        { status: 422 }
      )
    }
    return NextResponse.json(
      { error: 'server_error', message: error.message || 'Parsing failed' },
      { status: 500 }
    )
  }
}
