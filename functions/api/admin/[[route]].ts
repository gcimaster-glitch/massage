// functions/api/admin/[[route]].ts
// Cloudflare Pages では functions/api/admin/ 配下のファイルが /api/admin/* を
// 最優先で処理するため、独自のHonoアプリを置くとメインルーター
// （admin-comprehensive-routes 等）が全て404になってしまう。
// メインアプリへ委譲して /api/admin/* を一元管理する。
import app from '../../[[route]]'
export const onRequest: PagesFunction = async (context) => {
  return app.fetch(context.request, context.env, context)
}
