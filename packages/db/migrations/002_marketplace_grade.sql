-- ================================================================
-- HIRRD MIGRATION 002 — EXCHANGE-GRADE MARKETPLACE UPGRADE
-- Sprint 1 Security + Compliance Baseline
-- Agent 1 (Architecture) + Agent 3 (Security) + Agent 4 (Independent Review)
-- ================================================================

-- ── IMMUTABLE AUDIT LOG ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  actor_id        uuid,                          -- who did it (null = system)
  actor_role      text,                          -- candidate / employer / admin / system
  action          text NOT NULL,                 -- CREATE_APPLICATION, UPDATE_STATUS, etc
  entity_type     text NOT NULL,                 -- table name
  entity_id       uuid NOT NULL,                 -- row affected
  old_values      jsonb,                         -- before state
  new_values      jsonb,                         -- after state
  ip_address      inet,
  user_agent      text,
  session_id      text,
  metadata        jsonb DEFAULT '{}'
);

-- Audit log is append-only — no updates or deletes
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_log_insert_only" ON audit_log FOR INSERT WITH CHECK (true);
CREATE POLICY "audit_log_admin_read"  ON audit_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','compliance','auditor'))
);

-- No UPDATE or DELETE policies — table is immutable
CREATE INDEX idx_audit_log_actor    ON audit_log(actor_id, created_at DESC);
CREATE INDEX idx_audit_log_entity   ON audit_log(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_audit_log_action   ON audit_log(action, created_at DESC);

-- ── RISK SCORES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS risk_scores (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score           integer NOT NULL DEFAULT 50 CHECK (score BETWEEN 0 AND 100),
  risk_level      text NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low','medium','high','critical')),
  flags           text[] DEFAULT '{}',
  last_evaluated  timestamptz DEFAULT now(),
  auto_suspended  boolean DEFAULT false,
  notes           text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE risk_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "risk_scores_admin_only" ON risk_scores USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','compliance','risk_officer','fraud_investigator'))
);

-- ── FRAUD FLAGS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fraud_flags (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz DEFAULT now(),
  profile_id      uuid REFERENCES profiles(id) ON DELETE CASCADE,
  flag_type       text NOT NULL,   -- VELOCITY_APPLY / FAKE_EMPLOYER / MULTI_ACCOUNT / BOT_BEHAVIOUR
  severity        text NOT NULL DEFAULT 'low' CHECK (severity IN ('low','medium','high','critical')),
  description     text,
  evidence        jsonb DEFAULT '{}',
  status          text NOT NULL DEFAULT 'open' CHECK (status IN ('open','investigating','resolved','false_positive')),
  resolved_by     uuid REFERENCES profiles(id),
  resolved_at     timestamptz,
  resolution_note text
);

ALTER TABLE fraud_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fraud_flags_admin_only" ON fraud_flags USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','compliance','fraud_investigator'))
);

-- ── DISPUTES ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS disputes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  applicant_id    uuid NOT NULL REFERENCES profiles(id),
  respondent_id   uuid REFERENCES profiles(id),
  application_id  uuid REFERENCES applications(id),
  placement_id    uuid REFERENCES placements(id),
  category        text NOT NULL, -- FRAUDULENT_LISTING / UNFAIR_REJECTION / NON_PAYMENT / DATA_BREACH / OTHER
  description     text NOT NULL,
  status          text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','under_review','escalated','resolved','closed')),
  priority        text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  assigned_to     uuid REFERENCES profiles(id),
  resolution      text,
  resolved_at     timestamptz,
  sla_due_at      timestamptz DEFAULT (now() + INTERVAL '5 business days'),
  evidence_urls   text[] DEFAULT '{}',
  internal_notes  text
);

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "disputes_own"   ON disputes FOR ALL USING (applicant_id = auth.uid() OR respondent_id = auth.uid());
CREATE POLICY "disputes_admin" ON disputes USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','compliance','support_agent'))
);

