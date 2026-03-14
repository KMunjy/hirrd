import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Get full profile + candidate data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: candidate } = await supabase
    .from('candidates')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  // Get live opportunities (top 20)
  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('*, employers(company_name, company_logo_url)')
    .eq('is_active', true)
    .order('published_at', { ascending: false })
    .limit(20)

  // Get placements for showcase
  const { data: placements } = await supabase
    .from('placements')
    .select('*')
    .eq('is_featured', true)
    .order('display_order', { ascending: true })

  // Get user preferences (theme)
  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  return (
    <DashboardClient
      user={user}
      profile={profile}
      candidate={candidate}
      opportunities={opportunities || []}
      placements={placements || []}
      preferences={preferences}
    />
  )
}
