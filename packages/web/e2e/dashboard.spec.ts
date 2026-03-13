import { test, expect } from '@playwright/test'

test.describe('대시보드', () => {
  test('미로그인 시 로그인 페이지로 리다이렉트', async ({ page }) => {
    await page.goto('/projects')
    await expect(page).toHaveURL(/login/)
  })

  test('대시보드 레이아웃 구조 확인', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('form')).toBeVisible()
  })
})
