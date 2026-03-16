# HIRRD — DEVELOPER ONBOARDING GUIDE
## Phase 11 | For new engineers joining the project

---

## QUICK START (Web / PWA — 10 minutes)

```bash
# 1. Clone
git clone https://github.com/KMunjy/hirrd.git
cd hirrd

# 2. Install
cd apps/web && npm install

# 3. Environment (NEVER commit .env.local)
cp .env.example .env.local
# Fill in values from 1Password / Vault

# 4. Run
npm run dev
# → http://localhost:3000

# 5. Tests
npx vitest run  # unit tests
npx playwright test  # E2E (needs running dev server)
```

## ENVIRONMENT VARIABLES REQUIRED
See `.env.example` for the full list. Critical ones:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase dashboard
- `SUPABASE_SERVICE_ROLE_KEY` — ⚠️ NEVER expose publicly
- `ANTHROPIC_API_KEY` — for CV parsing
- `CRON_SECRET` — for D+3 re-engagement cron auth

## ARCHITECTURE DECISIONS LOG

| Decision | Why | Date |
|---------|-----|------|
| Next.js App Router over Pages Router | Server components, edge middleware, better DX | Sprint 1 |
| Supabase over Firebase | PostgreSQL (RLS), SA data residency option, POPIA-friendlier | Sprint 1 |
| Twilio for WhatsApp | SA GenZ comms standard, 96% penetration | Sprint 4 |
| Clickatell for SMS | SA-founded, best local coverage, works on feature phones | Sprint 4 |
| Rate limiting via Upstash | Edge-compatible, no cold start, Redis semantics | Sprint 4 |
| Photo upload feature-flagged OFF | POPIA s.26 — needs attorney review | Sprint 5 |
| Hybrid employer pricing | Per-listing for SMMEs, subscription for mid-market | Sprint 6 |
| PWA over native app (MVP) | Faster to market, shared codebase, no App Store lag | Sprint 7 |

## SECURITY RULES (MANDATORY)

1. **Never** store auth tokens in `localStorage` or `sessionStorage`
2. **Never** log user PII (name, email, phone, CV content) to console or Sentry
3. **Never** hardcode API keys — always `process.env.*`
4. **Never** skip auth checks on API routes — every route checks `getUser()`
5. Rate limiting **must** be on every public API endpoint
6. All DB access **must** go through Supabase client with RLS enabled
7. File uploads **must** validate type AND size before Supabase Storage call

## KEY ROUTES

| Route | Auth | Purpose |
|-------|------|---------|
| `GET /api/health` | Public | Infrastructure health check |
| `POST /api/cv/parse` | Required | AI CV parsing (Anthropic) |
| `POST /api/employer-leads` | Public | Employer registration |
| `POST /api/applications/create` | Required | Apply to job |
| `POST /api/account/delete` | Required + service role | POPIA erasure |
| `GET /api/cron/reengagement` | CRON_SECRET | D+3 WhatsApp cron |
| `POST /api/messaging/stop` | Twilio webhook | WhatsApp STOP handler |

## FEATURE FLAGS

Set in Vercel environment variables:

| Flag | Default | Controls |
|------|---------|---------|
| `NEXT_PUBLIC_PHOTO_ENABLED` | `false` | Passport photo upload (POPIA s.26 — needs legal review) |

## POPIA COMPLIANCE NOTES

- All consent captured at registration stored in `profiles.tos_accepted_at`
- WhatsApp opt-in stored in `candidates.whatsapp_opt_in` with timestamp
- Photo consent stored in `candidates.passport_photo_consent_at`
- Account deletion: `/api/account/delete` clears Storage + profiles + auth
- STOP handler: `/api/messaging/stop` immediately opts out, logs to `notification_log`
- Never store PII in Sentry error reports

## DEPLOYMENT

```bash
# Web (automatic via Vercel on push to main)
git push origin main

# Manual deploy
vercel --prod

# Check health
curl https://hirrd-web.vercel.app/api/health
```
