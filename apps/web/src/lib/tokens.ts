// ============================================================
// HIRRD DESIGN TOKENS
// Extracted from our agreed UI — Fugo-style light/dark system
// ============================================================

export const colors = {
  // Brand primaries
  primary: '#7C58E8',
  primaryLight: '#B099FF',
  primaryDark: '#4E30B8',

  // Brand secondary
  secondary: '#38C6D4',
  secondaryLight: '#5ADCE8',
  secondaryDark: '#28A8B4',

  // Backgrounds — light mode
  bgBase: '#F4F2FF',
  bgSurface: '#FAFAFF',
  bgCard: '#FFFFFF',
  bgSection: '#EDE8FF',

  // Backgrounds — dark mode
  bgBaseDark: '#0D0A18',
  bgSurfaceDark: '#0F0C1E',
  bgCardDark: '#140C38',

  // Typography — light mode
  textPrimary: '#1A1240',
  textSecondary: '#4A4270',
  textMuted: '#8880A8',
  textSubtle: '#B0A8C8',

  // Typography — dark mode
  textPrimaryDark: '#FFFFFF',
  textSecondaryDark: '#C4B0F0',
  textMutedDark: '#6A62A0',

  // Semantic
  success: '#3AAE72',
  successLight: '#EDFFF5',
  warning: '#C4962A',
  warningLight: '#FFF8E8',
  error: '#C0504A',
  errorLight: '#FFF5F5',
  info: '#38C6D4',
  infoLight: '#E8FEFF',

  // Borders
  borderLight: 'rgba(124,88,232,0.12)',
  borderMedium: 'rgba(124,88,232,0.22)',
  borderStrong: 'rgba(124,88,232,0.35)',

  // Gradients (as CSS strings)
  gradientPrimary: 'linear-gradient(135deg, #7C58E8, #38C6D4)',
  gradientPrimaryVertical: 'linear-gradient(180deg, #B099FF, #4E30B8)',
  gradientHero: 'linear-gradient(145deg, #EDE8FF, #F4F2FF, #E6F9FF)',
  gradientDarkHero: 'linear-gradient(145deg, #0E0A22, #0A0614, #060E12)',

  // Match score colours
  matchExcellent: '#3AAE72',  // 80-100
  matchGood: '#38C6D4',       // 60-79
  matchFair: '#C4962A',       // 40-59
  matchLow: '#C0504A',        // 0-39
} as const

export const typography = {
  fontFamily: "'Inter', 'Arial', sans-serif",
  fontMono: "'JetBrains Mono', 'Courier New', monospace",

  // Sizes
  xs: '10px',
  sm: '11px',
  base: '13px',
  md: '15px',
  lg: '18px',
  xl: '22px',
  '2xl': '28px',
  '3xl': '36px',
  '4xl': '48px',
  '5xl': '62px',

  // Weights
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,

  // Letter spacing
  tight: '-0.03em',
  normal: '0',
  wide: '0.06em',
  wider: '0.1em',
  widest: '0.18em',
} as const

export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const

export const radii = {
  sm: '8px',
  md: '12px',
  lg: '14px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  full: '9999px',
} as const

export const shadows = {
  card: '0 4px 24px rgba(124,88,232,0.08)',
  cardHover: '0 8px 32px rgba(124,88,232,0.16)',
  iconBox: '0 8px 32px rgba(74,40,168,0.28)',
  glow: '0 0 24px rgba(124,88,232,0.35)',
} as const

// Tailwind CSS config extension (for apps/web tailwind.config.ts)
export const tailwindExtension = {
  colors: {
    primary: colors.primary,
    'primary-light': colors.primaryLight,
    'primary-dark': colors.primaryDark,
    secondary: colors.secondary,
    'secondary-light': colors.secondaryLight,
    'bg-base': colors.bgBase,
    'bg-surface': colors.bgSurface,
    'bg-card': colors.bgCard,
    'text-brand': colors.textPrimary,
    'text-muted': colors.textMuted,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  },
  fontFamily: {
    sans: ['"Inter"', 'Arial', 'sans-serif'],
    mono: ['"JetBrains Mono"', 'monospace'],
  },
  borderRadius: {
    brand: radii.lg,
    'brand-lg': radii.xl,
    'brand-xl': radii['2xl'],
  },
}

// Match score → colour helper
export function matchScoreColor(score: number): string {
  if (score >= 80) return colors.matchExcellent
  if (score >= 60) return colors.matchGood
  if (score >= 40) return colors.matchFair
  return colors.matchLow
}

// Currency formatter
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

// Market display
export const marketLabels: Record<string, string> = {
  za: 'South Africa',
  zw: 'Zimbabwe',
  uk: 'United Kingdom',
  remote: 'Remote',
}

// Opportunity type display
export const opportunityTypeLabels: Record<string, string> = {
  job: 'Job',
  learnership: 'Learnership',
  internship: 'Internship',
  course: 'Course',
  bursary: 'Bursary',
}
