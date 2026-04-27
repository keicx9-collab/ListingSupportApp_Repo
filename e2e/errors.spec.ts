import { test, expect } from "@playwright/test"
import { canRunAuthE2E, hasCleanupEnv } from "./helpers/env"
import { clearProductsByUserEmail } from "./helpers/cleanup"
import { loginAsE2EUser } from "./helpers/login"
import { installGenerateErrorMock } from "./helpers/routes"

test.describe("TC-ERR エラー UI", () => {
  test.beforeEach(async () => {
    if (canRunAuthE2E() && hasCleanupEnv()) {
      await clearProductsByUserEmail()
    }
  })

  test("TC-ERR-01 API が 500 のとき（成功用タイトルは出ない想定）", async ({ page }) => {
    test.skip(!canRunAuthE2E(), "NEXT_PUBLIC_SUPABASE_* が必要")
    await installGenerateErrorMock(page, 500, { error: "Internal Server Error" })
    await loginAsE2EUser(page)
    await page.getByRole("button", { name: "生成する" }).click()
    await expect(page.getByRole("button", { name: "生成する" })).toBeEnabled({
      timeout: 30000,
    })
    // 直近の「生成結果」は h2。履歴の h3 とは別。500 本文では h2 タイトルにモック名は出ない
    await expect(
      page.locator("h2", { hasText: "E2E_モック商品_A" })
    ).toHaveCount(0)
  })
})
