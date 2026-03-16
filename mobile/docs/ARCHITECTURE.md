# HIRRD MOBILE — SYSTEM ARCHITECTURE
## Version 1.0 | SA MVP | Production-Grade

---

## PHASE 1 — PRODUCT DISCOVERY ANSWERS

**App purpose:** Career intelligence platform for South African youth (GenZ) — job/learnership
matching, CV parsing, WhatsApp-first notifications, SETA-verified employer trust signals.

**Target users:**
- Primary: SA candidates age 17–35 (GenZ), 40% school leavers with no CV
- Secondary: SA employers (verified CIPC companies)
- Tertiary: SETA-accredited institutions

**Core features:**
- Candidate: register, build profile (CV upload OR school-leaver flow), AI match feed, apply, WhatsApp alerts
- Employer: register interest, view vetting status, post jobs (verified only)
- Admin: employer vetting queue, approve/reject/limit

**Data collected:** Name, email, phone (SA mobile), CV content (parsed), skills, work history,
location (province/city), passport photo (POPIA s.26 — feature-flagged), employer details

**Authentication:** Supabase Auth (email/password + Google OAuth) + phone OTP (Twilio SMS)

**Third-party integrations:** Supabase (DB + Auth + Storage), Anthropic (CV AI parse),
Twilio (SMS/WhatsApp), Clickatell (SMS fallback), Resend (email), Upstash (rate limiting), Sentry

**Payment:** Future — employer Pro subscription (R1,800/mo). Not in MVP.

**Offline functionality:** Match feed cached locally. CV stored on-device. Read-only offline.

**Geographic regions:** South Africa only. POPIA applies (not GDPR).

---

## PHASE 2 — SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         HIRRD MOBILE ARCHITECTURE                        │
├──────────────────────┬──────────────────────┬───────────────────────────┤
│    iOS (Swift)       │   Android (Kotlin)   │     React Native (Web)    │
│    SwiftUI + UIKit   │   Jetpack Compose    │   (PWA — existing web)    │
│    iOS 16+           │   Android 8+         │   Next.js 14 on Vercel    │
├──────────────────────┴──────────────────────┴───────────────────────────┤
│                        API GATEWAY LAYER                                  │
│    Next.js API Routes (Edge) — rate limited, auth-guarded, CSP          │
├─────────────────────────────────────────────────────────────────────────┤
│                        BACKEND SERVICES                                   │
│  ┌───────────────┐ ┌────────────────┐ ┌─────────────────┐              │
│  │ Supabase DB   │ │ Supabase Auth  │ │ Supabase Storage│              │
│  │ PostgreSQL    │ │ JWT + OAuth2   │ │ cvs bucket      │              │
│  │ RLS enforced  │ │ Refresh tokens │ │ photos bucket   │              │
│  └───────────────┘ └────────────────┘ └─────────────────┘              │
├─────────────────────────────────────────────────────────────────────────┤
│                        THIRD-PARTY SERVICES                               │
│  Anthropic (AI) │ Twilio (WA/SMS) │ Resend (Email) │ Upstash (Cache)  │
│  Clickatell     │ Sentry (Errors) │ Vercel (Host)  │ GitHub (CI/CD)   │
└─────────────────────────────────────────────────────────────────────────┘
```

## MOBILE STRATEGY: Progressive Enhancement

For SA MVP, the recommended approach is:

1. **PWA (Progressive Web App)** — EXISTS (hirrd-web.vercel.app)
   - Installable on Android home screen
   - Works in Safari on iOS (limited PWA support)
   - No App Store needed for MVP launch
   - Shares all existing code

2. **React Native (expo)** — PHASE 2 (post-MVP)
   - Single codebase for iOS + Android
   - Access to native APIs (biometrics, Keychain, push notifications)
   - Required for App Store + Play Store submission
   - Reuses all existing API contracts

3. **Swift (iOS)** + **Kotlin (Android)** — PHASE 3 (enterprise tier)
   - CyberArk PAM integration requirement
   - SETA reporting native tools
   - Certificate pinning (required for bank-grade security)

**Decision for today:** Build the PWA shell + React Native architecture.
Native Swift/Kotlin templates generated for compliance documentation.

---

## DATA FLOW DIAGRAM

```
Candidate Opens App
        │
        ▼
┌────────────────┐
│  Auth Check    │ ─── Token expired? ──► Refresh via Supabase
│  (JWT local)   │ ─── Not logged in? ──► /auth/login
└───────┬────────┘
        │ Valid session
        ▼
┌────────────────┐    ┌─────────────────────┐
│ Dashboard load  │───►│ GET /api/match       │
│ (cache first)   │    │ Returns opportunities│
└───────┬────────┘    │ ranked by AI score   │
        │              └─────────────────────┘
        ▼
┌────────────────┐    ┌─────────────────────┐
│ CV Upload      │───►│ POST /api/cv/parse   │
│ (local file)   │    │ Anthropic claude-    │
│                │    │ sonnet-4-6 (28s max) │
└───────┬────────┘    └─────────────────────┘
        │
        ▼
┌────────────────┐    ┌─────────────────────┐
│ Apply to job   │───►│ POST /api/           │
│                │    │ applications/create  │
└───────┬────────┘    └─────────────────────┘
        │
        ▼
┌────────────────┐    ┌─────────────────────┐
│ WhatsApp alert │◄───│ D+3 cron triggers    │
│ (A/B/C variant)│    │ sendNotification()   │
└────────────────┘    └─────────────────────┘
```

---

## MOBILE SECURITY MODEL

```
Device Layer          App Layer             Network Layer
─────────────         ─────────────         ─────────────
Biometric auth   ──►  JWT storage      ──►  TLS 1.3 only
(FaceID/Touch)        (Keychain/       
                       Keystore)             Certificate
Jailbreak/root        
detection        ──►  Token refresh    ──►  pinning
                                            (api.hirrd.com
Secure enclave        Session timeout       + supabase)
(iOS T2)         ──►  (30 min idle)    ──►  
                                            API rate
App transport         Secrets never         limiting
security         ──►  in logs          ──►  (Upstash)
```
