import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Clock, Calendar, Phone, Mail, Building2, Home, User, CreditCard, Info, X, CheckCircle, AlertCircle, Loader, ChevronLeft, Download, DollarSign, Timer, Package } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

const BookingDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    const fetchBookingDetail = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/auth/login/user');
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/bookings/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setBooking(data);
        } else if (res.status === 404) {
          alert('予約が見つかりません');
          navigate('/app/bookings');
        } else {
          alert('予約情報の取得に失敗しました');
        }
      } catch (e) {
        console.error('Error fetching booking detail:', e);
        alert('予約情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookingDetail();
    }
  }, [id, navigate]);

  const handleCancel = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/auth/login/user');
      return;
    }

    try {
      setCancelling(true);
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'CANCELLED' })
      });

      if (res.ok) {
        alert('予約をキャンセルしました');
        setShowCancelModal(false);
        // Refresh booking data
        window.location.reload();
      } else {
        const errorData = await res.json();
        alert(`キャンセルに失敗しました: ${errorData.error || '不明なエラー'}`);
      }
    } catch (e) {
      console.error('Error cancelling booking:', e);
      alert('キャンセルに失敗しました');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader size={48} className="animate-spin text-teal-600 mx-auto" />
          <p className="text-gray-400 font-bold">予約詳細を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle size={48} className="text-red-500 mx-auto" />
          <p className="text-gray-400 font-bold">予約が見つかりません</p>
          <button
            onClick={() => navigate('/app/bookings')}
            className="bg-teal-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-teal-700 transition-all"
          >
            予約一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  const isPast = new Date(booking.scheduled_start || booking.scheduled_at) < new Date();
  const canCancel = !isPast && ['PENDING_PAYMENT', 'CONFIRMED'].includes(booking.status);

  return (
    <div className="min-h-screen pb-40 animate-fade-in font-sans">
      <div className="max-w-5xl mx-auto px-4 md:px-0 pt-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/app/bookings')}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold transition-all group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            予約一覧に戻る
          </button>
        </div>

        {/* Booking Header Card */}
        <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-[100px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${booking.type === 'MOBILE' ? 'bg-orange-500' : 'bg-white/20'}`}>
                    {booking.type === 'ONSITE' ? <Building2 size={24} /> : <Home size={24} />}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">予約番号</p>
                    <h3 className="text-2xl font-black tracking-tight">#{booking.id.slice(-8).toUpperCase()}</h3>
                  </div>
                </div>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <h1 className="text-4xl font-black tracking-tight">{booking.service_name}</h1>

            <div className="grid md:grid-cols-3 gap-6 pt-4">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="opacity-70" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">日時</p>
                  <p className="font-bold">{new Date(booking.scheduled_start || booking.scheduled_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={20} className="opacity-70" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">開始時刻</p>
                  <p className="font-bold">{new Date(booking.scheduled_start || booking.scheduled_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Timer size={20} className="opacity-70" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">所要時間</p>
                  <p className="font-bold">{booking.duration} 分</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Therapist Info */}
            <div className="bg-white rounded-[32px] p-8 shadow-lg border border-gray-100">
              <h2 className="text-lg font-black text-gray-900 tracking-tight mb-6 flex items-center gap-2">
                <User size={20} className="text-teal-600" />
                担当セラピスト
              </h2>
              <div className="flex items-center gap-6">
                <img
                  src={booking.therapist_avatar || '/default-avatar.jpg'}
                  alt={booking.therapist_name}
                  className="w-20 h-20 rounded-[24px] object-cover shadow-xl border-4 border-white"
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">{booking.therapist_name}</h3>
                  {booking.therapist_phone && (
                    <div className="flex items-center gap-2 text-gray-500 font-bold text-sm mt-2">
                      <Phone size={14} className="text-teal-500" />
                      {booking.therapist_phone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Location Info */}
            {booking.type === 'ONSITE' && booking.site_name && (
              <div className="bg-white rounded-[32px] p-8 shadow-lg border border-gray-100">
                <h2 className="text-lg font-black text-gray-900 tracking-tight mb-6 flex items-center gap-2">
                  <MapPin size={20} className="text-teal-600" />
                  施術場所
                </h2>
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-gray-900">{booking.site_name}</h3>
                  {booking.site_address && (
                    <p className="text-gray-600 font-bold flex items-start gap-2">
                      <MapPin size={16} className="text-teal-500 mt-1" />
                      {booking.site_address}
                    </p>
                  )}
                  {booking.site_phone && (
                    <p className="text-gray-600 font-bold flex items-center gap-2">
                      <Phone size={16} className="text-teal-500" />
                      {booking.site_phone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Service Info */}
            {booking.type === 'MOBILE' && booking.user_address && (
              <div className="bg-orange-50 rounded-[32px] p-8 shadow-lg border border-orange-100">
                <h2 className="text-lg font-black text-gray-900 tracking-tight mb-6 flex items-center gap-2">
                  <Home size={20} className="text-orange-600" />
                  訪問先住所
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-900 font-bold flex items-start gap-2">
                    <MapPin size={16} className="text-orange-500 mt-1" />
                    〒{booking.postal_code} {booking.user_address}
                  </p>
                  <div className="bg-white p-4 rounded-2xl">
                    <p className="text-xs text-gray-500 font-bold">
                      <Info size={14} className="inline mr-1" />
                      訪問時間の5分前にセラピストが到着予定です
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Service Details */}
            {booking.items && booking.items.length > 0 && (
              <div className="bg-white rounded-[32px] p-8 shadow-lg border border-gray-100">
                <h2 className="text-lg font-black text-gray-900 tracking-tight mb-6 flex items-center gap-2">
                  <Package size={20} className="text-teal-600" />
                  サービス内容
                </h2>
                <div className="space-y-4">
                  {booking.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${item.item_type === 'COURSE' ? 'bg-teal-100 text-teal-700' : 'bg-orange-100 text-orange-700'}`}>
                          {item.item_type === 'COURSE' ? 'C' : 'O'}
                        </div>
                        <div>
                          <p className="font-black text-gray-900">{item.item_name}</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.item_type === 'COURSE' ? 'コース' : 'オプション'}</p>
                        </div>
                      </div>
                      <p className="font-black text-gray-900">¥{item.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Payment Info */}
            <div className="bg-white rounded-[32px] p-8 shadow-lg border border-gray-100">
              <h2 className="text-lg font-black text-gray-900 tracking-tight mb-6 flex items-center gap-2">
                <CreditCard size={20} className="text-teal-600" />
                お支払い情報
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <span className="text-gray-600 font-bold text-sm">合計金額</span>
                  <span className="text-3xl font-black text-gray-900">¥{booking.price.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-bold text-sm">支払い状況</span>
                  <span className={`font-black text-xs uppercase tracking-widest px-3 py-1 rounded-full ${booking.payment_status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {booking.payment_status === 'PAID' ? '支払い済み' : booking.payment_status === 'PENDING' ? '未払い' : booking.payment_status || '不明'}
                  </span>
                </div>
                {booking.payment_intent_id && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">決済ID</p>
                    <p className="text-xs text-gray-600 font-mono break-all">{booking.payment_intent_id}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-[32px] p-8 shadow-lg border border-gray-100">
              <h2 className="text-lg font-black text-gray-900 tracking-tight mb-6">予約ステータス</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-teal-500" />
                  <div>
                    <p className="font-bold text-gray-900">予約作成</p>
                    <p className="text-xs text-gray-500">{new Date(booking.created_at).toLocaleString('ja-JP')}</p>
                  </div>
                </div>
                {booking.started_at && (
                  <div className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-blue-500" />
                    <div>
                      <p className="font-bold text-gray-900">施術開始</p>
                      <p className="text-xs text-gray-500">{new Date(booking.started_at).toLocaleString('ja-JP')}</p>
                    </div>
                  </div>
                )}
                {booking.completed_at && (
                  <div className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-500" />
                    <div>
                      <p className="font-bold text-gray-900">施術完了</p>
                      <p className="text-xs text-gray-500">{new Date(booking.completed_at).toLocaleString('ja-JP')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-200 px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95"
              >
                予約をキャンセル
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] p-10 max-w-md w-full shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">予約をキャンセル</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-600 font-bold mb-8">本当にこの予約をキャンセルしますか？この操作は取り消せません。</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-100 text-gray-900 px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all"
              >
                戻る
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 bg-red-600 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    処理中...
                  </>
                ) : (
                  'キャンセル確定'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetail;
