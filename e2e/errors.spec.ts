import { test, expect } from "@playwright/test"
import { canRunAuthE2E } from "./helpers/env"
import { loginAsE2EUser } from "./helpers/login"
import { installGenerateErrorMock } from "./helpers/routes"

test.describe("TC-ERR エラー UI", () => {
  test("TC-ERR-01 API が 500 のとき（成功用タイトルは出ない想定）", async ({ page }) => {
    test.skip(!canRunAuthE2E(), "NEXT_PUBLIC_SUPABASE_* が必要")
    await installGenerateErrorMock(page, 500, { error: "Internal Server Error" })
    await loginAsE2EUser(page)
    await page.getByRole("button", { name: "生成する" }).click()
    await expect(page.getByRole("button", { name: "生成する" })).toBeEnabled({
      timeout: 30000,
    })
    await expect(page.getByText("E2E_モック商品_A")).toHaveCount(0)
  })
})
