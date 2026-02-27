// ============================================
// Mock Data Management Routes (Admin only)
// デモ・開発用データの管理API
// ============================================
import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const mockDataApp = new Hono<{ Bindings: Bindings }>()

// ============================================
// DELETE /api/admin/mock-data - モックデータ一括削除
// ============================================
mockDataApp.delete('/', async (c) => {
  try {
    if (!c.env.DB) {
      return c.json({ error: 'Database not available' }, 500)
    }

    // 外部キー制約を考慮した順序で削除
    const deletions = [
      // 1. 予約関連データ（外部キー制約のため先に削除）
      `DELETE FROM booking_items WHERE booking_id IN (SELECT id FROM bookings WHERE therapist_id IN (SELECT user_id FROM therapist_profiles WHERE user_id LIKE 'therapist-%'))`,
      `DELETE FROM bookings WHERE therapist_id IN (SELECT user_id FROM therapist_profiles WHERE user_id LIKE 'therapist-%')`,
      // 2. セラピストメニュー・オプション
      `DELETE FROM therapist_options WHERE therapist_id LIKE 'therapist-%'`,
      `DELETE FROM therapist_menu WHERE therapist_id LIKE 'therapist-%'`,
      // 3. セラピストプロフィール
      `DELETE FROM therapist_profiles WHERE user_id LIKE 'therapist-%'`,
      // 4. セラピストユーザー
      `DELETE FROM users WHERE id LIKE 'therapist-%' AND role = 'THERAPIST'`,
      // ※ マスターデータは他のセラピストが使用している可能性があるため削除しない
    ]

    let deletedCount = 0
    for (const sql of deletions) {
      const result = await c.env.DB.prepare(sql).run()
      deletedCount += result.meta.changes || 0
    }

    return c.json({
      success: true,
      message: `${deletedCount}件のモックデータを削除しました`,
      deletedCount,
    })
  } catch (e) {
    console.error('モックデータ削除エラー:', e)
    return c.json({ error: 'モックデータの削除に失敗しました', details: String(e) }, 500)
  }
})

