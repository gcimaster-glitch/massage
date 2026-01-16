/**
 * PaymentForm: 決済フォーム
 * - カード情報入力
 * - Stripe連携（今後実装）
 */

import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Lock } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  onComplete: () => void;
  onBack: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ amount, onComplete, onBack }) => {
  const [cardData, setCardData] = useState({
    card_number: '',
    exp_month: '',
    exp_year: '',
    cvc: '',
    card_holder_name: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!cardData.card_number || !cardData.exp_month || !cardData.exp_year || !cardData.cvc) {
      alert('すべての項目を入力してください');
      return;
    }

    setIsProcessing(true);

    try {
      // Stripe決済API（今後実装）
      // const response = await fetch('/api/payments/charge', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     amount,
      //     card: cardData,
      //   })
      // });

      // 仮の成功処理
      setTimeout(() => {
        alert('お支払いが完了しました');
        onComplete();
      }, 1500);
    } catch (error) {
      alert('決済に失敗しました');
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19); // 16桁 + 3スペース
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* カード番号 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カード番号 <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={cardData.card_number}
                onChange={(e) => setCardData({ 
                  ...cardData, 
                  card_number: formatCardNumber(e.target.value) 
                })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
              />
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* 有効期限とCVC */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                月 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={cardData.exp_month}
                onChange={(e) => setCardData({ 
                  ...cardData, 
                  exp_month: e.target.value.replace(/\D/g, '').slice(0, 2)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="MM"
                maxLength={2}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                年 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={cardData.exp_year}
                onChange={(e) => setCardData({ 
                  ...cardData, 
                  exp_year: e.target.value.replace(/\D/g, '').slice(0, 2)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="YY"
                maxLength={2}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVC <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={cardData.cvc}
                onChange={(e) => setCardData({ 
                  ...cardData, 
                  cvc: e.target.value.replace(/\D/g, '').slice(0, 4)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="123"
                maxLength={4}
                required
              />
            </div>
          </div>

          {/* カード名義 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カード名義人 <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={cardData.card_holder_name}
              onChange={(e) => setCardData({ ...cardData, card_holder_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="TARO YAMADA"
              required
            />
          </div>

          {/* 注意事項 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600">
              お支払い情報は暗号化されて安全に送信されます。
              カード情報は保存されません。
            </p>
          </div>

          {/* 支払いボタン */}
          <button
            type="submit"
            disabled={isProcessing}
            className={`w-full py-3 rounded-lg font-medium transition-all ${
              isProcessing
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}
          >
            {isProcessing ? '処理中...' : `¥${amount.toLocaleString()} を支払う`}
          </button>

          <p className="text-xs text-gray-500 text-center">
            お支払いをもって予約が確定します
          </p>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
