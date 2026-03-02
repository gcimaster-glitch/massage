import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, CheckCircle, Clock, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import SimpleLayout from '../../../components/SimpleLayout';

interface ConnectStatus {
  connected: boolean;
  status: 'not_started' | 'pending' | 'active';
  stripe_account_id?: string;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
}

const StripeSettings: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSuccess = searchParams.get('success') === 'true';
  const isRefresh = searchParams.get('refresh') === 'true';

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/payments/connect-status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('ステータス取得に失敗しました');
      const data = await res.json();
      setStatus(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleStartOnboarding = async () => {
    setOnboarding(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/payments/connect-onboarding', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'オンボーディングURLの取得に失敗しました');
      }
      if (data.status === 'complete') {
        await fetchStatus();
        return;
      }
      // Stripeのオンボーディングページへリダイレクト
      window.location.href = data.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
      setOnboarding(false);
    }
  };

  const renderStatusBadge = () => {
    if (!status || !status.connected) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
          <Clock size={14} />
          未設定
        </span>
      );
    }
    if (status.status === 'active') {
      return (
        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium border border-emerald-200">
          <CheckCircle size={14} />
          有効
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-medium border border-amber-200">
        <Clock size={14} />
        設定中
      </span>
    );
  };

  return (
    <SimpleLayout>
      <div className="max-w-3xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/t/settings')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span>個人設定に戻る</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="text-teal-600" />
                報酬受取設定（Stripe Connect）
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                セッション報酬を受け取るための決済アカウントを設定します
              </p>
            </div>
            {renderStatusBadge()}
          </div>
        </div>

        {/* 成功メッセージ */}
        {isSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle className="text-emerald-600 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <p className="font-semibold text-emerald-800">設定が完了しました</p>
              <p className="text-sm text-emerald-700 mt-0.5">
                Stripe Connectアカウントの設定が完了しました。報酬の受取が可能になります。
              </p>
            </div>
          </div>
        )}

        {/* リフレッシュメッセージ */}
        {isRefresh && !isSuccess && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <p className="font-semibold text-amber-800">設定が完了していません</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Stripeの設定が途中で中断されました。再度「設定を開始する」から続きを行ってください。
              </p>
            </div>
          </div>
        )}

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* メインコンテンツ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-gray-500 text-sm">設定状況を確認中...</p>
            </div>
          ) : status?.status === 'active' ? (
            /* 設定完了状態 */
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="text-emerald-600" size={24} />
                </div>
                <div>
                  <p className="font-bold text-emerald-800">Stripe Connectアカウントが有効です</p>
                  <p className="text-sm text-emerald-700 mt-0.5">報酬の受取が可能な状態です</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">アカウントID</span>
                  <span className="text-sm font-mono text-gray-800">{status.stripe_account_id}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">決済受取</span>
                  <span className={`text-sm font-semibold ${status.charges_enabled ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {status.charges_enabled ? '有効' : '無効'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-gray-600">振込</span>
                  <span className={`text-sm font-semibold ${status.payouts_enabled ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {status.payouts_enabled ? '有効' : '無効'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={fetchStatus}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw size={14} />
                  状況を更新
                </button>
              </div>
            </div>
          ) : status?.connected && status?.status === 'pending' ? (
            /* 設定途中状態 */
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="text-amber-600" size={24} />
                </div>
                <div>
                  <p className="font-bold text-amber-800">設定が完了していません</p>
                  <p className="text-sm text-amber-700 mt-0.5">
                    Stripeでの本人確認・口座設定が未完了です。「設定を続ける」から完了してください。
                  </p>
                </div>
              </div>

              <button
                onClick={handleStartOnboarding}
                disabled={onboarding}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {onboarding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Stripeへ移動中...
                  </>
                ) : (
                  <>
                    <ExternalLink size={16} />
                    設定を続ける（Stripeへ移動）
                  </>
                )}
              </button>
            </div>
          ) : (
            /* 未設定状態 */
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900">Stripe Connectとは</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  HOGUSYでの施術報酬を受け取るために、Stripeの決済アカウントが必要です。
                  設定は約5〜10分で完了します。本人確認書類と銀行口座情報をご用意ください。
                </p>
                <ul className="space-y-2">
                  {[
                    '本人確認書類（運転免許証・マイナンバーカードなど）',
                    '銀行口座情報（口座番号・支店名など）',
                    '生年月日・住所',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle size={14} className="text-teal-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
                <p>• 設定はStripeの安全なページで行われます</p>
                <p>• HOGUSYがお客様の銀行口座情報を保持することはありません</p>
                <p>• 設定完了後、翌月以降の報酬から振込が開始されます</p>
              </div>

              <button
                onClick={handleStartOnboarding}
                disabled={onboarding}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {onboarding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Stripeへ移動中...
                  </>
                ) : (
                  <>
                    <ExternalLink size={16} />
                    設定を開始する（Stripeへ移動）
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </SimpleLayout>
  );
};

export default StripeSettings;
