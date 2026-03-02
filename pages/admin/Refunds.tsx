import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, CheckCircle, XCircle, Search, Loader2, AlertCircle } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

interface RefundRequest {
  id: string;
  booking_id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  service_name?: string;
  booking_price?: number;
  amount: number;
  reason?: string;
  status: string;
  requested_at: string;
  reviewed_at?: string;
}

const AdminRefunds: React.FC = () => {
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('PENDING');

  const fetchRefunds = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const params = filterStatus ? `?status=${filterStatus}` : '';
      const res = await fetch(`/api/admin/refunds${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('返金申請一覧の取得に失敗しました');
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchRefunds(); }, [fetchRefunds]);

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    const msg = action === 'APPROVE'
      ? '返金を承認し、決済プロバイダへリクエストを送信しますか？'
      : '返金申請を却下しますか？';
    if (!confirm(msg)) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/refunds/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error('更新に失敗しました');
      setRequests(prev => prev.map(r =>
        r.id === id ? { ...r, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : r
      ));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '更新に失敗しました');
    }
  };

  const filtered = requests.filter(r => {
    const q = search.toLowerCase();
    return !q || r.booking_id.toLowerCase().includes(q) || (r.user_name || '').toLowerCase().includes(q);
  });

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">返金承認キュー</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-orange-600 font-bold mt-1">
              {pendingCount}件の返金申請が承認待ちです
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchRefunds} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
          <div className="relative">
            <input type="text" placeholder="予約IDまたはユーザー名" value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white text-gray-900 placeholder-gray-400" />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex gap-4">
          {[
            { val: 'PENDING', label: '承認待ち' },
            { val: 'APPROVED', label: '承認済み' },
            { val: 'REJECTED', label: '却下済み' },
            { val: '', label: '全件' },
          ].map(({ val, label }) => (
            <button key={val} onClick={() => setFilterStatus(val)}
              className={`text-sm font-bold pb-1 ${filterStatus === val ? 'text-teal-700 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-800'}`}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={28} /></div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">現在、該当する返金申請はありません。</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
              <tr>
                <th className="p-4 font-bold">申請ID / 予約ID</th>
                <th className="p-4 font-bold">ユーザー</th>
                <th className="p-4 font-bold">サービス</th>
                <th className="p-4 font-bold">返金額</th>
                <th className="p-4 font-bold">理由</th>
                <th className="p-4 font-bold">申請日時</th>
                <th className="p-4 font-bold">ステータス</th>
                <th className="p-4 font-bold text-center">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((req, index) => (
                <tr key={req.id} className={`hover:bg-teal-50/50 transition-colors ${index % 2 === 1 ? 'bg-slate-50' : 'bg-white'}`}>
                  <td className="p-4">
                    <p className="font-mono text-xs text-gray-500">{req.id.slice(0, 8)}</p>
                    <p className="font-bold text-sm text-gray-700">{req.booking_id.slice(0, 8)}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-sm">{req.user_name || '---'}</p>
                    <p className="text-xs text-gray-400">{req.user_email || ''}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{req.service_name || '---'}</td>
                  <td className="p-4 font-bold text-gray-900">¥{req.amount.toLocaleString()}</td>
                  <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={req.reason}>{req.reason || '---'}</td>
                  <td className="p-4 text-xs text-gray-500">
                    {new Date(req.requested_at).toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={req.status as any} />
                  </td>
                  <td className="p-4">
                    {req.status === 'PENDING' && (
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleAction(req.id, 'APPROVE')}
                          className="bg-green-100 text-green-700 p-2 rounded-lg hover:bg-green-200 transition-colors" title="承認">
                          <CheckCircle size={18} />
                        </button>
                        <button onClick={() => handleAction(req.id, 'REJECT')}
                          className="bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200 transition-colors" title="却下">
                          <XCircle size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminRefunds;
