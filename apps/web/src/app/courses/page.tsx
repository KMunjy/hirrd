import ComingSoon from '@/components/ComingSoon'
export const metadata = { title: 'Courses — Hirrd' }
export default function CoursesPage() {
  return (
    <ComingSoon
      emoji="📚"
      title="Course marketplace — coming Q2 2026"
      description="Close your skill gaps with AI-recommended courses. Upload your CV and we'll tell you exactly what to study."
      launchHint="Skill gap analysis is already live — start there"
      ctaText="See your skill gaps now"
      ctaHref="/auth/register"
    />
  )
}
