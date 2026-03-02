import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  JapaneseYen, Download, CheckCircle, Clock, Calendar,
  FileText, AlertCircle, RefreshCw, CreditCard
} from 'lucide-react';

interface EarningRecord {
  id: string;
  booking_id: string;
  booking_price: number;
  therapist_amount: number;
  therapist_rate: number;
  status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED';
  booking_date: string;
  paid_at: string | null;
  service_name: string | null;
}

interface EarningsSummary {
  total_paid: number;
  total_pending: number;
  total_bookings: number;
}

const TherapistEarnings: React.FC = () => {
  const navigate = useNavigate();
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [summary, setSummary] = useState<EarningsSummary>({ total_paid: 0, total_pending: 0, total_bookings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [connectStatus, setConnectStatus] = useState<{ connected: boolean; status: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [earningsRes, connectRes] = await Promise.all([
        fetch('/api/payments/therapist/earnings', { headers }),
        fetch('/api/payments/connect-status', { headers }),
      ]);

      if (!earningsRes.ok) throw new Error('報酬データの取得に失敗しました');

      const earningsData = await earningsRes.json();
      setEarnings(earningsData.earnings || []);
      setSummary(earningsData.summary || { total_paid: 0, total_pending: 0, total_bookings: 0 });

      if (connectRes.ok) {
        const connectData = await connectRes.json();
        setConnectStatus(connectData);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status: EarningRecord['status']) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] font-black shadow-sm">
            振込完了
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-black border border-indigo-200">
            支払予約
          </span>
        );
      case 'PENDING':
        return (
          <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-black border border-amber-200">
            集計中
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-black">
            キャンセル
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-black">
            不明
          </span>
        );
    }
  };

  // 年度フィルタリング
  const filteredEarnings = earnings.filter((e) => {
    if (!e.booking_date) return true;
    return e.booking_date.startsWith(selectedYear);
  });

  const years = Array.from(
    new Set(earnings.map((e) => (e.booking_date ? e.booking_date.slice(0, 4) : null)).filter(Boolean))
  ).sort((a, b) => Number(b) - Number(a)) as string[];

  if (years.length === 0) years.push(new Date().getFullYear().toString());

  return (
    <div className="space-y-8 animate-fade-in text-gray-900 font-sans pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">報酬・支払元帳</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">
            Professional Financial Ledger
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-black outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}年度</option>
            ))}
          </select>
          <button
            onClick={fetchData}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-gray-200 transition-all"
          >
            <RefreshCw size={12} />
            更新
          </button>
        </div>
      </div>

      {/* Stripe Connect未設定の警告 */}
      {connectStatus && !connectStatus.connected && (
        <div className="mx-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
          <div className="flex-1">
            <p className="font-bold text-amber-800 text-sm">報酬受取設定が完了していません</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Stripe Connectの設定を完了すると、報酬の振込が開始されます。
            </p>
          </div>
          <button
            onClick={() => navigate('/t/settings/stripe')}
            className="flex items-center gap-1.5 bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors flex-shrink-0"
          >
            <CreditCard size={12} />
            設定する
          </button>
        </div>
      )}

      {/* エラー */}
      {error && (
        <div className="mx-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-medium">報酬データを読み込み中...</p>
        </div>
      ) : (
        <>
          {/* サマリー・メトリクス */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">未払報酬残高 (確定済)</p>
              <h3 className="text-3xl font-black text-gray-900">
                ¥{summary.total_pending.toLocaleString()}
              </h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">累計受取済</p>
              <h3 className="text-3xl font-black text-teal-600">
                ¥{summary.total_paid.toLocaleString()}
              </h3>
            </div>
            <div className="bg-indigo-900 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <JapaneseYen size={64} />
              </div>
              <p className="text-[10px] font-black text-indigo-300 uppercase mb-1">総セッション数</p>
              <h3 className="text-3xl font-black">{summary.total_bookings}件</h3>
            </div>
          </div>

          {/* 明細テーブル */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-sm font-black flex items-center gap-2 text-gray-700">
                <FileText size={16} /> 報酬明細一覧
              </h3>
              <span className="text-xs text-gray-400 font-medium">{filteredEarnings.length}件</span>
            </div>

            {filteredEarnings.length === 0 ? (
              <div className="py-16 text-center">
                <Calendar className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-gray-400 text-sm font-medium">
                  {selectedYear}年度の報酬データはありません
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">予約日</th>
                      <th className="px-6 py-4">サービス</th>
                      <th className="px-6 py-4">売上</th>
                      <th className="px-6 py-4">報酬率</th>
                      <th className="px-6 py-4 text-right">報酬額</th>
                      <th className="px-6 py-4 text-center">状況</th>
                      <th className="px-6 py-4">振込日</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs font-bold">
                    {filteredEarnings.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-gray-900 font-black">
                          {record.booking_date
                            ? new Date(record.booking_date).toLocaleDateString('ja-JP', {
                                month: 'short',
                                day: 'numeric',
                              })
                            : '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {record.service_name || '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-400 font-mono">
                          ¥{(record.booking_price || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {record.therapist_rate ? `${Math.round(record.therapist_rate * 100)}%` : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-black text-gray-900 font-mono">
                            ¥{(record.therapist_amount || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">{getStatusBadge(record.status)}</td>
                        <td className="px-6 py-4 text-gray-400">
                          {record.paid_at
                            ? new Date(record.paid_at).toLocaleDateString('ja-JP', {
                                month: 'short',
                                day: 'numeric',
                              })
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Stripe Connect 有効バナー */}
          {connectStatus?.status === 'active' && (
            <div className="mx-4 bg-teal-50 border border-teal-100 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-teal-600" size={20} />
                <div>
                  <p className="text-sm font-bold text-teal-800">Stripe Connect 有効</p>
                  <p className="text-xs text-teal-600">報酬の自動振込が設定されています</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/t/settings/stripe')}
                className="text-xs text-teal-600 font-bold hover:underline flex items-center gap-1"
              >
                設定を確認 →
              </button>
            </div>
          )}

          {/* 補足事項 */}
          <div className="px-6 py-8 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <h4 className="text-xs font-black text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={16} className="text-teal-600" /> 支払スケジュール・規定
            </h4>
            <div className="grid md:grid-cols-2 gap-8 text-[11px] text-gray-500 font-bold leading-relaxed">
              <div className="space-y-2">
                <p>・毎月月末締め、翌月10日払い（休日の場合は翌営業日）。</p>
                <p>・振込手数料は一律220円をセラピスト負担として差し引かせていただきます。</p>
              </div>
              <div className="space-y-2">
                <p>・報酬の受取にはStripe Connectの設定が必要です。</p>
                <p>・設定が完了していない場合、支払いが保留されます。</p>
              </div>
            </div>
          </div>

          {/* 年間支払証明書ダウンロード（将来実装） */}
          <div className="px-4">
            <button
              disabled
              className="flex items-center gap-2 bg-gray-100 text-gray-400 px-6 py-2 rounded-xl text-xs font-black cursor-not-allowed"
              title="準備中"
            >
              <Download size={14} /> 年間支払証明書(PDF) — 準備中
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TherapistEarnings;
