"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const fieldClass =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/25 dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-500/20"

  const btnPrimary =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"

  const btnSecondary =
    "inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-700/80"

  // 🔥 新規登録（改善版）
  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    console.log("signup data:", data)
    console.log("signup error:", error)

    if (error) {
      alert("登録失敗: " + error.message)
      return
    }

    // 👇 強制的にこのメッセージにする
    alert("登録処理を実行しました。新規登録の場合はメールが飛ぶのでリンクをクリックし確定ください。既に登録済の場合は登録済パスワードを使ってログインください。")
  }

  // 🔥 ログイン
  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log("login data:", data)
    console.log("login error:", error)

    if (error) {
      alert("ログイン失敗: " + error.message)
      return
    }

    alert("ログイン成功")
    router.push("/") // トップへ
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-rose-100/50 to-zinc-50 px-4 py-10 dark:from-zinc-950 dark:via-rose-950/[0.28] dark:to-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          ログイン
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          メールアドレスとパスワードでサインイン
        </p>

        <div className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              メール
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="メール"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className={fieldClass}
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              パスワード
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={handleLogin} className={`${btnPrimary} w-full sm:w-auto`}>
            ログイン
          </button>
          <button type="button" onClick={handleSignup} className={`${btnSecondary} w-full sm:w-auto`}>
            新規登録
          </button>
        </div>
      </div>
    </div>
  )
}
