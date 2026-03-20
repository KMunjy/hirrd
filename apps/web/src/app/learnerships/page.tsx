import { createClient } from '@/lib/supabase/server'
import HirrdNav from '@/components/HirrdNav'
import OpportunitySearch from '@/components/OpportunitySearch'
import Link from 'next/link'

export const metadata = {
  title: 'Learnerships — Hirrd',
  description: 'Find SA learnerships matched to your skills by AI.',
}

export const dynamic = 'force-dynamic'

export default async function LearnershipsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user ? await supabase.from('profiles').select('*').eq('id', user.id).single()
    : { data: null }

  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('*, employers(company_name)')
    .eq('is_active', true)
    .eq('type', 'learnership')
    .order('published_at', { ascending: false })
    .limit(50)

  return (
    <>
      <HirrdNav user={user} profile={profile} />
      <main id="main-content" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Learnerships in South Africa
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            AI-matched to your skills. Verified SA employers only.{' '}
            <Link href="/auth/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Upload your CV for personalised matches &rarr;</Link>
          </p>
        </div>
        <OpportunitySearch opportunities={opportunities || []} type="learnership" />

        <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(124,88,232,0.04)', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          Are you an institution or training provider?{' '}
          <Link href="/auth/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Register your programmes &rarr;</Link>
        </div>
      </main>
    </>
  )
}
