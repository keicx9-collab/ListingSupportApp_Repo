````md
# フリマ出品支援アプリ - spec

## 1. 目的
画像をアップロードすると、フリマ出品用の商品情報（タイトル・説明文・タグ等）を自動生成する。

---

## 2. MVPスコープ

### 含む
- 画像アップロード
- 商品情報生成（AI）
- 結果表示
- 編集
- コピー

### 含まない
- 認証
- DB保存
- 類似商品検索
- 画像編集

---

## 3. ユーザーフロー

1. 画像をアップロード
2. 任意で補助情報を入力
3. 「生成する」を押す
4. 結果を確認・編集
5. コピーして出品

---

## 4. 画面構成

### /（ホーム）
- 画像アップロード
- 補助情報入力
- 生成ボタン

### /result
- 商品情報表示
- 編集
- コピー
- 再生成

---

## 5. API仕様

### POST /api/generate

#### input
```json
{
  "images": ["string"],
  "inputText": "string"
}
````

#### output

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

---

## 6. データ構造

```ts
export type Product = {
  title: string
  description: string
  categories: string[]
  brands: string[]
  condition: string
  price: number
  hashtags: string[]
}
```

---

## 7. 生成ルール（重要）

* 日本語で出力する
* 必ずJSON形式で返す
* 説明文は200〜400文字
* ハッシュタグは5〜10個
* カテゴリ・ブランドは複数候補
* 推測は自然に行う（不明でも埋める）

---

## 8. エラーハンドリング

* API失敗時はエラーを返す
* フロントはエラーメッセージ表示
* 再試行可能にする

---

## 9. 非機能要件

* 生成時間：5〜15秒以内
* UIはシンプル優先
* モバイル対応不要（PCのみ）

---

## 10. ファイル構成（概要）

* app/
* components/
* lib/
* types/

---

## 11. 備考

* UIデザインは後回し
* まずは動作優先

