export type UserRole = 'candidate' | 'employer' | 'admin'
export type OpportunityType = 'job' | 'learnership' | 'internship' | 'course' | 'bursary'
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'freelance' | 'volunteer'
export type ExperienceLevel = 'entry' | 'junior' | 'mid' | 'senior' | 'executive'
export type ApplicationStatus = 'draft' | 'applied' | 'viewed' | 'shortlisted' | 'interview' | 'offered' | 'rejected' | 'withdrawn' | 'placed'
export type Market = 'za' | 'zw' | 'uk' | 'remote'
export type Currency = 'ZAR' | 'GBP' | 'USD' | 'ZWL'
export type EmployerPlan = 'free' | 'starter' | 'pro' | 'enterprise'
export type CandidatePlan = 'free' | 'premium'
export type ProfileVisibility = 'open' | 'closed' | 'anonymous'
export type VerificationStatus = 'pending' | 'verified' | 'rejected'
export type CVStatus = 'uploaded' | 'parsing' | 'parsed' | 'improved' | 'failed'

export interface Profile {
  id: string
  role: UserRole
  full_name: string | null
  email: string
  phone: string | null
  avatar_url: string | null
  location_city: string | null
  location_country: string | null
  market: Market
  bio: string | null
  linkedin_url: string | null
  github_url: string | null
  portfolio_url: string | null
  created_at: string
  updated_at: string
}

export interface Candidate {
  id: string
  profile_id: string
  visibility: ProfileVisibility
  plan: CandidatePlan
  plan_expires_at: string | null
  cv_url: string | null
  cv_filename: string | null
  cv_status: CVStatus
  cv_parsed_at: string | null
  cv_score: number | null
  cv_improvement_credits: number
  headline: string | null
  summary: string | null
  years_experience: number | null
  education: Record<string, unknown>[]
  work_history: Record<string, unknown>[]
  skills: string[]
  languages: string[]
  certifications: Record<string, unknown>[]
  desired_roles: string[]
  desired_salary_min: number | null
  desired_salary_max: number | null
  desired_currency: Currency
  preferred_markets: Market[]
  open_to_remote: boolean
  open_to_relocation: boolean
  bbbee_level: number | null
  equity_eligible: boolean | null
  right_to_work_uk: boolean
  visa_required: boolean
  applications_count: number
  profile_views: number
  match_notifications_enabled: boolean
  last_active: string
  created_at: string
  updated_at: string
}

export interface Employer {
  id: string
  profile_id: string
  company_name: string
  company_slug: string
  company_logo_url: string | null
  company_banner_url: string | null
  company_description: string | null
  company_website: string | null
  industry: string | null
  company_size: string | null
  headquarters_city: string | null
  headquarters_country: string | null
  verification_status: VerificationStatus
  plan: EmployerPlan
  plan_expires_at: string | null
  job_posts_used: number
  job_posts_limit: number
  bbbee_level: number | null
  ee_employer: boolean
  stripe_customer_id: string | null
  total_hires: number
  active_jobs_count: number
  created_at: string
  updated_at: string
}

export interface Opportunity {
  id: string
  employer_id: string | null
  type: OpportunityType
  title: string
  slug: string
  description: string
  requirements: string | null
  responsibilities: string | null
  benefits: string | null
  skills_required: string[]
  skills_preferred: string[]
  employment_type: EmploymentType
  experience_level: ExperienceLevel
  industry: string | null
  category: string | null
  market: Market
  location_city: string | null
  location_country: string | null
  remote_allowed: boolean
  salary_min: number | null
  salary_max: number | null
  salary_currency: Currency
  salary_visible: boolean
  bbbee_preference: boolean
  ee_designated: boolean
  visa_sponsorship: boolean
  right_to_work_required: boolean
  ai_summary: string | null
  is_active: boolean
  is_featured: boolean
  expires_at: string | null
  views_count: number
  applications_count: number
  published_at: string
  created_at: string
  updated_at: string
  // Joined
  employer?: Employer
}

export interface Application {
  id: string
  candidate_id: string
  opportunity_id: string
  employer_id: string | null
  status: ApplicationStatus
  match_score: number | null
  match_breakdown: Record<string, unknown>
  matched_skills: string[]
  missing_skills: string[]
  cover_letter: string | null
  cv_url: string | null
  viewed_at: string | null
  shortlisted_at: string | null
  offered_at: string | null
  placed_at: string | null
  placement_confirmed: boolean
  is_queued: boolean
  created_at: string
  updated_at: string
  // Joined
  opportunity?: Opportunity
  candidate?: Candidate
}

export interface Placement {
  id: string
  candidate_name: string
  candidate_avatar_url: string | null
  role_title: string
  company_name: string
  company_logo_url: string | null
  location_city: string | null
  market: Market | null
  testimonial: string | null
  testimonial_approved: boolean
  consent_given: boolean
  placed_at: string
  is_featured: boolean
  display_order: number
}

export interface UserPreferences {
  id: string
  profile_id: string
  theme_primary: string
  theme_secondary: string
  theme_mode: 'light' | 'dark'
  language: string
  currency_display: Currency
  email_notifications: boolean
  push_notifications: boolean
  whatsapp_notifications: boolean
  whatsapp_number: string | null
  created_at: string
  updated_at: string
}

export interface MatchResult {
  opportunity: Opportunity
  match_score: number
  matched_skills: string[]
  missing_skills: string[]
  match_breakdown: {
    skills: number
    experience: number
    location: number
    salary: number
    education: number
  }
}
