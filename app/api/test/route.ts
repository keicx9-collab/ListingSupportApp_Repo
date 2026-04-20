//PostでなくGetで叩くテスト
//http://localhost:3000/api/generate　⇒　ブラウザで開く = GETリクエスト

export async function GET() {
  console.log("API KEY:", process.env.OPENAI_API_KEY)

  return new Response("OK")
}

