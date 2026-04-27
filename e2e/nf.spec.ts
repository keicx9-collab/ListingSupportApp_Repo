import { test, expect } from "@playwright/test"
import { canRunAuthE2E } from "./helpers/env"
import { loginAsE2EUser } from "./helpers/login"
import { mockProductA } from "./helpers/mocks"

test.describe("TC-NF 非機能", () => {
  test("TC-NF-01 生成はタイムアウト前に完了する", async ({ page }, testInfo) => {
    test.skip(!canRunAuthE2E(), "NEXT_PUBLIC_SUPABASE_* が必要")
    // ログイン + 生成の余裕（グローバル 180s 内に収めるが、明示しておく）
    testInfo.setTimeout(180_000)
    await page.route("**/api/generate", async (route) => {
      if (route.request().method() === "GET") {
        return route.fulfill({ status: 200, contentType: "text/plain", body: "API is working" })
      }
      if (route.request().method() === "POST") {
        await new Promise((r) => setTimeout(r, 1500))
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockProductA),
        })
      }
      return route.continue()
    })
    const t0 = Date.now()
    await loginAsE2EUser(page)
    await page.getByRole("button", { name: "生成する" }).click()
    await expect(page.getByText("E2E_モック商品_A").first()).toBeVisible()
    const elapsed = Date.now() - t0
    expect(elapsed).toBeLessThan(50_000)
  })

  test("TC-NF-02 デスクトップ Chromium プロジェクトで実行", async ({ browserName }) => {
    expect(browserName).toBe("chromium")
  })
})
