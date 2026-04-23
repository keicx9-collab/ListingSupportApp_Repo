# フリマ出品支援アプリ — 仕様書（spec）

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

- 画像アップロード
- テキスト入力
- 生成ボタン
- 生成結果表示
- 履歴一覧
- 編集モーダル

### `/login`

- メール + パスワードログイン
- 新規登録対応

## 5. API 仕様

### `POST /api/generate`

**Input**

```json
{
  "images": ["base64 string"],
  "inputText": "string"
}
```

**Output**

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

## 6. データ構造（Supabase）

### `products` テーブル

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
- モバイル未対応（PC 前提）
- UI は軽量優先
- 画像はフロントで圧縮（800px / JPEG 0.7）

## 11. セキュリティ

- Supabase RLS でユーザー分離
- API は Bearer トークン認証
- `service_role` キーはサーバー限定使用

## 12. システム構成

```
app/
├── page.tsx          # メイン UI（生成・履歴・CRUD）
├── login/            # 認証画面
└── api/generate/     # AI 生成 API

lib/
├── supabase.ts
└── prompt.ts
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
