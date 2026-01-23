import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// =========================================
// エリア一覧取得
// =========================================
app.get('/', async (c) => {
  try {
    const { DB } = c.env as Bindings

    // DBからエリア一覧を取得
    const result = await DB.prepare(`
      SELECT DISTINCT 
        prefecture,
        city,
        area
      FROM sites
      WHERE status = 'ACTIVE'
      ORDER BY prefecture, city, area
    `).all()

    // エリアをグループ化
    const areas: any[] = []
    const areaMap = new Map<string, any>()

    if (result.results) {
      result.results.forEach((row: any) => {
        const key = `${row.prefecture}-${row.city}`
        if (!areaMap.has(key)) {
          const area = {
            id: key.toLowerCase().replace(/\s+/g, '-'),
            name: `${row.prefecture} ${row.city}`,
            prefecture: row.prefecture,
            city: row.city
          }
          areaMap.set(key, area)
          areas.push(area)
        }
      })
    }

    // フォールバックとして主要エリアを追加
    if (areas.length === 0) {
      areas.push(
        { id: 'tokyo-shibuya', name: '東京都 渋谷区', prefecture: '東京都', city: '渋谷区' },
        { id: 'tokyo-shinjuku', name: '東京都 新宿区', prefecture: '東京都', city: '新宿区' },
        { id: 'tokyo-minato', name: '東京都 港区', prefecture: '東京都', city: '港区' },
        { id: 'tokyo-chuo', name: '東京都 中央区', prefecture: '東京都', city: '中央区' },
        { id: 'osaka-osaka', name: '大阪府 大阪市', prefecture: '大阪府', city: '大阪市' },
        { id: 'aichi-nagoya', name: '愛知県 名古屋市', prefecture: '愛知県', city: '名古屋市' },
        { id: 'fukuoka-fukuoka', name: '福岡県 福岡市', prefecture: '福岡県', city: '福岡市' }
      )
    }

    return c.json({
      areas,
      total: areas.length
    })
  } catch (e) {
    console.error('Error fetching areas:', e)
    // エラー時はデフォルトエリアを返す
    return c.json({
      areas: [
        { id: 'tokyo-shibuya', name: '東京都 渋谷区', prefecture: '東京都', city: '渋谷区' },
        { id: 'tokyo-shinjuku', name: '東京都 新宿区', prefecture: '東京都', city: '新宿区' },
        { id: 'tokyo-minato', name: '東京都 港区', prefecture: '東京都', city: '港区' },
        { id: 'tokyo-chuo', name: '東京都 中央区', prefecture: '東京都', city: '中央区' },
        { id: 'osaka-osaka', name: '大阪府 大阪市', prefecture: '大阪府', city: '大阪市' },
        { id: 'aichi-nagoya', name: '愛知県 名古屋市', prefecture: '愛知県', city: '名古屋市' },
        { id: 'fukuoka-fukuoka', name: '福岡県 福岡市', prefecture: '福岡県', city: '福岡市' }
      ],
      total: 7
    })
  }
})

export default app
