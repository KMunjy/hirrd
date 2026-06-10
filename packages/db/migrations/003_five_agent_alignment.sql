-- ================================================================
-- HIRRD MIGRATION 003 — 5-AGENT MARKETPLACE ALIGNMENT
-- Agent 1 (Architecture) + Agent 2 (Compliance) + Agent 3 (Security)
-- + Agent 4 (Independent Review) remediation of findings B1-B6
-- Run after: 001_sprint2_vetting.sql + 002_marketplace_grade.sql
-- ================================================================

-- ── B1 REMEDIATION: DOUBLE-ENTRY FINANCIAL LEDGER ────────────────
-- Required before Stripe/payment activation (Sprint 6)
CREATE TABLE IF NOT EXISTS ledger (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  profile_id      uuid        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  entry_type      text        NOT NULL CHECK (entry_type IN ('debit','credit','fee','refund','adjustment')),
  amount          bigint      NOT NULL CHECK (amount > 0),  -- in cents/rands * 100
  currency        text        NOT NULL DEFAULT 'ZAR' CHECK (currency IN ('ZAR','GBP','USD','ZWL')),
  balance_after   bigint      NOT NULL,                     -- running balance in cents
  reference       text        NOT NULL,                     -- payment_id / subscription_id / manual
  description     text,
  metadata        jsonb       DEFAULT '{}',
  reconciled      boolean     DEFAULT false,
  reconciled_at   timestamptz,
  created_by      uuid        REFERENCES profiles(id)       -- system or admin actor
);

ALTER TABLE ledger ENABLE ROW LEVEL SECURITY;
-- Ledger is append-only (like audit_log) — no updates, no deletes
CREATE POLICY "ledger_insert_only"    ON ledger FOR INSERT WITH CHECK (true);
CREATE POLICY "ledger_owner_read"     ON ledger FOR SELECT USING (
  profile_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','compliance','auditor','exec'))
);
-- No UPDATE or DELETE policies intentionally omitted

CREATE INDEX idx_ledger_profile  ON ledger(profile_id, created_at DESC);
CREATE INDEX idx_ledger_ref      ON ledger(reference);
CREATE INDEX idx_ledger_unreconciled ON ledger(reconciled, created_at DESC) WHERE NOT reconciled;

-- ── SETTLEMENT QUEUE (RCP-10 enforcement) ────────────────────────
CREATE TABLE IF NOT EXISTS settlement_queue (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        timestamptz DEFAULT now(),
  placement_id      uuid        NOT NULL REFERENCES placements(id) ON DELETE CASCADE,
  status            text        NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending','confirmed','lapsed','disputed','manual_review')),
  scheduled_at      timestamptz NOT NULL DEFAULT now() + interval '30 days',
  completed_at      timestamptz,
  sla_deadline      timestamptz NOT NULL DEFAULT now() + interval '30 days',
  sla_breached      boolean     DEFAULT false,
  notes             text,
  escalated_to      uuid        REFERENCES profiles(id)
);

ALTER TABLE settlement_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settlement_admin_only" ON settlement_queue USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','compliance','risk_officer'))
);
CREATE INDEX idx_settlement_status   ON settlement_queue(status, sla_deadline);
CREATE INDEX idx_settlement_sla      ON settlement_queue(sla_deadline) WHERE status = 'pending';

-- ── KYC DOCUMENTS (Agent 2: FICA requirement) ────────────────────
CREATE TABLE IF NOT EXISTS kyc_documents (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz DEFAULT now(),
  profile_id      uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  doc_type        text        NOT NULL
                              CHECK (doc_type IN ('sa_id','passport','drivers_licence','utility_bill',
                                                  'bank_statement','cipc_certificate','proof_of_address')),
  doc_url         text        NOT NULL,  -- Supabase Storage signed URL (compliance bucket)
  doc_hash        text,                 -- SHA-256 hash for tamper detection
  verified        boolean     DEFAULT false,
  provider        text,                 -- 'manual' | 'onfido' | 'jumio' | 'smile_identity'
  provider_ref    text,
  verified_at     timestamptz,
  verified_by     uuid        REFERENCES profiles(id),
  expiry_date     date,
  rejection_reason text,
  metadata        jsonb       DEFAULT '{}'
);

ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kyc_docs_owner_read"   ON kyc_documents FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "kyc_docs_owner_insert" ON kyc_documents FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "kyc_docs_admin_all"    ON kyc_documents FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','compliance'))
);
CREATE INDEX idx_kyc_docs_profile    ON kyc_documents(profile_id, doc_type);
CREATE INDEX idx_kyc_docs_unverified ON kyc_documents(verified, created_at) WHERE NOT verified;

