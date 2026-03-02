import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, Check, X, AlertCircle, RefreshCw, Play } from 'lucide-react';
import SimpleLayout from '../../components/SimpleLayout';

interface Booking {
  id: string;
  user_name: string;
  user_phone?: string;
  scheduled_at: string;
  duration: number;
  site_address?: string;
  service_name?: string;
  price: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}

const TherapistSessionManagement: React.FC = () => {
  const navigate = useNavigate();
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);
  const [completedBookings, setCompletedBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'history'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const h = { Authorization: `Bearer ${token}` };
      const [pendingRes, confirmedRes, completedRes] = await Promise.all([
        fetch('/api/bookings?status=PENDING&limit=50', { headers: h }),
        fetch('/api/bookings?status=CONFIRMED&limit=50', { headers: h }),
        fetch('/api/bookings?status=COMPLETED&limit=50', { headers: h }),
      ]);
      const [pj, cj, hj] = await Promise.all([
        pendingRes.ok ? pendingRes.json() : { bookings: [] },
        confirmedRes.ok ? confirmedRes.json() : { bookings: [] },
        completedRes.ok ? completedRes.json() : { bookings: [] },
      ]);
      setPendingBookings(pj.bookings || []);
      setConfirmedBookings(cj.bookings || []);
      setCompletedBookings(hj.bookings || []);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'エラーが発生しました'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleApprove = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/bookings/${bookingId}/approve`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('承認に失敗しました');
      await fetchBookings();
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'エラー'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (bookingId: string) => {
    const reason = prompt('キャンセル理由を入力してください：');
    if (!reason) return;
    setActionLoading(bookingId);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/bookings/${bookingId}/reject`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error('却下に失敗しました');
      await fetchBookings();
    } catch (e: unknown) { alert(e instanceof Error ? e.message : 'エラー'); }
    finally { setActionLoading(null); }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; label: string }> = {
      PENDING: { bg: 'bg-yellow-100 text-yellow-800', label: '承認待ち' },
      CONFIRMED: { bg: 'bg-green-100 text-green-800', label: '確定' },
      COMPLETED: { bg: 'bg-blue-100 text-blue-800', label: '完了' },
      CANCELLED: { bg: 'bg-red-100 text-red-800', label: 'キャンセル' },
    };
    const s = map[status] || { bg: 'bg-gray-100 text-gray-600', label: status };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.bg}`}>{s.label}</span>;
  };

  const formatDate = (dt: string) => {
    const d = new Date(dt);
    return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  const BookingCard: React.FC<{ booking: Booking; showActions?: boolean }> = ({ booking, showActions }) => (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <User size={16} className="text-gray-400" />
          <span className="font-bold text-gray-900">{booking.user_name || '不明'}</span>
        </div>
        {getStatusBadge(booking.status)}
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-1"><Calendar size={14} className="text-teal-500" />{formatDate(booking.scheduled_at)}</div>
        <div className="flex items-center gap-1"><Clock size={14} className="text-teal-500" />{booking.duration}分</div>
        {booking.site_address && <div className="flex items-center gap-1 col-span-2"><MapPin size={14} className="text-teal-500" />{booking.site_address}</div>}
        {booking.service_name && <div className="col-span-2 text-xs text-gray-500">{booking.service_name}</div>}
      </div>
      <div className="flex justify-between items-center">
        <span className="font-black text-gray-900">¥{(booking.price || 0).toLocaleString()}</span>
        <div className="flex gap-2">
          {booking.status === 'CONFIRMED' && (
            <button onClick={() => navigate(`/t/active-session/${booking.id}`)} className="flex items-center gap-1 bg-teal-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-teal-700">
              <Play size={12} /> 開始
            </button>
          )}
          {showActions && booking.status === 'PENDING' && (
            <>
              <button onClick={() => handleApprove(booking.id)} disabled={actionLoading === booking.id} className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-700 disabled:opacity-50">
                <Check size={12} /> 承認
              </button>
              <button onClick={() => handleReject(booking.id)} disabled={actionLoading === booking.id} className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-100 disabled:opacity-50">
                <X size={12} /> 却下
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const currentBookings = activeTab === 'pending' ? pendingBookings : activeTab === 'confirmed' ? confirmedBookings : completedBookings;

  return (
    <SimpleLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Calendar className="text-teal-600" /> 予約管理</h1>
            <p className="text-gray-500 text-sm mt-1">セッションの承認・管理を行います</p>
          </div>
          <button onClick={fetchBookings} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-xl hover:bg-gray-200 font-bold">
            <RefreshCw size={14} /> 更新
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl mb-6">
          {([
            { key: 'pending', label: '承認待ち', count: pendingBookings.length },
            { key: 'confirmed', label: '確定済み', count: confirmedBookings.length },
            { key: 'history', label: '履歴', count: completedBookings.length },
          ] as const).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
              {tab.label}
              {tab.count > 0 && <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.key ? 'bg-teal-100 text-teal-700' : 'bg-gray-200 text-gray-500'}`}>{tab.count}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">読み込み中...</p>
          </div>
        ) : currentBookings.length === 0 ? (
          <div className="bg-white p-16 rounded-[32px] border border-gray-100 text-center">
            <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-bold">予約がありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentBookings.map(b => (
              <BookingCard key={b.id} booking={b} showActions={activeTab === 'pending'} />
            ))}
          </div>
        )}
      </div>
    </SimpleLayout>
  );
};

export default TherapistSessionManagement;
