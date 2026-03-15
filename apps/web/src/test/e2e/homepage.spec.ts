import { test, expect } from '@playwright/test'

test.describe('Homepage — smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('TC-001 loads with correct title and hero', async ({ page }) => {
    await expect(page).toHaveTitle('Hirrd — Career Intelligence')
    await expect(page.getByText('The platform built to')).toBeVisible()
    await expect(page.getByText('change careers')).toBeVisible()
  })

  test('TC-002 Upload CV CTA navigates to register', async ({ page }) => {
    await page.getByRole('button', { name: /upload cv/i }).first().click()
    await expect(page).toHaveURL(/auth\/register/)
  })

  test('TC-003 Post a job CTA navigates to employers', async ({ page }) => {
    await page.getByRole('button', { name: /post a job/i }).first().click()
    await expect(page).toHaveURL(/employers|auth\/register/)
  })

  test('TC-004 feed filter pills work', async ({ page }) => {
    const jobPill = page.getByRole('button', { name: 'Job' }).first()
    await jobPill.click()
    await expect(jobPill).toHaveCSS('background-color', /7c58e8|124, 88, 232/)
  })

  test('TC-008 live ticker is visible', async ({ page }) => {
    const ticker = page.locator('[style*="overflow"]').first()
    await expect(ticker).toBeVisible()
  })
})

test.describe('Navigation — all links branded', () => {
  const navLinks = [
    { href: '/jobs', title: 'Jobs — Hirrd' },
    { href: '/learnerships', title: 'Learnerships — Hirrd' },
    { href: '/courses', title: 'Courses — Hirrd' },
    { href: '/employers', expectedText: 'Post jobs on Hirrd' },
    { href: '/auth/login', expectedText: 'Welcome back' },
    { href: '/auth/register', expectedText: 'Get hirrd today' },
  ]

  for (const { href, title, expectedText } of navLinks) {
    test(`TC-NAV ${href} renders branded page`, async ({ page }) => {
      await page.goto(href)
      if (title) await expect(page).toHaveTitle(new RegExp(title.replace(' — Hirrd', '')))
      if (expectedText) await expect(page.getByText(expectedText)).toBeVisible()
      // No raw 404 text visible
      await expect(page.getByText('This page could not be found')).not.toBeVisible()
    })
  }

  test('Custom 404 is branded', async ({ page }) => {
    await page.goto('/this-does-not-exist')
    await expect(page.getByText('Page not found')).toBeVisible()
    await expect(page.getByRole('link', { name: /back to hirrd/i })).toBeVisible()
    await expect(page.getByText('This page could not be found')).not.toBeVisible()
  })

  test('Logo click returns to homepage', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByRole('link', { name: /hirrd/i }).first().click()
    await expect(page).toHaveURL('/')
  })
})

test.describe('Mobile nav', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('hamburger visible at 375px', async ({ page }) => {
    await page.goto('/')
    const hamburger = page.getByRole('button', { name: /open navigation menu/i })
    await expect(hamburger).toBeVisible()
  })

  test('desktop nav links hidden at 375px', async ({ page }) => {
    await page.goto('/')
    const jobsLink = page.getByRole('link', { name: 'Jobs' }).first()
    // Should be hidden in desktop nav (CSS class hirrd-nav-desktop hides it)
    await expect(jobsLink).not.toBeVisible()
  })

  test('mobile drawer opens and shows nav links', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /open navigation menu/i }).click()
    await expect(page.getByRole('dialog', { name: 'Navigation menu' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Jobs' })).toBeVisible()
  })

  test('mobile drawer closes on outside click', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /open navigation menu/i }).click()
    await expect(page.getByRole('dialog', { name: 'Navigation menu' })).toBeVisible()
    await page.mouse.click(50, 400)
    await expect(page.getByRole('dialog', { name: 'Navigation menu' })).not.toBeVisible()
  })
})


test.describe('Accessibility — aria labels', () => {
  test('Testimonial dot buttons have aria-labels', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Scroll to testimonial section
    const dots = page.locator('button[aria-label*="testimonial"]')
    const count = await dots.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })

  test('Skip link is present', async ({ page }) => {
    await page.goto('/')
    const skipLink = page.locator('.skip-link, a[href="#main-content"]')
    await expect(skipLink).toHaveCount(1)
  })
})
