import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReviewList from '../../components/review/ReviewList'
import ReviewStats from '../../components/review/ReviewStats'

interface CurrentUser {
  role: string
  displayName: string
}

interface ReviewDashboardProps {
  currentUser?: CurrentUser | null
}

const ReviewDashboard: React.FC<ReviewDashboardProps> = ({ currentUser }) => {
  const navigate = useNavigate()
  const [therapistId, setTherapistId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    // JWTからuserIdを取得
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      const payload = JSON.parse(jsonPayload)
      setTherapistId(payload.userId || payload.sub || null)
    } catch {
      navigate('/login', { replace: true })
    } finally {
      setLoading(false)
    }
  }, [navigate])

  if (loading || !therapistId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">お客様レビュー管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            お客様からいただいたレビューを確認・返信できます
          </p>
        </div>

        {/* 評価統計 */}
        <div className="mb-8">
          <ReviewStats therapistId={therapistId} />
        </div>

        {/* レビュー一覧 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-800">レビュー一覧</h2>
            <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
              返信はお客様のページに表示されます
            </span>
          </div>
          <ReviewList
            therapistId={therapistId}
            showReplyForm={true}
            currentUserId={therapistId}
            currentUserRole={currentUser?.role}
          />
        </div>
      </div>
    </div>
  )
}

export default ReviewDashboard
