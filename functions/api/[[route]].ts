// functions/api/[[route]].ts
// Cloudflare Pages では functions/api/ 配下のファイルが /api/* を優先処理する。
// メインルーター（functions/[[route]].ts）と同じ Hono アプリを使うことで
// /api/auth/*, /api/therapists/* 等のすべてのルートを一元管理する。
import app from '../[[route]]'
export const onRequest: PagesFunction = async (context) => {
  return app.fetch(context.request, context.env, context)
}