-- ── EMPLOYER VERIFICATION STATE MACHINE ──────────────────────────
CREATE TABLE IF NOT EXISTS employer_verification (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id         uuid UNIQUE NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  cipc_status         text DEFAULT 'pending' CHECK (cipc_status IN ('pending','verified','failed','manual_review')),
  cipc_reg_number     text,
  cipc_verified_at    timestamptz,
  director_check      boolean DEFAULT false,
  sanctions_clear     boolean DEFAULT false,
  pep_clear           boolean DEFAULT false,
  domain_verified     boolean DEFAULT false,
  manual_reviewed_by  uuid REFERENCES profiles(id),
  manual_reviewed_at  timestamptz,
  risk_tier           text DEFAULT 'standard' CHECK (risk_tier IN ('low','standard','enhanced','high_risk')),
  edd_required        boolean DEFAULT false,
  edd_completed_at    timestamptz,
  notes               text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

ALTER TABLE employer_verification ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employer_verification_own"   ON employer_verification FOR SELECT USING (
  employer_id IN (SELECT id FROM employers WHERE profile_id = auth.uid())
);
CREATE POLICY "employer_verification_admin" ON employer_verification USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','compliance'))
);

-- ── PLACEMENT OUTCOMES (LONGITUDINAL TRACKING) ───────────────────
CREATE TABLE IF NOT EXISTS placement_outcomes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_id    uuid UNIQUE NOT NULL REFERENCES placements(id) ON DELETE CASCADE,
  candidate_id    uuid NOT NULL REFERENCES profiles(id),
  employer_id     uuid NOT NULL REFERENCES employers(id),
  started_at      date,
  ended_at        date,
  outcome         text CHECK (outcome IN ('permanent','extended','ended_natural','resigned','dismissed','unknown')),
  salary_at_start integer,
  salary_at_end   integer,
  skills_gained   text[] DEFAULT '{}',
  candidate_rating   integer CHECK (candidate_rating BETWEEN 1 AND 5),
  employer_rating    integer CHECK (employer_rating BETWEEN 1 AND 5),
  candidate_review   text,
  employer_review    text,
  confirmed_by_candidate boolean DEFAULT false,
  confirmed_by_employer  boolean DEFAULT false,
  confirmed_at    timestamptz,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE placement_outcomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "placement_outcomes_own" ON placement_outcomes FOR ALL USING (
  candidate_id = auth.uid() OR
  employer_id IN (SELECT id FROM employers WHERE profile_id = auth.uid())
);
CREATE POLICY "placement_outcomes_admin" ON placement_outcomes USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','compliance'))
);

-- ── DATA SUBJECT REQUESTS (POPIA s.23) ───────────────────────────
CREATE TABLE IF NOT EXISTS data_subject_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  profile_id      uuid REFERENCES profiles(id),
  request_type    text NOT NULL CHECK (request_type IN ('access','correction','deletion','portability','objection')),
  status          text NOT NULL DEFAULT 'received' CHECK (status IN ('received','processing','completed','rejected')),
  description     text,
  response        text,
  sla_due_at      timestamptz DEFAULT (now() + INTERVAL '30 days'),
  completed_at    timestamptz,
  assigned_to     uuid REFERENCES profiles(id),
  email_provided  text  -- for subjects who contact without account
);

ALTER TABLE data_subject_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dsr_own"   ON data_subject_requests FOR ALL USING (profile_id = auth.uid());
CREATE POLICY "dsr_admin" ON data_subject_requests USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','compliance'))
);

-- ── EMPLOYER RATINGS (TRUST SIGNAL) ──────────────────────────────
CREATE TABLE IF NOT EXISTS employer_ratings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id     uuid NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  candidate_id    uuid NOT NULL REFERENCES profiles(id),
  application_id  uuid REFERENCES applications(id),
  rating          integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review          text,
  tags            text[] DEFAULT '{}', -- RESPONDED_QUICKLY / PROFESSIONAL / GHOSTED / etc
  is_verified     boolean DEFAULT false, -- only verified placements
  created_at      timestamptz DEFAULT now(),
  UNIQUE(employer_id, candidate_id)
);

