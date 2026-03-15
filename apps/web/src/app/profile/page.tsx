export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileClient from './ProfileClient'
import HirrdNav from '@/components/HirrdNav'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/profile')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: candidate } = await supabase.from('candidates').select('*').eq('profile_id', user.id).single()

  return (
    <>
      <HirrdNav />
      <ProfileClient profile={profile} candidate={candidate} userId={user.id} />
    </>
  )
}
