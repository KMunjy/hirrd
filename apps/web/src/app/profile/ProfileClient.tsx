'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Props {
  profile: any
  candidate: any
  userId: string
}

export default function ProfileClient({ profile, candidate, userId }: Props) {
  const [skills, setSkills] = useState<string[]>(candidate?.skills || [])
  const [headline, setHeadline] = useState(candidate?.headline || '')
  const [summary, setSummary] = useState(candidate?.summary || '')
  const [newSkill, setNewSkill] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function saveProfile() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills, headline, summary }),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteAccount() {
    setDeleting(true)
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' })
      if (!res.ok) throw new Error('Deletion failed')
      window.location.href = '/'
    } catch (e: any) {
      setError(e.message)
      setDeleting(false)
    }
  }

  function removeSkill(s: string) {
    setSkills(prev => prev.filter(x => x !== s))
  }

  function addSkill() {
    const trimmed = newSkill.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed])
    }
    setNewSkill('')
  }

  const sectionLabel: React.CSSProperties = {
    fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)',
    letterSpacing: '0.1em', marginBottom: '12px',
  }
  const card: React.CSSProperties = {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '14px', padding: '24px', marginBottom: '20px',
  }

  return (
    <main id="main-content" style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 20px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Your Profile
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {profile?.full_name} · {profile?.email}
          </p>
        </div>
        <Link href="/dashboard" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
          ← Dashboard
        </Link>
      </div>

      {/* CV Strength */}
      {candidate?.cv_score != null && (
        <div style={{ ...card, borderLeft: '3px solid var(--primary)' }}>
          <div style={sectionLabel}>CV STRENGTH</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--primary)' }}>
              {candidate.cv_score}/100
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '4px',
                  background: candidate.cv_score >= 70 ? 'var(--success)' : candidate.cv_score >= 50 ? 'var(--warning)' : 'var(--error)',
                  width: `${candidate.cv_score}%`, transition: 'width 0.6s ease',
                }} />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                {candidate.cv_score < 50 ? 'Add more skills and achievements to improve your matches' :
                 candidate.cv_score < 70 ? 'Good — add certifications and measurable achievements' :
                 'Strong profile — keep it updated'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Headline & Summary */}
      <div style={card}>
        <div style={sectionLabel}>PROFESSIONAL HEADLINE</div>
        <input
          value={headline}
          onChange={e => setHeadline(e.target.value)}
          placeholder="e.g. Senior Data Analyst | 5 years SA banking"
          style={{
            width: '100%', padding: '10px 14px', borderRadius: '8px',
            border: '1px solid var(--border-medium)', background: 'var(--bg-base)',
            color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
            marginBottom: '16px', boxSizing: 'border-box',
          }}
        />
        <div style={{ ...sectionLabel, marginTop: '4px' }}>PROFESSIONAL SUMMARY</div>
        <textarea
          value={summary}
          onChange={e => setSummary(e.target.value)}
          rows={3}
          placeholder="Brief 2-3 sentence summary of your experience and goals"
          style={{
            width: '100%', padding: '10px 14px', borderRadius: '8px',
            border: '1px solid var(--border-medium)', background: 'var(--bg-base)',
            color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
            resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Skills */}
      <div style={card}>
        <div style={sectionLabel}>SKILLS</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          {skills.map(s => (
            <span key={s} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(124,88,232,0.08)', borderRadius: '6px',
              padding: '4px 10px', fontSize: '13px', fontWeight: 600, color: 'var(--primary)',
              border: '1px solid rgba(124,88,232,0.15)',
            }}>
              {s}
              <button
                onClick={() => removeSkill(s)}
                aria-label={`Remove ${s}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1, padding: 0 }}
              >×</button>
            </span>
          ))}
          {skills.length === 0 && (
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No skills yet — add some below</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSkill()}
            placeholder="Add a skill (press Enter)"
            style={{
              flex: 1, padding: '9px 14px', borderRadius: '8px',
              border: '1px solid var(--border-medium)', background: 'var(--bg-base)',
              color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
            }}
          />
          <button
            onClick={addSkill}
            style={{
              padding: '9px 18px', borderRadius: '8px', fontWeight: 600,
              background: 'var(--gradient-primary)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '13px',
            }}
          >Add</button>
        </div>
      </div>

      {/* Work history — read only */}
      {candidate?.work_history?.length > 0 && (
        <div style={card}>
          <div style={sectionLabel}>WORK HISTORY</div>
          {candidate.work_history.map((job: any, i: number) => (
            <div key={i} style={{ paddingBottom: '14px', marginBottom: '14px', borderBottom: i < candidate.work_history.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>{job.title}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {job.company} · {job.start_date} – {job.is_current ? 'Present' : job.end_date}
              </div>
              {job.description && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{job.description}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Education — read only */}
      {candidate?.education?.length > 0 && (
        <div style={card}>
          <div style={sectionLabel}>EDUCATION</div>
          {candidate.education.map((edu: any, i: number) => (
            <div key={i} style={{ paddingBottom: '10px', marginBottom: '10px', borderBottom: i < candidate.education.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>{edu.qualification} {edu.field ? `— ${edu.field}` : ''}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{edu.institution} · {edu.year_completed}</div>
            </div>
          ))}
        </div>
      )}

      {/* Save button */}
      {error && (
        <div style={{ background: 'var(--error-light)', border: '1px solid rgba(192,80,74,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: 'var(--error)' }}>
          {error}
        </div>
      )}
      <button
        onClick={saveProfile}
        disabled={saving}
        style={{
          width: '100%', padding: '13px', borderRadius: '10px',
          background: saved ? 'var(--success)' : 'var(--gradient-primary)',
          color: 'white', border: 'none', fontWeight: 600, fontSize: '15px',
          cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1,
          marginBottom: '32px',
        }}
      >
        {saving ? 'Saving…' : saved ? '✓ Changes saved' : 'Save profile'}
      </button>

      {/* POPIA: Delete account */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Delete my account
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.5 }}>
          This will permanently delete your profile, CV, and all data under your account.
          This cannot be undone. Your right to erasure under POPIA s.24.
        </p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              padding: '9px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
              border: '1px solid rgba(192,80,74,0.4)', color: 'var(--error)',
              background: 'var(--error-light)', cursor: 'pointer',
            }}
          >
            Delete my account
          </button>
        ) : (
          <div style={{ background: 'var(--error-light)', border: '1px solid rgba(192,80,74,0.25)', borderRadius: '10px', padding: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--error)', marginBottom: '12px' }}>
              Are you sure? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={deleteAccount}
                disabled={deleting}
                style={{
                  padding: '9px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                  background: 'var(--error)', color: 'white', border: 'none', cursor: deleting ? 'default' : 'pointer',
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? 'Deleting…' : 'Yes, delete everything'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: '9px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                  border: '1px solid var(--border-medium)', color: 'var(--text-secondary)',
                  background: 'var(--bg-card)', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