// ============================================
// POST /api/admin/mock-data/seed - モックデータ挿入
// ============================================
mockDataApp.post('/seed', async (c) => {
  try {
    if (!c.env.DB) {
      return c.json({ error: 'Database not available' }, 500)
    }

    // 1. デモセラピストユーザーを挿入
    const users: [string, string, string, string, string, string][] = [
      ['therapist-1', 'misaki.tanaka@hogusy.com', '田中 美咲', '090-1234-5678', 'THERAPIST', '/therapists/therapist-1.jpg'],
      ['therapist-2', 'takeshi.sato@hogusy.com', '佐藤 武志', '090-2345-6789', 'THERAPIST', '/therapists/therapist-2.jpg'],
      ['therapist-3', 'kenji.yamada@hogusy.com', '山田 健二', '090-3456-7890', 'THERAPIST', '/therapists/therapist-3.jpg'],
      ['therapist-4', 'yui.kobayashi@hogusy.com', '小林 結衣', '090-4567-8901', 'THERAPIST', 'https://www.genspark.ai/api/files/s/kMBUm4hm'],
      ['therapist-5', 'ayumi.watanabe@hogusy.com', '渡辺 あゆみ', '090-5678-9012', 'THERAPIST', 'https://www.genspark.ai/api/files/s/0RIiDbmp'],
      ['therapist-6', 'hiroki.kato@hogusy.com', '加藤 浩樹', '090-6789-0123', 'THERAPIST', 'https://www.genspark.ai/api/files/s/iLvjbJLH'],
      ['therapist-7', 'sakura.nakamura@hogusy.com', '中村 さくら', '090-7890-1234', 'THERAPIST', 'https://www.genspark.ai/api/files/s/rmby81Es'],
      ['therapist-8', 'rina.yamamoto@hogusy.com', '山本 梨奈', '090-8901-2345', 'THERAPIST', 'https://www.genspark.ai/api/files/s/iqRVJzGE'],
      ['therapist-9', 'yuka.ito@hogusy.com', '伊藤 優香', '090-9012-3456', 'THERAPIST', 'https://www.genspark.ai/api/files/s/jl395HcH'],
      ['therapist-10', 'mika.suzuki@hogusy.com', '鈴木 美香', '090-0123-4567', 'THERAPIST', 'https://www.genspark.ai/api/files/s/hg4hZj91'],
      ['therapist-11', 'daichi.takahashi@hogusy.com', '高橋 大地', '090-1234-6789', 'THERAPIST', 'https://www.genspark.ai/api/files/s/dlavRDmC'],
    ]

    for (const user of users) {
      await c.env.DB.prepare(`
        INSERT OR IGNORE INTO users (id, email, name, phone, role, avatar_url, kyc_status, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, 'VERIFIED', CURRENT_TIMESTAMP)
      `).bind(...user).run()
    }

    // 2. セラピストプロフィールを挿入
    const profiles: [string, string, string, number, number, number, string][] = [
      ['therapist-1', '看護師資格を持つベテランセラピスト。医療知識を活かした丁寧な施術で、お客様一人ひとりの体調に合わせたケアを提供します。', '["メディカルマッサージ", "リラクゼーション", "アロマセラピー"]', 10, 4.9, 342, '["shibuya", "shinjuku", "minato"]'],
      ['therapist-2', 'スポーツトレーナー出身の男性セラピスト。筋膜リリースとスポーツマッサージで、アスリートから一般の方まで幅広く対応。', '["スポーツマッサージ", "筋膜リリース", "ストレッチ"]', 8, 4.8, 298, '["shibuya", "shinjuku", "minato"]'],
      ['therapist-3', '整体院での経験を活かした施術が得意。深層筋へのアプローチで根本から体を改善します。', '["整体", "深層筋マッサージ", "姿勢改善"]', 12, 4.7, 134, '["shibuya", "shinjuku", "minato"]'],
      ['therapist-4', '看護師としての経験を活かし、丁寧で安心感のある施術を心がけています。女性のお客様に人気です。', '["リラクゼーション", "リンパドレナージュ", "メディカルケア"]', 6, 4.7, 234, '["shibuya", "shinjuku", "minato"]'],
      ['therapist-5', '受付スタッフとしても活躍。お客様とのコミュニケーションを大切にし、心身ともにリラックスできる施術を提供。', '["リラクゼーション", "ボディケア", "ヘッドスパ"]', 4, 4.6, 187, '["shibuya", "shinjuku", "minato"]'],
      ['therapist-6', 'エステティシャン出身の男性セラピスト。美容と健康の両面からアプローチする施術が特徴です。', '["美容整体", "リンパドレナージュ", "デトックス"]', 7, 4.7, 265, '["shibuya", "shinjuku", "minato"]'],
      ['therapist-7', '明るく親しみやすい雰囲気が魅力。初めての方でもリラックスして施術を受けていただけます。', '["リラクゼーション", "アロマセラピー", "ストレッチ"]', 5, 4.8, 213, '["shibuya", "shinjuku", "minato"]'],
      ['therapist-8', '笑顔が素敵なセラピスト。お客様の悩みに寄り添った丁寧なカウンセリングと施術を提供。', '["リラクゼーション", "ボディケア", "フットケア"]', 6, 4.7, 198, '["shibuya", "shinjuku", "minato"]'],
      ['therapist-9', '国家資格保有のあん摩マッサージ指圧師。確かな技術で根本から体の不調を改善します。', '["あん摩", "指圧", "マッサージ"]', 9, 4.9, 378, '["shibuya", "shinjuku", "minato"]'],
      ['therapist-10', 'ヨガインストラクターとしても活動。呼吸と体のバランスを整える施術が特徴です。', '["ヨガセラピー", "ストレッチ", "バランス調整"]', 7, 4.8, 289, '["shibuya", "shinjuku", "minato"]'],
      ['therapist-11', '鍼灸師・柔道整復師の資格保有。スポーツ障害や慢性痛の改善を得意としています。', '["鍼灸", "柔道整復", "スポーツ障害"]', 11, 4.9, 423, '["shibuya", "shinjuku", "minato"]'],
    ]

    for (const profile of profiles) {
      await c.env.DB.prepare(`
        INSERT OR IGNORE INTO therapist_profiles 
        (user_id, bio, specialties, experience_years, rating, review_count, approved_areas, is_active) 
        VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
      `).bind(...profile).run()
    }

    // 3. セラピストメニューを挿入（全セラピストに全コースを割り当て）
    const { results: courses } = await c.env.DB.prepare('SELECT id, base_price FROM master_courses').all<{ id: string; base_price: number }>()
    const therapistIds = users.map(u => u[0])

    for (const therapistId of therapistIds) {
      for (const course of courses) {
        await c.env.DB.prepare(`
          INSERT OR IGNORE INTO therapist_menu (id, therapist_id, master_course_id, price, is_available, created_at)
          VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
        `).bind(`tm-${therapistId}-${course.id}`, therapistId, course.id, course.base_price).run()
      }
    }

    // 4. セラピストオプションを挿入
    const { results: options } = await c.env.DB.prepare('SELECT id, base_price FROM master_options').all<{ id: string; base_price: number }>()

    for (const therapistId of therapistIds) {
      for (const option of options) {
        await c.env.DB.prepare(`
          INSERT OR IGNORE INTO therapist_options (id, therapist_id, master_option_id, price, is_available, created_at)
          VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
        `).bind(`to-${therapistId}-${option.id}`, therapistId, option.id, option.base_price).run()
      }
    }

    return c.json({
      success: true,
      message: `11名のセラピストと${courses.length * 11}件のメニュー、${options.length * 11}件のオプションを挿入しました`,
      therapists: 11,
      menus: courses.length * 11,
      options: options.length * 11,
    })
  } catch (e) {
    console.error('モックデータ挿入エラー:', e)
    return c.json({ error: 'モックデータの挿入に失敗しました', details: String(e) }, 500)
  }
})

// ============================================
// GET /api/admin/mock-data/status - モックデータ状態確認
// ============================================
mockDataApp.get('/status', async (c) => {
  try {
    if (!c.env.DB) {
      return c.json({ error: 'Database not available' }, 500)
    }

    const { results: therapists } = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM users WHERE id LIKE 'therapist-%' AND role = 'THERAPIST'
    `).all<{ count: number }>()

    const { results: profiles } = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM therapist_profiles WHERE user_id LIKE 'therapist-%'
    `).all<{ count: number }>()

    const { results: menus } = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM therapist_menu WHERE therapist_id LIKE 'therapist-%'
    `).all<{ count: number }>()

    const { results: options } = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM therapist_options WHERE therapist_id LIKE 'therapist-%'
    `).all<{ count: number }>()

    const hasMockData = (therapists[0]?.count ?? 0) > 0

    return c.json({
      hasMockData,
      counts: {
        therapists: therapists[0]?.count ?? 0,
        profiles: profiles[0]?.count ?? 0,
        menus: menus[0]?.count ?? 0,
        options: options[0]?.count ?? 0,
      },
    })
  } catch (e) {
    console.error('モックデータ状態確認エラー:', e)
    return c.json({ error: 'モックデータの状態確認に失敗しました', details: String(e) }, 500)
  }
})

export default mockDataApp
