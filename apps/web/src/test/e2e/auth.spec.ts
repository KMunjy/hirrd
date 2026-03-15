import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('TC-012 Sign in nav button navigates to login', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Sign in' }).first().click()
    await expect(page).toHaveURL(/auth\/login/)
    await expect(page.getByText('Welcome back')).toBeVisible()
  })

  test('TC-013 Get hirrd button navigates to register', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /get hirrd/i }).first().click()
    await expect(page).toHaveURL(/auth\/register/)
  })

  test('TC-014 Register form has correct fields and autocomplete', async ({ page }) => {
    await page.goto('/auth/register')
    await expect(page.locator('input#reg-name')).toHaveAttribute('autocomplete', 'name')
    await expect(page.locator('input#reg-email')).toHaveAttribute('autocomplete', 'email')
    await expect(page.locator('input#reg-password')).toHaveAttribute('autocomplete', 'new-password')
  })

  test('TC-016 Register form blocks submit without ToS', async ({ page }) => {
    await page.goto('/auth/register')
    await page.fill('input#reg-name', 'Test User')
    await page.fill('input#reg-email', 'test@example.com')
    await page.fill('input#reg-password', 'Password123!')
    const submitBtn = page.getByRole('button', { name: /create account/i })
    await expect(submitBtn).toBeDisabled()
  })

  test('TC-017 Role toggle works', async ({ page }) => {
    await page.goto('/auth/register')
    await page.getByRole('button', { name: /employer/i }).click()
    const employerBtn = page.getByRole('button', { name: /employer/i })
    await expect(employerBtn).toHaveCSS('color', /7c58e8|124, 88, 232/)
  })

  test('TC-022 Protected route redirects to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/auth\/login/)
    await expect(page.url()).toContain('redirect')
  })

  test('TC-023 Forgot password link works', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByRole('link', { name: /forgot password/i }).click()
    await expect(page).toHaveURL(/auth\/forgot-password/)
    await expect(page.getByText('Reset your password')).toBeVisible()
  })

  test('TC-AUTH-CHAOS-001 Auth callback with no code redirects cleanly', async ({ page }) => {
    await page.goto('/auth/callback')
    await expect(page).toHaveURL(/auth\/login/)
    // HIRRD-003: error message should be visible
    await expect(page.getByRole('alert')).toBeVisible()
  })

  test('TC-LOGIN-007 Login inputs have correct autocomplete', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.locator('input#login-email')).toHaveAttribute('autocomplete', 'email')
    await expect(page.locator('input#login-password')).toHaveAttribute('autocomplete', 'current-password')
  })
})
