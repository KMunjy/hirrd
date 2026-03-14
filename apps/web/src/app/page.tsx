'use client'

import { useState, useEffect } from 'react'
import HirrdNav from '@/components/HirrdNav'
import HeroSection from '@/components/HeroSection'
import LiveFeedDashboard from '@/components/LiveFeedDashboard'
import PlacementsShowcase from '@/components/PlacementsShowcase'
import TestimonialBanner from '@/components/TestimonialBanner'
import FooterBar from '@/components/FooterBar'

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <HirrdNav />
      <HeroSection />
      <LiveFeedDashboard />
      <PlacementsShowcase />
      <TestimonialBanner />
      <FooterBar />
    </main>
  )
}
