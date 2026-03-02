import React, { useState, useEffect } from 'react';
import { Users, Star, MapPin, ShieldCheck, RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface Therapist {
  id: string; user_id: string; name: string; email: string;
  rating: number; review_count: number; status: string;
  approved_areas: string; created_at: string; joined_at: string;
}

const OfficeTherapists: React.FC = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [officeId, setOfficeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
      const oid = offices[0].id; setOfficeId(oid);
      const r2 = await fetch(`/api/office-management/${oid}/therapists`, { headers: h });
      if (!r2.ok) throw new Error('セラピスト情報の取得に失敗しました');
      const j2 = await r2.json();
      setTherapists(j2.therapists || []);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'エラー'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const doAction = async (therapistId: string, action: 'approve' | 'reject') => {
    if (!officeId) return;
    if (action === 'reject' && !confirm('このセラピストを拒否しますか？')) return;
    setActionLoading(therapistId);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/office-management/${officeId}/therapists/${therapistId}/${action}`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('操作に失敗しました');
      await fetchData();
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'エラー'); }
    finally { setActionLoading(null); }
  };

  const badge = (s: string) => {
    if (s === 'ACTIVE') return <span className="bg-green-100 text-green-700 text-[9px] font-black px-2 py-0.5 rounded-full">稼働中</span>;
    if (s === 'PENDING') return <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-full">承認待ち</span>;
    if (s === 'SUSPENDED') return <span className="bg-red-100 text-red-700 text-[9px] font-black px-2 py-0.5 rounded-full">停止中</span>;
    return <span className="bg-gray-100 text-gray-500 text-[9px] font-black px-2 py-0.5 rounded-full">{s}</span>;
  };

  const activeCount = therapists.filter(t => t.status === 'ACTIVE').length;
  const pendingCount = therapists.filter(t => t.status === 'PENDING').length;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">所属セラピスト管理</h1>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Managed Talent Pool</p>
        </div>
        <div className="flex gap-3">
          {pendingCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl flex items-center gap-2">
              <span className="text-[10px] font-black text-amber-600 uppercase">承認待ち</span>
              <span className="text-xl font-black text-amber-600">{pendingCount}</span>
            </div>
          )}
          <div className="bg-white px-6 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <span className="text-[10px] font-black text-gray-400 uppercase">稼働中</span>
            <span className="text-xl font-black text-teal-600">{activeCount} / {therapists.length}</span>
          </div>
          <button onClick={fetchData} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-gray-200">
            <RefreshCw size={14} /> 更新
          </button>
        </div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3"><AlertCircle className="text-red-600" size={20} /><p className="text-sm text-red-700">{error}</p></div>}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-medium">データを読み込み中...</p>
        </div>
      ) : therapists.length === 0 ? (
        <div className="bg-white p-16 rounded-[48px] border border-gray-100 text-center">
          <Users className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 font-bold text-lg">所属セラピストがいません</p>
          <p className="text-gray-400 text-sm mt-2">セラピストが参加申請するとここに表示されます</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {therapists.map(t => (
            <div key={t.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 flex-1">
                <div className="relative">
                  <div className="w-20 h-20 rounded-[28px] bg-teal-50 flex items-center justify-center shadow-lg"><Users size={32} className="text-teal-600" /></div>
                  <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm"><ShieldCheck size={20} className="text-teal-600" /></div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2"><h3 className="text-xl font-black text-gray-900">{t.name}</h3>{badge(t.status)}</div>
                  <p className="text-xs text-gray-400">{t.email}</p>
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                    <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400 fill-current" /> {t.rating || 'N/A'} ({t.review_count || 0})</span>
                    {t.approved_areas && <span className="flex items-center gap-1"><MapPin size={14} /> {t.approved_areas}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {t.status === 'PENDING' && (
                  <>
                    <button onClick={() => doAction(t.id, 'approve')} disabled={actionLoading === t.id} className="bg-teal-600 text-white px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-teal-700 disabled:opacity-50"><CheckCircle size={14} /> 承認</button>
                    <button onClick={() => doAction(t.id, 'reject')} disabled={actionLoading === t.id} className="bg-red-50 text-red-600 border border-red-200 px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-red-100 disabled:opacity-50"><XCircle size={14} /> 拒否</button>
                  </>
                )}
                {t.status === 'ACTIVE' && (
                  <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-4 py-2 rounded-xl">参加日: {new Date(t.joined_at || t.created_at).toLocaleDateString('ja-JP')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OfficeTherapists;
