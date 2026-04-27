import type { Product } from "@/types/product"

type HistoryListProps = {
  items: Product[]
  onEdit: (item: Product) => void
  onDelete: (id: string) => void
  onCopy: (item: Product) => void
}

export function HistoryList({
  items,
  onEdit,
  onDelete,
  onCopy,
}: HistoryListProps) {
  return (
    <section aria-labelledby="history-title">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="history-title" className="text-2xl font-bold text-zinc-900">
          履歴
        </h2>
        <span className="text-base text-zinc-500">{`${items.length}件`}</span>
      </div>

      {items.length === 0 && (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white/80 px-4 py-8 text-center text-base text-zinc-500">
          履歴がありません
        </p>
      )}
      {items.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-zinc-900 sm:text-xl">
                {item.title}
              </h3>
              <p className="mt-2 text-base text-zinc-800 leading-relaxed whitespace-pre-wrap">
                {item.description}
              </p>
              <hr
                className="my-3 border-0 border-t border-zinc-200"
                aria-hidden={true}
              />
              <div className="min-h-0 flex-1 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {item.hashtags?.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-zinc-100 px-2 py-0.5 text-sm text-zinc-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-base text-zinc-800">
                  <span className="font-medium">カテゴリ:</span>{" "}
                  {item.categories?.join(", ")}
                </p>
                <p className="text-base text-zinc-800">
                  <span className="font-medium">ブランド:</span>{" "}
                  {item.brands?.join(", ")}
                </p>
                <p className="text-base text-zinc-800">
                  <span className="font-medium">価格:</span>{" "}
                  {`${String(item.price)}円`}
                </p>
                {item.images && item.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {item.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        width={80}
                        height={80}
                        alt=""
                        className="h-20 w-20 rounded border border-zinc-200 object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base font-medium text-zinc-800 hover:bg-zinc-50"
                >
                  編集
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item.id!)}
                  className="rounded-lg border border-rose-200 bg-rose-100 px-3 py-2 text-base font-medium text-rose-800 hover:bg-rose-200"
                >
                  削除
                </button>
                <button
                  type="button"
                  onClick={() => onCopy(item)}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base font-medium text-zinc-800 hover:bg-zinc-50"
                >
                  コピー
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
