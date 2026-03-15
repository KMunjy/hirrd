/**
 * PATCH /api/candidate/messaging-preferences
 * Updates candidate's messaging opt-ins and preferred channel
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { whatsapp_opt_in, sms_opt_in, push_opt_in, preferred_channel } = await request.json()

    const updates: Record<string, any> = {}
    if (typeof whatsapp_opt_in === 'boolean') {
      updates.whatsapp_opt_in = whatsapp_opt_in
      if (whatsapp_opt_in) updates.whatsapp_opt_in_at = new Date().toISOString()
    }
    if (typeof sms_opt_in === 'boolean') {
      updates.sms_opt_in = sms_opt_in
      if (sms_opt_in) updates.sms_opt_in_at = new Date().toISOString()
    }
    if (typeof push_opt_in === 'boolean') updates.push_opt_in = push_opt_in
    if (preferred_channel) updates.preferred_channel = preferred_channel

    const { error } = await supabase.from('candidates').update(updates).eq('profile_id', user.id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
