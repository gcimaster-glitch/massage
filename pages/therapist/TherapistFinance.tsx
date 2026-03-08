import { useState, useEffect } from 'react'

interface EarningSplit {
  id: string
  booking_id: string | null
  gross_amount: number
  rate: number
  amount: number // transaction_splitsのamount
  payout_status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED'
  created_at: string
  transaction_date?: string
  service_name?: string
  customer_name?: string
}

interface PayoutStatement {
  id: string
  period_start: string
  period_end: string
  statement_number: string
  total_amount: number
  deduction_amount: number
  net_amount: number
  status: 'DRAFT' | 'CONFIRMED' | 'PAID'
  pdf_url: string | null
  paid_at: string | null
}

interface Summary {
  pending_amount: number
  paid_amount: number
  pending_count: number
}

export default function TherapistFinance() {
  const [activeTab, setActiveTab] = useState<'overview' | 'splits' | 'statements'>('overview')
  const [summary, setSummary] = useState<Summary | null>(null)
  const [splits, setSplits] = useState<EarningSplit[]>([])
  const [statements, setStatements] = useState<PayoutStatement[]>([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('auth_token')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [splitsRes, statementsRes] = await Promise.all([
        fetch('/api/revenue/splits/my', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/revenue/payout-statements/my', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])
      if (splitsRes.ok) {
        const data = await splitsRes.json()
        setSplits(data.splits || [])
        setSummary(data.summary || null)
      }
      if (statementsRes.ok) {
        const data = await statementsRes.json()
        setStatements(data.statements || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount)

  const statusLabel: Record<string, { label: string; color: string }> = {
    PENDING: { label: '未確定', color: 'bg-yellow-100 text-yellow-800' },
    PROCESSING: { label: '処理中', color: 'bg-blue-100 text-blue-800' },
    PAID: { label: '支払済', color: 'bg-green-100 text-green-800' },
    FAILED: { label: '失敗', color: 'bg-red-100 text-red-700' },
    DRAFT: { label: '下書き', color: 'bg-gray-100 text-gray-600' },
    CONFIRMED: { label: '確定済', color: 'bg-blue-100 text-blue-800' },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">収益管理</h1>
            <p className="text-sm text-gray-500 mt-1">施術報酬の明細と支払明細書</p>
          </div>

        </div>
        <div className="flex gap-1 mt-4">
          {[
            { key: 'overview', label: '概要' },
            { key: 'splits', label: '収益明細' },
            { key: 'statements', label: '支払明細書' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                activeTab === tab.key
                  ? 'bg-green-50 text-green-700'
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: '未払い残高', value: summary?.pending_amount ?? 0, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    { label: '支払済合計', value: summary?.paid_amount ?? 0, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: '未払い件数', value: summary?.pending_count ?? 0, color: 'text-gray-900', bg: 'bg-white', isCount: true },
                  ].map((kpi) => (
                    <div key={kpi.label} className={`${kpi.bg} rounded-xl border border-gray-200 p-4`}>
                      <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
                      <p className={`text-xl font-bold ${kpi.color}`}>
                        {(kpi as { isCount?: boolean }).isCount ? `${kpi.value} 件` : formatCurrency(kpi.value as number)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-900 mb-2">報酬の仕組み</h3>
                  <p className="text-sm text-gray-600">
                    お客様がお支払いいただいた施術料金の <span className="font-bold text-green-600">70%</span> がセラピスト報酬として自動計算されます。
                    施術完了後、HOGUSYシステムが自動的に収益明細に記録します。
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">最近の収益明細</h2>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {splits.slice(0, 8).map((split) => (
                      <div key={split.id} className="px-5 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{split.service_name || '施術'}</p>
                          <p className="text-xs text-gray-400">
                            {split.transaction_date
                              ? new Date(split.transaction_date).toLocaleDateString('ja-JP')
                              : new Date(split.created_at).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{formatCurrency(split.amount)}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusLabel[split.payout_status]?.color}`}>
                            {statusLabel[split.payout_status]?.label}
                          </span>
                        </div>
                      </div>
                    ))}
                    {splits.length === 0 && (
                      <p className="px-5 py-8 text-center text-gray-400 text-sm">収益明細はまだありません</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'splits' && (
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">収益明細一覧</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">日付</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">サービス</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">施術料金</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">報酬率</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">報酬額</th>
                        <th className="text-center px-4 py-3 text-xs font-medium text-gray-500">状態</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {splits.map((split) => (
                        <tr key={split.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-500">
                            {split.transaction_date
                              ? new Date(split.transaction_date).toLocaleDateString('ja-JP')
                              : new Date(split.created_at).toLocaleDateString('ja-JP')}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">{split.service_name || '施術'}</td>
                          <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(split.gross_amount)}</td>
                          <td className="px-4 py-3 text-right text-gray-500">{split.rate}%</td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(split.amount)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusLabel[split.payout_status]?.color}`}>
                              {statusLabel[split.payout_status]?.label}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {splits.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-gray-400">この期間の収益明細はありません</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'statements' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-800">
                    支払明細書は毎月末にHOGUSY本部が生成します。確定後、PDFでダウンロードできます。
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">支払明細書一覧</h2>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {statements.map((stmt) => (
                      <div key={stmt.id} className="px-5 py-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{stmt.statement_number}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(stmt.period_start).toLocaleDateString('ja-JP')} 〜{' '}
                            {new Date(stmt.period_end).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatCurrency(stmt.net_amount)}</p>
                            <p className="text-xs text-gray-400">
                              総額 {formatCurrency(stmt.total_amount)}
                              {stmt.deduction_amount > 0 && ` − 控除 ${formatCurrency(stmt.deduction_amount)}`}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusLabel[stmt.status]?.color}`}>
                            {statusLabel[stmt.status]?.label}
                          </span>
                          {stmt.pdf_url && (
                            <a href={stmt.pdf_url} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 hover:underline">
                              PDF
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                    {statements.length === 0 && (
                      <p className="px-5 py-8 text-center text-gray-400 text-sm">支払明細書はまだありません</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
