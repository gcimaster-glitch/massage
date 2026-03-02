import React, { useState, useEffect } from 'react';
import { JapaneseYen, Download, TrendingUp, CreditCard, Users, RefreshCw, AlertCircle, Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MonthlyEarning {
  month: string;
  referral_count: number;
  total_commission: number;
  paid_amount: number;
  pending_amount: number;
}

interface Summary {
  total_earnings: number;
  total_referrals: number;
  commission_rate: number;
  status: string;
}

const AffiliateEarnings: React.FC = () => {
  const navigate = useNavigate();
  const [earnings, setEarnings] = useState<MonthlyEarning[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [dashboard, setDashboard] = useState<{ this_month_earnings: number; this_month_referrals: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [earningsRes, dashRes] = await Promise.all([
        fetch('/api/affiliate/earnings', { headers }),
        fetch('/api/affiliate/dashboard', { headers }),
      ]);

      if (!earningsRes.ok) throw new Error('収益情報の取得に失敗しました');
      const earningsJson = await earningsRes.json();
      setEarnings(earningsJson.earnings || []);
      setSummary(earningsJson.summary || null);

      if (dashRes.ok) {
        const dashJson = await dashRes.json();
        setDashboard({
          this_month_earnings: dashJson.this_month_earnings || 0,
          this_month_referrals: dashJson.this_month_referrals || 0,
        });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-10 animate-fade-in text-gray-900 font-sans pb-32 px-4 pt-4">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <span className="inline-block bg-purple-50 text-purple-600 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.4em] mb-4 border border-purple-100 shadow-sm">パートナー収益</span>
          <h1 className="text-4xl font-black tracking-tighter">報酬明細・振込管理</h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] mt-1 text-[10px]">Affiliate Revenue Ledger</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="bg-white border-2 border-gray-100 text-gray-900 px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
            <RefreshCw size={14} /> 更新
          </button>
          <button onClick={() => navigate('/a/settings')} className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-teal-600 transition-all shadow-xl active:scale-95">
            <CreditCard size={14} /> 口座設定の変更
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
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-medium">データを読み込み中...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform"></div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><TrendingUp size={12}/> 今月の報酬</p>
              <h3 className="text-5xl font-black text-gray-900 tracking-tighter">¥{(dashboard?.this_month_earnings || 0).toLocaleString()}</h3>
              <p className="text-[9px] font-bold text-gray-400 mt-4 uppercase">今月の紹介数: {dashboard?.this_month_referrals || 0}件</p>
            </div>
            <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-2xl transition-all duration-500">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">総累計獲得報酬</p>
              <h3 className="text-5xl font-black text-teal-600 tracking-tighter">¥{(summary?.total_earnings || 0).toLocaleString()}</h3>
              <button onClick={() => navigate('/a/referrals')} className="text-[9px] font-black text-teal-600 mt-6 uppercase tracking-widest flex items-center gap-1 hover:underline">成果ログを全件表示 <ChevronRight size={10}/></button>
            </div>
            <div className="bg-indigo-900 p-10 rounded-[56px] shadow-2xl text-white relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><JapaneseYen size={80}/></div>
              <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">コミッション率</p>
              <h3 className="text-5xl font-black tracking-tighter">{((summary?.commission_rate || 0.05) * 100).toFixed(0)}%</h3>
              <div className="flex items-center gap-2 mt-4">
                <Users size={14} className="text-indigo-300" />
                <p className="text-[9px] font-bold text-indigo-300">累計紹介数: {summary?.total_referrals || 0}件</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <h2 className="font-black text-lg flex items-center gap-3"><Calendar size={20} className="text-purple-600" /> 月別報酬</h2>
              <button className="bg-gray-50 text-gray-600 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-gray-100">
                <Download size={14} /> CSV
              </button>
            </div>
            {earnings.length === 0 ? (
              <div className="p-16 text-center">
                <TrendingUp className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-gray-400 text-sm font-medium">報酬データがありません</p>
                <p className="text-gray-300 text-xs mt-1">紹介が完了すると報酬が記録されます</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">月</th>
                      <th className="text-right px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">紹介数</th>
                      <th className="text-right px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">報酬合計</th>
                      <th className="text-right px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">支払済</th>
                      <th className="text-right px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">未払</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earnings.map((row) => (
                      <tr key={row.month} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-5 font-black text-gray-900">{row.month}</td>
                        <td className="px-8 py-5 text-right font-bold text-gray-600">{row.referral_count}件</td>
                        <td className="px-8 py-5 text-right font-black text-gray-900">¥{(row.total_commission || 0).toLocaleString()}</td>
                        <td className="px-8 py-5 text-right font-black text-teal-600">¥{(row.paid_amount || 0).toLocaleString()}</td>
                        <td className="px-8 py-5 text-right font-black text-orange-500">¥{(row.pending_amount || 0).toLocaleString()}</td>
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

export default AffiliateEarnings;
