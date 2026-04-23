# Listing Support App（フリマ出品支援アプリ）

フリマアプリ（メルカリ・ラクマ等）への出品作業を効率化するための Web アプリです。商品画像と簡単なテキストを入力するだけで、AI が商品説明・タイトル・価格などを自動生成します。

## Demo

**URL:** [https://listing-support-app-repo.vercel.app/](https://listing-support-app-repo.vercel.app/)

**デモ用アカウント**

| 項目 | 値 |
|------|-----|
| Email | `guest@listingsupportapp.jp` |
| Password | `password123` |

## ドキュメント

- [仕様書（docs/spec.md）](docs/spec.md)

## Features

- **AI 商品情報生成** — 商品名 / 説明文 / カテゴリ / ブランド / 状態 / 価格 / ハッシュタグを自動生成
- **画像解析（Vision 対応）** — 最大 5 枚の画像から商品情報を推定
- **ワンクリックコピー** — 履歴からワンクリックでコピー可能
- **画像自動圧縮** — 幅 800px / JPEG 品質 0.7 で最適化
- **画像プレビュー** — アップロード画像を即時表示
- **ユーザー認証** — メールアドレス + パスワードログイン（Supabase Auth）、新規登録対応
- **履歴保存** — 生成結果を DB に保存し、ユーザーごとに管理
- **CRUD** — 履歴の編集（タイトル / 説明文 / ハッシュタグ）、削除、一覧表示

## Tech Stack

| 区分 | 技術 |
|------|------|
| Frontend | Next.js 16（App Router）, React 19, TypeScript, Tailwind CSS v4 |
| Backend | Next.js API Routes |
| AI | OpenAI API（gpt-4o-mini）, `response_format: json_object` |
| Database | Supabase（PostgreSQL） |
| Auth | Supabase Auth（メール + パスワード） |

## Project Structure

リポジトリ構成の概要です（設定ファイル・`public/` 配下の静的アセットは省略しています）。

```text
app/
├── api/
│   ├── generate/
│   │   └── route.ts      # POST: AI 生成（Bearer 認証） / GET: 疎通確認
│   └── test/
│       └── route.ts      # 開発用 GET（環境確認など）
├── login/
│   └── page.tsx          # ログイン・新規登録画面
├── globals.css           # Tailwind / グローバルスタイル
├── layout.tsx            # ルートレイアウト
└── page.tsx              # メイン UI（生成・履歴・CRUD・ログアウト）

docs/
└── spec.md               # 詳細仕様

lib/
├── prompt.ts             # AI 向けプロンプト定義
└── supabase.ts           # ブラウザ用 Supabase クライアント

types/
└── product.ts            # 生成結果の基本フィールド型（画面・DB では拡張）
```

## Setup

### 1. Clone

```bash
git clone https://github.com/your-username/listing-support-app.git
cd listing-support-app
```

### 2. Install

```bash
npm install
```

### 3. Environment Variables

プロジェクトルートに `.env.local` を作成し、次を設定します。

```env
OPENAI_API_KEY=your_api_key_here

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Run

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

### その他のスクリプト

| コマンド | 説明 |
|----------|------|
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint |

## API

### `POST /api/generate`

`Authorization: Bearer <Supabase access_token>` ヘッダが必須です。未認証の場合は `401` を返します。

**Request**

```json
{
  "inputText": "黒いスニーカー",
  "images": ["base64画像"]
}
```

**Response（成功時・例）**

```json
{
  "title": "ナイキ 黒スニーカー メンズ",
  "description": "...",
  "categories": ["メンズ", "靴"],
  "brands": ["ナイキ"],
  "condition": "目立った傷なし",
  "price": 3000,
  "hashtags": ["#ナイキ", "#スニーカー"]
}
```

**エラー時（例）**

- `401` — `Authorization` なし、またはトークンが無効
- `500` — AI 空応答、JSON パース失敗、内部エラー（本文に `error` や `raw` が含まれる場合あり）

### `GET /api/generate`

動作確認用。文字列 `API is working` を返します。

## Database（Supabase）

### `products` テーブル

| カラム | 型 |
|--------|-----|
| `id` | uuid |
| `user_id` | uuid |
| `title` | text |
| `description` | text |
| `categories` | text[] |
| `brands` | text[] |
| `condition` | text |
| `price` | int |
| `hashtags` | text[] |
| `images` | text[] |
| `created_at` | timestamp |

### RLS（Row Level Security）

Row Level Security を有効化し、`user_id = auth.uid()` に基づくポリシーを設定します。

## Key Implementation Points

- **Vision API** — `messages.content` を配列化し、テキストと画像を同時送信。`image_url` 形式で画像を渡してトークン効率を最適化。
- **トークン制限対策** — 画像をプロンプトに直接埋め込まない、最大 5 枚、フロントで画像圧縮。
- **JSON 安定出力** — `response_format: { type: "json_object" }` を使用。パースエラー時のフォールバックを実装。
- **認証付き API** — Bearer トークンでユーザー認証し、未認証アクセスをブロック。

## Current Status

| Feature | Status |
|---------|--------|
| AI 生成 | 完了 |
| UI | 完了 |
| コピー機能 | 完了 |
| 画像アップロード | 完了 |
| Vision 対応 | 完了 |
| データ保存 | 完了 |
| 認証 | 完了 |
| CRUD | 完了 |

## Roadmap

- UI の継続的な改善（レイアウト・アクセシビリティ等）※ Tailwind CSS は導入済み
- タグ入力のチップ化
- 検索・フィルタ機能
- 画像のクラウド保存（Supabase Storage）
- 価格最適化ロジック
- 出品フォーマット切替（メルカリ / ラクマ）

## Notes

- OpenAI API は従量課金です。
- 画像枚数・サイズによりコストが増加します。

## Author

Kei Terada

## License

TBD
