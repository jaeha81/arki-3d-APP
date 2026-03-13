import { test, expect } from '@playwright/test'

test.describe('인증', () => {
  test('로그인 페이지 로드', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveTitle(/SpacePlanner/)
    await expect(
      page.getByRole('heading', { name: /로그인/i })
    ).toBeVisible()
    await expect(page.getByPlaceholder(/이메일/i)).toBeVisible()
    await expect(page.getByPlaceholder(/비밀번호/i)).toBeVisible()
  })

  test('빈 폼 제출 시 에러 표시', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /로그인/i }).click()
    // 폼 검증 메시지 확인
    await expect(page.getByText(/이메일/i)).toBeVisible()
  })

  test('회원가입 페이지 이동', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /회원가입/i }).click()
    await expect(page).toHaveURL(/register/)
  })
})
