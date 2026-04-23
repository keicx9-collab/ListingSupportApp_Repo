# フリマ出品支援アプリ - 仕様書（spec）

詳細なセットアップ・デモ URL・環境変数・API エラー概要は、リポジトリ直下の [README.md](../README.md) を参照してください。

本書は **1. 目的** から **13. 現在の状態** までの番号付きセクションで構成しています（GitHub 上の目次ペインからもジャンプできます）。

## 1. 目的

画像とテキストからフリマ出品用の商品情報を AI で自動生成し、履歴として保存・管理できる出品支援ツールを提供する。

## 2. スコープ

### 含む（現在実装済み）

- 画像アップロード（最大 5 枚）
- 画像圧縮（フロントエンド）
- 商品情報生成（AI / OpenAI Vision 対応）
- 結果表示
- ユーザー認証（Supabase Auth）
- 商品履歴保存（Supabase）
- 履歴一覧表示
- 履歴編集（タイトル・説明文・ハッシュタグ）
- 履歴削除（CRUD）
- コピー機能

### 含まない（将来拡張）

- 類似商品検索
- 画像編集（切り抜き等）
- マーケット連携（メルカリ自動出品）
- 決済機能
- チーム共有機能

## 3. ユーザーフロー

### 初回利用

1. ログイン（Supabase Auth）
2. ホーム画面へ遷移

### 通常利用

1. 画像アップロード（最大 5 枚）
2. 任意テキスト入力
3. 「生成する」を押下
4. AI が商品情報を生成
5. 結果表示
6. 自動で履歴保存

### 履歴利用

1. 過去生成一覧を表示
2. 編集（モーダル UI）
3. 削除
4. コピーして出品

## 4. 画面構成

### `/`（ホーム）

- 画像アップロード（ドロップゾーン風 UI）
- テキスト入力
- 生成ボタン（生成中はローディング表示）
- 今回の生成結果の表示エリア
- 履歴一覧（カード形式・ハッシュタグはバッジ風）
- 編集モーダル
- ログアウト

### `/login`

- メール + パスワードログイン
- 新規登録対応

## 5. API 仕様

### `POST /api/generate`

リクエストヘッダに `Authorization: Bearer <access_token>`（Supabase セッションの access token）が必要。未設定または無効な場合は `401`。

**Input**

```json
{
  "images": ["base64 string"],
  "inputText": "string"
}
```

**Output（成功時・フィールド例）**

```json
{
  "title": "string",
  "description": "string",
  "categories": ["string"],
  "brands": ["string"],
  "condition": "string",
  "price": 0,
  "hashtags": ["string"]
}
```

**失敗時（例）**

- `401` — 認証ヘッダなし / ユーザー解決不可
- `500` — AI 空応答、JSON パースエラー、その他内部エラー

### `GET /api/generate`

疎通確認用。本文はプレーンテキスト（実装は `API is working` 形式）。

## 6. データ構造（Supabase）

### `products` テーブル（DB 行のイメージ）

アプリ画面側では `id` や `images` などを含む拡張型を用いる。`types/product.ts` は生成 API のコアフィールドに近い形の型定義。

```ts
export type Product = {
  id: string
  user_id: string
  title: string
  description: string
  categories: string[]
  brands: string[]
  condition: string
  price: number
  hashtags: string[]
  images: string[]
  created_at: string
}
```

## 7. 認証仕様

- Supabase Auth を使用
- email + password 認証
- 未認証ユーザーは `/login` にリダイレクト
- `user_id` ベースでデータ分離
- ログイン・新規登録の結果は現状 `alert` で通知（実装詳細）

## 8. CRUD 仕様

| 操作 | 内容 |
|------|------|
| Create | 生成時に自動保存 |
| Read | ログインユーザーの履歴一覧取得 |
| Update | タイトル / 説明 / ハッシュタグ編集 |
| Delete | 履歴削除可能 |

## 9. 生成ルール（AI）

- 日本語出力
- JSON 形式固定
- 説明文：200〜400 文字
- ハッシュタグ：5〜10 個
- カテゴリ・ブランドは複数候補
- 画像情報を優先的に利用

## 10. 非機能要件

- 生成時間：5〜15 秒以内
- **利用想定** — PC 利用を最優先。狭い画面でも主要操作が一通りできる程度のレスポンシブ対応（従来の「モバイル未対応（PC 前提）」方針を満たす範囲でレイアウト調整）
- UI は軽量優先
- 画像はフロントで圧縮（800px / JPEG 0.7）

## 11. セキュリティ

- Supabase RLS でユーザー分離
- API は Bearer トークン認証
- `service_role` キーはサーバー限定使用

## 12. システム構成

```text
app/
├── page.tsx              # メイン UI（生成・履歴・CRUD）
├── login/                # 認証画面
├── api/
│   ├── generate/         # AI 生成 API（POST + GET 疎通）
│   └── test/             # 開発用ルート（任意）
├── layout.tsx
└── globals.css

lib/
├── supabase.ts
└── prompt.ts

types/
└── product.ts
```

## 13. 現在の状態

| 機能 | 状態 |
|------|------|
| AI 生成 | 完了 |
| 画像アップロード | 完了 |
| 画像圧縮 | 完了 |
| 認証 | 完了 |
| 履歴保存 | 完了 |
| CRUD | 完了 |
| コピー | 完了 |
