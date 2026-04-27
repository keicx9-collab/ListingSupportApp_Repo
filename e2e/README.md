# E2E（Playwright）

[docs/e2e/test-cases.md](../docs/e2e/test-cases.md) の各 TC-ID に対応するテストを `e2e/*.spec.ts` に置いています。

## 前提

- ブラウザ: `npx playwright install`（未実行なら先に実行）
- 開発用 Supabase: `.env.local` の `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` があり、**インターネット経由で Supabase に到達できる**こと
- ログイン系: 既定では README のデモ ID（`guest@listingsupportapp.jp` / `password123`）を使います。プロジェクトに該当ユーザーがいない場合は `.env.local` に `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` を上書き
- 履歴を空にする（TC-HIST-01）: `SUPABASE_SERVICE_ROLE_KEY` があると `products` 事前削除に使用

## コマンド

| スクリプト | 内容 |
|------------|------|
| `npm run test:e2e` | 全 E2E |
| `npm run test:e2e:api` | API（GET/401 等）のみ。Supabase 未接続でも通りやすい |
| `npm run test:e2e:ui` | UI モード |

## 失敗の典型

- ログイン・生成まわりで **45s 前後**で失敗: `signInWithPassword` / `getSession` の応答が遅い、または URL・キー・ファイアウォール不整合。Supabase ダッシュボードの URL/キー、プロジェクト上のデモユーザーを確認
- `TC-AUTH-01` の URL 未遷移: クライアントの `getSession()` が遅延している可能性。`waitForURL` の上限は 60s
