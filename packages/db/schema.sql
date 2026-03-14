-- ============================================================
-- HIRRD PLATFORM — COMPLETE DATABASE SCHEMA
-- Supabase PostgreSQL
-- Project: nzanxokgpfurtkrvjfhw
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('candidate', 'employer', 'admin');
CREATE TYPE opportunity_type AS ENUM ('job', 'learnership', 'internship', 'course', 'bursary');
CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contract', 'freelance', 'volunteer');
CREATE TYPE experience_level AS ENUM ('entry', 'junior', 'mid', 'senior', 'executive');
CREATE TYPE application_status AS ENUM ('draft', 'applied', 'viewed', 'shortlisted', 'interview', 'offered', 'rejected', 'withdrawn', 'placed');
CREATE TYPE market AS ENUM ('za', 'zw', 'uk', 'remote');
CREATE TYPE currency AS ENUM ('ZAR', 'GBP', 'USD', 'ZWL');
CREATE TYPE employer_plan AS ENUM ('free', 'starter', 'pro', 'enterprise');
CREATE TYPE candidate_plan AS ENUM ('free', 'premium');
CREATE TYPE profile_visibility AS ENUM ('open', 'closed', 'anonymous');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE cv_status AS ENUM ('uploaded', 'parsing', 'parsed', 'improved', 'failed');

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'candidate',
  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  location_city TEXT,
  location_country TEXT,
  market market DEFAULT 'za',
  bio TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CANDIDATES
-- ============================================================

CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  visibility profile_visibility DEFAULT 'open',
  plan candidate_plan DEFAULT 'free',
  plan_expires_at TIMESTAMPTZ,

  -- CV data
  cv_url TEXT,
  cv_filename TEXT,
  cv_status cv_status DEFAULT 'uploaded',
  cv_parsed_at TIMESTAMPTZ,
  cv_score INTEGER CHECK (cv_score BETWEEN 0 AND 100),
  cv_improvement_credits INTEGER DEFAULT 3,

  -- Parsed CV content
  headline TEXT,
  summary TEXT,
  years_experience INTEGER,
  education JSONB DEFAULT '[]',
  work_history JSONB DEFAULT '[]',
  skills TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  certifications JSONB DEFAULT '[]',

  -- AI match vector
  profile_vector vector(1536),

  -- Preferences
  desired_roles TEXT[] DEFAULT '{}',
  desired_salary_min INTEGER,
  desired_salary_max INTEGER,
  desired_currency currency DEFAULT 'ZAR',
  preferred_markets market[] DEFAULT '{za}',
  open_to_remote BOOLEAN DEFAULT FALSE,
  open_to_relocation BOOLEAN DEFAULT FALSE,

  -- SA specific
  bbbee_level INTEGER,
  equity_eligible BOOLEAN,
  disability_status BOOLEAN DEFAULT FALSE,

  -- UK specific
  right_to_work_uk BOOLEAN DEFAULT FALSE,
  visa_required BOOLEAN DEFAULT FALSE,

  -- Stats
  applications_count INTEGER DEFAULT 0,
  profile_views INTEGER DEFAULT 0,
  match_notifications_enabled BOOLEAN DEFAULT TRUE,
  last_active TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id)
);

-- ============================================================
-- EMPLOYERS
-- ============================================================

CREATE TABLE employers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_slug TEXT UNIQUE NOT NULL,
  company_logo_url TEXT,
  company_banner_url TEXT,
  company_description TEXT,
  company_website TEXT,
  industry TEXT,
  company_size TEXT,
  founded_year INTEGER,
  headquarters_city TEXT,
  headquarters_country TEXT,

  -- Verification
  verification_status verification_status DEFAULT 'pending',
  verified_at TIMESTAMPTZ,

  -- Plan
  plan employer_plan DEFAULT 'free',
  plan_expires_at TIMESTAMPTZ,
  job_posts_used INTEGER DEFAULT 0,
  job_posts_limit INTEGER DEFAULT 1,

  -- SA compliance
  bbbee_level INTEGER,
  bbbee_certificate_url TEXT,
  ee_employer BOOLEAN DEFAULT FALSE,

  -- Billing
  stripe_customer_id TEXT,
  paystack_customer_id TEXT,

  -- Stats
  total_hires INTEGER DEFAULT 0,
  active_jobs_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id)
);

