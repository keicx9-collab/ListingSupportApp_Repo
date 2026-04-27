import { test, expect } from "@playwright/test"
import { canRunAuthE2E } from "./helpers/env"
import { loginAsE2EUser } from "./helpers/login"
import { mockProductA, mockProductB } from "./helpers/mocks"
import { installGenerateJsonMock } from "./helpers/routes"

test.describe("TC-GEN 生成", () => {
  test.beforeEach(() => {
    test.skip(!canRunAuthE2E(), "NEXT_PUBLIC_SUPABASE_* が .env.local に必要")
  })

  test("TC-GEN-01 補助テキストのみで商品情報が表示される", async ({ page }) => {
    await installGenerateJsonMock(page, { ...mockProductA })
    await loginAsE2EUser(page)
    await page.locator("textarea").first().fill("黒いスニーカー")
    await page.getByRole("button", { name: "生成する" }).click()
    await expect(page.getByRole("heading", { name: "E2E_モック商品_A" })).toBeVisible({
      timeout: 30000,
    })
    await expect(page.getByText("カテゴリ:")).toBeVisible()
    await expect(page.getByText("ブランド:")).toBeVisible()
    await expect(page.getByText(/価格:/)).toBeVisible()
  })

  test("TC-GEN-02 生成中はボタンが生成中...で無効", async ({ page }) => {
    await page.route("**/api/generate", async (route) => {
      if (route.request().method() === "GET") {
        return route.fulfill({ status: 200, contentType: "text/plain", body: "API is working" })
      }
      if (route.request().method() === "POST") {
        await new Promise((r) => setTimeout(r, 2500))
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockProductA),
        })
      }
      return route.continue()
    })
    await loginAsE2EUser(page)
    const btn = page.getByRole("button", { name: /生成する|生成中/ })
    await btn.click()
    await expect(page.getByRole("button", { name: "生成中..." })).toBeVisible()
    await expect(page.getByRole("button", { name: "生成中..." })).toBeDisabled()
    await expect(page.getByRole("heading", { name: "E2E_モック商品_A" })).toBeVisible({
      timeout: 20000,
    })
  })

  test("TC-GEN-03 再生成時に直前の結果表示が消える", async ({ page }) => {
    let n = 0
    await page.route("**/api/generate", async (route) => {
      if (route.request().method() === "GET") {
        return route.fulfill({ status: 200, contentType: "text/plain", body: "API is working" })
      }
      if (route.request().method() === "POST") {
        n += 1
        const body = n === 1 ? mockProductA : mockProductB
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(body),
        })
      }
      return route.continue()
    })
    await loginAsE2EUser(page)
    await page.getByRole("button", { name: "生成する" }).click()
    await expect(page.getByRole("heading", { name: "E2E_モック商品_A" })).toBeVisible({
      timeout: 30000,
    })
    const second = page.getByRole("button", { name: "生成する" })
    await second.click()
    await expect(
      page.getByRole("heading", { name: "E2E_モック商品_A" })
    ).toBeHidden({ timeout: 5000 })
    await expect(page.getByRole("heading", { name: "E2E_モック商品_B" })).toBeVisible({
      timeout: 30000,
    })
  })

  test("TC-GEN-04 画像付きで生成し履歴に反映される", async ({ page }) => {
    await installGenerateJsonMock(page, { ...mockProductA })
    await loginAsE2EUser(page)
    await page
      .locator('input[type="file"]')
      .setInputFiles([
        "e2e/fixtures/pixel.png",
        "e2e/fixtures/pixel.png",
      ])
    await expect(page.locator('img[width="100"]')).toHaveCount(2)
    await page.getByRole("button", { name: "生成する" }).click()
    await expect(page.getByRole("heading", { name: "E2E_モック商品_A" })).toBeVisible({
      timeout: 30000,
    })
    const hist = page.getByRole("heading", { name: "履歴" })
    await expect(hist).toBeVisible()
    await expect(page.getByRole("heading", { name: "E2E_モック商品_A" }).nth(1)).toBeVisible()
    await expect(page.locator('img[width="80"]').first()).toBeVisible()
  })
})
