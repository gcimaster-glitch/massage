import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReviewForm from '../../components/review/ReviewForm'

interface BookingInfo {
  id: string
  therapist_id: string
  therapist_name?: string
  scheduled_at?: string
  status?: string
}

const BookingReview: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<BookingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  const [reviewDone, setReviewDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!bookingId) return

    const token = localStorage.getItem('auth_token')
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    // 予約情報取得 + レビュー済み確認を並行実行
    Promise.all([
      fetch(`/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch(`/api/reviews/check/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    ])
      .then(([bookingData, reviewCheck]) => {
        if (bookingData.ok || bookingData.booking) {
          const b = bookingData.booking || bookingData
          setBooking({
            id: b.id || bookingId,
            therapist_id: b.therapist_id || b.therapistId || '',
            therapist_name: b.therapist_name || b.therapistName || '',
            scheduled_at: b.scheduled_at || b.scheduledAt || '',
            status: b.status || '',
          })
        } else {
          setError('予約情報が見つかりません')
        }
        if (reviewCheck.ok && reviewCheck.has_review) {
          setAlreadyReviewed(true)
        }
      })
      .catch(() => setError('データの取得に失敗しました'))
      .finally(() => setLoading(false))
  }, [bookingId, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/app/bookings')}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
          >
            予約一覧へ戻る
          </button>
        </div>
      </div>
    )
  }

  // レビュー投稿完了
  if (reviewDone) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">レビューを投稿しました</h2>
          <p className="text-sm text-gray-500 mb-6">
            ご評価いただきありがとうございます。<br />
            セラピストへの大切なフィードバックになります。
          </p>
          <button
            onClick={() => navigate('/app/bookings')}
            className="w-full px-4 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors"
          >
            予約一覧へ戻る
          </button>
        </div>
      </div>
    )
  }

  // 既にレビュー済み
  if (alreadyReviewed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">レビュー投稿済みです</h2>
          <p className="text-sm text-gray-500 mb-6">
            この予約に対するレビューは既に投稿されています。
          </p>
          <button
            onClick={() => navigate('/app/bookings')}
            className="w-full px-4 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors"
          >
            予約一覧へ戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* パンくずリスト */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <button onClick={() => navigate('/app/bookings')} className="hover:text-teal-600 transition-colors">
            予約一覧
          </button>
          <span>›</span>
          <span className="text-gray-600">レビュー投稿</span>
        </nav>

        <ReviewForm
          bookingId={bookingId || ''}
          therapistId={booking?.therapist_id || ''}
          therapistName={booking?.therapist_name}
          onSuccess={() => setReviewDone(true)}
          onCancel={() => navigate('/app/bookings')}
        />
      </div>
    </div>
  )
}

export default BookingReview
