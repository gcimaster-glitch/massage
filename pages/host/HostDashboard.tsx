import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building, Zap, AlertCircle, Calendar,
  MapPin, RefreshCw, TrendingUp, Clock
} from 'lucide-react';

interface DashboardData {
  total_sites: number;
  active_sites: number;
  total_bookings_this_month: number;
  total_revenue_this_month: number;
  upcoming_bookings: Array<{
    id: string;
    scheduled_at: string;
    service_name: string;
    price: number;
    status: string;
    therapist_name: string;
    site_name: string;
  }>;
  sites: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    room_count: number;
  }>;
}

const HostDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/host/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('ダッシュボードデータの取得に失敗しました');
      const json = await res.json();
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': case 'CONFIRMED': return 'bg-green-100 text-green-700';
      case 'INACTIVE': return 'bg-gray-100 text-gray-500';
      case 'MAINTENANCE': case 'PENDING': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: '稼働中', INACTIVE: '停止中', MAINTENANCE: 'メンテナンス',
      CONFIRMED: '確定', PENDING: '保留中', COMPLETED: '完了', CANCELLED: 'キャンセル',
    };
    return map[status] || status;
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20 text-gray-900 font-sans px-4">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">拠点運営統括ボード</h1>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.3em] mt-2">Facility & Operations Management</p>
        </div>
        <div className="flex items-center gap-3">
          {data && (
            <div className="bg-teal-50 text-teal-700 px-8 py-4 rounded-3xl font-black text-xs shadow-sm border border-teal-100 flex items-center gap-3">
              <Zap size={16} className="text-teal-500" fill="currentColor" />
              今月の売上: <span className="text-lg font-black ml-1">¥{(data.total_revenue_this_month || 0).toLocaleString()}</span>
            </div>
          )}
          <button onClick={fetchDashboard} className="bg-gray-100 text-gray-700 px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-gray-200 transition-all">
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
      ) : data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">登録サイト数</p>
              <h3 className="text-4xl font-black text-gray-900">{data.total_sites}</h3>
              <p className="text-xs text-teal-600 font-bold mt-1">稼働中 {data.active_sites}件</p>
            </div>
            <div className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">今月の予約数</p>
              <h3 className="text-4xl font-black text-gray-900">{data.total_bookings_this_month}<span className="text-lg ml-1 opacity-30">件</span></h3>
            </div>
            <div className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">今月の売上</p>
              <h3 className="text-4xl font-black text-teal-600">¥{(data.total_revenue_this_month || 0).toLocaleString()}</h3>
            </div>
            <div className="bg-gray-900 text-white p-8 rounded-[48px] flex flex-col justify-center items-center gap-3 shadow-xl hover:bg-teal-600 transition-all cursor-pointer active:scale-95 group" onClick={() => navigate('/h/sites')}>
              <Building size={24} className="text-teal-400 group-hover:text-white" />
              <span className="text-[11px] font-black uppercase tracking-widest text-center">サイト管理</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center px-4 mb-2">
                <h2 className="text-xl font-black flex items-center gap-3 tracking-tight"><Building size={24} className="text-teal-600" /> 登録サイト一覧</h2>
                <button onClick={() => navigate('/h/sites')} className="text-xs font-black text-teal-600 hover:underline">全て管理 →</button>
              </div>
              {data.sites.length === 0 ? (
                <div className="bg-white p-10 rounded-[48px] border border-gray-100 text-center">
                  <Building className="mx-auto text-gray-300 mb-3" size={40} />
                  <p className="text-gray-400 text-sm font-medium">登録されたサイトはありません</p>
                  <button onClick={() => navigate('/h/sites')} className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-xl text-xs font-black hover:bg-teal-700">サイトを追加する</button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {data.sites.map((site) => (
                    <div key={site.id} className="bg-white p-8 rounded-[48px] border border-gray-100 flex items-center justify-between group hover:shadow-xl hover:border-teal-500/20 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-[20px] bg-teal-50 flex items-center justify-center">
                          <Building size={24} className="text-teal-600" />
                        </div>
                        <div>
                          <h4 className="font-black text-lg text-gray-900">{site.name}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${getStatusColor(site.status)}`}>{getStatusLabel(site.status)}</span>
                            <span className="text-xs text-gray-400">{site.type}</span>
                            <span className="text-xs text-gray-400">{site.room_count}室</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => navigate('/h/sites')} className="bg-gray-50 text-gray-400 px-6 py-3 rounded-[20px] text-[10px] font-black hover:bg-gray-900 hover:text-white transition-all uppercase tracking-widest">管理</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-black flex items-center gap-3 tracking-tight px-4"><Calendar size={24} className="text-indigo-600" /> 直近の予約</h2>
              {data.upcoming_bookings.length === 0 ? (
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 text-center">
                  <Clock className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-gray-400 text-sm font-medium">予定された予約はありません</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.upcoming_bookings.map((booking) => (
                    <div key={booking.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-black text-gray-900 text-sm">{booking.therapist_name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{booking.service_name}</p>
                          <p className="text-xs text-teal-600 font-bold mt-1">{formatDate(booking.scheduled_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-gray-900">¥{(booking.price || 0).toLocaleString()}</p>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${getStatusColor(booking.status)}`}>{getStatusLabel(booking.status)}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1"><MapPin size={10} /> {booking.site_name}</p>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => navigate('/h/earnings')} className="w-full py-6 bg-teal-600 text-white rounded-[32px] font-black text-sm shadow-xl shadow-teal-500/20 hover:bg-teal-700 transition-all flex items-center justify-center gap-3 active:scale-95">
                <TrendingUp size={18} /> 収益レポートを見る
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default HostDashboard;
