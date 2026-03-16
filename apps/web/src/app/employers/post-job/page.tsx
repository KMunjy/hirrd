export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HirrdNav from '@/components/HirrdNav'
import PostJobClient from './PostJobClient'

export default async function PostJobPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/employers/post-job')

  // Only verified employers can post
  const { data: lead } = await supabase
    .from('employer_leads')
    .select('*')
    .eq('work_email', user.email)
    .eq('status', 'converted')
    .single()

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  // Count existing active postings for this employer
  const { count: activeListings } = await supabase
    .from('opportunities')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)

  const freeTierLimit = 3

  return (
    <>
      <HirrdNav user={user} profile={profile} />
      <PostJobClient
        lead={lead}
        userId={user.id}
        userEmail={user.email || ''}
        activeListings={activeListings || 0}
        freeTierLimit={freeTierLimit}
      />
    </>
  )
}
