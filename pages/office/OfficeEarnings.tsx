import React, { useState, useEffect } from 'react';
import { JapaneseYen, Users, RefreshCw, AlertCircle, Download, CheckCircle, ArrowRightLeft } from 'lucide-react';

interface TherapistPayout {
  id: string; name: string; rate: number; amount: number; payout_status: 'UNPAID' | 'PAID';
}
interface EarningsData {
  total_revenue: number; royalty_amount: number; office_net: number;
  therapist_payouts: TherapistPayout[];
}

const OfficeEarnings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PAYOUT_EXEC' | 'DISTRIBUTION'>('OVERVIEW');
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [officeId, setOfficeId] = useState<string | null>(null);
  const [payoutDone, setPayoutDone] = useState(false);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const h = { Authorization: `Bearer ${token}` };
      const r1 = await fetch('/api/office-management/my-offices', { headers: h });
      if (!r1.ok) throw new Error('オフィス情報の取得に失敗しました');
      const j1 = await r1.json();
      const offices = j1.offices || [];
      if (!offices.length) { setLoading(false); return; }
      const office = offices[0]; setOfficeId(office.id);
      const r2 = await fetch(`/api/office-management/${office.id}/therapists`, { headers: h });
      const j2 = r2.ok ? await r2.json() : { therapists: [] };
      const therapists = j2.therapists || [];
      const totalRevenue = office.this_month_revenue || 0;
      const royaltyAmount = Math.floor(totalRevenue * 0.15);
      const officeNet = totalRevenue - royaltyAmount;
      const payouts: TherapistPayout[] = therapists.map((t: { id: string; name: string }) => ({
        id: t.id, name: t.name, rate: 60,
        amount: Math.floor(officeNet * 0.6 / Math.max(therapists.length, 1)),
        payout_status: 'UNPAID',
      }));
      setData({ total_revenue: totalRevenue, royalty_amount: royaltyAmount, office_net: officeNet, therapist_payouts: payouts });
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'エラー'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleExecutePayout = async () => {
    if (!confirm('所属セラピスト全員への振込確定データを生成しますか？')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/office-management/execute-payout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ office_id: officeId }),
      });
      if (res.ok) {
        setPayoutDone(true);
        setData(prev => prev ? { ...prev, therapist_payouts: prev.therapist_payouts.map(t => ({ ...t, payout_status: 'PAID' as const })) } : prev);
        alert('振込用データが生成されました。');
      } else {
        const j = await res.json();
        alert(j.error || '振込処理に失敗しました');
      }
    } catch { alert('振込処理に失敗しました'); }
  };

  const StatCard: React.FC<{ label: string; val: string; color: string; icon: React.ReactNode }> = ({ label, val, color, icon }) => (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-xl transition-all">
      <div className={`w-12 h-12 bg-gray-50 ${color} rounded-2xl flex items-center justify-center mb-6`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-3xl font-black ${color} tracking-tighter`}>{val}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-24 animate-fade-in text-gray-900 font-sans">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">収益管理・二次分配設定</h1>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.2em] mt-1">Agency Settlement Engine</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 p-1.5 bg-gray-100 rounded-3xl">
            {(['OVERVIEW', 'PAYOUT_EXEC', 'DISTRIBUTION'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                {tab === 'OVERVIEW' ? '本部実績' : tab === 'PAYOUT_EXEC' ? 'セラピストへ支払' : '配分ルール'}
              </button>
            ))}
          </div>
          <button onClick={fetchData} className="bg-gray-100 text-gray-700 px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-gray-200"><RefreshCw size={14} /></button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3"><AlertCircle className="text-red-600" size={20} /><p className="text-sm text-red-700">{error}</p></div>}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">データを読み込み中...</p>
        </div>
      ) : !data ? (
        <div className="bg-white p-16 rounded-[48px] border border-gray-100 text-center"><p className="text-gray-400">オフィスデータがありません</p></div>
      ) : (
        <>
          {activeTab === 'OVERVIEW' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="当月本部受託決済総額" val={`¥${data.total_revenue.toLocaleString()}`} color="text-teal-600" icon={<JapaneseYen size={24} />} />
              <StatCard label="本部ロイヤリティ(15%)" val={`- ¥${data.royalty_amount.toLocaleString()}`} color="text-red-500" icon={<ArrowRightLeft size={24} />} />
              <StatCard label="オフィス受取確定額" val={`¥${data.office_net.toLocaleString()}`} color="text-indigo-600" icon={<CheckCircle size={24} />} />
            </div>
          )}

          {activeTab === 'PAYOUT_EXEC' && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                <h3 className="font-black text-xl mb-6 flex items-center gap-3"><Users size={20} className="text-teal-600" /> セラピスト別支払金額</h3>
                {data.therapist_payouts.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">所属セラピストがいません</p>
                ) : (
                  <div className="space-y-3">
                    {data.therapist_payouts.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center"><Users size={16} className="text-teal-600" /></div>
                          <div>
                            <p className="font-black text-gray-900">{t.name}</p>
                            <p className="text-xs text-gray-400">配分率: {t.rate}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-black text-gray-900">¥{t.amount.toLocaleString()}</p>
                          <span className={`text-[9px] font-black px-2 py-1 rounded-full ${t.payout_status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {t.payout_status === 'PAID' ? '支払済' : '未払い'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <button onClick={handleExecutePayout} disabled={payoutDone} className="flex-1 py-5 bg-teal-600 text-white rounded-[28px] font-black text-sm shadow-xl shadow-teal-500/20 hover:bg-teal-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                  <CheckCircle size={18} /> {payoutDone ? '振込完了' : '振込確定データを生成'}
                </button>
                <button className="px-8 py-5 bg-gray-100 text-gray-700 rounded-[28px] font-black text-sm hover:bg-gray-200 transition-all flex items-center gap-3">
                  <Download size={18} /> CSV出力
                </button>
              </div>
            </div>
          )}

          {activeTab === 'DISTRIBUTION' && (
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
              <h3 className="font-black text-xl mb-6">配分ルール設定</h3>
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-gray-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">本部ロイヤリティ率</p>
                  <p className="text-3xl font-black text-red-500">15%</p>
                  <p className="text-xs text-gray-400 mt-2">HOGUSYプラットフォーム手数料（固定）</p>
                </div>
                <div className="p-6 rounded-2xl bg-gray-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">セラピストへの標準配分率</p>
                  <div className="flex items-center justify-between">
                    <p className="text-3xl font-black text-indigo-600">60%</p>
                    <button className="text-[10px] font-black text-teal-600 bg-teal-50 px-4 py-2 rounded-full border border-teal-100 hover:bg-teal-100 transition-all">変更申請</button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">オフィス純売上（本部手数料控除後）に対する比率</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                  <p className="text-xs font-bold text-amber-700">配分率の変更は管理者の承認が必要です。変更申請後、3営業日以内に反映されます。</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OfficeEarnings;
