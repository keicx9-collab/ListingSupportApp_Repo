import { test, expect } from "@playwright/test"
import { canRunAuthE2E } from "./helpers/env"
import { loginAsE2EUser } from "./helpers/login"
import { mockProductA } from "./helpers/mocks"
import { installGenerateJsonMock } from "./helpers/routes"

const pixel = "e2e/fixtures/pixel.png"

test.describe("TC-IMG 画像", () => {
  test.beforeEach(() => {
    test.skip(!canRunAuthE2E(), "NEXT_PUBLIC_SUPABASE_* が必要")
  })

  test("TC-IMG-01 プレビュー（幅100px）が並ぶ", async ({ page }) => {
    await installGenerateJsonMock(page, { ...mockProductA })
    await loginAsE2EUser(page)
    await page.locator('input[type="file"]').setInputFiles(pixel)
    await expect(page.locator('img[width="100"]')).toHaveCount(1)
  })

  test("TC-IMG-02 6枚選んでも5枚までに制限", async ({ page }) => {
    await installGenerateJsonMock(page, { ...mockProductA })
    await loginAsE2EUser(page)
    const six = [pixel, pixel, pixel, pixel, pixel, pixel] as [string, string, string, string, string, string]
    await page.locator('input[type="file"]').setInputFiles(six)
    await expect(page.locator('img[width="100"]')).toHaveCount(5)
  })

  test("TC-IMG-03 リクエスト body に data: JPEG 画像が含まれる", async ({ page }) => {
    await installGenerateJsonMock(page, { ...mockProductA })
    await loginAsE2EUser(page)
    await page.locator('input[type="file"]').setInputFiles(pixel)
    const waitReq = page.waitForRequest(
      (r) => r.method() === "POST" && r.url().includes("/api/generate")
    )
    await page.getByRole("button", { name: "生成する" }).click()
    const req = await waitReq
    const postData = req.postData()
    expect(postData).toBeTruthy()
    const body = JSON.parse(postData!) as { images?: string[] }
    const images = body.images
    expect(Array.isArray(images)).toBeTruthy()
    expect(images!.length).toBeGreaterThanOrEqual(1)
    expect(images![0].startsWith("data:image/jpeg")).toBe(true)
  })
})
