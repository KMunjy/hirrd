'use client'

import { useState, useEffect } from 'react'

const PLACEMENTS = [
  {
    initials: 'TM',
    name: 'Thabo Mokoena',
    role: 'Junior Data Analyst',
    company: 'FNB',
    city: 'Johannesburg',
    daysAgo: '3 days ago',
    quote: 'Hirrd changed my life — found me opportunities even while I was at home with no data. Once I uploaded my CV, they didn\'t stop until I found my right opportunity.',
    accentColor: 'var(--primary)',
    bgColor: 'rgba(124,88,232,0.08)',
  },
  {
    initials: 'SN',
    name: 'Sive Nkosi',
    role: 'UX Researcher',
    company: 'Standard Bank',
    city: 'Cape Town',
    daysAgo: '5 days ago',
    quote: 'I had no idea my CV was holding me back. Hirrd improved it and matched me to roles I didn\'t even know existed. Got the call within a week.',
    accentColor: 'var(--secondary)',
    bgColor: 'rgba(56,198,212,0.08)',
  },
  {
    initials: 'PM',
    name: 'Priya Moodley',
    role: 'Data Science Intern',
    company: 'Discovery',
    city: 'Johannesburg',
    daysAgo: '1 week ago',
    quote: 'As a graduate with no connections I thought it would take months. Hirrd matched me to this learnship in 48 hours. The AI knew exactly what I needed.',
    accentColor: 'var(--warning)',
    bgColor: 'rgba(196,150,42,0.08)',
  },
]

export default function PlacementsShowcase({ placements }: { placements?: any[] } = {}) {
  return (
    <section style={{ padding: '0 24px 0' }}>
      <div style={{
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '10px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>Recently Placed</span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>This week · 3 placements confirmed</span>
      </div>

      <div style={{
        padding: '16px 0',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '14px',
      }}>
        {PLACEMENTS.map(p => (
          <PlacementCard key={p.name} placement={p} />
        ))}
      </div>
    </section>
  )
}

function PlacementCard({ placement: p }: { placement: typeof PLACEMENTS[0] }) {
  return (
    <div className="card card-hover">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: p.bgColor,
          border: `2px solid ${p.accentColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 700,
          color: p.accentColor,
          flexShrink: 0,
        }}>
          {p.initials}
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>Placed at {p.company}</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{p.role} · {p.city}</div>
        </div>
      </div>
      <div style={{
        fontSize: '12px',
        color: 'var(--text-secondary)',
        lineHeight: 1.7,
        fontStyle: 'italic',
        borderTop: '1px solid var(--border)',
        paddingTop: '10px',
      }}>
        "{p.quote}"
      </div>
      <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--text-subtle)', fontWeight: 500 }}>
        {p.daysAgo}
      </div>
    </div>
  )
}
