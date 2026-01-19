import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BookingCompleteV2: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings/guest/${bookingId}`);
        
        if (response.ok) {
          const data = await response.json();
          setBooking(data.booking || data);
        }
      } catch (err) {
        console.error('予約情報取得エラー:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            予約が完了しました！
          </h1>
          
          <p className="text-lg text-gray-600">
            ご予約ありがとうございます
          </p>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-4 border-b-2 border-teal-100">
            予約内容
          </h2>
          
          {booking ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">予約ID</span>
                <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                  {booking.id}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">サービス</span>
                <span className="font-semibold text-gray-800">{booking.service_name}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">日時</span>
                <span className="font-semibold text-gray-800">
                  {new Date(booking.scheduled_start || booking.scheduled_at).toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">所要時間</span>
                <span className="font-semibold text-gray-800">{booking.duration}分</span>
              </div>
              
              <div className="flex justify-between items-center py-4 bg-gradient-to-r from-teal-50 to-blue-50 px-4 rounded-lg mt-4">
                <span className="text-xl font-bold text-gray-800">合計金額</span>
                <span className="text-3xl font-bold text-teal-600">
                  ¥{parseInt(booking.price || booking.total_price || 0).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-6">予約情報を読み込めませんでした</p>
          )}
        </div>

        {/* Confirmation Email Notice */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-500 mr-3 mt-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <div>
              <h3 className="font-bold text-blue-900 mb-2">確認メールを送信しました</h3>
              <p className="text-sm text-blue-800">
                {booking?.user_email || booking?.customer_email || 'ご登録のメールアドレス'}宛に予約確認メールを送信しました。
                メールが届かない場合は、迷惑メールフォルダをご確認ください。
              </p>
            </div>
          </div>
        </div>

        {/* Member Registration Promotion */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            会員登録でもっと便利に！
          </h3>
          <ul className="text-sm text-gray-700 space-y-2 mb-4">
            <li className="flex items-center">
              <svg className="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              予約履歴の確認
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              お気に入りセラピスト登録
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              次回以降の予約がスムーズ
            </li>
          </ul>
          <button
            onClick={() => {
              // 予約情報を引き継いで会員登録ページへ
              const params = new URLSearchParams({
                name: booking?.user_name || '',
                email: booking?.user_email || '',
                phone: booking?.user_phone || '',
                bookingId: bookingId || ''
              });
              navigate(`/auth/signup/user?${params.toString()}`);
            }}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all"
          >
            会員登録する（無料）
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-white text-gray-700 font-bold py-4 px-6 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors"
          >
            トップページへ
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold py-4 px-6 rounded-lg hover:shadow-lg transition-all"
          >
            予約内容を印刷
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingCompleteV2;
