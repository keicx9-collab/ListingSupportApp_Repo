import { createClient } from "@supabase/supabase-js"
import { e2eLoginEmail } from "./env"

/**
 * 指定メールのユーザーの `products` をすべて削除（TC-HIST-01 等用）
 */
export async function clearProductsByUserEmail(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const email = e2eLoginEmail()
  if (!url || !key) {
    throw new Error("clearProducts: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY が必要です")
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (error) throw error
  const u = data?.users.find((x) => x.email === email)
  if (!u) return

  const { error: delE } = await supabase.from("products").delete().eq("user_id", u.id)
  if (delE) throw delE
}
