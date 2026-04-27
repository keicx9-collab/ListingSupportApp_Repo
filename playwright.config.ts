import { defineConfig, devices } from "@playwright/test"
import { config } from "dotenv"
import { resolve } from "path"

// `.env.local` から E2E_USER_* / Supabase 等を読み込み（重複は既存 process.env 優先）
config({ path: resolve(__dirname, ".env.local") })

// localhost と 127.0.0.1 は別オリジン。Supabase Auth / cookie は多くの環境で localhost 前提のため既定は localhost。
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000"

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Supabase 履歴等は同一ユーザで干渉しやすいので直列
  workers: 1,
  // `e2e/helpers/login.ts` の dialog 待ち（最大 100s）より長く取る（旧 60s だと dialog より先にテスト全体が打ち切られる）
  timeout: 180_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "pipe",
  },
})
