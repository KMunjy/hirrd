-- ============================================================
-- HIRRD SPRINT 2 MIGRATION — SA Vetting, Leads, Institutions
-- Run in Supabase SQL editor: project nzanxokgpfurtkrvjfhw
-- ============================================================

-- 1. Extend verification_status enum
ALTER TYPE verification_status ADD VALUE IF NOT EXISTS 'high_risk_review';
ALTER TYPE verification_status ADD VALUE IF NOT EXISTS 'limited';
ALTER TYPE verification_status ADD VALUE IF NOT EXISTS 'suspended';

-- 2. Employer vetting fields
ALTER TABLE employers
  ADD COLUMN IF NOT EXISTS cipc_number          TEXT,
  ADD COLUMN IF NOT EXISTS vat_number           TEXT,
  ADD COLUMN IF NOT EXISTS physical_address_sa  TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone        TEXT,
  ADD COLUMN IF NOT EXISTS contact_title        TEXT,
  ADD COLUMN IF NOT EXISTS website_domain       TEXT,
  ADD COLUMN IF NOT EXISTS industry_sector      TEXT,
  ADD COLUMN IF NOT EXISTS risk_flags           JSONB       DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS account_status       TEXT        DEFAULT 'pending'
                                                CHECK (account_status IN
                                                  ('pending','verified','high_risk_review',
                                                   'limited','rejected','suspended')),
  ADD COLUMN IF NOT EXISTS active_jobs_limit    INTEGER     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS first_job_reviewed   BOOLEAN     DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS rejected_reason      TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_by          UUID        REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS reviewed_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cipc_doc_url         TEXT,
  ADD COLUMN IF NOT EXISTS marketing_consent    BOOLEAN     DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS marketing_consent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tos_accepted_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS popia_notice_shown   BOOLEAN     DEFAULT FALSE;

