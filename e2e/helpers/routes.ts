import type { Page } from "@playwright/test"
import { mockProductA } from "./mocks"

/**
 * `POST /api/generate` を JSON モックに差し替え（OpenAI 不要）
 */
export async function installGenerateJsonMock(
  page: Page,
  body: Record<string, unknown> = { ...mockProductA }
) {
  await page.route("**/api/generate", async (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({ status: 200, contentType: "text/plain", body: "API is working" })
    }
    if (route.request().method() === "POST") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(body),
      })
    }
    return route.continue()
  })
}

export async function installGenerateErrorMock(
  page: Page,
  status: number,
  body: Record<string, unknown>
) {
  await page.route("**/api/generate", async (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({ status: 200, contentType: "text/plain", body: "API is working" })
    }
    if (route.request().method() === "POST") {
      return route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(body),
      })
    }
    return route.continue()
  })
}
