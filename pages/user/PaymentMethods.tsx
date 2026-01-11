import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaymentMethods: React.FC = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([
    { id: 'card-1', brand: 'Visa', last4: '4242', exp: '12/28', isDefault: true },
    { id: 'card-2', brand: 'Mastercard', last4: '8888', exp: '09/26', isDefault: false },
  ]);

  const handleSetDefault = (id: string) => {
    setCards(cards.map(c => ({ ...c, isDefault: c.id === id })));
  };

  const handleDelete = (id: string) => {
    if (confirm('このカードを削除しますか？')) {
      setCards(cards.filter(c => c.id !== id));
    }
  };

  const handleAdd = () => {
    alert("カード追加画面 (デモ: Stripe連携)");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900">
           <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">支払い方法</h1>
      </div>

      <div className="space-y-4">
        {cards.map(card => (
          <div key={card.id} className={`p-4 rounded-xl border-2 flex justify-between items-center ${card.isDefault ? 'border-teal-500 bg-teal-50' : 'border-gray-100 bg-white'}`}>
            <div className="flex items-center gap-4">
              <div className="bg-gray-200 p-2 rounded text-gray-600">
                <CreditCard size={24} />
              </div>
              <div>
                <p className="font-bold text-gray-900">{card.brand} **** {card.last4}</p>
                <p className="text-xs text-gray-500">有効期限: {card.exp}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {card.isDefault ? (
                <span className="text-xs font-bold text-teal-700 flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-sm">
                  <Check size={12} /> メイン
                </span>
              ) : (
                <button 
                  onClick={() => handleSetDefault(card.id)}
                  className="text-xs text-gray-500 hover:text-teal-600 font-medium px-2 py-1"
                >
                  メインにする
                </button>
              )}
              {!card.isDefault && (
                <button 
                  onClick={() => handleDelete(card.id)}
                  className="text-gray-400 hover:text-red-500 p-2"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}

        <button 
          onClick={handleAdd}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          新しいカードを追加
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-500 space-y-2">
        <p className="font-bold text-gray-700">セキュリティについて</p>
        <p>クレジットカード情報は、決済代行会社（Stripe）によって安全に管理されています。Soothe x CARE CUBE のサーバーにはカード番号は保存されません。</p>
      </div>
    </div>
  );
};

export default PaymentMethods;