'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userId: string
  candidateId?: string
}

export default function CVUploadPanel({ userId, candidateId }: Props) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleFile(file: File) {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB')
      return
    }
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowed.includes(file.type)) {
      setError('Please upload a PDF or Word document')
      return
    }

    setUploading(true)
    setError('')

    try {
      // 1. Upload to Supabase Storage
      const filename = `${userId}/${Date.now()}_${file.name.replace(/\s/g, '_')}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(filename, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('cvs').getPublicUrl(filename)

      // 2. Update candidate record with CV URL
      if (candidateId) {
        await supabase.from('candidates').update({
          cv_url: publicUrl,
          cv_filename: file.name,
          cv_status: 'uploaded',
        }).eq('id', candidateId)
      } else {
        // Create candidate record first
        await supabase.from('candidates').insert({
          profile_id: userId,
          cv_url: publicUrl,
          cv_filename: file.name,
          cv_status: 'uploaded',
        })
      }

      setUploading(false)
      setParsing(true)

      // 3. Trigger AI parsing via API route
      const parseResponse = await fetch('/api/cv/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv_url: publicUrl, user_id: userId }),
      })

      if (!parseResponse.ok) throw new Error('Parsing failed')

      setParsing(false)
      setDone(true)

      // Refresh page to show matches
      setTimeout(() => window.location.reload(), 1500)

    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.')
      setUploading(false)
      setParsing(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const isLoading = uploading || parsing

  if (done) {
    return (
      <div style={{
        background: 'var(--success-light)',
        border: '1px solid rgba(58,174,114,0.3)',
        borderRadius: '12px',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '14px',
        fontWeight: 600,
        color: 'var(--success)',
      }}>
        ✓ CV uploaded — finding your matches...
      </div>
    )
  }

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.doc,.docx"
        style={{ display: 'none' }}
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <div
        onClick={() => !isLoading && fileRef.current?.click()}
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
              animation: 'spin 0.8s linear infinite',
            }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {uploading ? 'Uploading CV...' : 'AI is analysing your CV...'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {parsing ? 'Extracting skills and experience' : 'Securing your file'}
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
                PDF or Word · AI matches in 30 sec
              </div>
            </div>
          </>
        )}
      </div>

      {error && (
        <div style={{ fontSize: '12px', color: 'var(--error)', marginTop: '6px' }}>{error}</div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