-- ============================================================
-- OPPORTUNITIES (jobs, learnerships, courses, internships)
-- ============================================================

CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID REFERENCES employers(id) ON DELETE SET NULL,
  type opportunity_type NOT NULL DEFAULT 'job',
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,

  -- Details
  description TEXT NOT NULL,
  requirements TEXT,
  responsibilities TEXT,
  benefits TEXT,
  skills_required TEXT[] DEFAULT '{}',
  skills_preferred TEXT[] DEFAULT '{}',

  -- Classification
  employment_type employment_type DEFAULT 'full_time',
  experience_level experience_level DEFAULT 'entry',
  industry TEXT,
  category TEXT,

  -- Location
  market market NOT NULL DEFAULT 'za',
  location_city TEXT,
  location_country TEXT,
  remote_allowed BOOLEAN DEFAULT FALSE,

  -- Compensation
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency currency DEFAULT 'ZAR',
  salary_visible BOOLEAN DEFAULT TRUE,
  stipend_amount INTEGER,

  -- SA compliance
  bbbee_preference BOOLEAN DEFAULT FALSE,
  ee_designated BOOLEAN DEFAULT FALSE,

  -- UK compliance
  visa_sponsorship BOOLEAN DEFAULT FALSE,
  right_to_work_required BOOLEAN DEFAULT FALSE,

  -- AI matching
  job_vector vector(1536),
  ai_summary TEXT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  featured_until TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Stats
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,

  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- APPLICATIONS
-- ============================================================

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES employers(id) ON DELETE SET NULL,

  status application_status DEFAULT 'applied',

  -- AI match data
  match_score INTEGER CHECK (match_score BETWEEN 0 AND 100),
  match_breakdown JSONB DEFAULT '{}',
  matched_skills TEXT[] DEFAULT '{}',
  missing_skills TEXT[] DEFAULT '{}',

  -- Application content
  cover_letter TEXT,
  cv_url TEXT,
  cv_version_label TEXT,

  -- Employer actions
  viewed_at TIMESTAMPTZ,
  shortlisted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Interview
  interview_scheduled_at TIMESTAMPTZ,
  interview_type TEXT,
  interview_notes TEXT,

  -- Offer
  offered_at TIMESTAMPTZ,
  offer_salary INTEGER,
  offer_currency currency,
  offer_accepted_at TIMESTAMPTZ,
  offer_declined_at TIMESTAMPTZ,

  -- Placement confirmation
  placed_at TIMESTAMPTZ,
  placement_confirmed BOOLEAN DEFAULT FALSE,
  placement_salary INTEGER,

  -- Queued for offline sync
  is_queued BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(candidate_id, opportunity_id)
);

-- ============================================================
-- PLACEMENTS (showcase + testimonials)
-- ============================================================

CREATE TABLE placements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES employers(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,

  candidate_name TEXT NOT NULL,
  candidate_avatar_url TEXT,
  role_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  location_city TEXT,
  market market,

  testimonial TEXT,
  testimonial_approved BOOLEAN DEFAULT FALSE,
  consent_given BOOLEAN DEFAULT FALSE,

  placed_at TIMESTAMPTZ DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SKILLS (master list for gap analysis)
-- ============================================================

CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT,
  is_technical BOOLEAN DEFAULT TRUE,
  demand_score INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SKILL GAPS (per candidate per role)
-- ============================================================

CREATE TABLE skill_gaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  skill_name TEXT NOT NULL,
  gap_severity TEXT DEFAULT 'medium',
  recommended_course TEXT,
  recommended_course_url TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CV VERSIONS
-- ============================================================

CREATE TABLE cv_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  version_label TEXT NOT NULL,
  cv_url TEXT NOT NULL,
  cv_score INTEGER,
  ai_improvements JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT FALSE,
  target_role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUBSCRIPTIONS / PAYMENTS
-- ============================================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  stripe_subscription_id TEXT,
  paystack_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  amount INTEGER NOT NULL,
  currency currency NOT NULL DEFAULT 'ZAR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SAVED JOBS
-- ============================================================

CREATE TABLE saved_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(candidate_id, opportunity_id)
);

