export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HirrdNav from '@/components/HirrdNav'
import ApplicationsClient from './ApplicationsClient'

export const metadata = { title: 'My Applications — Hirrd' }

export default async function ApplicationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/applications')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: candidate } = await supabase.from('candidates').select('id').eq('profile_id', user.id).single()

  let applications: any[] = []
  if (candidate) {
    const { data } = await supabase
      .from('applications')
      .select(`
        *,
        opportunities (
          id, title, type, employment_type, experience_level,
          location_city, market, salary_min, salary_max, salary_currency,
          skills_required, is_active,
          employers ( company_name, company_logo_url )
        )
      `)
      .eq('candidate_id', candidate.id)
      .order('created_at', { ascending: false })
    applications = data || []
  }

  return (
    <>
      <HirrdNav user={user} profile={profile} />
      <ApplicationsClient applications={applications} hasCandidate={!!candidate} />
    </>
  )
}
