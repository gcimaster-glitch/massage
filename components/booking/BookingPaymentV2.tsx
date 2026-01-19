import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Stripe公開鍵
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_dummy');

interface BookingPaymentV2Props {
  bookingId: string;
}

const PaymentForm: React.FC<BookingPaymentV2Props> = ({ bookingId }) => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch booking details
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings/guest/${bookingId}`);
        
        if (!response.ok) {
          throw new Error('予約情報の取得に失敗しました');
        }
        
        const data = await response.json();
        console.log('✅ 予約情報:', data);
        setBooking(data.booking || data);
      } catch (err: any) {
        console.error('❌ 予約情報取得エラー:', err);
        setErrorMessage('予約情報を読み込めませんでした');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBooking();
  }, [bookingId]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!booking) {
      return;
    }
    
    setProcessing(true);
    setErrorMessage('');
    
    try {
      console.log('🔄 決済処理をスキップして完了ページへ遷移します（開発モード）');
      
      // 開発モード: 決済をスキップして完了ページへ
      // TODO: 本番環境ではStripe決済を実装
      
      // 2秒待機（決済処理のシミュレーション）
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('✅ 予約完了（決済スキップ）:', bookingId);
      
      // Navigate to completion page
      navigate(`/app/booking/complete/${bookingId}`);
      
    } catch (error: any) {
      console.error('❌ エラー:', error);
      setErrorMessage(error.message || 'エラーが発生しました');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <p className="text-red-700">予約情報が見つかりません</p>
      </div>
    );
  }

  return (
    <form onSubmit={handlePayment} className="space-y-6">
      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 font-medium">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              className="text-red-500 hover:text-red-700 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Booking Summary */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">予約内容</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between pb-2 border-b">
            <span className="text-gray-600">お名前</span>
            <span className="font-semibold">{booking.user_name || booking.customer_name}</span>
          </div>
          
          <div className="flex justify-between pb-2 border-b">
            <span className="text-gray-600">メールアドレス</span>
            <span className="font-semibold">{booking.user_email || booking.customer_email}</span>
          </div>
          
          <div className="flex justify-between pb-2 border-b">
            <span className="text-gray-600">日時</span>
            <span className="font-semibold">
              {new Date(booking.scheduled_start || booking.scheduled_at).toLocaleString('ja-JP')}
            </span>
          </div>
          
          <div className="flex justify-between pb-2 border-b">
            <span className="text-gray-600">所要時間</span>
            <span className="font-semibold">{booking.duration}分</span>
          </div>
          
          <div className="flex justify-between items-center pt-3 bg-teal-50 p-4 rounded-lg">
            <span className="text-lg font-semibold text-gray-800">合計金額</span>
            <span className="text-3xl font-bold text-teal-600">
              ¥{parseInt(booking.price || booking.total_price).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Card Input - Development Mode */}
      <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-300">
        <div className="flex items-start space-x-3 mb-4">
          <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-lg font-bold text-yellow-900 mb-2">
              開発モード（決済スキップ）
            </h3>
            <p className="text-sm text-yellow-800">
              現在は開発モードのため、実際の決済は行われません。<br />
              「次へ（完了画面）」ボタンをクリックすると、決済をスキップして予約完了画面に進みます。
            </p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-gray-600 mb-2">
            <strong>💡 本番環境では：</strong>
          </p>
          <ul className="text-xs text-gray-600 space-y-1 ml-4">
            <li>• クレジットカード情報の入力が必要になります</li>
            <li>• Stripe決済システムで安全に処理されます</li>
            <li>• 決済完了後に予約が確定します</li>
          </ul>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={processing}
        className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold py-4 px-6 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? (
          <span className="flex items-center justify-center">
            <span className="inline-block animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent mr-2"></span>
            処理中...
          </span>
        ) : (
          '次へ（完了画面） →'
        )}
      </button>
      
      <p className="text-xs text-center text-gray-500 mt-2">
        ※ 開発モードのため決済は実行されません
      </p>
    </form>
  );
};

const BookingPaymentV2: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  
  if (!bookingId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">予約IDが指定されていません</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          お支払い
        </h1>
        
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <Elements stripe={stripePromise}>
            <PaymentForm bookingId={bookingId} />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default BookingPaymentV2;
