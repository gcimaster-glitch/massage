import React, { useEffect, useState, useCallback } from 'react'

// ============================================
// 型定義
// ============================================
export interface Review {
  id: string
  booking_id: string
  therapist_id: string
  rating: number
  comment: string | null
  customer_age_range: string | null
  customer_gender: string | null
  customer_occupation: string | null
  body_concerns: string[]
  ng_items: string[]
  is_public: number
  therapist_reply: string | null
  therapist_replied_at: number | null
  created_at: number
  updated_at: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  total_pages: number
}

interface ReviewListProps {
  therapistId: string
  showReplyForm?: boolean // セラピスト本人のダッシュボードで返信フォームを表示
  currentUserId?: string
  currentUserRole?: string
}

// ============================================
// 星表示
// ============================================
const StarDisplay: React.FC<{ rating: number; size?: 'sm' | 'md' }> = ({ rating, size = 'md' }) => {
  const cls = size === 'sm' ? 'text-sm' : 'text-base'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`${cls} ${rating >= s ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
      ))}
    </div>
  )
}

// ============================================
// 日付フォーマット
// ============================================
function formatDate(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

// ============================================
// 単一レビューカード
// ============================================
const ReviewCard: React.FC<{
  review: Review
  showReplyForm?: boolean
  onReplySubmit?: (reviewId: string, reply: string) => Promise<void>
}> = ({ review, showReplyForm, onReplySubmit }) => {
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return
    setSubmittingReply(true)
    setReplyError(null)
    try {
      await onReplySubmit?.(review.id, replyText)
      setShowReply(false)
      setReplyText('')
    } catch (e: any) {
      setReplyError(e.message || '返信の送信に失敗しました')
    } finally {
      setSubmittingReply(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
      {/* ヘッダー */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {/* アバター */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {review.customer_gender === '男性' ? '♂' : review.customer_gender === '女性' ? '♀' : '?'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <StarDisplay rating={review.rating} />
              <span className="text-sm font-bold text-gray-800">{review.rating}.0</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {review.customer_age_range && (
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">{review.customer_age_range}</span>
              )}
              {review.customer_gender && (
                <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full">{review.customer_gender}</span>
              )}
              {review.customer_occupation && (
                <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded-full">{review.customer_occupation}</span>
              )}
            </div>
          </div>
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(review.created_at)}</span>
      </div>

      {/* コメント */}
      {review.comment && (
        <p className="text-sm text-gray-700 leading-relaxed mb-3">{review.comment}</p>
      )}

      {/* 身体の悩み */}
      {review.body_concerns && review.body_concerns.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-400 mb-1.5">施術前の悩み</p>
          <div className="flex flex-wrap gap-1">
            {review.body_concerns.map((c) => (
              <span key={c} className="px-2 py-0.5 bg-teal-50 text-teal-600 text-xs rounded-full border border-teal-100">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* NG事項 */}
      {review.ng_items && review.ng_items.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-400 mb-1.5">NG事項</p>
          <div className="flex flex-wrap gap-1">
            {review.ng_items.map((n) => (
              <span key={n} className="px-2 py-0.5 bg-red-50 text-red-500 text-xs rounded-full border border-red-100">
                {n}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* セラピストからの返信 */}
      {review.therapist_reply && (
        <div className="mt-3 ml-4 pl-4 border-l-2 border-teal-200 bg-teal-50 rounded-r-lg p-3">
          <p className="text-xs font-semibold text-teal-700 mb-1">セラピストより</p>
          <p className="text-sm text-teal-800">{review.therapist_reply}</p>
          {review.therapist_replied_at && (
            <p className="text-xs text-teal-400 mt-1">{formatDate(review.therapist_replied_at)}</p>
          )}
        </div>
      )}

      {/* 返信フォーム（セラピストダッシュボード用） */}
      {showReplyForm && !review.therapist_reply && (
        <div className="mt-3">
          {!showReply ? (
            <button
              onClick={() => setShowReply(true)}
              className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              返信する
            </button>
          ) : (
            <div className="mt-2 space-y-2">
              {replyError && (
                <p className="text-xs text-red-500">{replyError}</p>
              )}
              <textarea
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
                rows={3}
                placeholder="お客様へのお礼や感謝のメッセージを入力してください"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                maxLength={300}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setShowReply(false); setReplyText('') }}
                  className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleReplySubmit}
                  disabled={submittingReply || !replyText.trim()}
                  className="px-3 py-1.5 text-xs font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                >
                  {submittingReply ? '送信中...' : '返信を送信'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// ReviewList メインコンポーネント
// ============================================
const ReviewList: React.FC<ReviewListProps> = ({
  therapistId,
  showReplyForm = false,
  currentUserId,
  currentUserRole,
}) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const fetchReviews = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const endpoint = showReplyForm && currentUserId
        ? `/api/reviews/therapist-dashboard/${therapistId}?page=${p}&limit=10`
        : `/api/reviews/therapist/${therapistId}?page=${p}&limit=10`

      const token = localStorage.getItem('auth_token')
      const res = await fetch(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      if (data.ok) {
        setReviews(data.reviews)
        setPagination(data.pagination)
      }
    } catch {
      // エラー時は空表示
    } finally {
      setLoading(false)
    }
  }, [therapistId, showReplyForm, currentUserId])

  useEffect(() => {
    fetchReviews(page)
  }, [fetchReviews, page])

  const handleReplySubmit = async (reviewId: string, reply: string) => {
    const token = localStorage.getItem('auth_token')
    const res = await fetch(`/api/reviews/${reviewId}/reply`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ reply }),
    })
    const data = await res.json()
    if (!data.ok) throw new Error(data.error || '返信に失敗しました')
    // リストを再取得
    await fetchReviews(page)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-50 rounded-xl h-24" />
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-sm">まだレビューはありません</p>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            showReplyForm={showReplyForm}
            onReplySubmit={handleReplySubmit}
          />
        ))}
      </div>

      {/* ページネーション */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            ← 前へ
          </button>
          <span className="text-sm text-gray-600">
            {page} / {pagination.total_pages}ページ
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
            disabled={page === pagination.total_pages}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            次へ →
          </button>
        </div>
      )}
    </div>
  )
}

export default ReviewList
