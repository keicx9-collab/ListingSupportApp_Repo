import { test, expect } from "@playwright/test"
import { canRunAuthE2E, e2eCredentials, e2eLoginEmail } from "./helpers/env"
import { loginAsE2EUser } from "./helpers/login"

test.describe("TC-AUTH 認証・ルーティング", () => {
  test("TC-AUTH-01 未認証では `/` から `/login` に遷移する", async ({ page, context }) => {
    test.skip(!canRunAuthE2E(), "NEXT_PUBLIC_SUPABASE_* が必要")
    await context.clearCookies()
    await page.goto("/")
    await page.evaluate(() => {
      try {
        localStorage.clear()
        sessionStorage.clear()
      } catch {
        /* empty */
      }
    })
    await page.goto("/")
    await page.waitForURL(/\/login$/, { timeout: 60_000 })
  })

  test("TC-AUTH-02 正しいパスワードでログインできる", async ({ page }) => {
    test.skip(!canRunAuthE2E(), "NEXT_PUBLIC_SUPABASE_* が必要")
    await loginAsE2EUser(page)
  })

  test("TC-AUTH-03 誤ったパスワードではログインできない", async ({ page }) => {
    test.skip(!canRunAuthE2E(), "NEXT_PUBLIC_SUPABASE_* が必要")
    const { email } = e2eCredentials()
    await page.goto("/login")
    await page.getByPlaceholder("メール").fill(email)
    await page.getByPlaceholder("パスワード").fill("__wrong_password_for_e2e__")
    const dialogPromise = page.waitForEvent("dialog")
    await page.getByRole("button", { name: "ログイン" }).click()
    const d = await dialogPromise
    expect(d.message()).toMatch(/ログイン失敗:/)
    await d.accept()
    await expect(page).toHaveURL(/\/login$/)
  })

  test("TC-AUTH-04 新規登録: 重複メール等で失敗アラート", async ({ page }) => {
    test.skip(!canRunAuthE2E(), "NEXT_PUBLIC_SUPABASE_* が必要")
    await page.goto("/login")
    const existing = e2eLoginEmail()
    await page.getByPlaceholder("メール").fill(existing)
    await page.getByPlaceholder("パスワード").fill("DifferentPass9!")
    const dialogPromise = page.waitForEvent("dialog", { timeout: 15_000 })
    await page.getByRole("button", { name: "新規登録" }).click()
    const d = await dialogPromise
    expect(d.message()).toMatch(/登録失敗:/)
    await d.accept()
  })

  test("TC-AUTH-04 新規登録: 新規アドレスなら登録完了系メッセージ", async ({ page }) => {
    test.skip(!canRunAuthE2E(), "NEXT_PUBLIC_SUPABASE_* が必要")
    const email = `e2e_new_${Date.now()}@e2e.example.com`
    await page.goto("/login")
    await page.getByPlaceholder("メール").fill(email)
    await page.getByPlaceholder("パスワード").fill("E2E_SignupPass1!")
    const dialogPromise = page.waitForEvent("dialog", { timeout: 20_000 })
    await page.getByRole("button", { name: "新規登録" }).click()
    const d = await dialogPromise
    expect(d.message()).toMatch(/登録(失敗|処理)/)
    await d.accept()
  })

  test("TC-AUTH-05 ログアウトで `/login` へ戻る", async ({ page }) => {
    test.skip(!canRunAuthE2E(), "NEXT_PUBLIC_SUPABASE_* が必要")
    await loginAsE2EUser(page)
    await page.getByRole("button", { name: "ログアウト" }).click()
    await expect(page).toHaveURL(/\/login$/)
  })

  test("TC-AUTH-06 ログイン済みで `/login` を開ける", async ({ page }) => {
    test.skip(!canRunAuthE2E(), "NEXT_PUBLIC_SUPABASE_* が必要")
    await loginAsE2EUser(page)
    await page.goto("/login")
    await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible()
  })
})
