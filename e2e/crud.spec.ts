import { test, expect } from "@playwright/test"
import { canRunAuthE2E, hasCleanupEnv } from "./helpers/env"
import { clearProductsByUserEmail } from "./helpers/cleanup"
import { loginAsE2EUser } from "./helpers/login"
import { mockProductA } from "./helpers/mocks"
import { installGenerateJsonMock } from "./helpers/routes"

const base = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000"

test.describe("TC-CRUD 履歴の編集・削除・コピー", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!canRunAuthE2E(), "NEXT_PUBLIC_SUPABASE_* が必要")
    if (hasCleanupEnv()) {
      await clearProductsByUserEmail()
    }
    await installGenerateJsonMock(page, { ...mockProductA })
    await loginAsE2EUser(page)
    await page.getByRole("button", { name: "生成する" }).click()
    await expect(page.getByRole("heading", { name: "E2E_モック商品_A" })).toHaveCount(2, {
      timeout: 30000,
    })
  })

  test("TC-CRUD-01 編集保存で反映される", async ({ page }) => {
    const row = page.locator("h3", { hasText: "E2E_モック商品_A" }).last()
    await row.locator("..").getByRole("button", { name: "編集" }).click()
    await expect(page.getByRole("heading", { name: "編集" })).toBeVisible()
    const box = page.getByRole("heading", { name: "編集" }).locator("..")
    await box.locator("> input").first().fill("E2E_編集後タイトル")
    await page.getByRole("button", { name: "保存" }).click()
    await expect(page.getByText("E2E_編集後タイトル").first()).toBeVisible()
  })

  test("TC-CRUD-02 タグをスペース区切りで保存", async ({ page }) => {
    const row = page.locator("h3", { hasText: "E2E_モック商品_A" }).last()
    await row.locator("..").getByRole("button", { name: "編集" }).click()
    const box = page.getByRole("heading", { name: "編集" }).locator("..")
    await box.locator("> input").nth(1).fill("foo bar baz")
    await page.getByRole("button", { name: "保存" }).click()
    await expect(page.getByText("foo")).toBeVisible()
    await expect(page.getByText("bar")).toBeVisible()
    await expect(page.getByText("baz")).toBeVisible()
  })

  test("TC-CRUD-03 キャンセルで変更されない", async ({ page }) => {
    const row = page.locator("h3", { hasText: "E2E_モック商品_A" }).last()
    await expect(row).toBeVisible()
    const before = (await row.textContent())?.trim() ?? ""
    await row.locator("..").getByRole("button", { name: "編集" }).click()
    const box = page.getByRole("heading", { name: "編集" }).locator("..")
    await box.locator("> input").first().fill("SHOULD_NOT_SAVE")
    await page.getByRole("button", { name: "キャンセル" }).click()
    const row2 = page.locator("h3", { hasText: "E2E_モック商品_A" }).last()
    await expect(row2).toHaveText(before)
  })

  test("TC-CRUD-04 削除で行が消える", async ({ page }) => {
    const row = page.locator("h3", { hasText: "E2E_モック商品_A" }).last()
    await row.locator("..").getByRole("button", { name: "削除" }).click()
    // 直近の生成結果 h2 には残るが、履歴の h3 だけが消える
    await expect(page.locator("h3", { hasText: "E2E_モック商品_A" })).toHaveCount(0, {
      timeout: 10000,
    })
  })

  test("TC-CRUD-05 コピーでアラートとクリップボード", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: new URL(base).origin,
    })
    const row = page.locator("h3", { hasText: "E2E_モック商品_A" }).last()
    const dlg = page.waitForEvent("dialog")
    await row.locator("..").getByRole("button", { name: "コピー" }).click()
    const d = await dlg
    expect(d.message()).toContain("コピーしました")
    await d.accept()
    const text = await page.evaluate(() => navigator.clipboard.readText())
    expect(text).toContain("E2E_モック商品_A")
  })
})
