/**
 * E2E は `.env.local` を playwright.config で dotenv 読込済みを前提とする。
 * `E2E_USER_*` 未指定時は README 掲載のデモ ID を用いる（Supabase に同一ユーザーが要る）
 */
const DEMO_EMAIL = "guest@listingsupportapp.jp"
const DEMO_PASSWORD = "password123"

export function e2eLoginEmail(): string {
  return process.env.E2E_USER_EMAIL || DEMO_EMAIL
}

export function e2eLoginPassword(): string {
  return process.env.E2E_USER_PASSWORD || DEMO_PASSWORD
}

/** ブラウザで Supabase セッションを張れるか（Anon 相当の公開設定） */
export function canRunAuthE2E(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export function hasCleanupEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export function e2eCredentials() {
  return {
    email: e2eLoginEmail(),
    password: e2eLoginPassword(),
  }
}
