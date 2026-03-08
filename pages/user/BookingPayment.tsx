import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Lock, ArrowLeft, CheckCircle, Loader2, CreditCard } from 'lucide-react';

const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  'pk_live_51T5n68AnaQJfi3mdorYm7OYMQu7iRuReAJrLQzZMlj0puHytyVHfKTS2hpE1jO7lgwWCdywuqDbQtdoSs0i6tYkt00QUHFS3jL';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// ─────────────────────────────────────────────
// 内部フォームコンポーネント
// ─────────────────────────────────────────────
interface CheckoutFormProps {
  bookingId: string;
  paymentIntentId: string;
  onSuccess: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ bookingId, paymentIntentId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    // Stripe Elements でカード情報を確定
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMsg(submitError.message || '決済情報の確認に失敗しました');
      setIsSubmitting(false);
      return;
    }

    // PaymentIntent を確定
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setErrorMsg(error.message || '決済に失敗しました。カード情報を確認してください。');
      setIsSubmitting(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      // バックエンドに確定通知
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentIntentId,
            bookingId,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || '予約確定処理に失敗しました');
        }

        onSuccess();
      } catch (err: any) {
        setErrorMsg(err.message || '予約確定処理中にエラーが発生しました');
        setIsSubmitting(false);
      }
    } else {
      setErrorMsg('決済が完了しませんでした。もう一度お試しください。');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Stripe PaymentElement */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <CreditCard size={14} className="text-teal-500" /> お支払い方法
        </h3>
        <PaymentElement
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                address: { country: 'JP' },
              },
            },
          }}
        />
      </div>

      {/* エラー表示 */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 text-sm font-bold">{errorMsg}</p>
        </div>
      )}

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={!stripe || isSubmitting}
        className="w-full py-5 bg-teal-500 text-white rounded-[32px] font-black text-lg shadow-[0_12px_40px_rgba(20,184,166,0.3)] hover:bg-teal-400 transition-all disabled:bg-gray-300 disabled:shadow-none active:scale-[0.98] flex items-center justify-center gap-3"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            決済処理中...
          </>
        ) : (
          <>
            <Lock size={18} />
            安全に決済して予約を確定する
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-400 font-bold">
        PCI-DSS 準拠 · Stripe による暗号化決済
      </p>
    </form>
  );
};

// ─────────────────────────────────────────────
// メインページコンポーネント
// ─────────────────────────────────────────────
const BookingPayment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookingId = searchParams.get('bookingId') || '';
  const clientSecret = searchParams.get('clientSecret') || '';
  const paymentIntentId = searchParams.get('paymentIntentId') || '';

  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!bookingId || !clientSecret) {
      navigate('/app/booking/new');
    }
  }, [bookingId, clientSecret, navigate]);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={48} className="text-teal-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900">予約が確定しました</h1>
          <p className="text-gray-500 font-bold">
            決済が完了し、予約が確定しました。セラピストへの通知を送信しました。
          </p>
          <button
            onClick={() => navigate('/app/bookings')}
            className="w-full py-4 bg-teal-500 text-white rounded-2xl font-black hover:bg-teal-400 transition-all"
          >
            予約一覧を確認する
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-teal-500" />
      </div>
    );
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#14b8a6',
      colorBackground: '#ffffff',
      colorText: '#111827',
      borderRadius: '12px',
      fontFamily: '"Inter", system-ui, sans-serif',
    },
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-10 pb-20">
      {/* ヘッダー */}
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tighter">お支払い</h1>
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest mt-0.5">
            Secure Checkout
          </p>
        </div>
      </div>

      {/* 決済フォーム */}
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance,
          locale: 'ja',
        }}
      >
        <CheckoutForm
          bookingId={bookingId}
          paymentIntentId={paymentIntentId}
          onSuccess={() => setIsSuccess(true)}
        />
      </Elements>
    </div>
  );
};

export default BookingPayment;
