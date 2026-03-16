'use client'

import { useState, useEffect } from 'react'
import HirrdNav from '@/components/HirrdNav'
import LiveFeedDashboard from '@/components/LiveFeedDashboard'
import PlacementsShowcase from '@/components/PlacementsShowcase'
import { TestimonialBanner, FooterBar } from '@/components/HeroSection'
import CVUploadPanel from '@/components/CVUploadPanel'
import { formatSalary, matchScoreColor } from '@/lib/tokens'

interface Props {
  user: any
  profile: any
  candidate: any
  opportunities: any[]
  placements: any[]
  preferences: any
}

export default function DashboardClient({ user, profile, candidate, opportunities, placements, preferences }: Props) {

  // Apply saved theme on load
  useEffect(() => {
    if (preferences?.theme_primary) {
      document.documentElement.style.setProperty('--primary', preferences.theme_primary)
    }
    if (preferences?.theme_secondary) {
      document.documentElement.style.setProperty('--secondary', preferences.theme_secondary)
    }
  }, [preferences])

  const hasCV = candidate?.cv_url || candidate?.cv_status === 'parsed'

  return (
    <main style={{ minHeight: '100vh', background: 'var(--glass-1)' }}>
      <HirrdNav user={user} profile={profile} />

      {/* CV Upload prompt if no CV yet */}
      {!hasCV && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,88,232,0.06), rgba(56,198,212,0.04))',
          borderBottom: '1px solid var(--border)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Welcome, {profile?.full_name?.split(' ')[0] || 'there'} 👋
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Upload your CV to unlock AI matching across {opportunities.length}+ live opportunities
            </div>
          </div>
          <CVUploadPanel userId={user.id} candidateId={candidate?.id} />
        </div>
      )}

      <LiveFeedDashboard
        opportunities={opportunities}
        candidate={candidate}
      />

      <PlacementsShowcase placements={placements} />
      <TestimonialBanner />
      <FooterBar />
    </main>
  )
}
