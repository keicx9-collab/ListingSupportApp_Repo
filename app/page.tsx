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

  const fetchItems = async (uid: string) => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })

    setItems(data || [])
  }

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

  const fieldClass =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/25 dark:border-zinc-600 dark:bg-zinc-900/80 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-500/20"

  const btnPrimary =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-55 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"

  const btnSecondary =
    "inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-700/80"

  const btnDanger =
    "inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 shadow-sm transition hover:bg-red-50 dark:border-red-900/50 dark:bg-zinc-800 dark:text-red-400 dark:hover:bg-red-950/40"

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-rose-100/50 to-zinc-50 dark:from-zinc-950 dark:via-rose-950/[0.28] dark:to-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl dark:text-zinc-50">
              フリマ出品支援アプリ
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              画像とメモから出品文を生成・履歴管理
            </p>
          </div>
          <button type="button" onClick={handleLogout} className={btnSecondary}>
            ログアウト
          </button>
        </header>

        <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
          {/* 入力エリア */}
          <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-7">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              入力
            </h2>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              商品メモ・キーワード
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={5}
              placeholder="例：黒のスニーカー、使用感少なめ…"
              className={`${fieldClass} mb-5 resize-y min-h-[100px]`}
            />

            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              画像（最大5枚）
            </label>
            <label className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50/50 px-4 py-8 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800/40 dark:hover:border-zinc-500">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                クリックして画像を選択
              </span>
              <span className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                JPEG / PNG など · 自動で圧縮されます
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
              />
            </label>

            {images.length > 0 && (
              <div className="mb-5 flex flex-wrap gap-3">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    className="h-24 w-24 rounded-lg border border-zinc-200 object-cover shadow-sm dark:border-zinc-700"
                  />
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className={`${btnPrimary} w-full sm:w-auto`}
            >
              {loading && (
                <span
                  className="size-4 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-zinc-900/30 dark:border-t-zinc-900"
                  aria-hidden
                />
              )}
              {loading ? "生成中..." : "生成する"}
            </button>
          </section>

          {/* 生成結果（サイド / 下にスタック） */}
          <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-5">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              今回の生成結果
            </h2>
            {!result && (
              <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                「生成する」を押すと、ここにタイトル・説明・タグなどが表示されます。
              </p>
            )}
            {result && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
                  {result.title}
                </h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {result.description}
                </p>
                {result.hashtags && result.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {result.hashtags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <dl className="grid gap-2 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-medium text-zinc-500 dark:text-zinc-400">カテゴリ</dt>
                    <dd className="text-zinc-800 dark:text-zinc-200">
                      {result.categories?.join(", ")}
                    </dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-medium text-zinc-500 dark:text-zinc-400">ブランド</dt>
                    <dd className="text-zinc-800 dark:text-zinc-200">
                      {result.brands?.join(", ")}
                    </dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-medium text-zinc-500 dark:text-zinc-400">価格</dt>
                    <dd className="text-zinc-800 dark:text-zinc-200">{result.price}円</dd>
                  </div>
                </dl>
              </div>
            )}
          </section>
        </div>

        {/* 履歴 */}
        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">履歴</h2>
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
              {items.length} 件
            </span>
          </div>

          {items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/60 px-6 py-12 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
              履歴がありません。上のフォームから生成するとここに表示されます。
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex flex-col rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <h3 className="text-base font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
                  {item.title}
                </h3>
                <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {item.description}
                </p>

                {item.hashtags && item.hashtags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.hashtags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <dl className="mt-4 space-y-1 border-t border-zinc-100 pt-4 text-xs dark:border-zinc-800">
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-medium text-zinc-500 dark:text-zinc-400">カテゴリ</dt>
                    <dd className="text-zinc-700 dark:text-zinc-300">{item.categories?.join(", ")}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-medium text-zinc-500 dark:text-zinc-400">ブランド</dt>
                    <dd className="text-zinc-700 dark:text-zinc-300">{item.brands?.join(", ")}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-medium text-zinc-500 dark:text-zinc-400">価格</dt>
                    <dd className="text-zinc-700 dark:text-zinc-300">{item.price}円</dd>
                  </div>
                </dl>

                {item.images && item.images.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt=""
                        className="h-16 w-16 rounded-md border border-zinc-200 object-cover dark:border-zinc-700"
                      />
                    ))}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <button type="button" onClick={() => openEditModal(item)} className={btnSecondary}>
                    編集
                  </button>
                  <button type="button" onClick={() => handleCopyItem(item)} className={btnSecondary}>
                    コピー
                  </button>
                  <button type="button" onClick={() => handleDelete(item.id!)} className={btnDanger}>
                    削除
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4 backdrop-blur-[2px] dark:bg-black/60"
          role="presentation"
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
          >
            <h2 id="edit-modal-title" className="mb-5 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              編集
            </h2>

            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              タイトル
            </label>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className={`${fieldClass} mb-4`}
            />
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              説明文
            </label>
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows={6}
              className={`${fieldClass} mb-4 resize-y`}
            />
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              ハッシュタグ（スペース区切り）
            </label>
            <input
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              className={`${fieldClass} mb-6`}
            />

            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setEditingItem(null)} className={btnSecondary}>
                キャンセル
              </button>
              <button type="button" onClick={handleSaveEdit} className={btnPrimary}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
