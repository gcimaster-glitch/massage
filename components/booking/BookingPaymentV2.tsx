/**
 * BookingPaymentV2.tsx
 * Stripe Elements を使った本番決済ページ
 * - PaymentIntent を作成してクライアントシークレットを取得
 * - Stripe Elements (PaymentElement) でカード情報を入力
 * - 決済確認後、収益分配が Webhook で自動処理される
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { ShieldCheck, Lock, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// Stripe公開鍵（環境変数から取得）
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

// ============================================
// 決済フォームコンポーネント
// ============================================
interface PaymentFormProps {
  bookingId: string;
  booking: Record<string, unknown>;
  clientSecret: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ bookingId, booking }) => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage('Stripeの初期化に失敗しました。ページを再読み込みしてください。');
      return;
    }

    setProcessing(true);
    setErrorMessage('');

    try {
      // Stripe Elements で決済を確定
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/app/booking/complete/${bookingId}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('❌ 決済エラー:', error);
        setErrorMessage(
          error.type === 'card_error'
            ? error.message || 'カードエラーが発生しました'
            : '決済処理中にエラーが発生しました。もう一度お試しください。'
        );
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        console.log('✅ 決済成功:', paymentIntent.id);

        // バックエンドに決済確認を通知（Webhookのバックアップ）
        try {
          const token = localStorage.getItem('auth_token');
          await fetch('/api/payment/confirm', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
              bookingId,
            }),
          });
        } catch (confirmErr) {
          // confirm APIの失敗はWebhookで補完されるため無視
          console.warn('confirm API error (non-critical):', confirmErr);
        }

        navigate(`/app/booking/complete/${bookingId}`);
      } else if (paymentIntent?.status === 'requires_action') {
        // 3Dセキュア等の追加認証が必要
        setErrorMessage('追加認証が必要です。画面の指示に従ってください。');
      } else {
        setErrorMessage('決済が完了しませんでした。もう一度お試しください。');
      }
    } catch (err: unknown) {
      console.error('❌ 予期しないエラー:', err);
      setErrorMessage('予期しないエラーが発生しました。');
    } finally {
      setProcessing(false);
    }
  };

  const price = (booking.price as number) || 0;

  return (
    <form onSubmit={handlePayment} className="space-y-6">
      {/* エラーメッセージ */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-red-700 font-medium">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            className="text-red-400 hover:text-red-600 font-bold text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* 予約内容サマリー */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CheckCircle size={20} className="text-teal-500" />
          予約内容の確認
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">サービス</span>
            <span className="font-semibold text-gray-800">
              {(booking.service_name as string) || '施術'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">日時</span>
            <span className="font-semibold text-gray-800">
              {new Date(
                (booking.scheduled_at as string) || (booking.scheduled_start as string)
              ).toLocaleString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">所要時間</span>
            <span className="font-semibold text-gray-800">{booking.duration as number}分</span>
          </div>
          <div className="flex justify-between items-center pt-3">
            <span className="text-lg font-bold text-gray-800">お支払い金額</span>
            <span className="text-3xl font-black text-teal-600">
              ¥{price.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Lock size={20} className="text-teal-500" />
          お支払い情報
        </h3>
        <PaymentElement
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                name: (booking.user_name as string) || '',
                email: (booking.user_email as string) || '',
              },
            },
          }}
        />
      </div>

      {/* セキュリティバッジ */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <ShieldCheck size={14} className="text-teal-500" />
        <span>256-bit SSL暗号化で保護されています</span>
        <span>·</span>
        <span>Stripe決済</span>
      </div>

      {/* 決済ボタン */}
      <button
        type="submit"
        disabled={processing || !stripe || !elements}
        className="w-full bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold py-5 px-6 rounded-2xl hover:shadow-lg hover:from-teal-700 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
      >
        {processing ? (
          <span className="flex items-center justify-center gap-3">
            <Loader2 className="animate-spin" size={20} />
            決済処理中...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Lock size={18} />
            ¥{price.toLocaleString()} を安全に支払う
          </span>
        )}
      </button>

      <p className="text-xs text-center text-gray-400">
        「支払う」ボタンをクリックすることで、
        <a href="/terms" className="underline hover:text-gray-600">利用規約</a>
        および
        <a href="/privacy" className="underline hover:text-gray-600">プライバシーポリシー</a>
        に同意したものとみなされます。
      </p>
    </form>
  );
};

// ============================================
// メインコンポーネント（PaymentIntent作成 + Elements初期化）
// ============================================
const BookingPaymentV2: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Record<string, unknown> | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!bookingId) {
      setError('予約IDが指定されていません');
      setLoading(false);
      return;
    }

    const initializePayment = async () => {
      try {
        // 1. 予約情報を取得
        const token = localStorage.getItem('auth_token');
        const bookingRes = await fetch(`/api/bookings/guest/${bookingId}`);

        if (!bookingRes.ok) {
          throw new Error('予約情報の取得に失敗しました');
        }

        const bookingData = await bookingRes.json();
        const bookingInfo = bookingData.booking || bookingData;
        setBooking(bookingInfo);

        // 2. PaymentIntentを作成
        const intentRes = await fetch('/api/payment/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            amount: bookingInfo.price,
            currency: 'jpy',
            booking_id: bookingId,
            metadata: {
              booking_id: bookingId,
              service_name: bookingInfo.service_name || '施術',
              therapist_id: bookingInfo.therapist_id || '',
            },
          }),
        });

        if (!intentRes.ok) {
          const errData = await intentRes.json();
          throw new Error(errData.error || 'PaymentIntentの作成に失敗しました');
        }

        const intentData = await intentRes.json();

        if (!intentData.clientSecret) {
          throw new Error('クライアントシークレットが取得できませんでした');
        }

        setClientSecret(intentData.clientSecret);
      } catch (err: unknown) {
        console.error('❌ 決済初期化エラー:', err);
        setError(err instanceof Error ? err.message : '決済の初期化に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [bookingId]);

  // ローディング中
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Loader2 className="animate-spin text-teal-600" size={32} />
          </div>
          <p className="text-gray-500 font-medium">決済情報を準備しています...</p>
        </div>
      </div>
    );
  }

  // エラー
  if (error || !booking || !clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">エラーが発生しました</h2>
          <p className="text-gray-500 mb-6">{error || '決済の初期化に失敗しました'}</p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mx-auto text-teal-600 hover:text-teal-700 font-medium"
          >
            <ArrowLeft size={16} />
            前のページに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900">お支払い</h1>
            <p className="text-sm text-gray-400 font-medium">予約ID: {bookingId}</p>
          </div>
        </div>

        {/* Stripe Elements */}
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#0d9488',
                colorBackground: '#ffffff',
                colorText: '#1f2937',
                colorDanger: '#ef4444',
                fontFamily: '"Noto Sans JP", system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '12px',
              },
            },
            locale: 'ja',
          }}
        >
          <PaymentForm
            bookingId={bookingId!}
            booking={booking}
            clientSecret={clientSecret}
          />
        </Elements>
      </div>
    </div>
  );
};

export default BookingPaymentV2;
