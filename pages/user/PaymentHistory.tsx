import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Download, Calendar, CheckCircle, XCircle, Clock, Loader2, Receipt, FileText } from 'lucide-react';

interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  payment_method: string;
  service_name: string;
  scheduled_at: string;
  created_at: string;
}

const PaymentHistory: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'refunded'>('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/user/payments', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'PENDING':
        return <Clock size={20} className="text-yellow-500" />;
      case 'FAILED':
        return <XCircle size={20} className="text-red-500" />;
      case 'REFUNDED':
        return <Receipt size={20} className="text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: Payment['status']) => {
    switch (status) {
      case 'COMPLETED':
        return '完了';
      case 'PENDING':
        return '保留中';
      case 'FAILED':
        return '失敗';
      case 'REFUNDED':
        return '返金済み';
      default:
        return status;
    }
  };

  const getStatusBadgeClass = (status: Payment['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'FAILED':
        return 'bg-red-100 text-red-700';
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredPayments = payments.filter((payment) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return payment.status === 'COMPLETED';
    if (filter === 'pending') return payment.status === 'PENDING';
    if (filter === 'refunded') return payment.status === 'REFUNDED';
    return true;
  });

  const handleDownloadReceipt = (paymentId: string) => {
    // TODO: 領収書ダウンロード機能を実装
    alert('🚧 領収書ダウンロード機能は準備中です');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 size={48} className="animate-spin text-teal-600 mx-auto" />
          <p className="text-gray-600 font-bold">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">💳 支払い履歴</h1>
          <p className="text-gray-600 font-bold">過去の決済履歴を確認できます</p>
        </div>

        {/* フィルター */}
        <div className="mb-6 flex gap-3 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${
              filter === 'all'
                ? 'bg-teal-500 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-teal-500'
            }`}
          >
            すべて ({payments.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${
              filter === 'completed'
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-green-500'
            }`}
          >
            完了 ({payments.filter((p) => p.status === 'COMPLETED').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${
              filter === 'pending'
                ? 'bg-yellow-500 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-yellow-500'
            }`}
          >
            保留中 ({payments.filter((p) => p.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setFilter('refunded')}
            className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${
              filter === 'refunded'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-500'
            }`}
          >
            返金済み ({payments.filter((p) => p.status === 'REFUNDED').length})
          </button>
        </div>

        {/* 支払い履歴一覧 */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-bold">支払い履歴がありません</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-6 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <CreditCard size={32} />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-black text-gray-900">{payment.service_name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 ${getStatusBadgeClass(payment.status)}`}>
                            {getStatusIcon(payment.status)}
                            {getStatusLabel(payment.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600 font-bold">
                            <Calendar size={16} />
                            {new Date(payment.scheduled_at).toLocaleDateString('ja-JP')}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 font-bold">
                            <FileText size={16} />
                            予約ID: {payment.booking_id}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 font-bold">
                            <CreditCard size={16} />
                            {payment.payment_method || 'カード決済'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-3xl font-black text-gray-900">¥{payment.amount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 font-bold mt-1">
                          {new Date(payment.created_at).toLocaleDateString('ja-JP')}
                        </p>
                      </div>

                      {payment.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleDownloadReceipt(payment.id)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-black text-sm hover:bg-gray-200 transition-all flex items-center gap-2"
                          title="領収書をダウンロード"
                        >
                          <Download size={16} />
                          領収書
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 合計金額 */}
        {filteredPayments.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-teal-500 to-indigo-600 p-6 rounded-3xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-black">合計支払額</p>
                <p className="text-sm opacity-90 font-bold mt-1">
                  {filter === 'all' ? 'すべて' : filter === 'completed' ? '完了のみ' : filter === 'pending' ? '保留中のみ' : '返金済みのみ'} ({filteredPayments.length}件)
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black">
                  ¥{filteredPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
