# Listing Support App（フリマ出品支援アプリ）

フリマアプリ（メルカリ・ラクマ等）への出品作業を効率化するための Web アプリです。商品画像とテキストを入力すると、AI がタイトル・説明・カテゴリ・価格・ハッシュタグなどを生成します。生成結果の履歴はユーザーごとに保存し、編集・削除・コピーが行えます。

## Demo

**URL:** [https://listing-support-app-repo.vercel.app/](https://listing-support-app-repo.vercel.app/)

**デモ用アカウント**

| 項目 | 値 |
|------|-----|
| Email | `guest@listingsupportapp.jp` |
| Password | `password123` |

## Features

- **AI 商品情報生成** — 商品名 / 説明文 / カテゴリ / ブランド / 状態 / 価格 / ハッシュタグを自動生成
- **画像解析（Vision 対応）** — 最大 5 枚の画像から商品情報を推定
- **ワンクリックコピー** — 履歴からコピー可能（`navigator.clipboard` + アラート）
- **画像自動圧縮** — 幅 800px / JPEG 品質 0.7
- **画像プレビュー** — アップロード直後に表示
- **ユーザー認証** — メール + パスワード（Supabase Auth）。ログイン画面ではパスワード表示の切替（目アイコン）が可能
- **履歴保存** — 生成結果を `products` テーブルに保存
- **CRUD** — 履歴の編集、削除、一覧。モーダルでタイトル・説明・タグ（スペース区切り）を編集

## Tech Stack

| 区分 | 技術 |
|------|------|
| フロント | Next.js 16（App Router）, React 19, TypeScript, Tailwind CSS v4 |
| API | Next.js Route Handlers（`app/api`） |
| AI | OpenAI（`lib/prompt` + `app/api/generate`） |
| データ / 認証 | Supabase（PostgreSQL + Auth） |
| E2E | Playwright 1.59+（`e2e/`、Chromium プロジェクト。テスト用に `workers: 1`） |

## Project Structure

```
app/
├── page.tsx              # メイン UI（入力・今回の生成結果・履歴・編集モーダル）
├── layout.tsx, globals.css
├── login/
│   └── page.tsx          # ログイン / 新規登録
└── api/
    ├── generate/
    │   └── route.ts      # 生成 API（Bearer 認証）
    └── test/             # 必要に応じたテスト用ルート
e2e/                      # Playwright 仕様
docs/e2e/                 # 手動用 TC 定義（test-cases.md）・最終 E2E サマリ（e2e-test-run-summary.md）
lib/
├── prompt.ts
└── supabase.ts
```

## Setup

### 1. Clone & Install

```bash
git clone <your-repo-url> ListingSupportApp
cd ListingSupportApp
npm install
```

E2E を実行する前に、ブラウザの取得が未なら次を 1 回実行します。

```bash
npx playwright install
```

### 2. 環境変数

プロジェクトルートに `.env.local` を置き、少なくとも次を設定します。

```env
OPENAI_API_KEY=your_openai_key

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# 管理用（サーバーからのみ使用）
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. 開発サーバー

```bash
npm run dev
```

**推奨 URL:** [http://localhost:3000](http://localhost:3000)  
`127.0.0.1` と `localhost` はオリジンが異なり、Supabase のクッキー / リダイレクトと噛み合わない場合があります。必要なら Playwright 用に `PLAYWRIGHT_BASE_URL` を設定します。

### 4. E2E 用（任意の上書き）

| 変数 | 用途 |
|------|------|
| `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` | 未指定時は上記デモ用アカウント（Supabase 上に同一ユーザが必要） |

履歴の事前削除が必要なテスト（`SUPABASE_SERVICE_ROLE_KEY` 利用）を通すには、**Service Role キー**を `.env.local` に入れてください。

## スクリプト

| コマンド | 内容 |
|----------|------|
| `npm run dev` | 開発サーバー（Turbopack） |
| `npm run build` / `npm run start` | 本番ビルド / 本番起動 |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Playwright 全 28 ケース（`next dev` を Playwright 設定で起動。`.env.local` 読み込み） |
| `npm run test:e2e:api` | API 系 E2E のみ |
| `npm run test:e2e:ui` | Playwright UI モード |
| `npm run test:e2e:headed` | ヘッド付きで実行 |

E2E の前提・失敗例は [e2e/README.md](e2e/README.md) を参照。直近の全件成否・所要の記録は [docs/e2e/e2e-test-run-summary.md](docs/e2e/e2e-test-run-summary.md) を手で更新する運用です。

## API

### `POST /api/generate`

`Authorization: Bearer <access_token>` 必須。本文は `inputText` と Base64 画像配列 `images` など（実装は `app/api/generate/route.ts` 参照）。

### `GET /api/generate`

ヘルスチェック用（E2E に含まれる）。

## Database（Supabase）

### `products` テーブル（主なカラム）

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

### RLS

Row Level Security を有効化し、`user_id` と `auth.uid()` などに基づくポリシーを設定します。

## 実装の要点

- **Vision** — テキストと画像を同時に渡すメッセージ形式。最大 5 枚、フロントで圧縮してから送信。
- **JSON 出力** — API 側で構造化。パース失敗時の扱いは `route.ts` 参照。
- **認証** — API は Bearer トークンで検証。未認証は 401。

## 現状

| 区分 | 状態 |
|------|------|
| AI 生成・履歴保存・CRUD | 利用可能 |
| 認証（ログイン / 新規登録） | 利用可能 |
| UI | Tailwind ベース（メイン・ログイン）。ローカルは `http://localhost:3000` 推奨 |
| E2E（Playwright） | `npm run test:e2e` 全 28 ケース想定。前提は `e2e/README.md` |

## 今後の候補

- タグ入力のチップ化
- 検索・フィルタ
- 画像の Supabase Storage 保存
- 価格最適化・出品向け形式プリセット

## Notes

- OpenAI API は従量課金。画像数・解像度でコストが増えます。

## Author

Kei Terada

## License

TBD
