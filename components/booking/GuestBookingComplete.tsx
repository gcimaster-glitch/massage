/**
 * GuestBookingComplete.tsx
 * ゲスト予約完了ページ
 * - 予約確定の確認表示
 * - 会員登録/ログイン促進UI（任意）
 * - 予約詳細の表示
 */
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

interface BookingDetail {
  id: string;
  therapist_name: string;
  therapist_avatar?: string;
  site_name?: string;
  site_address?: string;
  service_name: string;
  scheduled_at: string;
  duration: number;
  price: number;
  guest_name: string;
  guest_email: string;
  type: string;
  status: string;
}

const GuestBookingComplete: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const guestEmail = searchParams.get('email') || '';

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return;
      try {
        const res = await fetch(`/api/bookings/guest/${bookingId}`);
        if (!res.ok) throw new Error('予約情報の取得に失敗しました');
        const data = await res.json();
        setBooking(data.booking);
      } catch (e: any) {
        setError(e.message || '予約情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  const formatDateTime = (scheduledAt: string) => {
    try {
      const dt = new Date(scheduledAt);
      return dt.toLocaleString('ja-JP', {
        year: 'numeric', month: 'long', day: 'numeric',
        weekday: 'short', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return scheduledAt;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">予約情報を確認中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">エラーが発生しました</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all"
          >
            トップページへ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 完了ヘッダー */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">予約が完了しました</h1>
          <p className="text-gray-600">
            確認メールを <strong>{guestEmail || booking?.guest_email}</strong> に送信しました
          </p>
        </div>

        {/* 予約詳細 */}
        {booking && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">予約詳細</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                {booking.therapist_avatar && (
                  <img
                    src={booking.therapist_avatar}
                    alt={booking.therapist_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="text-xs text-gray-500">担当セラピスト</p>
                  <p className="font-bold text-gray-800">{booking.therapist_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-gray-500">メニュー</p>
                  <p className="font-semibold text-gray-800">{booking.service_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">所要時間</p>
                  <p className="font-semibold text-gray-800">{booking.duration}分</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">予約日時</p>
                  <p className="font-semibold text-gray-800">{formatDateTime(booking.scheduled_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">料金</p>
                  <p className="font-bold text-teal-600 text-lg">¥{booking.price.toLocaleString()}</p>
                </div>
                {booking.site_name && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">施術場所</p>
                    <p className="font-semibold text-gray-800">{booking.site_name}</p>
                    {booking.site_address && (
                      <p className="text-xs text-gray-500 mt-0.5">{booking.site_address}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mt-2">
                <p className="text-xs text-gray-500 mb-1">予約番号</p>
                <p className="font-mono text-xs text-gray-700 break-all">{booking.id}</p>
              </div>
            </div>
          </div>
        )}

        {/* 会員登録促進カード */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl shadow-xl p-6 mb-6 text-white">
          <h2 className="text-xl font-bold mb-2">会員登録でさらに便利に</h2>
          <ul className="text-sm space-y-1.5 mb-5 text-teal-100">
            <li className="flex items-center gap-2">
              <span>✓</span> 予約履歴の確認・管理
            </li>
            <li className="flex items-center gap-2">
              <span>✓</span> 簡単キャンセル・変更
            </li>
            <li className="flex items-center gap-2">
              <span>✓</span> ポイント獲得・特典利用
            </li>
            <li className="flex items-center gap-2">
              <span>✓</span> お気に入りセラピスト登録
            </li>
          </ul>
          <div className="flex gap-3">
            <a
              href={`/signup?email=${encodeURIComponent(guestEmail)}`}
              className="flex-1 bg-white text-teal-600 font-bold py-3 px-4 rounded-lg text-center hover:bg-teal-50 transition-colors text-sm"
            >
              無料で会員登録
            </a>
            <a
              href="/login"
              className="flex-1 bg-teal-700 text-white font-bold py-3 px-4 rounded-lg text-center hover:bg-teal-800 transition-colors text-sm border border-teal-400"
            >
              ログイン
            </a>
          </div>
          <p className="text-xs text-teal-200 mt-3 text-center">
            ※ 会員登録はいつでも可能です。今回の予約は確定しています。
          </p>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-white text-gray-700 font-bold py-3 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
          >
            トップページへ
          </button>
          <button
            onClick={() => navigate('/app/therapists')}
            className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg transition-all text-sm"
          >
            別のセラピストを探す
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestBookingComplete;
