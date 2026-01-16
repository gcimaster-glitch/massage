/**
 * PaymentForm: Stripe決済フォーム
 * - Stripe Elements統合
 * - カード情報入力
 * - 決済処理
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, CreditCard, AlertCircle } from 'lucide-react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Stripe公開キー（本番環境では環境変数から取得）
const stripePromise = loadStripe('pk_test_51QbDQOFaEvmBTqm3fQkDiOsQ0H8PrXP6xrDXEjKyOLmGEAVtF3sN7PV1wXkqBu3hgEEShBEXb6D6hRzAkGkSG7aq00RRSGvjLb');

interface PaymentFormProps {
  amount: number;
  bookingId?: string;
  bookingData?: any;
  onComplete: (paymentIntentId: string) => void;
  onBack: () => void;
}

const PaymentFormContent: React.FC<PaymentFormProps> = ({ 
  amount, 
  bookingId,
  bookingData,
  onComplete, 
  onBack 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');

  // PaymentIntentを作成
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payment/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            currency: 'jpy',
            booking_id: bookingId,
            metadata: {
              therapist_name: bookingData?.therapist?.name || '',
              site_name: bookingData?.site?.name || '',
            }
          })
        });

        if (!response.ok) {
          throw new Error('PaymentIntent creation failed');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
        console.log('✅ PaymentIntent created:', data.paymentIntentId);
      } catch (err: any) {
        console.error('❌ PaymentIntent creation error:', err);
        setError('決済の準備に失敗しました。もう一度お試しください。');
      }
    };

    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount, bookingId, bookingData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Stripeの読み込みに失敗しました');
      return;
    }

    if (!clientSecret) {
      setError('決済の準備ができていません');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('カード情報を入力してください');
      setIsProcessing(false);
      return;
    }

    try {
      // Stripe決済を実行
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (stripeError) {
        console.error('❌ Stripe payment error:', stripeError);
        setError(stripeError.message || '決済に失敗しました');
        setIsProcessing(false);
        
        // 決済失敗メール送信（bookingIdがある場合）
        if (bookingId) {
          await fetch('/api/email/payment-failed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userEmail: bookingData?.userEmail || '',
              bookingId,
              reason: stripeError.message,
            })
          });
        }
        
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('✅ Payment succeeded:', paymentIntent.id);
        
        // 決済成功時の処理
        if (bookingId) {
          // 予約レコードを更新
          await fetch('/api/payment/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
              bookingId,
            })
          });

          // 決済成功メール送信
          await fetch('/api/email/payment-success', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userEmail: bookingData?.userEmail || '',
              bookingId,
              amount,
              paymentIntentId: paymentIntent.id,
            })
          });
        }
        
        onComplete(paymentIntent.id);
      }
    } catch (err: any) {
      console.error('❌ Payment processing error:', err);
      setError('決済処理中にエラーが発生しました');
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#111827',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        '::placeholder': {
          color: '#9ca3af',
        },
      },
      invalid: {
        color: '#dc2626',
        iconColor: '#dc2626',
      },
    },
    hidePostalCode: true,
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <button 
          onClick={onBack} 
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          disabled={isProcessing}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          戻る
        </button>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">お支払い</h2>
          <div className="flex items-center text-teal-600">
            <Lock className="w-4 h-4 mr-1" />
            <span className="text-sm">安全な接続</span>
          </div>
        </div>

        {/* 金額表示 */}
        <div className="bg-teal-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">お支払い金額</span>
            <span className="text-2xl font-bold text-teal-600">
              ¥{amount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Stripe Card Element */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="inline w-4 h-4 mr-1" />
              カード情報 <span className="text-red-600">*</span>
            </label>
            <div className="border border-gray-300 rounded-lg p-3 focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {/* 注意事項 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600">
              お支払い情報はStripeによって暗号化されて安全に送信されます。
              カード情報は当社のサーバーに保存されません。
            </p>
          </div>

          {/* 支払いボタン */}
          <button
            type="submit"
            disabled={isProcessing || !stripe || !clientSecret}
            className={`w-full py-3 rounded-lg font-medium transition-all ${
              isProcessing || !stripe || !clientSecret
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                処理中...
              </span>
            ) : !clientSecret ? (
              '準備中...'
            ) : (
              `¥${amount.toLocaleString()} を支払う`
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            お支払いをもって予約が確定します
          </p>
        </form>
      </div>
    </div>
  );
};

// Elementsプロバイダーでラップ
const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  const options: StripeElementsOptions = {
    mode: 'payment',
    amount: props.amount,
    currency: 'jpy',
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentFormContent {...props} />
    </Elements>
  );
};

export default PaymentForm;
