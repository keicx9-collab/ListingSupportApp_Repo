import { expect, type ConsoleMessage, type Page, type Request, type Response } from "@playwright/test"
import { e2eCredentials } from "./env"

/** 1 テスト内の `waitForEvent('dialog')` より短く、playwright の test timeout より十分短く取る */
const DIALOG_TIMEOUT_MS = 100_000

/**
 * ログイン切り分け用: ブラウザコンソールの error/warning、失敗したリクエスト、Supabase の異常レスポンスを標準出力へ出す。
 */
function attachLoginDebug(page: Page): () => void {
  const onConsole = (msg: ConsoleMessage) => {
    const t = msg.type()
    if (t !== "error" && t !== "warning") return
    const text = msg.text()
    // Next.js dev の HMR WebSocket は Playwright 環境でよく失敗するだけで、認証切り分けに役立たない
    if (text.includes("webpack-hmr") || text.includes("_next/webpack-hmr")) return
    console.log(`[e2e-login][console.${t}] ${text}`)
  }
  const onRequestFailed = (req: Request) => {
    const f = req.failure()
    console.log(
      `[e2e-login][requestfailed] ${req.method()} ${req.url()} ${f?.errorText ?? ""}`
    )
  }
  const onResponse = async (resp: Response) => {
    const u = resp.url()
    if (!u.includes("supabase.co")) return
    if (resp.status() < 400) return
    let body = ""
    try {
      body = (await resp.text()).slice(0, 300)
    } catch {
      /* empty */
    }
    console.log(
      `[e2e-login][response] ${resp.status()} ${resp.request().method()} ${u} ${body}`
    )
  }
  page.on("console", onConsole)
  page.on("requestfailed", onRequestFailed)
  page.on("response", onResponse)
  return () => {
    page.off("console", onConsole)
    page.off("requestfailed", onRequestFailed)
    page.off("response", onResponse)
  }
}

/**
 * ログイン画面から E2E ユーザでログインし、ホーム (`/`) へ遷移する（alert も確実に処理する）
 */
export async function loginAsE2EUser(page: Page) {
  const { email, password } = e2eCredentials()
  if (!email || !password) throw new Error("E2E_USER_EMAIL / E2E_USER_PASSWORD が未設定です")

  const detach = attachLoginDebug(page)
  try {
    await page.goto("/login")
    await page.getByPlaceholder("メール").fill(email)
    await page.getByPlaceholder("パスワード").fill(password)
    const dialogPromise = page.waitForEvent("dialog", { timeout: DIALOG_TIMEOUT_MS })
    await page.getByRole("button", { name: "ログイン" }).click()
    const d = await dialogPromise
    const msg = d.message()
    d.accept()
    expect(msg).toContain("ログイン成功")
    await expect(
      page.getByRole("heading", { name: "フリマ出品支援アプリ" })
    ).toBeVisible({ timeout: 20_000 })
  } finally {
    detach()
  }
}
