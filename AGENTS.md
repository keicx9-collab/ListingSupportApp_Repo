<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## E2E ワークフロー（必須）

変更が E2E（`e2e/`、Playwright 設定、ホーム・認証・API 挙動など UI/フロー）に関わる場合は、次を必ず踏むこと。

1. **E2E に関わる変更をしたら**、マージや完了報告の前に **`npm run test:e2e`（フルスイート）** を実行する。
2. **`npm run test:e2e` をフル実行したら**、必ず **`docs/e2e/e2e-test-run-summary.md`** を更新する（実行日・コード上の前提メタ、合計所要、各テストの概算所要は **その run のログ** に合わせる）。
3. **`docs/e2e/e2e-test-run-summary.md` の更新が完了したのち**、**`README.md` も必ず更新**する。E2E 件数・合計所要の目安、サマリへのリンク、プロジェクト構造（`e2e/` や `app/` の説明）など、サマリや現状と矛盾しないように揃える。

スキップしないこと。ローカルで E2E が通らない状態で本件を完了と書かないこと。
