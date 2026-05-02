import React, { useEffect, useState } from 'react'

// ============================================
// 型定義
// ============================================
interface RatingStats {
  total_count: number
  average_rating: number | null
  rating_distribution: Record<string, number>
  gender_distribution: Array<{ customer_gender: string; count: number }>
  age_distribution: Array<{ customer_age_range: string; count: number }>
}

interface ReviewStatsProps {
  therapistId: string
  compact?: boolean
}

// ============================================
// ReviewStats コンポーネント
// ============================================
const ReviewStats: React.FC<ReviewStatsProps> = ({ therapistId, compact = false }) => {
  const [stats, setStats] = useState<RatingStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!therapistId) return
    setLoading(true)
    fetch(`/api/reviews/stats/${therapistId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setStats(data.stats)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [therapistId])

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-100 rounded-lg w-32 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-24" />
      </div>
    )
  }

  if (!stats || stats.total_count === 0) {
    return (
      <div className="text-gray-400 text-sm py-2">
        まだレビューはありません
      </div>
    )
  }

  const avg = stats.average_rating ?? 0
  const total = stats.total_count

  // コンパクト表示（セラピスト一覧カードなど）
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} className={`text-base ${avg >= s ? 'text-yellow-400' : avg >= s - 0.5 ? 'text-yellow-300' : 'text-gray-200'}`}>
              ★
            </span>
          ))}
        </div>
        <span className="text-sm font-bold text-gray-800">{avg.toFixed(1)}</span>
        <span className="text-xs text-gray-400">({total}件)</span>
      </div>
    )
  }

  // フル表示
  const maxCount = Math.max(...Object.values(stats.rating_distribution))

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-base font-bold text-gray-800 mb-5">お客様の評価</h3>

      <div className="flex flex-col md:flex-row gap-6">
        {/* 平均スコア */}
        <div className="flex flex-col items-center justify-center bg-teal-50 rounded-xl px-8 py-6 min-w-[140px]">
          <span className="text-5xl font-black text-teal-600">{avg.toFixed(1)}</span>
          <div className="flex gap-0.5 my-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className={`text-xl ${avg >= s ? 'text-yellow-400' : avg >= s - 0.5 ? 'text-yellow-300' : 'text-gray-200'}`}>
                ★
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-500">{total}件のレビュー</span>
        </div>

        {/* 評価分布バー */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.rating_distribution[star] || 0
            const pct = total > 0 ? (count / total) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12 flex-shrink-0">
                  <span className="text-sm text-gray-600">{star}</span>
                  <span className="text-yellow-400 text-sm">★</span>
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 性別・年齢層分布 */}
      {(stats.gender_distribution.length > 0 || stats.age_distribution.length > 0) && (
        <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-5">
          {stats.gender_distribution.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">性別</p>
              <div className="flex flex-wrap gap-2">
                {stats.gender_distribution.map((g) => (
                  <div key={g.customer_gender} className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                      {g.customer_gender}
                    </span>
                    <span className="text-xs text-gray-400">{g.count}人</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.age_distribution.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">年齢層</p>
              <div className="flex flex-wrap gap-2">
                {stats.age_distribution.map((a) => (
                  <div key={a.customer_age_range} className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      {a.customer_age_range}
                    </span>
                    <span className="text-xs text-gray-400">{a.count}人</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ReviewStats
