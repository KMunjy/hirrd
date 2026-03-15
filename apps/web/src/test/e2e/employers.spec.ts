import { test, expect } from '@playwright/test'

test.describe('Employer registration', () => {
  test('Employers page loads with registration form', async ({ page }) => {
    await page.goto('/employers')
    await expect(page.getByText('Post jobs on Hirrd')).toBeVisible()
    await expect(page.getByText('We verify every employer')).toBeVisible()
  })

  test('Employer form has CIPC field', async ({ page }) => {
    await page.goto('/employers')
    await expect(page.getByPlaceholder(/2020\/123456\/07/)).toBeVisible()
  })

  test('Employer form has POPIA notice', async ({ page }) => {
    await page.goto('/employers')
    await expect(page.getByText(/POPIA/)).toBeVisible()
    await expect(page.getByRole('link', { name: /privacy policy/i })).toBeVisible()
  })

  test('Employer submit disabled without ToS', async ({ page }) => {
    await page.goto('/employers')
    const submitBtn = page.getByRole('button', { name: /register interest/i })
    await expect(submitBtn).toBeDisabled()
  })

  test('Employer form has separate marketing consent', async ({ page }) => {
    await page.goto('/employers')
    await expect(page.locator('#emp-tos')).not.toBeChecked()
    await expect(page.locator('#emp-mkt')).not.toBeChecked()
  })
})
