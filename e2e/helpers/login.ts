import { expect, type Page } from "@playwright/test"
import { e2eCredentials } from "./env"

/**
 * ログイン画面から E2E ユーザでログインし、ホーム (`/`) へ遷移する（alert も確実に処理する）
 */
export async function loginAsE2EUser(page: Page) {
  const { email, password } = e2eCredentials()
  if (!email || !password) throw new Error("E2E_USER_EMAIL / E2E_USER_PASSWORD が未設定です")

  await page.goto("/login")
  await page.getByPlaceholder("メール").fill(email)
  await page.getByPlaceholder("パスワード").fill(password)
  const dialogPromise = page.waitForEvent("dialog", { timeout: 90_000 })
  await page.getByRole("button", { name: "ログイン" }).click()
  const d = await dialogPromise
  const msg = d.message()
  d.accept()
  expect(msg).toContain("ログイン成功")
  await expect(
    page.getByRole("heading", { name: "フリマ出品支援アプリ" })
  ).toBeVisible({ timeout: 20000 })
}
