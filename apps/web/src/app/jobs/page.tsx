import { createClient } from '@/lib/supabase/server'
import HirrdNav from '@/components/HirrdNav'
import OpportunitySearch from '@/components/OpportunitySearch'
import Link from 'next/link'

export const metadata = {
  title: 'Jobs — Hirrd',
  description: 'Find SA jobs matched to your skills by AI.',
}

export const dynamic = 'force-dynamic'

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user ? await supabase.from('profiles').select('*').eq('id', user.id).single() : { data: null }
  
  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('*, employers(company_name)')
    .eq('is_active', true)
    .eq('market', 'za')
    .order('published_at', { ascending: false })
    .limit(50)

  return (
    <>
      <HirrdNav user={user} profile={profile} />
      <main id="main-content" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Jobs in South Africa
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            AI-matched to your skills. Verified SA employers only.
            {' '}<Link href="/auth/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Upload your CV for personalised matches →</Link>
          </p>
        </div>
        <OpportunitySearch opportunities={opportunities || []} type="job" />
        
      </main>
    </>
  )
}
