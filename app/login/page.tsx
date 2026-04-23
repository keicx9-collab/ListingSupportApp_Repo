"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

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
    alert("登録処理を実行しました。ログインしてください（パスワードは既登録済の可能性もあるので注意ください）")
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
    <div style={{ padding: 40 }}>
      <h1>ログイン</h1>

      <input
        type="email"
        placeholder="メール"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />

      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />

      <button onClick={handleLogin} style={{ marginRight: 10 }}>
        ログイン
      </button>

      <button onClick={handleSignup}>
        新規登録
      </button>
    </div>
  )
}
