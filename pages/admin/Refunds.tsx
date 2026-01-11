import React, { useState } from 'react';
import { RefreshCcw, CheckCircle, XCircle, Search } from 'lucide-react';
import { MOCK_BOOKINGS } from '../../constants';
import StatusBadge from '../../components/StatusBadge';

const AdminRefunds: React.FC = () => {
  // Mock refund requests
  const [requests, setRequests] = useState([
    { id: 'ref-1', bookingId: 'b-103', user: '鈴木 一郎', amount: 4400, reason: '体調不良によるキャンセル', status: 'PENDING', requestedAt: '2025-05-20T09:00:00' },
    { id: 'ref-2', bookingId: 'b-098', user: '佐藤 花子', amount: 8000, reason: 'セラピスト都合によるキャンセル', status: 'PENDING', requestedAt: '2025-05-19T18:30:00' },
  ]);

  const handleAction = (id: string, action: 'APPROVE' | 'REJECT') => {
    const confirmMsg = action === 'APPROVE' 
      ? '返金を承認し、決済プロバイダへリクエストを送信しますか？' 
      : '返金申請を却下しますか？';
    
    if (confirm(confirmMsg)) {
      setRequests(requests.filter(r => r.id !== id)); // Remove for demo
      alert(action === 'APPROVE' ? '返金処理を実行しました。' : '返金を却下しました。');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">返金承認キュー</h1>
        <div className="relative">
          <input 
            type="text" 
            placeholder="予約ID検索" 
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white text-gray-900 placeholder-gray-400" 
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
            <tr>
              <th className="p-4 font-bold">申請ID / 予約ID</th>
              <th className="p-4 font-bold">ユーザー</th>
              <th className="p-4 font-bold">金額</th>
              <th className="p-4 font-bold">理由</th>
              <th className="p-4 font-bold">申請日時</th>
              <th className="p-4 font-bold text-center">アクション</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.length === 0 ? (
               <tr>
                 <td colSpan={6} className="p-8 text-center text-gray-400 bg-white">
                   現在、承認待ちの返金リクエストはありません。
                 </td>
               </tr>
            ) : (
              requests.map((req, index) => (
                <tr key={req.id} className={`hover:bg-teal-50/50 transition-colors ${index % 2 === 1 ? 'bg-slate-50' : 'bg-white'}`}>
                  <td className="p-4">
                    <p className="font-bold text-gray-900 text-sm">{req.id}</p>
                    <p className="text-xs text-gray-500 font-mono">{req.bookingId}</p>
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900">{req.user}</td>
                  <td className="p-4 font-bold text-gray-900">¥{req.amount.toLocaleString()}</td>
                  <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                  <td className="p-4 text-xs text-gray-500">
                    {new Date(req.requestedAt).toLocaleString('ja-JP')}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleAction(req.id, 'APPROVE')}
                        className="bg-green-100 text-green-700 p-2 rounded-lg hover:bg-green-200 transition-colors"
                        title="承認"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button 
                        onClick={() => handleAction(req.id, 'REJECT')}
                        className="bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200 transition-colors"
                        title="却下"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRefunds;