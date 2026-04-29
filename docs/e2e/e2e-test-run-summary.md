# E2E テスト実行サマリ

このリポジトリの自動テストは **Playwright E2E**（`e2e/`）のみです。`package.json` には Jest / Vitest 等の別スイートは定義されていません。

## 実行条件（メタ）

| 項目 | 値 |
|------|-----|
| 実行日時 | **2026-04-29** に記録した `npm run test:e2e` 全件成功 run（レポート合計 **約 28.9s**）。ホームの履歴 UI は `app/components/HistoryList.tsx` に分離。`Product` は `types/product.ts` を共有。価格・件数はテンプレート文字列 1 式。本番は `package.json` の `build` = `next build --webpack` |
| コマンド | `npm run test:e2e`（= `playwright test`） |
| Playwright | 1.59.1 |
| プロジェクト | `chromium`（Desktop Chrome） |
| ワーカー | 1（履歴等の同ユーザ干渉を避けるため） |
| 合計 / 成功 / 失敗 / スキップ | **28 / 28 / 0 / 0** |
| 合計所要（レポート上） | 約 **28.9s**（本 run。回によって ± 数十秒：ネットワーク・Supabase・OpenAI 待ちなど） |
| 前提 | `playwright.config.ts` により `npm run dev` 起動（ログ上は Turbopack 表示可）、`.env.local` 注入。認証系・DB 掃除系は Supabase 認証情報・`SUPABASE_SERVICE_ROLE_KEY` 等の条件あり（各 spec の `test.skip` 参照） |

## 全テストケースと結果

| # | ファイル | describe（グループ） | テストケース | 結果 | 所要（概算） |
|---|----------|----------------------|-------------|------|-------------|
| 1 | `e2e/api.spec.ts` | TC-API /api/generate | TC-API-03 GET はヘルスを返す | 成功 | 186ms |
| 2 | `e2e/api.spec.ts` | TC-API /api/generate | TC-API-01 Authorization なしの POST は 401 | 成功 | 18ms |
| 3 | `e2e/api.spec.ts` | TC-API /api/generate | TC-API-02 不正な Bearer では 401 | 成功 | 536ms |
| 4 | `e2e/auth.spec.ts` | TC-AUTH 認証・ルーティング | TC-AUTH-01 未認証では `/` から `/login` に遷移する | 成功 | 585ms |
| 5 | `e2e/auth.spec.ts` | TC-AUTH 認証・ルーティング | TC-AUTH-02 正しいパスワードでログインできる | 成功 | 807ms |
| 6 | `e2e/auth.spec.ts` | TC-AUTH 認証・ルーティング | TC-AUTH-03 誤ったパスワードではログインできない | 成功 | 572ms |
| 7 | `e2e/auth.spec.ts` | TC-AUTH 認証・ルーティング | TC-AUTH-04 新規登録: 重複メール等で失敗アラート | 成功 | 490ms |
| 8 | `e2e/auth.spec.ts` | TC-AUTH 認証・ルーティング | TC-AUTH-04 新規登録: 新規アドレスなら登録完了系メッセージ | 成功 | 1.4s |
| 9 | `e2e/auth.spec.ts` | TC-AUTH 認証・ルーティング | TC-AUTH-05 ログアウトで `/login` へ戻る | 成功 | 817ms |
| 10 | `e2e/auth.spec.ts` | TC-AUTH 認証・ルーティング | TC-AUTH-06 ログイン済みで `/login` を開ける | 成功 | 679ms |
| 11 | `e2e/crud.spec.ts` | TC-CRUD 履歴の編集・削除・コピー | TC-CRUD-01 編集保存で反映される | 成功 | 1.5s |
| 12 | `e2e/crud.spec.ts` | TC-CRUD 履歴の編集・削除・コピー | TC-CRUD-02 タグをスペース区切りで保存 | 成功 | 1.1s |
| 13 | `e2e/crud.spec.ts` | TC-CRUD 履歴の編集・削除・コピー | TC-CRUD-03 キャンセルで変更されない | 成功 | 1.2s |
| 14 | `e2e/crud.spec.ts` | TC-CRUD 履歴の編集・削除・コピー | TC-CRUD-04 削除で行が消える | 成功 | 1.0s |
| 15 | `e2e/crud.spec.ts` | TC-CRUD 履歴の編集・削除・コピー | TC-CRUD-05 コピーでアラートとクリップボード | 成功 | 929ms |
| 16 | `e2e/errors.spec.ts` | TC-ERR エラー UI | TC-ERR-01 API が 500 のとき（成功用タイトルは出ない想定） | 成功 | 836ms |
| 17 | `e2e/generate.spec.ts` | TC-GEN 生成 | TC-GEN-01 補助テキストのみで商品情報が表示される | 成功 | 859ms |
| 18 | `e2e/generate.spec.ts` | TC-GEN 生成 | TC-GEN-02 生成中はボタンが生成中...で無効 | 成功 | 3.6s |
| 19 | `e2e/generate.spec.ts` | TC-GEN 生成 | TC-GEN-03 再生成時に直前の結果表示が消える | 成功 | 1.2s |
| 20 | `e2e/generate.spec.ts` | TC-GEN 生成 | TC-GEN-04 画像付きで生成し履歴に反映される | 成功 | 919ms |
| 21 | `e2e/history.spec.ts` | TC-HIST 履歴 | TC-HIST-01 商品が0件のとき 履歴がありません | 成功 | 709ms |
| 22 | `e2e/history.spec.ts` | TC-HIST 履歴 | TC-HIST-02 生成後に履歴へ反映される | 成功 | 873ms |
| 23 | `e2e/history.spec.ts` | TC-HIST 履歴 | TC-HIST-03 履歴行に 編集・削除・コピー | 成功 | 844ms |
| 24 | `e2e/images.spec.ts` | TC-IMG 画像 | TC-IMG-01 プレビュー（幅100px）が並ぶ | 成功 | 642ms |
| 25 | `e2e/images.spec.ts` | TC-IMG 画像 | TC-IMG-02 6枚選んでも5枚までに制限 | 成功 | 676ms |
| 26 | `e2e/images.spec.ts` | TC-IMG 画像 | TC-IMG-03 リクエスト body に data: JPEG 画像が含まれる | 成功 | 758ms |
| 27 | `e2e/nf.spec.ts` | TC-NF 非機能 | TC-NF-01 生成はタイムアウト前に完了する | 成功 | 804ms |
| 28 | `e2e/nf.spec.ts` | TC-NF 非機能 | TC-NF-02 デスクトップ Chromium プロジェクトで実行 | 成功 | 1ms |

## 補足

- 上表の所要時間は、該当 run の Playwright 行ログに出ていた個別テストの所要です（CPU・他プロセスの負荷で前後します）。
- フル E2E は **直列 1 ワーカー＋`next dev` 起動＋多数のブラウザ操作** のため、**合計 約 30～55 秒** 程度にはなりやすいです（外部 API 待ちで伸びることもあります）。短縮は並列化やスイート分割とトレードオフがあります。
- 同じ表を出し直すには `npm run test:e2e` を実行し、メタの日時と所要列を更新してください。
- 生成結果のタイトルは直近分を `h2`、履歴行を `h3` で表示しており、TC-GEN-03 では `h2` に限定して照合するよう `e2e/generate.spec.ts` で揃えています（`getByRole("heading")` だと厳格モードで 2 要素に一致し得る）。
