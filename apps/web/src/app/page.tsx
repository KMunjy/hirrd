import { createClient } from '@/lib/supabase/server'
import HirrdNav from '@/components/HirrdNav'
import HomeClient from '@/components/HomeClient'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch live public opportunities for ticker + feed (no auth required)
  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('id,type,title,slug,is_verified,employment_type,salary_min,salary_max,expires_at,employers(company_name,company_logo_url)')
    .eq('is_active', true)
    .order('published_at', { ascending: false })
    .limit(60)

  // Fetch stats for hero
  const { count: jobCount }    = await supabase.from('opportunities').select('id',{count:'exact',head:true}).eq('type','job').eq('is_active',true)
  const { count: learnCount }  = await supabase.from('opportunities').select('id',{count:'exact',head:true}).eq('type','learnership').eq('is_active',true)
  const { count: internCount } = await supabase.from('opportunities').select('id',{count:'exact',head:true}).eq('type','internship').eq('is_active',true)
  const { count: bursaryCount} = await supabase.from('opportunities').select('id',{count:'exact',head:true}).eq('type','bursary').eq('is_active',true)

  // Candidate-specific matches (logged in only)
  let candidate = null
  let matches: any[] = []
  if (user) {
    const { data: c } = await supabase.from('candidates').select('*').eq('profile_id', user.id).single()
    candidate = c
    if (c?.cv_status === 'parsed') {
      const { data: m } = await supabase
        .from('opportunities')
        .select('*,employers(company_name,company_logo_url)')
        .eq('is_active', true)
        .limit(12)
      matches = m || []
    }
  }

  const profile = user ? (await supabase.from('profiles').select('*').eq('id', user.id).single()).data : null

  return (
    <>
      <HirrdNav user={user} profile={profile} />
      <HomeClient
        user={user}
        profile={profile}
        candidate={candidate}
        opportunities={(opportunities || []) as any[]}
        matches={matches as any[]}
        stats={{
          jobs: jobCount || 0,
          learnerships: learnCount || 0,
          internships: internCount || 0,
          bursaries: bursaryCount || 0,
        }}
      />
    </>
  )
}
