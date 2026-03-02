import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, JapaneseYen, Activity, RefreshCw, AlertCircle, Calendar, ChevronRight } from 'lucide-react';

interface Therapist { id: string; name: string; status: string; rating: number; review_count: number; }
interface Booking { id: string; therapist_name: string; service_name: string; scheduled_at: string; price: number; status: string; }
interface DashboardData {
  office_name: string; total_therapists: number; active_therapists: number; pending_therapists: number;
  this_month_revenue: number; this_month_bookings: number;
  recent_bookings: Booking[]; therapists: Therapist[];
}

const StatCard: React.FC<{ label: string; val: string; icon: React.ReactNode; color: string; bg: string }> = ({ label, val, icon, color, bg }) => (
  <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-xl transition-all">
    <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner`}>{icon}</div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-black ${color} tracking-tighter`}>{val}</p>
    </div>
  </div>
);

const OfficeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const h = { Authorization: `Bearer ${token}` };
      const r1 = await fetch('/api/office-management/my-offices', { headers: h });
      if (!r1.ok) throw new Error('オフィス情報の取得に失敗しました');
      const j1 = await r1.json();
      const offices = j1.offices || [];
      if (!offices.length) { setData(null); setLoading(false); return; }
      const office = offices[0];
      const r2 = await fetch(`/api/office-management/${office.id}/therapists`, { headers: h });
      const j2 = r2.ok ? await r2.json() : { therapists: [] };
      const therapists = j2.therapists || [];
      setData({
        office_name: office.name || 'オフィス',
        total_therapists: therapists.length,
        active_therapists: therapists.filter((t: Therapist) => t.status === 'ACTIVE').length,
        pending_therapists: therapists.filter((t: Therapist) => t.status === 'PENDING').length,
        this_month_revenue: office.this_month_revenue || 0,
        this_month_bookings: office.this_month_bookings || 0,
        recent_bookings: office.recent_bookings || [],
        therapists: therapists.slice(0, 5),
      });
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'エラー'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const sc = (s: string) => {
    if (s === 'ACTIVE' || s === 'CONFIRMED') return 'bg-green-100 text-green-700';
    if (s === 'PENDING') return 'bg-amber-100 text-amber-700';
    if (s === 'CANCELLED') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-500';
  };
  const sl = (s: string) => ({ ACTIVE: '稼働中', PENDING: '承認待ち', SUSPENDED: '停止中', CONFIRMED: '確定', CANCELLED: 'キャンセル', COMPLETED: '完了' }[s] || s);

  return (
    <div className="space-y-10 animate-fade-in pb-20 text-gray-900 font-sans">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">{data ? data.office_name : 'オフィス管理ボード'}</h1>
          <p className="text-gray-400 text-sm font-bold mt-1 uppercase tracking-[0.2em]">Office Management Dashboard</p>
        </div>
        <div className="flex gap-3">
          {data && <div className="bg-teal-600 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg shadow-teal-500/20">今月の売上: ¥{(data.this_month_revenue || 0).toLocaleString()}</div>}
          <button onClick={fetchDashboard} className="bg-gray-100 text-gray-700 px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-gray-200"><RefreshCw size={14} /> 更新</button>
        </div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3"><AlertCircle className="text-red-600 flex-shrink-0" size={20} /><p className="text-sm text-red-700">{error}</p></div>}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-medium">データを読み込み中...</p>
        </div>
      ) : !data ? (
        <div className="bg-white p-16 rounded-[48px] border border-gray-100 text-center">
          <Users className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 font-bold text-lg">オフィスが登録されていません</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="所属セラピスト" val={`${data.total_therapists}名`} icon={<Users size={24} />} color="text-indigo-600" bg="bg-indigo-50" />
            <StatCard label="今月の売上" val={`¥${(data.this_month_revenue || 0).toLocaleString()}`} icon={<JapaneseYen size={24} />} color="text-teal-600" bg="bg-teal-50" />
            <StatCard label="今月の予約数" val={`${data.this_month_bookings}件`} icon={<Activity size={24} />} color="text-orange-600" bg="bg-orange-50" />
          </div>
          {data.pending_therapists > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3"><AlertCircle className="text-amber-600" size={20} /><p className="text-sm font-bold text-amber-700">承認待ちのセラピストが{data.pending_therapists}名います</p></div>
              <button onClick={() => navigate('/o/therapists')} className="text-xs font-black text-amber-700 bg-amber-100 px-4 py-2 rounded-xl hover:bg-amber-200 flex items-center gap-1">確認する <ChevronRight size={14} /></button>
            </div>
          )}
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black flex items-center gap-3"><Users size={20} className="text-indigo-600" /> 所属セラピスト</h2>
                <button onClick={() => navigate('/o/therapists')} className="text-xs font-black text-teal-600 hover:underline">全員を管理 →</button>
              </div>
              {data.therapists.length === 0 ? (
                <div className="bg-white p-10 rounded-[40px] border border-gray-100 text-center"><p className="text-gray-400 text-sm">所属セラピストがいません</p></div>
              ) : data.therapists.map(t => (
                <div key={t.id} className="bg-white p-5 rounded-[28px] border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[16px] bg-teal-50 flex items-center justify-center"><Users size={20} className="text-teal-600" /></div>
                    <div>
                      <p className="font-black text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">⭐ {t.rating || 'N/A'} ({t.review_count || 0}件)</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-1 rounded-full ${sc(t.status)}`}>{sl(t.status)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-black flex items-center gap-3"><Calendar size={20} className="text-teal-600" /> 直近の予約</h2>
              {data.recent_bookings.length === 0 ? (
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 text-center"><p className="text-gray-400 text-sm">予約データがありません</p></div>
              ) : data.recent_bookings.map(b => (
                <div key={b.id} className="bg-white p-5 rounded-[28px] border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-black text-sm text-gray-900">{b.therapist_name}</p>
                      <p className="text-xs text-gray-500">{b.service_name}</p>
                      <p className="text-xs text-teal-600 font-bold mt-1">{new Date(b.scheduled_at).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900">¥{(b.price || 0).toLocaleString()}</p>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${sc(b.status)}`}>{sl(b.status)}</span>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => navigate('/o/earnings')} className="w-full py-5 bg-teal-600 text-white rounded-[28px] font-black text-sm shadow-xl shadow-teal-500/20 hover:bg-teal-700 transition-all flex items-center justify-center gap-3">
                <JapaneseYen size={18} /> 収益管理を開く
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OfficeDashboard;
