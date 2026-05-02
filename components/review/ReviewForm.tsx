import React, { useState } from 'react'

// ============================================
// 型定義
// ============================================
export interface ReviewFormData {
  booking_id: string
  therapist_id: string
  rating: number
  comment: string
  customer_age_range: string
  customer_gender: string
  customer_occupation: string
  body_concerns: string[]
  ng_items: string[]
  is_public: boolean
}

interface ReviewFormProps {
  bookingId: string
  therapistId: string
  therapistName?: string
  onSuccess?: (reviewId: string) => void
  onCancel?: () => void
}

// ============================================
// 選択肢定数
// ============================================
const AGE_RANGES = [
  { value: '10代', label: '10代' },
  { value: '20代', label: '20代' },
  { value: '30代', label: '30代' },
  { value: '40代', label: '40代' },
  { value: '50代', label: '50代' },
  { value: '60代以上', label: '60代以上' },
]

const GENDERS = [
  { value: '男性', label: '男性' },
  { value: '女性', label: '女性' },
  { value: 'その他', label: 'その他' },
  { value: '回答しない', label: '回答しない' },
]

const BODY_CONCERNS_OPTIONS = [
  '肩こり', '腰痛', '首の痛み', '背中の張り', '足の疲れ',
  '全身疲労', '頭痛', '眼精疲労', 'むくみ', '冷え性',
  'ストレス解消', '睡眠改善', '姿勢改善', '運動後のケア',
]

const NG_ITEMS_OPTIONS = [
  '強圧禁止', '妊娠中', '骨折・手術後', '皮膚疾患あり',
  '高血圧', '心臓疾患', '糖尿病', '骨粗しょう症',
  '腰椎ヘルニア', '頸椎ヘルニア', 'ペースメーカー装着',
  '静脈瘤', '悪性腫瘍', '発熱中',
]

// ============================================
// 星評価コンポーネント
// ============================================
const StarRating: React.FC<{
  value: number
  onChange: (v: number) => void
  size?: 'sm' | 'md' | 'lg'
}> = ({ value, onChange, size = 'lg' }) => {
  const [hovered, setHovered] = useState(0)
  const sizeClass = size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-xl'

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${sizeClass} transition-transform hover:scale-110 focus:outline-none`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          aria-label={`${star}星`}
        >
          <span className={hovered >= star || value >= star ? 'text-yellow-400' : 'text-gray-300'}>
            ★
          </span>
        </button>
      ))}
    </div>
  )
}

// ============================================
// チェックボックスグループ
// ============================================
const CheckboxGroup: React.FC<{
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
  columns?: number
}> = ({ options, selected, onChange, columns = 3 }) => {
  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter((s) => s !== val))
    } else {
      onChange([...selected, val])
    }
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-${columns} gap-2`}>
      {options.map((opt) => (
        <label
          key={opt}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm ${
            selected.includes(opt)
              ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium'
              : 'border-gray-200 bg-white text-gray-600 hover:border-teal-300'
          }`}
        >
          <input
            type="checkbox"
            className="sr-only"
            checked={selected.includes(opt)}
            onChange={() => toggle(opt)}
          />
          <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
            selected.includes(opt) ? 'bg-teal-500 border-teal-500' : 'border-gray-300'
          }`}>
            {selected.includes(opt) && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
          {opt}
        </label>
      ))}
    </div>
  )
}

