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
    
    if (!stripe || !elements || !booking) {
      return;
    }
    
    setProcessing(true);
    setErrorMessage('');
    
    try {
      // Get card element
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('カード情報が見つかりません');
      }
      
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });
      
      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }
      
      console.log('✅ Payment Method created:', paymentMethod.id);
      
      // Create payment intent on backend
      const paymentResponse = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          paymentMethodId: paymentMethod.id
        })
      });
      
      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || '決済の処理に失敗しました');
      }
      
      const paymentResult = await paymentResponse.json();
      console.log('✅ 決済完了:', paymentResult);
      
      // Navigate to completion page
      navigate(`/app/booking/complete/${bookingId}`);
      
    } catch (error: any) {
      console.error('❌ 決済エラー:', error);
      setErrorMessage(error.message || '決済処理中にエラーが発生しました');
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
              {new Date(booking.scheduled_at).toLocaleString('ja-JP')}
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

      {/* Card Input */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">カード情報</h3>
        
        <div className="p-4 border-2 border-gray-300 rounded-lg focus-within:border-teal-500 transition-colors">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          🔒 すべてのカード情報は安全に暗号化されます
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold py-4 px-6 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? (
          <span className="flex items-center justify-center">
            <span className="inline-block animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent mr-2"></span>
            決済処理中...
          </span>
        ) : (
          `¥${parseInt(booking.price || booking.total_price).toLocaleString()} を支払う`
        )}
      </button>
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
