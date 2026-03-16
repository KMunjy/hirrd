# HIRRD MOBILE — TESTING STRATEGY
## Phase 8 | All test layers

---

## PYRAMID

```
                    ┌─────────────────┐
                    │   E2E / UI      │  5% — Playwright (web), XCUITest (iOS), Espresso (Android)
                    ├─────────────────┤
                    │  Integration    │  25% — API contract tests, DB tests
                    ├─────────────────┤
                    │   Unit Tests    │  70% — Vitest (web), XCTest (iOS), JUnit (Android)
                    └─────────────────┘
```

## UNIT TESTS (38/38 passing — web)

Current coverage:
- auth-validation.test.ts — email/password validation
- employer-risk-flags.test.ts — SA CIPC/email risk computation
- route-smoke.test.ts — all 22 routes return non-500
- messaging.test.ts — SA phone normalisation, templates
- rate-limiting.test.ts — retry logic
- email-templates.test.ts — template rendering

## INTEGRATION TESTS TO ADD

```typescript
// apps/web/src/test/integration/cv-parse.test.ts
describe('CV parse end-to-end', () => {
  it('uploads PDF and returns parsed skills', async () => {
    // Upload to test bucket
    // Call /api/cv/parse
    // Assert: cv_status = 'parsed', skills.length > 0
    // Assert: response time < 30s
  })
  it('handles timeout gracefully — returns 408', async () => {})
  it('handles non-text PDF — returns 422', async () => {})
})

// apps/web/src/test/integration/auth-flow.test.ts
describe('Auth flow', () => {
  it('full registration → verify email → dashboard redirect', async () => {})
  it('phone OTP: SA number normalised to E.164', async () => {})
  it('expired JWT → token refresh → retry', async () => {})
  it('STOP reply → whatsapp_opt_in = false in DB', async () => {})
})
```

## E2E TESTS (Playwright)

```typescript
// Candidate journey
test('school-leaver builds profile in under 8 minutes', async ({ page }) => {
  await page.goto('/build-profile')
  await page.getByText('Grade 12 / Matric').click()
  await page.getByText('Mathematics').click()
  await page.getByText('Next →').click()
  // ... complete all 5 steps
  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByText(/matches/i)).toBeVisible()
})

// Verification badge
test('verified opportunity shows green badge', async ({ page }) => {
  await page.goto('/jobs')
  const badge = page.locator('[class*="badge"], text="✓ Verified"').first()
  await expect(badge).toBeVisible()
})

// Employer journey  
test('unverified employer cannot access post-job form', async ({ page, context }) => {
  // Login as unverified employer
  await page.goto('/employers/post-job')
  await expect(page.getByText('Verification required')).toBeVisible()
})
```

## MOBILE DEVICE TESTING MATRIX

| Device | OS | Form factor | Priority |
|--------|-----|-------------|----------|
| iPhone 15 Pro | iOS 17 | 393×852 | P0 |
| iPhone SE (3rd gen) | iOS 16 | 375×667 | P0 — small screen |
| Samsung Galaxy A54 | Android 13 | 393×873 | P0 — top SA Android |
| Redmi Note 12 | Android 12 | 393×786 | P0 — budget SA market |
| Samsung Galaxy S23 | Android 13 | 393×851 | P1 |
| iPad Air 5 | iPadOS 16 | 820×1180 | P2 |

## PERFORMANCE TARGETS (SA network conditions)

| Metric | Target | Test method |
|--------|--------|-------------|
| FCP (3G SA) | < 3.0s | Lighthouse with throttling |
| LCP | < 2.5s | Lighthouse |
| TTI | < 5.0s | Lighthouse |
| CV parse response | < 30s | Integration test |
| Match feed load | < 2.0s | Integration test |
| Bundle size | < 250kB gzipped | next build output |
| Service worker install | < 5s | Manual test |

## SECURITY TESTING

| Test | Tool | Trigger |
|------|------|---------|
| SAST (Swift) | SwiftLint + Semgrep | Every PR |
| SAST (Kotlin) | Detekt + Semgrep | Every PR |
| Dependency CVEs | npm audit + OWASP DC | Every PR (blocks on HIGH) |
| Secret detection | GitLeaks | Every commit |
| DAST | OWASP ZAP | Main branch only |
| APK analysis | apkleaks | Release builds |
| Jailbreak test | Manual on jailbroken device | Monthly |
| Cert pin test | mitmproxy | Pre-release |