// ============================================
// ReviewForm メインコンポーネント
// ============================================
const ReviewForm: React.FC<ReviewFormProps> = ({
  bookingId,
  therapistId,
  therapistName,
  onSuccess,
  onCancel,
}) => {
  const [step, setStep] = useState(1) // 1: 評価, 2: お客様情報, 3: 確認
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<ReviewFormData>({
    booking_id: bookingId,
    therapist_id: therapistId,
    rating: 0,
    comment: '',
    customer_age_range: '',
    customer_gender: '',
    customer_occupation: '',
    body_concerns: [],
    ng_items: [],
    is_public: true,
  })

  const handleSubmit = async () => {
    if (formData.rating === 0) {
      setError('評価（星）を選択してください')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'レビューの投稿に失敗しました')
      }

      onSuccess?.(data.review_id)
    } catch (e: any) {
      setError(e.message || '予期しないエラーが発生しました')
    } finally {
      setSubmitting(false)
    }
  }

  const ratingLabels = ['', '不満', 'やや不満', '普通', '良い', '大変良い']

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-2xl mx-auto">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-5 text-white">
        <h2 className="text-xl font-bold">施術レビューを投稿</h2>
        {therapistName && (
          <p className="text-teal-100 text-sm mt-1">{therapistName} セラピスト</p>
        )}
        {/* ステップインジケーター */}
        <div className="flex items-center gap-2 mt-4">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step >= s ? 'bg-white text-teal-600' : 'bg-teal-400 text-teal-100'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-white' : 'bg-teal-400'}`} />}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between text-xs text-teal-100 mt-1">
          <span>評価・コメント</span>
          <span>お客様情報</span>
          <span>確認・送信</span>
        </div>
      </div>

      <div className="p-6">
        {/* エラー表示 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: 評価・コメント */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                総合評価 <span className="text-red-500">*</span>
              </label>
              <StarRating value={formData.rating} onChange={(v) => setFormData({ ...formData, rating: v })} />
              {formData.rating > 0 && (
                <p className="text-teal-600 font-medium mt-2 text-sm">
                  {ratingLabels[formData.rating]}（{formData.rating}点）
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                コメント
                <span className="text-gray-400 font-normal ml-2">（任意・最大500文字）</span>
              </label>
              <textarea
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                rows={5}
                maxLength={500}
                placeholder="施術の感想、セラピストへのメッセージなどをご自由にお書きください"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              />
              <p className="text-right text-xs text-gray-400 mt-1">{formData.comment.length}/500</p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                id="is_public"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded"
              />
              <label htmlFor="is_public" className="text-sm text-gray-600 cursor-pointer">
                このレビューを公開する（セラピストのページに表示されます）
              </label>
            </div>
          </div>
        )}

        {/* Step 2: お客様情報 */}
        {step === 2 && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              お客様の情報はセラピストが施術の参考にするために使用します。すべて任意入力です。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">年齢層</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  value={formData.customer_age_range}
                  onChange={(e) => setFormData({ ...formData, customer_age_range: e.target.value })}
                >
                  <option value="">選択しない</option>
                  {AGE_RANGES.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">性別</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  value={formData.customer_gender}
                  onChange={(e) => setFormData({ ...formData, customer_gender: e.target.value })}
                >
                  <option value="">選択しない</option>
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">職業</label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="例: 会社員、主婦など"
                  maxLength={30}
                  value={formData.customer_occupation}
                  onChange={(e) => setFormData({ ...formData, customer_occupation: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                施術前の身体の悩み
                <span className="text-gray-400 font-normal ml-2">（複数選択可）</span>
              </label>
              <CheckboxGroup
                options={BODY_CONCERNS_OPTIONS}
                selected={formData.body_concerns}
                onChange={(v) => setFormData({ ...formData, body_concerns: v })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                NG事項・注意事項
                <span className="text-gray-400 font-normal ml-2">（複数選択可）</span>
              </label>
              <CheckboxGroup
                options={NG_ITEMS_OPTIONS}
                selected={formData.ng_items}
                onChange={(v) => setFormData({ ...formData, ng_items: v })}
              />
            </div>
          </div>
        )}

        {/* Step 3: 確認 */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-700 mb-4">以下の内容で投稿します</p>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 w-24 flex-shrink-0">総合評価</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className={`text-xl ${formData.rating >= s ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-medium">{ratingLabels[formData.rating]}</span>
              </div>

              {formData.comment && (
                <div>
                  <span className="text-sm text-gray-500">コメント</span>
                  <p className="text-sm text-gray-700 mt-1 bg-white rounded-lg p-3 border border-gray-100">
                    {formData.comment}
                  </p>
                </div>
              )}

              {(formData.customer_age_range || formData.customer_gender || formData.customer_occupation) && (
                <div className="flex flex-wrap gap-2">
                  {formData.customer_age_range && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{formData.customer_age_range}</span>
                  )}
                  {formData.customer_gender && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">{formData.customer_gender}</span>
                  )}
                  {formData.customer_occupation && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">{formData.customer_occupation}</span>
                  )}
                </div>
              )}

              {formData.body_concerns.length > 0 && (
                <div>
                  <span className="text-xs text-gray-500">身体の悩み</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.body_concerns.map((c) => (
                      <span key={c} className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {formData.ng_items.length > 0 && (
                <div>
                  <span className="text-xs text-gray-500">NG事項</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.ng_items.map((n) => (
                      <span key={n} className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">{n}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className={`w-2 h-2 rounded-full ${formData.is_public ? 'bg-green-400' : 'bg-gray-300'}`} />
                {formData.is_public ? '公開レビューとして投稿' : '非公開で投稿'}
              </div>
            </div>
          </div>
        )}

        {/* ナビゲーションボタン */}
        <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => (step > 1 ? setStep(step - 1) : onCancel?.())}
            className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {step > 1 ? '← 戻る' : 'キャンセル'}
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && formData.rating === 0) {
                  setError('評価（星）を選択してください')
                  return
                }
                setError(null)
                setStep(step + 1)
              }}
              className="px-6 py-2.5 text-sm font-semibold bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
            >
              次へ →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-semibold bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  送信中...
                </>
              ) : (
                'レビューを投稿する'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReviewForm
