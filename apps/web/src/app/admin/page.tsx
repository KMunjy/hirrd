export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminClient from './AdminClient'
import HirrdNav from '@/components/HirrdNav'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  // Fetch employer leads
  const { data: leads } = await supabase
    .from('employer_leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  // Stats
  const stats = {
    total: leads?.length || 0,
    new: leads?.filter(l => l.status === 'new').length || 0,
    converted: leads?.filter(l => l.status === 'converted').length || 0,
    rejected: leads?.filter(l => l.status === 'rejected').length || 0,
    highRisk: leads?.filter(l => (l.risk_flags?.length || 0) > 0).length || 0,
  }

  return (
    <>
      <HirrdNav />
      <AdminClient leads={leads || []} stats={stats} />
    </>
  )
}
