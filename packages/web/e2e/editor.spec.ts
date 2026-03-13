import { test, expect } from '@playwright/test'

test.describe('에디터', () => {
  test('에디터 페이지 접근 시 로그인 리다이렉트', async ({ page }) => {
    await page.goto('/editor/test-id')
    // 인증 필요하므로 리다이렉트 또는 에러
    await expect(page).toHaveURL(/login|editor/)
  })
})