ALTER TABLE employer_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employer_ratings_select" ON employer_ratings FOR SELECT USING (true);
CREATE POLICY "employer_ratings_own"    ON employer_ratings FOR INSERT WITH CHECK (candidate_id = auth.uid());

-- ── CIRCUIT BREAKERS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS circuit_breakers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text UNIQUE NOT NULL,
  description     text,
  threshold       integer NOT NULL,
  window_minutes  integer NOT NULL DEFAULT 60,
  action          text NOT NULL CHECK (action IN ('flag','block','suspend','alert')),
  is_active       boolean DEFAULT true,
  trip_count      integer DEFAULT 0,
  last_tripped_at timestamptz,
  created_at      timestamptz DEFAULT now()
);

INSERT INTO circuit_breakers (name, description, threshold, window_minutes, action) VALUES
  ('apply_velocity',     'Applications per user per hour',         20, 60,  'block'),
  ('employer_reg_ip',    'Employer registrations per IP per day',  5,  1440,'flag'),
  ('login_failures',     'Failed logins per user per hour',        10, 60,  'block'),
  ('cv_parse_rate',      'CV parses per user per hour',            3,  60,  'block'),
  ('admin_login_new_ip', 'Admin login from new IP',                1,  0,   'alert')
ON CONFLICT (name) DO NOTHING;

-- ── ADD ROLE COLUMN TO PROFILES (if not present) ─────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'candidate'
  CHECK (role IN ('candidate','employer','admin','compliance','support_agent','risk_officer','fraud_investigator','auditor','exec','regulator'));

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'active'
  CHECK (account_status IN ('active','suspended','under_review','closed','deceased'));

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_level text NOT NULL DEFAULT 'none'
  CHECK (kyc_level IN ('none','basic','standard','enhanced'));

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS two_fa_enabled boolean DEFAULT false;

-- ── ADD CV HASH TO CANDIDATES ─────────────────────────────────────
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS cv_file_hash text;  -- SHA-256 of CV file
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS cv_ssrf_validated boolean DEFAULT false;

-- ── INDEXES ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_fraud_flags_profile  ON fraud_flags(profile_id, status);
CREATE INDEX IF NOT EXISTS idx_disputes_applicant   ON disputes(applicant_id, status);
CREATE INDEX IF NOT EXISTS idx_risk_scores_level    ON risk_scores(risk_level);
CREATE INDEX IF NOT EXISTS idx_employer_ratings_emp ON employer_ratings(employer_id);
CREATE INDEX IF NOT EXISTS idx_dsr_profile          ON data_subject_requests(profile_id, status);

-- ── AUDIT TRIGGER FUNCTION ────────────────────────────────────────
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO audit_log (actor_id, actor_role, action, entity_type, entity_id, old_values, new_values)
  VALUES (
    auth.uid(),
    (SELECT role FROM profiles WHERE id = auth.uid()),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN row_to_json(OLD)::jsonb ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW)::jsonb ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Wire audit triggers to critical tables
DROP TRIGGER IF EXISTS audit_applications ON applications;
CREATE TRIGGER audit_applications AFTER INSERT OR UPDATE OR DELETE ON applications
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_placements ON placements;
CREATE TRIGGER audit_placements AFTER INSERT OR UPDATE OR DELETE ON placements
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_profiles ON profiles;
CREATE TRIGGER audit_profiles AFTER UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

DROP TRIGGER IF EXISTS audit_employer_verification ON employer_verification;
CREATE TRIGGER audit_employer_verification AFTER INSERT OR UPDATE ON employer_verification
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