-- ── AML ALERTS (Agent 2: FICA + FAIS when payments go live) ──────
CREATE TABLE IF NOT EXISTS aml_alerts (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz DEFAULT now(),
  profile_id      uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  alert_type      text        NOT NULL
                              CHECK (alert_type IN (
                                'HIGH_VALUE_DEPOSIT','VELOCITY_DEPOSIT','ROUND_TRIP_TRANSFER',
                                'STRUCTURING','SANCTIONS_HIT','PEP_MATCH','UNUSUAL_BEHAVIOUR',
                                'SOURCE_OF_FUNDS_MISSING','PAYMENT_FRAUD_INDICATOR'
                              )),
  amount          bigint,     -- amount in cents (nullable — not all alerts are transaction-based)
  currency        text        DEFAULT 'ZAR',
  pattern         jsonb       DEFAULT '{}',  -- structured signal data
  risk_score      integer     CHECK (risk_score BETWEEN 0 AND 100),
  status          text        NOT NULL DEFAULT 'open'
                              CHECK (status IN ('open','under_review','escalated','sar_filed','closed_no_action')),
  assigned_to     uuid        REFERENCES profiles(id),
  resolution      text,
  sar_id          uuid        REFERENCES sar_reports(id),
  closed_at       timestamptz
);

ALTER TABLE aml_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aml_alerts_compliance_only" ON aml_alerts USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','compliance','fraud_investigator'))
);
CREATE INDEX idx_aml_alerts_status   ON aml_alerts(status, created_at DESC);
CREATE INDEX idx_aml_alerts_profile  ON aml_alerts(profile_id, created_at DESC);

-- ── MARKET SURVEILLANCE LOG (Agent 1: market surveillance portal) ──
CREATE TABLE IF NOT EXISTS market_surveillance_log (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz DEFAULT now(),
  entity_id       uuid        NOT NULL,   -- opportunity_id or profile_id
  entity_type     text        NOT NULL    CHECK (entity_type IN ('opportunity','candidate','employer','application_batch')),
  pattern_type    text        NOT NULL
                              CHECK (pattern_type IN (
                                'FAKE_OPPORTUNITY','COORDINATED_APPLICATIONS','EMPLOYER_COLLUSION',
                                'BOT_BEHAVIOUR','INSIDER_LISTING','MARKET_MANIPULATION',
                                'OUTCOME_GAMING','REVIEW_MANIPULATION'
                              )),
  severity        text        NOT NULL    CHECK (severity IN ('low','medium','high','critical')),
  signal_data     jsonb       DEFAULT '{}',
  analyst_notes   text,
  status          text        NOT NULL    DEFAULT 'flagged'
                              CHECK (status IN ('flagged','investigating','confirmed','cleared')),
  assigned_to     uuid        REFERENCES profiles(id)
);

ALTER TABLE market_surveillance_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "surveillance_admin_only" ON market_surveillance_log USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','compliance','risk_officer','fraud_investigator'))
);
CREATE INDEX idx_surveillance_entity  ON market_surveillance_log(entity_id, entity_type);
CREATE INDEX idx_surveillance_status  ON market_surveillance_log(status, severity, created_at DESC);

-- ── B5 REMEDIATION: DATA RETENTION ENFORCEMENT ───────────────────
-- Tracks retention status per profile for POPIA enforcement
CREATE TABLE IF NOT EXISTS data_retention_log (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz DEFAULT now(),
  profile_id      uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  action          text        NOT NULL
                              CHECK (action IN (
                                'RETENTION_REVIEW','CV_ANONYMISED','PROFILE_ANONYMISED',
                                'AUDIT_LOG_ARCHIVED','MANUAL_DELETION','SCHEDULED_DELETION'
                              )),
  records_affected integer,
  triggered_by    text        DEFAULT 'cron',  -- 'cron' | 'admin' | 'user_request'
  metadata        jsonb       DEFAULT '{}'
);

ALTER TABLE data_retention_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "retention_admin_only" ON data_retention_log USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','compliance','auditor'))
);

-- ── B6 REMEDIATION: ALIGN RATE LIMIT EVENTS WITH RCPs ───────────
-- rate_limit_events already exists from 002 — add threshold config table
CREATE TABLE IF NOT EXISTS rate_limit_config (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint        text        UNIQUE NOT NULL,
  window_seconds  integer     NOT NULL,
  max_requests    integer     NOT NULL,
  block_threshold integer     NOT NULL,    -- requests triggering block
  suspend_threshold integer,               -- requests triggering auto-suspend (RCP-01)
  action_on_block text        NOT NULL     CHECK (action_on_block IN ('block','flag','throttle')),
  action_on_suspend text                   CHECK (action_on_suspend IN ('suspend','alert')),
  is_active       boolean     DEFAULT true,
  updated_at      timestamptz DEFAULT now()
);

-- Seed canonical rate limit configs (aligned to RCPs)
INSERT INTO rate_limit_config (endpoint, window_seconds, max_requests, block_threshold, suspend_threshold, action_on_block, action_on_suspend)
VALUES
  ('/api/applications/create',  3600,  20,  20,  50,   'block',    'suspend'),    -- RCP-01
  ('/api/cv/parse',             60,    5,   5,   20,   'block',    'alert'),
  ('/api/opportunities/create', 3600,  3,   3,   10,   'block',    'alert'),      -- RCP-02
  ('/api/auth/verify-phone',    3600,  5,   5,   15,   'block',    'alert'),
  ('/api/auth/confirm-otp',     3600,  5,   5,   10,   'block',    'suspend'),
  ('/api/employer-leads',       3600,  3,   3,   8,    'block',    'alert'),
  ('/api/match',                60,    30,  30,  100,  'throttle', null),
  ('/api/admin/risk',           60,    10,  10,  30,   'block',    'alert')
