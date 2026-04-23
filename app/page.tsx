// そのまま差し替えで動く「圧縮＋5枚対応＋プレビュー付き」完成コード
// 画像最大5枚アップロード
// 自動圧縮（800px + 品質0.7）
// プレビュー表示
// API送信
// コピー機能
// Vision対応
// 認証機能対応
// 履歴保存・CRUD対応

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Product = {
  id?: string
  title: string
  description: string
  categories: string[]
  brands: string[]
  condition: string
  price: number
  hashtags: string[]
  images?: string[]
  user_id?: string
}

export default function Home() {
  const router = useRouter()

  const [inputText, setInputText] = useState("")
  const [result, setResult] = useState<Product | null>(null)
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  // 編集用
  const [editingItem, setEditingItem] = useState<Product | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editTags, setEditTags] = useState("")

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      const session = data.session

      if (!session) {
        router.push("/login")
        return
      }

      setUserId(session.user.id)
      fetchItems(session.user.id)
    }

    init()
  }, [])

  const fetchItems = async (uid: string) => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })

    setItems(data || [])
  }

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      const reader = new FileReader()

      reader.onload = (e) => {
        img.src = e.target?.result as string
      }

      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")!

        const maxWidth = 800
        const scale = maxWidth / img.width

        canvas.width = maxWidth
        canvas.height = img.height * scale

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        resolve(canvas.toDataURL("image/jpeg", 0.7))
      }

      reader.readAsDataURL(file)
    })
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const limited = Array.from(files).slice(0, 5)

    const compressed = await Promise.all(
      limited.map((file) => compressImage(file))
    )

    setImages(compressed)
  }

  const handleGenerate = async () => {
    setLoading(true)
    setResult(null)

    try {
      const { data } = await supabase.auth.getSession()
      const session = data.session
      if (!session) return

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ inputText, images }),
      })

      const dataRes = await res.json()
      setResult(dataRes)

      await supabase.from("products").insert([
        {
          user_id: session.user.id,
          ...dataRes,
          images,
        },
      ])

      fetchItems(session.user.id)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    await supabase.from("products").delete().eq("id", id)
    if (userId) fetchItems(userId)
  }

  const openEditModal = (item: Product) => {
    setEditingItem(item)
    setEditTitle(item.title)
    setEditDesc(item.description)
    setEditTags(item.hashtags?.join(" ") || "")
  }

  const handleSaveEdit = async () => {
    if (!editingItem) return

    await supabase
      .from("products")
      .update({
        title: editTitle,
        description: editDesc,
        hashtags: editTags.split(" "),
      })
      .eq("id", editingItem.id)

    setEditingItem(null)
    if (userId) fetchItems(userId)
  }

  // 🔥 履歴用コピー（追加）
  const handleCopyItem = async (item: Product) => {
    const text = `
${item.title}

${item.description}

${item.hashtags?.join(" ")}
`
    await navigator.clipboard.writeText(text)
    alert("コピーしました")
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>
      <h1>フリマ出品支援アプリ</h1>

      <button onClick={handleLogout}>ログアウト</button>

      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        style={{ width: "100%", height: 100 }}
      />

      <input type="file" multiple onChange={handleImageChange} />

      <div style={{ display: "flex", gap: 10 }}>
        {images.map((img, i) => (
          <img key={i} src={img} width={100} />
        ))}
      </div>

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "生成中..." : "生成する"}
      </button>

      {/* 🔥 生成結果（コピー削除済み） */}
      {result && (
        <div style={{ marginTop: 30 }}>
          <h2>{result.title}</h2>
          <p>{result.description}</p>

          <div>
            {result.hashtags?.map((tag, i) => (
              <span key={i}>{tag} </span>
            ))}
          </div>

          <p><b>カテゴリ:</b> {result.categories?.join(", ")}</p>
          <p><b>ブランド:</b> {result.brands?.join(", ")}</p>
          <p><b>価格:</b> {result.price}円</p>

        </div>
      )}

      <h2>履歴</h2>

      {items.length === 0 && <p>履歴がありません</p>}

      {items.map((item) => (
        <div key={item.id} style={{ border: "1px solid #ccc", marginTop: 10, padding: 10 }}>
          <h3>{item.title}</h3>
          <p>{item.description}</p>

          <div>
            {item.hashtags?.map((tag, i) => (
              <span key={i}>{tag} </span>
            ))}
          </div>

          <p><b>カテゴリ:</b> {item.categories?.join(", ")}</p>
          <p><b>ブランド:</b> {item.brands?.join(", ")}</p>
          <p><b>価格:</b> {item.price}円</p>

          <div style={{ display: "flex", gap: 5 }}>
            {item.images?.map((img, i) => (
              <img key={i} src={img} width={80} />
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => openEditModal(item)}>編集</button>
            <button onClick={() => handleDelete(item.id!)}>削除</button>
            <button onClick={() => handleCopyItem(item)}>コピー</button>
          </div>
        </div>
      ))}

      {/* モーダル */}
      {editingItem && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <div style={{ background: "#fff", padding: 20, borderRadius: 8, width: 500 }}>
            <h2>編集</h2>

            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={{ width: "100%", marginBottom: 10 }} />
            <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} style={{ width: "100%", height: 150, marginBottom: 10 }} />
            <input value={editTags} onChange={(e) => setEditTags(e.target.value)} style={{ width: "100%", marginBottom: 10 }} />

            <button onClick={handleSaveEdit}>保存</button>
            <button onClick={() => setEditingItem(null)}>キャンセル</button>
          </div>
        </div>
      )}
    </div>
  )
}
