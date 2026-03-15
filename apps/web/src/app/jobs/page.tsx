import ComingSoon from '@/components/ComingSoon'
export const metadata = { title: 'Jobs — Hirrd' }
export default function JobsPage() {
  return (
    <ComingSoon
      emoji="💼"
      title="Jobs board coming soon"
      description="We're curating live jobs across South Africa, Zimbabwe, and the UK — matched to your skills by AI."
      launchHint="Launching Q2 2026 · Upload your CV now to be first in line"
      ctaText="Upload your CV to get matched"
    />
  )
}
