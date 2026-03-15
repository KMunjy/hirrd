export function matchScoreColor(score: number): string {
  if (score >= 80) return '#3AAE72'
  if (score >= 60) return '#38C6D4'
  if (score >= 40) return '#C4962A'
  return '#C0504A'
}

export function formatSalary(min: number | null, max: number | null, currency: string): string {
  if (!min && !max) return 'Negotiable'
  const fmt = (n: number) => {
    if (currency === 'ZAR') return `R${(n / 1000).toFixed(0)}k`
    if (currency === 'GBP') return `£${(n / 1000).toFixed(0)}k`
    if (currency === 'USD') return `$${(n / 1000).toFixed(0)}k`
    return `${n}`
  }
  if (min && max) return `${fmt(min)}–${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  if (max) return `Up to ${fmt(max)}`
  return 'Negotiable'
}

export const marketLabels: Record<string, string> = {
  za: 'South Africa',
  zw: 'Zimbabwe',
  uk: 'United Kingdom',
  remote: 'Remote',
}

export const opportunityTypeLabels: Record<string, string> = {
  job: 'Job',
  learnership: 'Learnership',
  internship: 'Internship',
  course: 'Course',
  bursary: 'Bursary',
}
