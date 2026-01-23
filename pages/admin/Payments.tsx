import React, { useState } from 'react';
import { Search, Download, Filter, CreditCard, CheckCircle, XCircle, Clock, RefreshCw, DollarSign, AlertTriangle } from 'lucide-react';
import SimpleLayout from '../../components/SimpleLayout';

const AdminPayments: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  // モックデータ
  const payments = [
    {
      id: 'PAY-001',
      bookingId: 'BK-12345',
      user: '山田 花子',
      therapist: '田中 有紀',
      amount: 8000,
      status: 'completed',
      paymentMethod: 'クレジットカード',
      date: '2026-01-22 14:30',
      stripeId: 'pi_3ABC123'
    },
    {
      id: 'PAY-002',
      bookingId: 'BK-12346',
      user: '佐藤 太郎',
      therapist: '鈴木 美咲',
      amount: 12000,
      status: 'completed',
      paymentMethod: 'クレジットカード',
      date: '2026-01-22 13:15',
      stripeId: 'pi_3ABC124'
    },
    {
      id: 'PAY-003',
      bookingId: 'BK-12347',
      user: '高橋 次郎',
      therapist: '伊藤 良太',
      amount: 6000,
      status: 'pending',
      paymentMethod: 'クレジットカード',
      date: '2026-01-22 12:45',
      stripeId: 'pi_3ABC125'
    },
    {
      id: 'PAY-004',
      bookingId: 'BK-12348',
      user: '田中 三郎',
      therapist: '山本 さくら',
      amount: 10000,
      status: 'failed',
      paymentMethod: 'クレジットカード',
      date: '2026-01-22 11:20',
      stripeId: 'pi_3ABC126'
    }
  ];

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.user.includes(searchQuery) || 
                          payment.therapist.includes(searchQuery) ||
                          payment.id.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle size={12} />
            完了
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 flex items-center gap-1">
            <Clock size={12} />
            処理中
          </span>
        );
      case 'failed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1">
            <XCircle size={12} />
            失敗
          </span>
        );
      default:
        return null;
    }
  };

  const handleRefund = async (paymentId: string, amount: number) => {
    const confirmation = window.confirm(
      `¥${amount.toLocaleString()}を返金しますか？\n\nこの操作は取り消せません。`
    );

    if (!confirmation) return;

    try {
      const response = await fetch('/api/admin/payments/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          payment_id: paymentId,
          amount: amount
        })
      });

      if (response.ok) {
        alert('返金処理を開始しました。処理には数分かかる場合があります。');
        // リロードして最新状態を取得
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`返金処理に失敗しました: ${error.message || '不明なエラー'}`);
      }
    } catch (error) {
      console.error('Refund failed:', error);
      alert('返金処理中にエラーが発生しました。ネットワーク接続を確認してください。');
    }
  };

  const handleRetry = async (paymentId: string) => {
    const confirmation = window.confirm('決済を再試行しますか？');
    if (!confirmation) return;

    try {
      const response = await fetch('/api/admin/payments/retry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          payment_id: paymentId
        })
      });

      if (response.ok) {
        alert('決済を再試行しました');
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`再試行に失敗しました: ${error.message || '不明なエラー'}`);
      }
    } catch (error) {
      console.error('Retry failed:', error);
      alert('再試行中にエラーが発生しました');
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ['決済ID', '予約ID', 'ユーザー', 'セラピスト', '金額', 'ステータス', '決済方法', '日時', 'Stripe ID'].join(','),
      ...filteredPayments.map(p => 
        [p.id, p.bookingId, p.user, p.therapist, p.amount, p.status, p.paymentMethod, p.date, p.stripeId].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <SimpleLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">決済管理</h1>
          <p className="text-gray-600">すべての決済履歴を確認・管理できます</p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">総決済額</p>
            <p className="text-3xl font-bold text-gray-900">¥{totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">完了件数</p>
            <p className="text-3xl font-bold text-green-600">{payments.filter(p => p.status === 'completed').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">処理中</p>
            <p className="text-3xl font-bold text-yellow-600">{payments.filter(p => p.status === 'pending').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">失敗</p>
            <p className="text-3xl font-bold text-red-600">{payments.filter(p => p.status === 'failed').length}</p>
          </div>
        </div>

        {/* 検索・フィルター */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 検索 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="ユーザー名、セラピスト名、決済IDで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* ステータスフィルター */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">すべて</option>
                <option value="completed">完了</option>
                <option value="pending">処理中</option>
                <option value="failed">失敗</option>
              </select>
            </div>

            {/* CSV出力 */}
            <button
              onClick={handleExportCSV}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-all flex items-center gap-2"
            >
              <Download size={20} />
              CSV出力
            </button>
          </div>
        </div>

        {/* 決済一覧テーブル */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">決済ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">予約ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ユーザー</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">セラピスト</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">金額</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ステータス</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">日時</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-gray-400" />
                        <span className="text-sm font-bold text-gray-900">{payment.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{payment.bookingId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">{payment.user}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{payment.therapist}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">¥{payment.amount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{payment.date}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {payment.status === 'completed' && (
                          <button 
                            onClick={() => handleRefund(payment.id, payment.amount)}
                            className="text-sm text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1"
                          >
                            <RefreshCw size={14} />
                            返金
                          </button>
                        )}
                        {payment.status === 'failed' && (
                          <button 
                            onClick={() => handleRetry(payment.id)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                          >
                            <RefreshCw size={14} />
                            再試行
                          </button>
                        )}
                        <button className="text-sm text-teal-600 hover:text-teal-700 font-bold">
                          詳細
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="p-12 text-center">
              <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-bold">決済データが見つかりません</p>
            </div>
          )}
        </div>
      </div>
    </SimpleLayout>
  );
};

export default AdminPayments;