-- ============================================================
-- USER PREFERENCES (colour theme + settings)
-- ============================================================

CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  theme_primary TEXT DEFAULT '#7C58E8',
  theme_secondary TEXT DEFAULT '#38C6D4',
  theme_mode TEXT DEFAULT 'light',
  language TEXT DEFAULT 'en',
  currency_display currency DEFAULT 'ZAR',
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  whatsapp_notifications BOOLEAN DEFAULT FALSE,
  whatsapp_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Full text search on opportunities
CREATE INDEX idx_opportunities_fts ON opportunities
  USING GIN (to_tsvector('english', title || ' ' || description));

-- Vector similarity search
CREATE INDEX idx_opportunities_vector ON opportunities
  USING ivfflat (job_vector vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_candidates_vector ON candidates
  USING ivfflat (profile_vector vector_cosine_ops) WITH (lists = 100);

-- Common filters
CREATE INDEX idx_opportunities_active ON opportunities(is_active, market, type);
CREATE INDEX idx_opportunities_employer ON opportunities(employer_id);
CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_applications_opportunity ON applications(opportunity_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_notifications_profile ON notifications(profile_id, read);
CREATE INDEX idx_placements_featured ON placements(is_featured, placed_at DESC);
CREATE INDEX idx_skills_name ON skills USING GIN (name gin_trgm_ops);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- CANDIDATES: own full access
CREATE POLICY "candidates_own" ON candidates FOR ALL USING (
  profile_id = auth.uid()
);
-- Employers can view non-closed candidate profiles
CREATE POLICY "candidates_employer_view" ON candidates FOR SELECT USING (
  visibility != 'closed'
  AND EXISTS (SELECT 1 FROM employers WHERE profile_id = auth.uid())
);

-- EMPLOYERS: own full access
CREATE POLICY "employers_own" ON employers FOR ALL USING (profile_id = auth.uid());
-- Public can view verified employers
CREATE POLICY "employers_public_view" ON employers FOR SELECT USING (verification_status = 'verified');

-- OPPORTUNITIES: public can view active ones
CREATE POLICY "opportunities_public_select" ON opportunities FOR SELECT USING (is_active = TRUE);
-- Employers manage their own
CREATE POLICY "opportunities_employer_manage" ON opportunities FOR ALL USING (
  employer_id IN (SELECT id FROM employers WHERE profile_id = auth.uid())
);

-- APPLICATIONS: candidates see own, employers see for their jobs
CREATE POLICY "applications_candidate_own" ON applications FOR ALL USING (
  candidate_id IN (SELECT id FROM candidates WHERE profile_id = auth.uid())
);
CREATE POLICY "applications_employer_view" ON applications FOR SELECT USING (
  employer_id IN (SELECT id FROM employers WHERE profile_id = auth.uid())
);
CREATE POLICY "applications_employer_update" ON applications FOR UPDATE USING (
  employer_id IN (SELECT id FROM employers WHERE profile_id = auth.uid())
);

-- PLACEMENTS: public read approved ones
CREATE POLICY "placements_public" ON placements FOR SELECT USING (
  testimonial_approved = TRUE AND consent_given = TRUE
);

-- NOTIFICATIONS: own only
CREATE POLICY "notifications_own" ON notifications FOR ALL USING (profile_id = auth.uid());

-- SUBSCRIPTIONS: own only
CREATE POLICY "subscriptions_own" ON subscriptions FOR ALL USING (profile_id = auth.uid());

-- SAVED: own only
CREATE POLICY "saved_own" ON saved_opportunities FOR ALL USING (
  candidate_id IN (SELECT id FROM candidates WHERE profile_id = auth.uid())
);

-- CV VERSIONS: own only
CREATE POLICY "cv_versions_own" ON cv_versions FOR ALL USING (
  candidate_id IN (SELECT id FROM candidates WHERE profile_id = auth.uid())
);

-- SKILL GAPS: own only
CREATE POLICY "skill_gaps_own" ON skill_gaps FOR ALL USING (
  candidate_id IN (SELECT id FROM candidates WHERE profile_id = auth.uid())
);

-- USER PREFERENCES: own only
CREATE POLICY "preferences_own" ON user_preferences FOR ALL USING (profile_id = auth.uid());

-- SKILLS: public read
CREATE POLICY "skills_public" ON skills FOR SELECT TO authenticated USING (TRUE);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'candidate')
  );

  -- Auto-create preferences
  INSERT INTO user_preferences (profile_id) VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER candidates_updated_at BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER employers_updated_at BEFORE UPDATE ON employers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Increment opportunity view count
