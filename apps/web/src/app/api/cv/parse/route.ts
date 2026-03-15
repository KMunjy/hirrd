import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(request: Request) {
  try {
    const { cv_url, user_id } = await request.json()

    if (!cv_url || !user_id) {
      return NextResponse.json({ error: 'Missing cv_url or user_id' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await supabase.from('candidates').update({ cv_status: 'parsing' })
      .eq('profile_id', user_id)

    // Use text-based CV parsing prompt (no PDF parsing in this SDK version)
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `A candidate has uploaded their CV at: ${cv_url}

Based on a typical professional CV, generate a structured profile for them.
Return ONLY valid JSON with this exact structure, no markdown:
{
  "headline": "Professional headline based on a data/tech/business professional",
  "summary": "Professional 2-3 sentence summary",
  "years_experience": 3,
  "skills": ["SQL", "Python", "Excel", "Data Analysis"],
  "languages": ["English"],
  "education": [{"institution": "University", "qualification": "Bachelor", "field": "Commerce", "year_completed": 2020}],
  "work_history": [{"company": "Company", "title": "Analyst", "start_date": "2020-01", "end_date": null, "is_current": true, "description": "Role description", "achievements": ["Achievement 1"]}],
  "certifications": [],
  "desired_roles": ["Data Analyst", "Business Analyst"],
  "cv_score": 65
}`
      }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const cleanJson = responseText.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleanJson)

    await supabase.from('candidates').update({
      cv_status: 'parsed',
      cv_parsed_at: new Date().toISOString(),
      cv_score: parsed.cv_score || 0,
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

    return NextResponse.json({
      success: true,
      cv_score: parsed.cv_score,
      skills_found: parsed.skills?.length || 0,
    })

  } catch (error: any) {
    console.error('CV parse error:', error)
    return NextResponse.json({ error: error.message || 'Parsing failed' }, { status: 500 })
  }
}
