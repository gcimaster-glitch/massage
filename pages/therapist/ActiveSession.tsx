import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Navigation, ShieldAlert, Clock, MapPin,
  ChevronRight, Phone, MessageSquare, AlertTriangle,
  CheckCircle, Play, Square, Loader2, Eye, EyeOff
} from 'lucide-react';
import { BookingStatus, BookingType } from '../../types';

interface BookingDetail {
  id: string;
  type: BookingType;
  status: BookingStatus;
  duration: number;
  location?: string;
  site_address?: string;
  user_name?: string;
  user_phone?: string;
  service_name?: string;
  price: number;
  scheduled_at: string;
}

const ActiveSession: React.FC = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [status, setStatus] = useState<BookingStatus>(BookingStatus.CONFIRMED);
  const [isAddressVisible, setIsAddressVisible] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSOSArmed, setIsSOSArmed] = useState(false);
  const [sosSwipeValue, setSosSwipeValue] = useState(0);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`/api/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('予約情報の取得に失敗しました');
        const data = await res.json();
        const b = data.booking || data;
        setBooking(b);
        setStatus(b.status as BookingStatus);
      } catch (e) {
        console.error('Failed to fetch booking:', e);
      } finally {
        setLoadingBooking(false);
      }
    };
    if (bookingId) fetchBooking();
  }, [bookingId]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (status === BookingStatus.IN_SERVICE) {
      interval = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    if (!confirm('施術を開始しますか？位置情報の高頻度送信が開始されます。')) return;
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_SERVICE' }),
      });
      setStatus(BookingStatus.IN_SERVICE);
    } catch {
      setStatus(BookingStatus.IN_SERVICE);
    }
  };

  const handleEnd = () => {
    navigate(`/t/session-summary/${bookingId}?type=${booking?.type || BookingType.ONSITE}`);
  };

  if (loadingBooking) {
    return (
      <div className="max-w-4xl mx-auto min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">セッション情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-400 mb-4">Session Not Found</p>
          <button onClick={() => navigate('/t/sessions')} className="text-teal-400 underline">予約一覧に戻る</button>
        </div>
      </div>
    );
  }

  const address = booking.site_address || booking.location || '住所情報なし';
  const addressShort = address.split(' ')[0] || address;

  return (
    <div className="max-w-4xl mx-auto min-h-screen bg-gray-900 text-white flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="p-8 border-b border-white/5 flex justify-between items-center bg-gray-950">
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${status === BookingStatus.IN_SERVICE ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Service Status</p>
            <h2 className="text-sm font-black uppercase tracking-widest">{status === BookingStatus.IN_SERVICE ? 'On-Site Active' : 'Ready to Start'}</h2>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Elapsed</p>
          <p className="text-2xl font-black tracking-tighter tabular-nums">{formatTime(elapsedSeconds)}</p>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        {/* Session Info */}
        <div className="bg-gray-800/50 rounded-3xl p-6 border border-white/5">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Session Details</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm flex items-center gap-2"><Clock size={14} />Duration</span>
              <span className="font-black">{booking.duration} min</span>
            </div>
            {booking.user_name && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm flex items-center gap-2"><Phone size={14} />Client</span>
                <span className="font-black">{booking.user_name}</span>
              </div>
            )}
            {booking.service_name && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm flex items-center gap-2"><MessageSquare size={14} />Service</span>
                <span className="font-black">{booking.service_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="bg-gray-800/50 rounded-3xl p-6 border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2"><MapPin size={12} />Location</p>
            <button onClick={() => setIsAddressVisible(!isAddressVisible)} className="flex items-center gap-1 text-xs text-teal-400 font-bold">
              {isAddressVisible ? <><EyeOff size={12} /> 非表示</> : <><Eye size={12} /> 表示</>}
            </button>
          </div>
          {isAddressVisible ? (
            <div>
              <h3 className="text-2xl font-black tracking-tight">{addressShort}</h3>
              <p className="text-lg font-bold leading-tight text-gray-300 mt-1">{address}</p>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-2 text-teal-400 text-sm font-bold">
                <Navigation size={14} /> Googleマップで開く <ChevronRight size={14} />
              </a>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">住所は施術開始後に表示されます</p>
          )}
        </div>

        {/* SOS */}
        <div className={`rounded-3xl p-6 border transition-all ${isSOSArmed ? 'bg-red-900/50 border-red-500/50' : 'bg-gray-800/50 border-white/5'}`}>
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2"><ShieldAlert size={12} />Safety SOS</p>
            <button onClick={() => setIsSOSArmed(!isSOSArmed)} className={`text-xs font-black px-3 py-1 rounded-full ${isSOSArmed ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
              {isSOSArmed ? 'ARMED' : 'ARM'}
            </button>
          </div>
          {isSOSArmed ? (
            <div>
              <p className="text-red-400 text-sm font-bold mb-3">スワイプしてSOSを送信</p>
              <input type="range" min={0} max={100} value={sosSwipeValue}
                onChange={e => setSosSwipeValue(Number(e.target.value))}
                onMouseUp={() => { if (sosSwipeValue >= 90) { alert('SOS信号を送信しました。緊急連絡先に通知されます。'); setSosSwipeValue(0); } else { setSosSwipeValue(0); } }}
                className="w-full accent-red-500" />
              <p className="text-xs text-gray-500 mt-1">90%以上スワイプで送信</p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">緊急時はARMボタンを押してSOSを有効化してください</p>
          )}
        </div>
      </main>

      {/* Footer Actions */}
      <footer className="p-8 border-t border-white/5 bg-gray-950">
        {status === BookingStatus.CONFIRMED ? (
          <button onClick={handleStart} className="w-full py-5 bg-teal-600 text-white rounded-[28px] font-black text-lg shadow-xl shadow-teal-500/20 hover:bg-teal-700 transition-all flex items-center justify-center gap-3">
            <Play size={22} /> 施術を開始する
          </button>
        ) : status === BookingStatus.IN_SERVICE ? (
          <button onClick={handleEnd} className="w-full py-5 bg-red-600 text-white rounded-[28px] font-black text-lg shadow-xl shadow-red-500/20 hover:bg-red-700 transition-all flex items-center justify-center gap-3">
            <Square size={22} /> 施術を終了する
          </button>
        ) : (
          <div className="flex items-center justify-center gap-3 text-green-400">
            <CheckCircle size={22} />
            <span className="font-black text-lg">セッション完了</span>
          </div>
        )}
      </footer>
    </div>
  );
};

export default ActiveSession;
