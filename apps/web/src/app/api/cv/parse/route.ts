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

    // Verify auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the CV file
    const cvResponse = await fetch(cv_url)
    if (!cvResponse.ok) throw new Error('Could not fetch CV file')

    const cvBuffer = await cvResponse.arrayBuffer()
    const cvBase64 = Buffer.from(cvBuffer).toString('base64')
    const contentType = cvResponse.headers.get('content-type') || 'application/pdf'

    // Update status to parsing
    await supabase.from('candidates').update({ cv_status: 'parsing' })
      .eq('profile_id', user_id)

    // Send to Claude for parsing
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: contentType as 'application/pdf',
              data: cvBase64,
            },
          },
          {
            type: 'text',
            text: `Parse this CV and return ONLY a JSON object with this exact structure. No markdown, no explanation, just valid JSON:
{
  "headline": "one-line professional headline based on experience",
  "summary": "2-3 sentence professional summary",
  "years_experience": 0,
  "skills": ["skill1", "skill2"],
  "languages": ["English"],
  "education": [{"institution": "", "qualification": "", "field": "", "year_completed": null}],
  "work_history": [{"company": "", "title": "", "start_date": "YYYY-MM", "end_date": null, "is_current": false, "description": "", "achievements": []}],
  "certifications": [{"name": "", "issuer": "", "year": null}],
  "desired_roles": ["role based on experience"],
  "cv_score": 0
}

For cv_score: rate 0-100 based on completeness, clarity, quantified achievements, and ATS-friendliness.`
          }
        ],
      }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const cleanJson = responseText.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleanJson)

    // Update candidate with parsed data
    const { error: updateError } = await supabase.from('candidates').update({
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

    if (updateError) throw updateError

    // Also update profile headline if not set
    await supabase.from('profiles').update({
      bio: parsed.summary,
    }).eq('id', user_id)

    return NextResponse.json({
      success: true,
      cv_score: parsed.cv_score,
      skills_found: parsed.skills?.length || 0,
      message: 'CV parsed successfully',
    })

  } catch (error: any) {
    console.error('CV parse error:', error)

    // Update status to failed
    try {
      const supabase = await createClient()
      const body = await request.json().catch(() => ({}))
      if (body.user_id) {
        await supabase.from('candidates').update({ cv_status: 'failed' })
          .eq('profile_id', body.user_id)
      }
    } catch {}

    return NextResponse.json({ error: error.message || 'Parsing failed' }, { status: 500 })
  }
}
