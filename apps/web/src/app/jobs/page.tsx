import ComingSoon from '@/components/ComingSoon'
export const metadata = { title: 'Jobs — Hirrd' }
export default function JobsPage() {
  return (
    <ComingSoon
      emoji="💼"
      title="Jobs board coming soon"
      description="We're curating live SA jobs — matched to your skills by AI. Early access now open."
      launchHint="Launching Q2 2026 · Upload your CV now to be first in line"
      ctaText="Upload your CV to get matched"
    />
  )
}
