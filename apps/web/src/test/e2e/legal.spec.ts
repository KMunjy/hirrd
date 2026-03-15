import { test, expect } from '@playwright/test'

test.describe('Legal pages', () => {
  test('Privacy policy page exists and loads', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page).toHaveTitle(/Privacy Policy/)
    await expect(page.getByText('POPIA')).toBeVisible()
    await expect(page.getByRole('link', { name: /back to hirrd/i })).toBeVisible()
  })

  test('Terms of service page exists and loads', async ({ page }) => {
    await page.goto('/terms')
    await expect(page).toHaveTitle(/Terms of Service/)
    await expect(page.getByText('South African law')).toBeVisible()
    await expect(page.getByRole('link', { name: /back to hirrd/i })).toBeVisible()
  })

  test('Terms linked from register page', async ({ page }) => {
    await page.goto('/auth/register')
    await expect(page.getByRole('link', { name: /terms of service/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /privacy policy/i })).toBeVisible()
  })

  test('Privacy linked from employers page', async ({ page }) => {
    await page.goto('/employers')
    await expect(page.getByRole('link', { name: /privacy policy/i })).toBeVisible()
  })
})
