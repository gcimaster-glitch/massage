import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// ============================================================
// 型定義
// ============================================================
interface TransactionSplit {
  id: string
  booking_id: string | null
  recipient_user_id: string
  recipient_role: 'THERAPIST' | 'THERAPIST_OFFICE' | 'HOST' | 'PLATFORM' | 'PROMOTION'
  gross_amount: number
  rate: number
  net_amount: number
  status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED'
  created_at: string
  recipient_name?: string
  booking_date?: string
  service_name?: string
}

interface RevenueShareRule {
  id: string
  office_id: string | null
  therapist_id: string | null
  therapist_rate: number
  office_rate: number
  host_rate: number
  platform_rate: number
  promotion_rate: number
  priority: number
  is_active: boolean
  notes: string | null
}

interface FinanceSummary {
  total_revenue: number
  platform_earnings: number
  therapist_payouts: number
  office_payouts: number
  host_payouts: number
  pending_splits: number
  period_label: string
}

// ============================================================
// 管理者財務ダッシュボード
// ============================================================
export default function AdminFinanceDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'splits' | 'rules' | 'payouts'>('overview')
  const [summary, setSummary] = useState<FinanceSummary | null>(null)
  const [splits, setSplits] = useState<TransactionSplit[]>([])
  const [rules, setRules] = useState<RevenueShareRule[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'this_month' | 'last_month' | 'this_year'>('this_month')

  // 新規ルール作成フォーム
  const [showRuleForm, setShowRuleForm] = useState(false)
  const [ruleForm, setRuleForm] = useState({
    therapist_rate: 70,
    office_rate: 10,
    host_rate: 5,
    platform_rate: 10,
    promotion_rate: 5,
    notes: '',
  })
  const [ruleFormError, setRuleFormError] = useState('')

  const token = localStorage.getItem('auth_token')

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [splitsRes, rulesRes] = await Promise.all([
        fetch(`/api/revenue/splits?period=${period}&limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/revenue/rules', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (splitsRes.ok) {
        const data = await splitsRes.json()
        setSplits(data.splits || [])
        setSummary(data.summary || null)
      }
      if (rulesRes.ok) {
        const data = await rulesRes.json()
        setRules(data.rules || [])
      }
    } catch (e) {
      console.error('財務データの取得に失敗しました', e)
    } finally {
      setLoading(false)
    }
  }

  // 分配ルールの合計が100%かチェック
  const validateRuleForm = () => {
    const total =
      ruleForm.therapist_rate +
      ruleForm.office_rate +
      ruleForm.host_rate +
      ruleForm.platform_rate +
      ruleForm.promotion_rate
    if (total !== 100) {
      setRuleFormError(`合計が100%になるよう設定してください（現在: ${total}%）`)
      return false
    }
    setRuleFormError('')
    return true
  }

  const handleCreateRule = async () => {
    if (!validateRuleForm()) return
    try {
      const res = await fetch('/api/revenue/rules', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ruleForm),
      })
      if (res.ok) {
        setShowRuleForm(false)
        fetchData()
      } else {
        const err = await res.json()
        setRuleFormError(err.error || '作成に失敗しました')
      }
    } catch (e) {
      setRuleFormError('通信エラーが発生しました')
    }
  }

  const handleRunSettlement = async () => {
    if (!confirm('未確定の分配記録を一括確定しますか？')) return
    try {
      const res = await fetch('/api/revenue/settle', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ period }),
      })
      if (res.ok) {
        alert('精算処理が完了しました')
        fetchData()
      } else {
        const err = await res.json()
        alert(err.error || '精算処理に失敗しました')
      }
    } catch (e) {
      alert('通信エラーが発生しました')
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount)

  const roleLabel: Record<string, string> = {
    THERAPIST: 'セラピスト',
    OFFICE: 'オフィス',
    HOST: 'ホスト',
    PLATFORM: '本部',
    PROMOTION: '販促',
  }

  const statusLabel: Record<string, { label: string; color: string }> = {
    PENDING: { label: '未確定', color: 'bg-yellow-100 text-yellow-800' },
    CONFIRMED: { label: '確定済', color: 'bg-blue-100 text-blue-800' },
    PAID: { label: '支払済', color: 'bg-green-100 text-green-800' },
    CANCELLED: { label: 'キャンセル', color: 'bg-gray-100 text-gray-600' },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">財務管理ダッシュボード</h1>
            <p className="text-sm text-gray-500 mt-1">報酬分配・精算・支払明細の統合管理</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as typeof period)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="this_month">今月</option>
              <option value="last_month">先月</option>
              <option value="this_year">今年</option>
            </select>
            <button
              onClick={handleRunSettlement}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              一括精算実行
            </button>
          </div>
        </div>

        {/* タブ */}
        <div className="flex gap-1 mt-4">
          {[
            { key: 'overview', label: '概要' },
            { key: 'splits', label: '分配明細' },
            { key: 'rules', label: '分配ルール' },
            { key: 'payouts', label: '支払明細書' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                activeTab === tab.key
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : (
          <>
            {/* 概要タブ */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* KPIカード */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { label: '総売上', value: summary?.total_revenue ?? 0, color: 'text-gray-900' },
                    { label: '本部収益', value: summary?.platform_earnings ?? 0, color: 'text-indigo-600' },
                    { label: 'セラピスト支払', value: summary?.therapist_payouts ?? 0, color: 'text-green-600' },
                    { label: 'オフィス支払', value: summary?.office_payouts ?? 0, color: 'text-blue-600' },
                    { label: 'ホスト支払', value: summary?.host_payouts ?? 0, color: 'text-purple-600' },
                  ].map((kpi) => (
                    <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-4">
                      <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
                      <p className={`text-xl font-bold ${kpi.color}`}>
                        {formatCurrency(kpi.value)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* 未確定分配件数アラート */}
                {(summary?.pending_splits ?? 0) > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-yellow-800">
                        未確定の分配記録が {summary?.pending_splits} 件あります
                      </p>
                      <p className="text-sm text-yellow-600 mt-1">
                        「一括精算実行」ボタンで確定処理を行ってください
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('splits')}
                      className="text-yellow-700 text-sm font-medium underline"
                    >
                      明細を確認
                    </button>
                  </div>
                )}

                {/* 最近の分配記録（上位10件） */}
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">最近の分配記録</h2>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {splits.slice(0, 10).map((split) => (
                      <div key={split.id} className="px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {roleLabel[split.recipient_role]}
                          </span>
                          <span className="text-sm text-gray-700">
                            {split.recipient_name || split.recipient_user_id.slice(0, 8)}
                          </span>
                          {split.service_name && (
                            <span className="text-xs text-gray-400">{split.service_name}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(split.net_amount)}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              statusLabel[split.status]?.color
                            }`}
                          >
                            {statusLabel[split.status]?.label}
                          </span>
                        </div>
                      </div>
                    ))}
                    {splits.length === 0 && (
                      <p className="px-5 py-8 text-center text-gray-400 text-sm">
                        この期間の分配記録はありません
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 分配明細タブ */}
            {activeTab === 'splits' && (
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">分配明細一覧</h2>
                  <span className="text-sm text-gray-500">{splits.length} 件</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">日付</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">受取人</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">役割</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">サービス</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">総額</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">率</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">受取額</th>
                        <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">状態</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {splits.map((split) => (
                        <tr key={split.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-500">
                            {split.booking_date
                              ? new Date(split.booking_date).toLocaleDateString('ja-JP')
                              : new Date(split.created_at).toLocaleDateString('ja-JP')}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {split.recipient_name || split.recipient_user_id.slice(0, 8) + '...'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {roleLabel[split.recipient_role]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {split.service_name || '—'}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700">
                            {formatCurrency(split.gross_amount)}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-500">
                            {split.rate}%
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">
                            {formatCurrency(split.net_amount)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                statusLabel[split.status]?.color
                              }`}
                            >
                              {statusLabel[split.status]?.label}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {splits.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                            この期間の分配記録はありません
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 分配ルールタブ */}
            {activeTab === 'rules' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowRuleForm(!showRuleForm)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                  >
                    + 新規ルール作成
                  </button>
                </div>

                {/* 新規ルール作成フォーム */}
                {showRuleForm && (
                  <div className="bg-white rounded-xl border border-indigo-200 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">新規分配ルール</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      {[
                        { key: 'therapist_rate', label: 'セラピスト (%)' },
                        { key: 'office_rate', label: 'オフィス (%)' },
                        { key: 'host_rate', label: 'ホスト (%)' },
                        { key: 'platform_rate', label: '本部 (%)' },
                        { key: 'promotion_rate', label: '販促 (%)' },
                      ].map((field) => (
                        <div key={field.key}>
                          <label className="block text-xs text-gray-500 mb-1">{field.label}</label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={ruleForm[field.key as keyof typeof ruleForm]}
                            onChange={(e) =>
                              setRuleForm((prev) => ({
                                ...prev,
                                [field.key]: Number(e.target.value),
                              }))
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs text-gray-500 mb-1">備考</label>
                      <input
                        type="text"
                        value={ruleForm.notes}
                        onChange={(e) => setRuleForm((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="例: 新規オフィス向け特別ルール"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        {ruleFormError && (
                          <p className="text-red-600 text-sm">{ruleFormError}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          合計:{' '}
                          <span
                            className={
                              ruleForm.therapist_rate +
                                ruleForm.office_rate +
                                ruleForm.host_rate +
                                ruleForm.platform_rate +
                                ruleForm.promotion_rate ===
                              100
                                ? 'text-green-600 font-bold'
                                : 'text-red-600 font-bold'
                            }
                          >
                            {ruleForm.therapist_rate +
                              ruleForm.office_rate +
                              ruleForm.host_rate +
                              ruleForm.platform_rate +
                              ruleForm.promotion_rate}
                            %
                          </span>
                          （100%になるよう設定してください）
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowRuleForm(false)}
                          className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          キャンセル
                        </button>
                        <button
                          onClick={handleCreateRule}
                          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                          作成
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ルール一覧 */}
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">分配ルール一覧</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      優先度の高いルール（数値が大きい）が優先適用されます
                    </p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {rules.map((rule) => (
                      <div key={rule.id} className="px-5 py-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  rule.is_active
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {rule.is_active ? '有効' : '無効'}
                              </span>
                              <span className="text-xs text-gray-400">
                                優先度: {rule.priority}
                              </span>
                              {rule.office_id && (
                                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                                  オフィス専用
                                </span>
                              )}
                              {rule.therapist_id && (
                                <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded">
                                  セラピスト専用
                                </span>
                              )}
                              {!rule.office_id && !rule.therapist_id && (
                                <span className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded">
                                  デフォルト
                                </span>
                              )}
                            </div>
                            {rule.notes && (
                              <p className="text-sm text-gray-600 mb-3">{rule.notes}</p>
                            )}
                            <div className="flex gap-4">
                              {[
                                { label: 'セラピスト', value: rule.therapist_rate, color: 'text-green-600' },
                                { label: 'オフィス', value: rule.office_rate, color: 'text-blue-600' },
                                { label: 'ホスト', value: rule.host_rate, color: 'text-purple-600' },
                                { label: '本部', value: rule.platform_rate, color: 'text-indigo-600' },
                                { label: '販促', value: rule.promotion_rate, color: 'text-orange-600' },
                              ].map((item) => (
                                <div key={item.label} className="text-center">
                                  <p className={`text-lg font-bold ${item.color}`}>
                                    {item.value}%
                                  </p>
                                  <p className="text-xs text-gray-400">{item.label}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {rules.length === 0 && (
                      <p className="px-5 py-8 text-center text-gray-400 text-sm">
                        分配ルールが設定されていません
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 支払明細書タブ */}
            {activeTab === 'payouts' && (
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">支払明細書管理</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      セラピスト・オフィス・ホストへの支払明細書を管理します
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!confirm('この期間の支払明細書を一括生成しますか？')) return
                      const res = await fetch('/api/revenue/payout-statements/generate', {
                        method: 'POST',
                        headers: {
                          Authorization: `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ period }),
                      })
                      if (res.ok) {
                        alert('支払明細書を生成しました')
                        fetchData()
                      } else {
                        const err = await res.json()
                        alert(err.error || '生成に失敗しました')
                      }
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    明細書を一括生成
                  </button>
                </div>
                <div className="px-5 py-10 text-center text-gray-400">
                  <p className="text-sm">支払明細書の生成後、ここに一覧が表示されます</p>
                  <p className="text-xs mt-2">
                    「明細書を一括生成」ボタンで、確定済みの分配記録から支払明細書を自動生成します
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
