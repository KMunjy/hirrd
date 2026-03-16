import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { leadSubmitRatelimit, getRateLimitKey, rateLimitResponse } from '@/lib/ratelimit'

export async function POST(request: Request) {
  const rlKey = getRateLimitKey(request, 'opp-create')
  const { success, reset } = await leadSubmitRatelimit.limit(rlKey)
  if (!success) return rateLimitResponse(reset)

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Must be a verified employer
    const { data: lead } = await supabase
      .from('employer_leads')
      .select('id, company_name, status')
      .eq('work_email', user.email)
      .eq('status', 'converted')
      .single()

    if (!lead) {
      return NextResponse.json(
        { error: 'Only verified employers can post opportunities. Register at /employers.' },
        { status: 403 }
      )
    }

    // Check free tier limit (3 active listings)
    const { count } = await supabase
      .from('opportunities')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)

    const FREE_LIMIT = 3
    if ((count || 0) >= FREE_LIMIT) {
      return NextResponse.json(
        { error: 'free_tier_limit', message: `Free tier limit of ${FREE_LIMIT} active listings reached.` },
        { status: 402 }
      )
    }

    const body = await request.json()
    const {
      type, title, description, requirements, sector, experience_level,
      employment_type, salary_min, salary_max, province, city,
      skills_required, seta_name, seta_accr, intake_date,
    } = body

    if (!title || !description || !sector || !province) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    // Generate slug from title + company
    const slug = `${lead.company_name}-${title}-${Date.now()}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 80)

    // Find or create employer record linked to this lead
    const { data: employer } = await supabase
      .from('employers')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    const { data: opp, error: insertErr } = await supabase
      .from('opportunities')
      .insert({
        employer_id: employer?.id || null,
        type: type || 'job',
        title,
        slug,
        description,
        requirements: requirements || null,
        skills_required: skills_required || [],
        employment_type: employment_type || 'full_time',
        experience_level: experience_level || 'junior',
        industry: sector,
        market: 'za',
        location_city: city || null,
        location_country: 'ZA',
        salary_min: salary_min || null,
        salary_max: salary_max || null,
        salary_currency: 'ZAR',
        seta_name: seta_name || null,
        seta_accr: seta_accr || null,
        intake_date: intake_date || null,
        is_active: true,
        is_verified: false, // Admin must verify before badge appears
        published_at: new Date().toISOString(),
      })
      .select('id, slug')
      .single()

    if (insertErr) throw insertErr

    return NextResponse.json({ success: true, opportunity_id: opp.id, slug: opp.slug })
  } catch (err: any) {
    console.error('opportunity create error:', err)
    return NextResponse.json({ error: err.message || 'Failed to create opportunity' }, { status: 500 })
  }
}
