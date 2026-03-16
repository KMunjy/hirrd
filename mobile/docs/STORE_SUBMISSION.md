# HIRRD — APP STORE SUBMISSION CHECKLIST
## Phase 9 | Apple App Store + Google Play

---

## APPLE APP STORE

### App Information
| Field | Value |
|-------|-------|
| App Name | Hirrd — Career Intelligence |
| Subtitle | SA Jobs, Learnerships & Bursaries |
| Bundle ID | com.hirrd.app |
| SKU | HIRRD-SA-001 |
| Primary Category | Business |
| Secondary Category | Education |
| Age Rating | 4+ |
| Content Rights | No third-party content |
| Pricing | Free (employer subscriptions in-app — IAP in Phase 3) |

### App Description (4000 chars max)
```
Get hirrd. South Africa's AI-powered career intelligence platform.

Upload your CV once and Hirrd matches you to the right SA jobs, 
learnerships, bursaries and internships — automatically.

No CV? No problem. Answer 5 quick questions and Hirrd builds your 
profile in minutes. Perfect for Grade 12 learners and first-time 
job seekers.

WHAT HIRRD DOES
• AI matches your CV to verified SA employers
• Shows exactly why you're a match (skills you have vs gaps)
• Sends WhatsApp + SMS job alerts — the way SA communicates
• Filters scam listings — only verified SETA and employer-verified opportunities
• Covers jobs, learnerships, internships, and bursaries

WHY HIRRD IS DIFFERENT
• 77% of users opt in for WhatsApp alerts (not email)
• Verification badges — every employer is CIPC-verified before listing
• School-leaver flow — no CV needed, 5-minute profile setup
• POPIA compliant — your data is always under your control
• Free to candidates — always

FOR EMPLOYERS
• Post opportunities in minutes
• AI-matched candidate recommendations
• WhatsApp notifications to shortlisted candidates
• SETA learnership tracking tools
• POPIA-compliant candidate data handling

South Africa only. Built for SA.
```

### Keywords (100 chars)
`jobs,learnerships,bursaries,SA,south africa,career,internship,SETA,employment,CV,resume`

### Support URL
`https://hirrd-web.vercel.app/support`

### Privacy Policy URL
`https://hirrd-web.vercel.app/privacy`

### Review Notes for Apple
```
TEST ACCOUNT:
Email: apple-review@hirrd-test.com
Password: AppleReview2026!

This is a South African career platform. The app requires a 
South African mobile number for phone verification features.
For testing, the phone verification step can be skipped — 
press "Skip for now" on the phone verification screen.

LEARNERSHIP LISTINGS: These are South African training programmes
funded by the Skills Education Training Authorities (SETA).
They are similar to paid apprenticeships — not scams.

NO IN-APP PURCHASES in this version. Employer subscriptions
are handled via external billing (email to employers@hirrd.com).
This complies with App Store guideline 3.1.3(a).
```

### Screenshot Requirements
| Device | Required sizes |
|--------|----------------|
| iPhone 15 Pro Max | 1290 × 2796 |
| iPhone 8 Plus | 1242 × 2208 |
| iPad Pro 12.9 (6th gen) | 2048 × 2732 |

Screenshots needed (6 per device):
1. Home — hero with "AI-powered · South Africa · Early Access" badge
2. Dashboard — job matches with verification badges and match %
3. Build Profile — school-leaver 5-step flow (step 2: subjects)
4. Jobs — search + filter with "Verified employer" badges
5. Match Explanation — "Why 82% match?" expanded with skills breakdown
6. Profile — skills edit + CV strength score

---

## GOOGLE PLAY STORE

### Store Listing
| Field | Value |
|-------|-------|
| App Name | Hirrd — SA Career Intelligence |
| Short Description (80 chars) | AI job matching for South Africa. WhatsApp alerts. Free. |
| Bundle/Package ID | com.hirrd.app |
| Category | Business |
| Tags | jobs, careers, learnerships, south africa, employment |
| Content Rating | Everyone |
| Target audience | 17+ |
| App availability | South Africa only |

### Permission Rationale
| Permission | Justification |
|------------|---------------|
| INTERNET | Required — all app features need network |
| POST_NOTIFICATIONS | Optional — WhatsApp backup for job alerts |
| CAMERA | Optional — passport photo for profile (POPIA s.26 consent required) |
| READ_EXTERNAL_STORAGE | Optional — CV document upload |
| USE_BIOMETRIC | Optional — biometric lock for account security |

### Data Safety Section
- All data encrypted in transit (TLS 1.3)
- All data encrypted at rest (AES-256, Supabase)
- Users can delete all data at any time (POPIA s.24)
- No advertising networks used
- No data sold to third parties

### Internal Test Track Setup
1. Create release in Play Console → Internal testing
2. Upload signed APK/AAB
3. Add test accounts: google-review@hirrd-test.com
4. Distribute to QA team for 7 days before promoting to closed testing

---

## PRE-SUBMISSION CHECKLIST

### Technical
- [ ] App crashes fixed (0 crashes on TestFlight for 7 days)
- [ ] All deep links tested (hirrd://dashboard, hirrd://jobs)
- [ ] Dark mode UI verified on both platforms
- [ ] Accessibility (VoiceOver iOS, TalkBack Android) working
- [ ] Offline mode tested (airplane mode — loads cached feed)
- [ ] Back gesture working throughout app
- [ ] Keyboard dismissal working on all forms
- [ ] All permissions requested at point of use (not at launch)

### Legal
- [ ] Privacy Policy URL live
- [ ] Terms of Service URL live
- [ ] POPIA statement on registration form
- [ ] Photo consent attorney-reviewed before enabling
- [ ] Information Regulator SA registration completed
- [ ] PAIA manual published

### Content
- [ ] No placeholder content ("Lorem Ipsum", "Test user")
- [ ] All screenshots taken on real devices (not simulators)
- [ ] App description reviewed for policy compliance
- [ ] No mention of competitor apps
- [ ] SA-only disclaimer visible

### Security
- [ ] Certificate pins updated with production certs
- [ ] Debug logging disabled in release builds
- [ ] API keys removed from source code
- [ ] ProGuard/R8 enabled on Android (code obfuscation)
- [ ] App Transport Security (iOS) set to HTTPS only