-- 3. Employer leads table
CREATE TABLE IF NOT EXISTS employer_leads (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name  TEXT        NOT NULL,
  work_email    TEXT        NOT NULL,
  company_size  TEXT,
  market        TEXT        DEFAULT 'za',
  cipc_number   TEXT,
  website       TEXT,
  industry      TEXT,
  contact_name  TEXT,
  contact_title TEXT,
  phone         TEXT,
  risk_flags    JSONB       DEFAULT '[]',
  status        TEXT        DEFAULT 'new'
                            CHECK (status IN ('new','contacted','converted','rejected')),
  notes         TEXT,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Institutions table
CREATE TABLE IF NOT EXISTS institutions (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id        UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  legal_name        TEXT        NOT NULL,
  trading_name      TEXT,
  institution_type  TEXT        NOT NULL
                                CHECK (institution_type IN
                                  ('public_university','tvet','private_college',
                                   'training_provider','placement_agency','other')),
  dhet_reg_number   TEXT,
  seta_name         TEXT,
  seta_accr_number  TEXT,
  saqa_id           TEXT,
  che_accredited    BOOLEAN     DEFAULT FALSE,
  website           TEXT,
  physical_address  TEXT        NOT NULL,
  contact_name      TEXT        NOT NULL,
  contact_email     TEXT        NOT NULL,
  contact_phone     TEXT,
  contact_title     TEXT,
  programmes_summary TEXT,
  nsfas_eligible    BOOLEAN     DEFAULT FALSE,
  account_status    TEXT        DEFAULT 'pending'
                                CHECK (account_status IN
                                  ('pending','verified','limited','rejected','suspended')),
  risk_flags        JSONB       DEFAULT '[]',
  accr_doc_url      TEXT,
  tos_accepted_at   TIMESTAMPTZ,
  marketing_consent BOOLEAN     DEFAULT FALSE,
  reviewed_by       UUID        REFERENCES profiles(id),
  reviewed_at       TIMESTAMPTZ,
  rejected_reason   TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Reports table
CREATE TABLE IF NOT EXISTS reports (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id   UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  target_type   TEXT        NOT NULL CHECK (target_type IN ('opportunity','employer','institution')),
  target_id     UUID        NOT NULL,
  reason        TEXT        NOT NULL
                            CHECK (reason IN
                              ('fake_job','fee_charged','scam','harassment',
                               'misleading','spam','other')),
  description   TEXT,
  status        TEXT        DEFAULT 'open'
                            CHECK (status IN ('open','reviewing','resolved','dismissed')),
  resolved_by   UUID        REFERENCES profiles(id),
  resolved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_employer_leads_status ON employer_leads(status);
CREATE INDEX IF NOT EXISTS idx_employer_leads_email  ON employer_leads(work_email);
CREATE INDEX IF NOT EXISTS idx_institutions_status   ON institutions(account_status);
CREATE INDEX IF NOT EXISTS idx_reports_target        ON reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reports_status        ON reports(status);
CREATE INDEX IF NOT EXISTS idx_employers_acct_status ON employers(account_status);

-- 7. RLS
ALTER TABLE employer_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports        ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_employer_leads" ON employer_leads FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "admin_all_institutions" ON institutions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "admin_all_reports" ON reports FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "institution_own_view" ON institutions
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "anyone_create_report" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "reporter_own_reports" ON reports FOR SELECT USING (reporter_id = auth.uid());
CREATE POLICY "public_verified_institutions" ON institutions
  FOR SELECT USING (account_status = 'verified');

-- ============================================================
-- MESSAGING & PHOTO ADDITIONS (Sprint 4)
-- ============================================================

-- Add messaging fields to candidates
ALTER TABLE candidates
  ADD COLUMN IF NOT EXISTS phone_verified        BOOLEAN     DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in       BOOLEAN     DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sms_opt_in            BOOLEAN     DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sms_opt_in_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS push_opt_in           BOOLEAN     DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS push_subscription     JSONB,
  ADD COLUMN IF NOT EXISTS preferred_channel     TEXT        DEFAULT 'whatsapp'
                                                 CHECK (preferred_channel IN ('whatsapp','sms','email','push')),
  ADD COLUMN IF NOT EXISTS passport_photo_url    TEXT,
  ADD COLUMN IF NOT EXISTS passport_photo_consent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ai_consent_at         TIMESTAMPTZ;

-- Add messaging fields to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone_verified        BOOLEAN     DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS phone_otp_last_sent   TIMESTAMPTZ;

-- Add messaging to employer_leads (if not already there)
ALTER TABLE employer_leads
  ADD COLUMN IF NOT EXISTS whatsapp_opt_in       BOOLEAN     DEFAULT FALSE;

-- OTP verification log (for audit + rate limiting)
CREATE TABLE IF NOT EXISTS otp_verifications (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID        REFERENCES profiles(id) ON DELETE CASCADE,
  phone       TEXT        NOT NULL,
  otp_hash    TEXT        NOT NULL,         -- bcrypt hash of OTP (never store plain)
  purpose     TEXT        NOT NULL          -- 'phone_verify' | 'login' | 'delete_account'
              CHECK (purpose IN ('phone_verify','login','delete_account')),
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Notification log (for audit trail and dedup)
CREATE TABLE IF NOT EXISTS notification_log (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  channel     TEXT        NOT NULL CHECK (channel IN ('whatsapp','sms','email','push')),
  phone       TEXT,
  message_type TEXT       NOT NULL,         -- 'cv_parsed' | 'new_match' | 'otp' | etc
  status      TEXT        DEFAULT 'sent'    CHECK (status IN ('sent','failed','delivered','read')),
  provider_id TEXT,                         -- Twilio SID / Clickatell ID
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_profile    ON otp_verifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_otp_phone      ON otp_verifications(phone, created_at);
CREATE INDEX IF NOT EXISTS idx_notif_profile  ON notification_log(profile_id);
CREATE INDEX IF NOT EXISTS idx_notif_type     ON notification_log(message_type, created_at);

-- RLS for OTP verifications
ALTER TABLE otp_verifications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_own_otps" ON otp_verifications
  FOR ALL USING (profile_id = auth.uid());

CREATE POLICY "admin_all_notif_log" ON notification_log
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- NOTE: Run these Storage policies via Supabase dashboard or Supabase Storage API
-- The candidate-photos bucket requires SEPARATE creation (like cvs bucket)
-- Bucket: candidate-photos, public: OFF
-- RLS policies:
--   INSERT: auth.uid()::text = (storage.foldername(name))[1]
--   SELECT: auth.uid()::text = (storage.foldername(name))[1] (private — no public access)
--   DELETE: auth.uid()::text = (storage.foldername(name))[1]
-- Note: Employers should only see photos via signed URLs from our API, never directly
