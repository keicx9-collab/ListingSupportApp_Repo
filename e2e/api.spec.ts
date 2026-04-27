import { test, expect } from "@playwright/test"

test.describe("TC-API /api/generate", () => {
  test("TC-API-03 GET はヘルスを返す", async ({ request }) => {
    const res = await request.get("/api/generate")
    expect(res.status()).toBe(200)
    expect(await res.text()).toContain("API is working")
  })

  test("TC-API-01 Authorization なしの POST は 401", async ({ request }) => {
    const res = await request.post("/api/generate", { data: {} })
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body).toMatchObject({ error: "Unauthorized" })
  })

  test("TC-API-02 不正な Bearer では 401", async ({ request }) => {
    const res = await request.post("/api/generate", {
      data: { inputText: "x" },
      headers: {
        Authorization: "Bearer invalid_token_for_e2e",
        "Content-Type": "application/json",
      },
    })
    expect(res.status()).toBe(401)
  })
})
