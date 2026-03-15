/**
 * POST /api/candidate/photo
 * Uploads a passport-size photo for a candidate
 * POPIA NOTE: Photos are biometric data (POPIA s.26 special personal information)
 * Requires explicit, specific consent before any upload
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('photo') as File | null
    const consentGiven = formData.get('popia_consent') === 'true'
    const consentTimestamp = formData.get('consent_timestamp') as string

    // POPIA compliance check — consent is mandatory before storing biometric data
    if (!consentGiven || !consentTimestamp) {
      return NextResponse.json({
        error: 'Explicit consent required before uploading a photo. This is required under POPIA s.26.',
        code: 'CONSENT_REQUIRED',
      }, { status: 400 })
    }

    if (!file) return NextResponse.json({ error: 'No photo provided' }, { status: 400 })

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Please upload a JPG, PNG, or WebP image' }, { status: 400 })
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'Photo must be under 5MB' }, { status: 400 })
    }

    // Validate minimum resolution for passport photo (basic check on file size)
    if (file.size < 10 * 1024) { // Under 10KB is suspiciously small for a photo
      return NextResponse.json({ error: 'Photo quality too low. Please upload a clearer image.' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filename = `${user.id}/passport_photo_${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('candidate-photos') // Separate bucket from CVs, stricter access
      .upload(filename, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      console.error('Photo upload error:', uploadError)
      return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
    }

    // Get URL (private — not public)
    const { data: { signedUrl } } = await supabase.storage
      .from('candidate-photos')
      .createSignedUrl(filename, 60 * 60 * 24 * 7) // 7-day signed URL

    // Store URL and consent record
    const { error: updateError } = await supabase.from('candidates').update({
      passport_photo_url: filename, // Store path, not URL (URL expires)
      passport_photo_consent_at: consentTimestamp,
    }).eq('profile_id', user.id)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      url: signedUrl,
      consentRecorded: true,
    })
  } catch (err: any) {
    console.error('Photo API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  // POPIA right to erasure — delete photo on request
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: candidate } = await supabase
      .from('candidates').select('passport_photo_url').eq('profile_id', user.id).single()

    if (candidate?.passport_photo_url) {
      await supabase.storage.from('candidate-photos').remove([candidate.passport_photo_url])
      await supabase.from('candidates').update({
        passport_photo_url: null,
        passport_photo_consent_at: null,
      }).eq('profile_id', user.id)
    }

    return NextResponse.json({ success: true, deleted: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