ON CONFLICT (endpoint) DO UPDATE
  SET max_requests = EXCLUDED.max_requests,
      block_threshold = EXCLUDED.block_threshold,
      suspend_threshold = EXCLUDED.suspend_threshold,
      updated_at = now();

-- ── EXTEND PROFILES: account status + KYC + 2FA fields ───────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS account_status     text        DEFAULT 'active'
                                              CHECK (account_status IN ('active','suspended','banned','pending_kyc','closed')),
  ADD COLUMN IF NOT EXISTS kyc_level          text        DEFAULT 'none'
                                              CHECK (kyc_level IN ('none','basic','standard','enhanced')),
  ADD COLUMN IF NOT EXISTS two_fa_enabled     boolean     DEFAULT false,
  ADD COLUMN IF NOT EXISTS two_fa_method      text        CHECK (two_fa_method IN ('totp','sms','email')),
  ADD COLUMN IF NOT EXISTS risk_level         text        DEFAULT 'low'
                                              CHECK (risk_level IN ('low','medium','high','critical')),
  ADD COLUMN IF NOT EXISTS sanctions_cleared  boolean     DEFAULT false,
  ADD COLUMN IF NOT EXISTS sanctions_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS pep_cleared        boolean     DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_active_at     timestamptz,
  ADD COLUMN IF NOT EXISTS deletion_scheduled_at timestamptz;

-- ── EXTEND APPLICATIONS: settlement tracking ─────────────────────
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS settlement_status  text        DEFAULT 'pending'
                                              CHECK (settlement_status IN ('pending','confirmed','lapsed','disputed')),
  ADD COLUMN IF NOT EXISTS settlement_due_at  timestamptz;

-- ── EXTEND OPPORTUNITIES: surveillance flags ──────────────────────
ALTER TABLE opportunities
  ADD COLUMN IF NOT EXISTS surveillance_flags text[]      DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS view_count         integer     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS apply_count        integer     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS suspicious         boolean     DEFAULT false,
  ADD COLUMN IF NOT EXISTS suspicious_reason  text;

-- ── PERFORMANCE INDEXES ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status, risk_level);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active    ON profiles(last_active_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_applications_settlement ON applications(settlement_status, settlement_due_at);
CREATE INDEX IF NOT EXISTS idx_opps_suspicious         ON opportunities(suspicious, created_at DESC) WHERE suspicious;

-- ── VIEWS: Compliance dashboards ──────────────────────────────────
CREATE OR REPLACE VIEW v_risk_dashboard AS
SELECT
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.account_status,
  p.risk_level,
  rs.score              AS risk_score,
  rs.flags              AS risk_flags,
  COUNT(ff.id)          AS open_fraud_flags,
  COUNT(d.id)           AS open_disputes,
  p.created_at
FROM profiles p
LEFT JOIN risk_scores rs ON rs.profile_id = p.id
LEFT JOIN fraud_flags ff ON ff.profile_id = p.id AND ff.status = 'open'
LEFT JOIN disputes d     ON d.applicant_id = p.id AND d.status IN ('submitted','under_review')
WHERE p.risk_level IN ('high','critical') OR p.account_status != 'active'
GROUP BY p.id, p.email, p.full_name, p.role, p.account_status, p.risk_level, rs.score, rs.flags, p.created_at;

CREATE OR REPLACE VIEW v_settlement_sla AS
SELECT
  sq.id,
  sq.placement_id,
  sq.status,
  sq.sla_deadline,
  sq.sla_breached,
  EXTRACT(EPOCH FROM (sq.sla_deadline - now())) / 86400 AS days_remaining,
  p_c.email  AS candidate_email,
  p_e.email  AS employer_email
FROM settlement_queue sq
JOIN placements pl ON pl.id = sq.placement_id
JOIN applications ap ON ap.id = pl.application_id
JOIN candidates ca   ON ca.id = ap.candidate_id
JOIN profiles p_c    ON p_c.id = ca.profile_id
JOIN employers em    ON em.id = ap.opportunity_id
JOIN profiles p_e    ON p_e.id = em.profile_id
WHERE sq.status = 'pending';

-- Mark migration complete
INSERT INTO audit_log (actor_id, actor_role, action, entity_type, entity_id, new_values)
VALUES (
  NULL,
  'system',
  'MIGRATION_003_APPLIED',
  'migrations',
  gen_random_uuid(),
  '{"migration": "003_five_agent_alignment", "tables_added": 6, "columns_added": 12, "views_added": 2}'::jsonb
);
