// 画像最大5枚・圧縮・プレビュー・API・認証・履歴 CRUD
"use client"

import { useState, useEffect, useId } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { Product } from "@/types/product"
import { HistoryList } from "./components/HistoryList"

export default function Home() {
  const router = useRouter()
  const fileInputId = useId()

  const [inputText, setInputText] = useState("")
  const [result, setResult] = useState<Product | null>(null)
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [userId, setUserId] = useState<string | null>(null)

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
      await fetchItems(session.user.id)
    }

    void init()
  }, [router])

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
    <div className="min-h-svh bg-rose-50 text-zinc-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              フリマ出品支援アプリ
            </h1>
            <p className="mt-2 text-base text-zinc-600">
              画像とメモから出品文を生成・履歴管理
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="self-start rounded-lg border border-zinc-300 bg-white px-4 py-2 text-base font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50"
          >
            ログアウト
          </button>
        </header>

        <div className="mb-10 grid gap-6 lg:grid-cols-2">
          {/* 入力 */}
          <section
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            aria-labelledby="input-heading"
          >
            <h2
              id="input-heading"
              className="mb-4 text-xl font-semibold text-zinc-900"
            >
              入力
            </h2>
            <p className="mb-2 text-base font-medium text-zinc-700">画像 (最大5枚)</p>
            <label
              htmlFor={fileInputId}
              className="mb-4 flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50/80 px-4 py-6 text-center transition hover:border-zinc-400 hover:bg-zinc-50"
            >
              <span className="text-base font-medium text-zinc-800">
                クリックして画像を選択
              </span>
              <span className="mt-1 text-sm text-zinc-500">
                JPEG / PNG など・自動で圧縮されます
              </span>
              <input
                id={fileInputId}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={handleImageChange}
              />
            </label>
            {images.length > 0 && (
              <div className="mb-5 flex flex-wrap gap-2">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    width={100}
                    height={100}
                    alt=""
                    className="h-[100px] w-[100px] rounded-md border border-zinc-200 object-cover"
                  />
                ))}
              </div>
            )}
            <label className="mb-1 block text-base font-medium text-zinc-700">
              商品メモ・キーワード
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="例：黒のスニーカー、使用感少なめ…"
              className="mb-5 min-h-[100px] w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-base text-zinc-900 shadow-inner placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
            />
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full rounded-lg bg-zinc-900 py-3 text-base font-medium text-white shadow transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "生成中..." : "生成する"}
            </button>
          </section>

          {/* 今回の生成結果 */}
          <section
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            aria-labelledby="result-heading"
          >
            <p
              id="result-heading"
              className="mb-4 text-xl font-semibold text-zinc-900"
            >
              今回の生成結果
            </p>
            {result ? (
              <div className="text-base">
                <h2 className="text-xl font-semibold text-zinc-900 sm:text-2xl">
                  {result.title}
                </h2>
                <p className="mt-2 whitespace-pre-wrap text-zinc-800 leading-relaxed">
                  {result.description}
                </p>
                <hr
                  className="my-4 border-0 border-t border-zinc-200"
                  aria-hidden={true}
                />
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {result.hashtags?.map((tag, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-zinc-100 px-2 py-0.5 text-sm text-zinc-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-zinc-800">
                    <span className="font-medium">カテゴリ:</span>{" "}
                    {result.categories?.join(", ")}
                  </p>
                  <p className="text-zinc-800">
                    <span className="font-medium">ブランド:</span>{" "}
                    {result.brands?.join(", ")}
                  </p>
                  <p className="text-zinc-800">
                    <span className="font-medium">価格:</span>{" "}
                    {`${String(result.price)}円`}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-base leading-relaxed text-zinc-500">
                「生成する」を押すと、ここにタイトル・説明・タグなどが表示されます。
              </p>
            )}
          </section>
        </div>

        <HistoryList
          items={items}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onCopy={handleCopyItem}
        />
      </div>

      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
        >
          <div
            className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-dialog-title"
          >
            <h2 id="edit-dialog-title" className="text-lg font-semibold text-zinc-900">
              編集
            </h2>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="mb-2 mt-3 w-full rounded border border-zinc-200 px-2 py-1.5 text-sm"
            />
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="mb-2 w-full rounded border border-zinc-200 px-2 py-1.5 text-sm"
              rows={5}
            />
            <input
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              className="mb-3 w-full rounded border border-zinc-200 px-2 py-1.5 text-sm"
              placeholder="タグをスペース区切り"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveEdit}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
