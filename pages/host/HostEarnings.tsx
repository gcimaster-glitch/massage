import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, AlertCircle, RefreshCw, JapaneseYen, Calendar } from 'lucide-react';

interface MonthlyStat {
  month: string;
  booking_count: number;
  total_revenue: number;
  host_earnings: number;
}

interface Summary {
  total_revenue: number;
  total_bookings: number;
  this_month_revenue: number;
  this_month_bookings: number;
  host_rate: number;
}

const HostEarnings: React.FC = () => {
  const [earnings, setEarnings] = useState<MonthlyStat[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEarnings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/host/earnings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('収益情報の取得に失敗しました');
      const json = await res.json();
      setEarnings(json.earnings || []);
      setSummary(json.summary || null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEarnings(); }, []);

  return (
    <div className="space-y-10 animate-fade-in pb-20 text-gray-900 font-sans px-4 pt-4">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <span className="inline-block bg-teal-50 text-teal-600 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.4em] mb-4 border border-teal-100">ホスト収益</span>
          <h1 className="text-4xl font-black tracking-tighter">収益レポート</h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] mt-1 text-[10px]">Host Revenue Report</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchEarnings} className="bg-white border-2 border-gray-100 text-gray-900 px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
            <RefreshCw size={14} /> 更新
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-medium">データを読み込み中...</p>
        </div>
      ) : (
        <>
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl opacity-50"></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><TrendingUp size={12}/> 今月の売上</p>
                <h3 className="text-5xl font-black text-gray-900 tracking-tighter">¥{(summary.this_month_revenue || 0).toLocaleString()}</h3>
                <p className="text-[9px] font-bold text-gray-400 mt-4 uppercase">{summary.this_month_bookings}件の予約</p>
              </div>
              <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-2xl transition-all duration-500">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">累計売上</p>
                <h3 className="text-5xl font-black text-teal-600 tracking-tighter">¥{(summary.total_revenue || 0).toLocaleString()}</h3>
                <p className="text-[9px] font-bold text-gray-400 mt-4 uppercase">総予約数: {summary.total_bookings}件</p>
              </div>
              <div className="bg-gray-900 p-10 rounded-[56px] shadow-2xl text-white relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><JapaneseYen size={80}/></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">ホスト収益率</p>
                <h3 className="text-5xl font-black tracking-tighter">{((summary.host_rate || 0.1) * 100).toFixed(0)}%</h3>
                <p className="text-[9px] font-bold text-gray-400 mt-4">売上の{((summary.host_rate || 0.1) * 100).toFixed(0)}%がホスト収益として計上されます</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <h2 className="font-black text-lg flex items-center gap-3"><Calendar size={20} className="text-teal-600" /> 月別収益</h2>
              <button className="bg-gray-50 text-gray-600 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-gray-100">
                <Download size={14} /> CSV
              </button>
            </div>
            {earnings.length === 0 ? (
              <div className="p-16 text-center">
                <TrendingUp className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-gray-400 text-sm font-medium">収益データがありません</p>
                <p className="text-gray-300 text-xs mt-1">予約が完了すると収益が記録されます</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">月</th>
                      <th className="text-right px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">予約数</th>
                      <th className="text-right px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">売上合計</th>
                      <th className="text-right px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">ホスト収益</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earnings.map((row) => (
                      <tr key={row.month} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-5 font-black text-gray-900">{row.month}</td>
                        <td className="px-8 py-5 text-right font-bold text-gray-600">{row.booking_count}件</td>
                        <td className="px-8 py-5 text-right font-black text-gray-900">¥{(row.total_revenue || 0).toLocaleString()}</td>
                        <td className="px-8 py-5 text-right font-black text-teal-600">¥{(row.host_earnings || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default HostEarnings;
