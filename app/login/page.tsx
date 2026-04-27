"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

function IconEye() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
  )
}

function IconEyeOff() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.274M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert("登録失敗: " + error.message)
      return
    }

    // 👇 強制的にこのメッセージにする
    alert("登録処理を実行しました。新規登録の場合はメールが飛ぶのでリンクをクリックし確定ください。既に登録済の場合は登録済パスワードを使ってログインください。")
  }

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert("ログイン失敗: " + error.message)
      return
    }

    alert("ログイン成功")
    router.push("/")
  }

  return (
    <div className="min-h-svh bg-rose-50 text-zinc-900">
      <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-4 py-10 sm:px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            フリマ出品支援アプリ
          </h1>
          <p className="mt-2 text-base text-zinc-600">
            画像とメモから出品文を生成・履歴管理
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            ログイン
          </h2>
          <p className="mt-2 text-base text-zinc-600">
            アカウントにログインするか、新規登録してください
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="mb-1 block text-base font-medium text-zinc-700"
              >
                メールアドレス
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="メール"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-base text-zinc-900 shadow-inner placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
              />
            </div>
            <div>
              <label
                htmlFor="login-password"
                className="mb-1 block text-base font-medium text-zinc-700"
              >
                パスワード
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="パスワード"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-3 pr-12 text-base text-zinc-900 shadow-inner placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                  aria-pressed={showPassword}
                  aria-label={
                    showPassword
                      ? "パスワードを隠す"
                      : "パスワードを表示する"
                  }
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={handleLogin}
              className="order-1 flex-1 rounded-lg bg-zinc-900 py-2.5 text-base font-medium text-white shadow transition hover:bg-zinc-800 sm:order-none"
            >
              ログイン
            </button>
            <button
              type="button"
              onClick={handleSignup}
              className="order-2 flex-1 rounded-lg border border-zinc-300 bg-white py-2.5 text-base font-medium text-zinc-800 transition hover:bg-zinc-50 sm:order-none"
            >
              新規登録
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
