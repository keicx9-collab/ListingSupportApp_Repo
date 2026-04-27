import { test, expect } from "@playwright/test"
import { canRunAuthE2E, hasCleanupEnv } from "./helpers/env"
import { clearProductsByUserEmail } from "./helpers/cleanup"
import { loginAsE2EUser } from "./helpers/login"
import { mockProductA } from "./helpers/mocks"
import { installGenerateJsonMock } from "./helpers/routes"

test.describe("TC-HIST 履歴", () => {
  test.beforeEach(async () => {
    test.skip(!canRunAuthE2E(), "NEXT_PUBLIC_SUPABASE_* が必要")
    if (hasCleanupEnv()) {
      await clearProductsByUserEmail()
    }
  })

  test("TC-HIST-01 商品が0件のとき 履歴がありません", async ({ page }) => {
    test.skip(!hasCleanupEnv(), "空状態にするには SUPABASE_SERVICE_ROLE_KEY 等で事前削除が必要")
    await installGenerateJsonMock(page, { ...mockProductA })
    await loginAsE2EUser(page)
    await expect(page.getByText("履歴がありません")).toBeVisible()
  })

  test("TC-HIST-02 生成後に履歴へ反映される", async ({ page }) => {
    await installGenerateJsonMock(page, { ...mockProductA })
    await loginAsE2EUser(page)
    await page.getByRole("button", { name: "生成する" }).click()
    await expect(page.getByRole("heading", { name: "E2E_モック商品_A" })).toHaveCount(2, {
      timeout: 30000,
    })
    const row = page.locator("h3", { hasText: "E2E_モック商品_A" }).first()
    await expect(row).toBeVisible()
    // テキストのみ生成では商品画像URLが付かないため、履歴行に必ず img があるとは限らない
  })

  test("TC-HIST-03 履歴行に 編集・削除・コピー", async ({ page }) => {
    await installGenerateJsonMock(page, { ...mockProductA })
    await loginAsE2EUser(page)
    await page.getByRole("button", { name: "生成する" }).click()
    await expect(page.getByRole("heading", { name: "E2E_モック商品_A" })).toHaveCount(2, {
      timeout: 30000,
    })
    const row = page.locator("h3", { hasText: "E2E_モック商品_A" }).last().locator("xpath=..")
    await expect(row.getByRole("button", { name: "編集" })).toBeVisible()
    await expect(row.getByRole("button", { name: "削除" })).toBeVisible()
    await expect(row.getByRole("button", { name: "コピー" })).toBeVisible()
  })
})
