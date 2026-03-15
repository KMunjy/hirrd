'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userId: string
  candidateId?: string
}

type UploadState = 'idle' | 'uploading' | 'parsing' | 'done' | 'error'

const ERROR_MESSAGES: Record<string, string> = {
  parsing_timeout: 'Analysis is taking longer than usual. Please try again.',
  parsing_failed: 'We couldn\'t read your CV. Make sure it\'s a text-based PDF, not a scanned image.',
  server_error: 'Something went wrong on our end. Please try again.',
  upload_failed: 'Upload failed. Check your connection and try again.',
}

export default function CVUploadPanel({ userId, candidateId }: Props) {
  const [dragging, setDragging] = useState(false)
  const [state, setState] = useState<UploadState>('idle')
  const [error, setError] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  function reset() {
    setState('idle')
    setError('')
    setScore(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleFile(file: File) {
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB')
      return
    }
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    if (!allowed.includes(file.type)) {
      setError('Please upload a PDF or Word document (.pdf, .doc, .docx)')
      return
    }

    setState('uploading')
    setError('')

    try {
      // 1. Upload to Supabase Storage
      const filename = `${userId}/${Date.now()}_${file.name.replace(/\s/g, '_')}`
      const { error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(filename, file, { upsert: true })

      if (uploadError) {
        // Bucket missing — give actionable message
        if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('bucket')) {
          throw new Error('CV storage is not configured yet. Please contact support.')
        }
        throw new Error('upload_failed')
      }

      const { data: { publicUrl } } = supabase.storage.from('cvs').getPublicUrl(filename)

      // 2. Save CV URL to candidate record
      if (candidateId) {
        await supabase.from('candidates').update({
          cv_url: publicUrl,
          cv_filename: file.name,
          cv_status: 'uploaded',
        }).eq('id', candidateId)
      } else {
        const { error: insertErr } = await supabase.from('candidates').insert({
          profile_id: userId,
          cv_url: publicUrl,
          cv_filename: file.name,
          cv_status: 'uploaded',
        })
        if (insertErr && !insertErr.message?.includes('duplicate')) throw insertErr
      }

      setState('parsing')

      // 3. AI parse — API handles 30s timeout internally
      const parseRes = await fetch('/api/cv/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv_url: publicUrl, user_id: userId }),
      })

      const parseData = await parseRes.json()

      if (!parseRes.ok) {
        const errKey = parseData.error || 'server_error'
        throw new Error(errKey)
      }

      setScore(parseData.cv_score || null)
      setState('done')

      // Reload to hydrate matches from DB
      setTimeout(() => window.location.reload(), 2000)

    } catch (err: any) {
      const errKey = err.message || 'server_error'
      setError(ERROR_MESSAGES[errKey] || errKey)
      setState('error')

      // Reset cv_status back to 'uploaded' so user can retry without re-uploading
      try {
        await supabase.from('candidates')
          .update({ cv_status: 'uploaded' })
          .eq('profile_id', userId)
      } catch {}
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  // ── Done state ──────────────────────────────────────────────────────────────
  if (state === 'done') {
    return (
      <div style={{
        background: 'var(--success-light)',
        border: '1px solid rgba(58,174,114,0.3)',
        borderRadius: '12px',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <span style={{ fontSize: '20px' }}>✓</span>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--success)' }}>
            CV analysed — finding your matches…
          </div>
          {score !== null && (
            <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '2px', opacity: 0.8 }}>
              CV strength: {score}/100
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (state === 'error') {
    return (
      <div style={{
        background: 'var(--error-light)',
        border: '1px solid rgba(192,80,74,0.25)',
        borderRadius: '12px',
        padding: '14px 20px',
      }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--error)', marginBottom: '8px' }}>
          {error}
        </div>
        <button
          onClick={reset}
          style={{
            fontSize: '12px', fontWeight: 600, color: 'var(--primary)',
            background: 'none', border: '1px solid var(--primary)',
            borderRadius: '6px', padding: '5px 14px', cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </div>
    )
  }

  const isLoading = state === 'uploading' || state === 'parsing'

  // ── Upload / drag-drop widget ────────────────────────────────────────────────
  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.doc,.docx"
        aria-label="Upload your CV"
        style={{ display: 'none' }}
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <div
        role="button"
        aria-label="Upload CV — click or drag a PDF or Word document here"
        tabIndex={0}
        onClick={() => !isLoading && fileRef.current?.click()}
        onKeyDown={e => e.key === 'Enter' && !isLoading && fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          background: dragging ? 'rgba(124,88,232,0.08)' : 'var(--bg-card)',
          border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--border-medium)'}`,
          borderRadius: '12px',
          padding: '14px 24px',
          cursor: isLoading ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          transition: 'all 0.15s',
          minWidth: '260px',
        }}
      >
        {isLoading ? (
          <>
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%',
              border: '2px solid var(--border)', borderTopColor: 'var(--primary)',
              animation: 'cvSpin 0.8s linear infinite', flexShrink: 0,
            }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {state === 'uploading' ? 'Uploading CV…' : 'AI analysing your CV…'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {state === 'parsing' ? 'Extracting skills · up to 30 seconds' : 'Securing your file'}
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', flexShrink: 0,
            }}>📄</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Upload CV →
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                PDF or Word · max 10MB · AI matches in 30 sec
              </div>
            </div>
          </>
        )}
      </div>

      {state === 'idle' && (
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>
          By uploading, you consent to AI analysis of your CV. <a href="/privacy" style={{ color: 'var(--primary)' }}>Privacy Policy</a>
        </div>
      )}

      <style>{`@keyframes cvSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
