'use client'

import { useState } from 'react'

interface Lead {
  id: string
  company_name: string
  work_email: string
  contact_name: string
  contact_title?: string
  phone?: string
  company_size?: string
  industry?: string
  cipc_number?: string
  website?: string
  risk_flags: string[]
  status: string
  notes?: string
  created_at: string
}

interface Props {
  leads: Lead[]
  stats: { total: number; new: number; converted: number; rejected: number; highRisk: number }
}

const RISK_LABELS: Record<string, { label: string; color: string }> = {
  free_email:         { label: 'Free email', color: '#C4962A' },
  no_website:         { label: 'No website', color: '#C4962A' },
  no_cipc:            { label: 'No CIPC', color: '#C0504A' },
  high_risk_industry: { label: 'High-risk industry', color: '#C0504A' },
}

export default function AdminClient({ leads, stats }: Props) {
  const [items, setItems] = useState<Lead[]>(leads)
  const [filter, setFilter] = useState<'all' | 'new' | 'high_risk' | 'converted' | 'rejected'>('new')
  const [actionId, setActionId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({})
  const [toast, setToast] = useState('')

  async function reviewLead(id: string, action: 'approve' | 'reject' | 'limit', reason?: string) {
    setActionId(id)
    try {
      const res = await fetch(`/api/admin/employers/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      })
      if (!res.ok) throw new Error('Action failed')

      const newStatus = action === 'approve' ? 'converted' : action === 'reject' ? 'rejected' : 'contacted'
      setItems(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l))
      setToast(`Lead ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'limited'} ✓`)
      setTimeout(() => setToast(''), 3000)
    } catch (e: any) {
      setToast('Error: ' + e.message)
    } finally {
      setActionId(null)
    }
  }

  const filtered = filter === 'all' ? items
    : filter === 'new' ? items.filter(l => l.status === 'new')
    : filter === 'high_risk' ? items.filter(l => l.risk_flags?.length > 0)
    : items.filter(l => l.status === filter)

  const statBoxes = [
    { label: 'Total', value: stats.total, color: 'var(--primary)' },
    { label: 'Pending', value: stats.new, color: 'var(--warning)' },
    { label: 'Approved', value: stats.converted, color: 'var(--success)' },
    { label: 'Rejected', value: stats.rejected, color: 'var(--error)' },
    { label: 'High risk', value: stats.highRisk, color: '#C4962A' },
  ]

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px 80px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Admin — Employer Vetting
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Review and action employer lead applications
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {statBoxes.map(s => (
          <div key={s.label} style={{
            background: 'var(--glass-2)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>
              {s.label.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {(['new', 'high_risk', 'all', 'converted', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
            border: 'none', cursor: 'pointer',
            background: filter === f ? 'var(--primary)' : 'var(--bg-base)',
            color: filter === f ? 'white' : 'var(--text-muted)',
          }}>
            {f === 'new' ? 'Pending' : f === 'high_risk' ? '⚠ High risk' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Leads table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '14px' }}>
          No leads in this category
        </div>
      ) : (
        filtered.map(lead => (
          <div key={lead.id} style={{
            background: 'var(--glass-2)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '20px', marginBottom: '12px',
            borderLeft: lead.risk_flags?.length > 0 ? '3px solid var(--warning)' : '3px solid var(--border)',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'start' }}>
              {/* Company info */}
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>
                  {lead.company_name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {lead.industry || 'Unknown industry'} · {lead.company_size || '?'} employees
                </div>
                {lead.cipc_number && (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    CIPC: {lead.cipc_number}
                  </div>
                )}
                {lead.website && (
                  <a href={lead.website} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: '11px', color: 'var(--primary)', textDecoration: 'none' }}>
                    {lead.website}
                  </a>
                )}
              </div>

              {/* Contact info */}
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>
                  {lead.contact_name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lead.contact_title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{lead.work_email}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lead.phone}</div>
              </div>

              {/* Risk flags + status */}
              <div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {(lead.risk_flags || []).map(f => {
                    const rf = RISK_LABELS[f] || { label: f, color: '#888' }
                    return (
                      <span key={f} style={{
                        fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                        background: rf.color + '18', color: rf.color, border: `1px solid ${rf.color}30`,
                      }}>{rf.label}</span>
                    )
                  })}
                  {(!lead.risk_flags || lead.risk_flags.length === 0) && (
                    <span style={{ fontSize: '10px', color: 'var(--success)', fontWeight: 600 }}>✓ No flags</span>
                  )}
                </div>
                <div style={{
                  display: 'inline-block', fontSize: '10px', fontWeight: 700,
                  padding: '2px 8px', borderRadius: '4px',
                  background: lead.status === 'new' ? 'rgba(196,150,42,0.1)' : lead.status === 'converted' ? 'rgba(58,174,114,0.1)' : 'rgba(192,80,74,0.1)',
                  color: lead.status === 'new' ? 'var(--warning)' : lead.status === 'converted' ? 'var(--success)' : 'var(--error)',
                }}>
                  {lead.status.toUpperCase()}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {new Date(lead.created_at).toLocaleDateString('en-ZA')}
                </div>
              </div>

              {/* Action buttons */}
              {lead.status === 'new' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '120px' }}>
                  <button
                    onClick={() => reviewLead(lead.id, 'approve')}
                    disabled={actionId === lead.id}
                    style={{
                      padding: '7px 16px', borderRadius: '7px', fontWeight: 600, fontSize: '12px',
                      background: 'rgba(58,174,114,0.1)', color: 'var(--success)',
                      border: '1px solid rgba(58,174,114,0.25)', cursor: 'pointer',
                    }}
                  >✓ Approve</button>
                  <button
                    onClick={() => reviewLead(lead.id, 'limit')}
                    disabled={actionId === lead.id}
                    style={{
                      padding: '7px 16px', borderRadius: '7px', fontWeight: 600, fontSize: '12px',
                      background: 'rgba(196,150,42,0.1)', color: 'var(--warning)',
                      border: '1px solid rgba(196,150,42,0.25)', cursor: 'pointer',
                    }}
                  >⚠ Limit</button>
                  <div>
                    <input
                      placeholder="Reason (optional)"
                      value={rejectReason[lead.id] || ''}
                      onChange={e => setRejectReason(prev => ({ ...prev, [lead.id]: e.target.value }))}
                      style={{
                        width: '100%', padding: '5px 8px', fontSize: '11px',
                        borderRadius: '5px', border: '1px solid var(--border-medium)',
                        background: 'var(--glass-1)', color: 'var(--text-primary)', marginBottom: '4px',
                        outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                    <button
                      onClick={() => reviewLead(lead.id, 'reject', rejectReason[lead.id])}
                      disabled={actionId === lead.id}
                      style={{
                        width: '100%', padding: '7px', borderRadius: '7px', fontWeight: 600, fontSize: '12px',
                        background: 'rgba(192,80,74,0.1)', color: 'var(--error)',
                        border: '1px solid rgba(192,80,74,0.25)', cursor: 'pointer',
                      }}
                    >✕ Reject</button>
                  </div>
                </div>
              )}
              {lead.status !== 'new' && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {lead.status === 'converted' ? 'Approved' : lead.status === 'rejected' ? 'Rejected' : 'Contacted'}
                  {lead.notes && <div style={{ marginTop: '4px' }}>{lead.notes}</div>}
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          background: 'var(--text-primary)', color: 'white',
          padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: 999,
        }}>
          {toast}
        </div>
      )}
    </main>
  )
}
