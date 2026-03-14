import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(request: Request) {
  try {
    const { opportunity_id } = await request.json()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get candidate profile
    const { data: candidate } = await supabase
      .from('candidates').select('*').eq('profile_id', user.id).single()

    // Get opportunity
    const { data: opportunity } = await supabase
      .from('opportunities').select('*').eq('id', opportunity_id).single()

    if (!candidate || !opportunity) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Analyse this candidate-job match. Return ONLY valid JSON.

CANDIDATE SKILLS: ${candidate.skills?.join(', ')}
CANDIDATE EXPERIENCE: ${candidate.years_experience} years
CANDIDATE LOCATION: ${candidate.preferred_markets?.join(', ')}

JOB: ${opportunity.title} at ${opportunity.location_city}
REQUIRED SKILLS: ${opportunity.skills_required?.join(', ')}
EXPERIENCE LEVEL: ${opportunity.experience_level}
MARKET: ${opportunity.market}

Return:
{
  "match_score": 0-100,
  "matched_skills": ["skill1"],
  "missing_skills": ["skill2"],
  "match_breakdown": {"skills": 0-100, "experience": 0-100, "location": 0-100},
  "recommendation": "apply_now|apply_with_note|skill_up_first|not_recommended",
  "tip": "one specific application tip"
}`
      }]
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const result = JSON.parse(text.replace(/```json|```/g, '').trim())

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