CREATE OR REPLACE FUNCTION increment_opportunity_views(opp_id UUID)
RETURNS VOID AS $$
  UPDATE opportunities SET views_count = views_count + 1 WHERE id = opp_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Increment application count on new application
CREATE OR REPLACE FUNCTION handle_new_application()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE opportunities SET applications_count = applications_count + 1 WHERE id = NEW.opportunity_id;
  UPDATE candidates SET applications_count = applications_count + 1 WHERE id = NEW.candidate_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_application
  AFTER INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION handle_new_application();

-- ============================================================
-- SEED DATA — SKILLS MASTER LIST
-- ============================================================

INSERT INTO skills (name, slug, category, is_technical, demand_score) VALUES
('SQL', 'sql', 'Data', true, 95),
('Python', 'python', 'Programming', true, 98),
('JavaScript', 'javascript', 'Programming', true, 97),
('TypeScript', 'typescript', 'Programming', true, 94),
('React', 'react', 'Frontend', true, 96),
('Node.js', 'nodejs', 'Backend', true, 93),
('AWS', 'aws', 'Cloud', true, 92),
('Azure', 'azure', 'Cloud', true, 88),
('Tableau', 'tableau', 'Data', true, 82),
('Power BI', 'power-bi', 'Data', true, 84),
('Excel', 'excel', 'Data', false, 91),
('Git', 'git', 'DevOps', true, 95),
('Docker', 'docker', 'DevOps', true, 87),
('Kubernetes', 'kubernetes', 'DevOps', true, 80),
('Machine Learning', 'machine-learning', 'AI', true, 89),
('Data Analysis', 'data-analysis', 'Data', true, 90),
('Project Management', 'project-management', 'Management', false, 86),
('Agile', 'agile', 'Management', false, 88),
('Communication', 'communication', 'Soft Skills', false, 95),
('Leadership', 'leadership', 'Soft Skills', false, 85),
('Java', 'java', 'Programming', true, 85),
('C#', 'csharp', 'Programming', true, 80),
('PHP', 'php', 'Programming', true, 72),
('Flutter', 'flutter', 'Mobile', true, 78),
('React Native', 'react-native', 'Mobile', true, 82),
('Figma', 'figma', 'Design', false, 88),
('UX Design', 'ux-design', 'Design', false, 87),
('SEO', 'seo', 'Marketing', false, 78),
('Digital Marketing', 'digital-marketing', 'Marketing', false, 82),
('Accounting', 'accounting', 'Finance', false, 85),
('Financial Analysis', 'financial-analysis', 'Finance', false, 83);

-- ============================================================
-- SEED DATA — SAMPLE PLACEMENTS (for homepage showcase)
-- ============================================================

INSERT INTO placements (candidate_name, role_title, company_name, location_city, market, testimonial, testimonial_approved, consent_given, is_featured, display_order) VALUES
('Thabo Mokoena', 'Junior Data Analyst', 'FNB', 'Johannesburg', 'za', 'Hirrd changed my life — found me opportunities even while I was at home with no data. Once I uploaded my CV, they didn''t stop until I found my right opportunity. Thank you Hirrd.', true, true, true, 1),
('Sive Nkosi', 'UX Researcher', 'Standard Bank', 'Cape Town', 'za', 'I had no idea my CV was holding me back. Hirrd improved it and matched me to roles I didn''t even know existed. Got the call within a week. Truly life-changing.', true, true, true, 2),
('Priya Moodley', 'Data Science Intern', 'Discovery', 'Johannesburg', 'za', 'As a graduate with no connections I thought it would take months. Hirrd matched me to this learnship in 48 hours. The AI knew exactly what I needed. Thank you.', true, true, true, 3);
