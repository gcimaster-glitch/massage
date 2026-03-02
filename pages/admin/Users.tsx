import React, { useState, useEffect, useCallback } from 'react';
import { Search, CheckCircle, XCircle, FileText, Loader2, RefreshCw, AlertCircle, Users } from 'lucide-react';

interface KycDocument {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  document_type: string;
  status: string;
  submitted_at: string;
  reviewed_at?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  kyc_status: string;
  is_active: number;
  created_at: string;
}

type TabType = 'kyc' | 'all' | 'inactive';

const AdminUsers: React.FC = () => {
  const [tab, setTab] = useState<TabType>('kyc');
  const [kycDocs, setKycDocs] = useState<KycDocument[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchKyc = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/kyc/admin', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('KYC一覧の取得に失敗しました');
      const data = await res.json();
      // APIはapplicationsキーで返す。フロントの型に合わせて変換
      const apps = (data.applications || []).map((a: any) => ({
        id: a.doc_id,
        user_id: a.user_id,
        user_name: a.name,
        user_email: a.email,
        document_type: a.id_type || '身分証',
        status: a.status,
        submitted_at: a.created_at,
      }))
      setKycDocs(apps);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('ユーザー一覧の取得に失敗しました');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'kyc') fetchKyc();
    else fetchUsers();
  }, [tab, fetchKyc, fetchUsers]);

  const handleKycAction = async (docId: string, userId: string, action: 'APPROVED' | 'REJECTED') => {
    if (!confirm(`${action === 'APPROVED' ? '承認' : '否認'}しますか？`)) return;
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`/api/kyc/admin/${userId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      });
      setKycDocs(prev => prev.map(d => d.id === docId ? { ...d, status: action } : d));
    } catch {
      alert('更新に失敗しました');
    }
  };

  const pendingCount = kycDocs.filter(d => d.status === 'PENDING').length;
  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    if (tab === 'inactive') return matchSearch && !u.is_active;
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">ユーザー管理 / セラピスト審査</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => tab === 'kyc' ? fetchKyc() : fetchUsers()}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
          <div className="relative">
            <input type="text" placeholder="名前やIDで検索" value={search} onChange={e => setSearch(e.target.value)}
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
          <button onClick={() => setTab('kyc')}
            className={`text-sm font-bold pb-1 ${tab === 'kyc' ? 'text-teal-700 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-800'}`}>
            審査待ち {pendingCount > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{pendingCount}</span>}
          </button>
          <button onClick={() => setTab('all')}
            className={`text-sm font-bold pb-1 ${tab === 'all' ? 'text-teal-700 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-800'}`}>
            全ユーザー
          </button>
          <button onClick={() => setTab('inactive')}
            className={`text-sm font-bold pb-1 ${tab === 'inactive' ? 'text-teal-700 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-800'}`}>
            停止中
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-gray-400" size={28} />
          </div>
        ) : tab === 'kyc' ? (
          kycDocs.length === 0 ? (
            <div className="p-8 text-center text-gray-400">審査待ちのKYC申請はありません</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-white text-gray-500 text-xs uppercase border-b border-gray-100">
                <tr>
                  <th className="p-4 font-bold">氏名 / ID</th>
                  <th className="p-4 font-bold">書類種別</th>
                  <th className="p-4 font-bold">申請日</th>
                  <th className="p-4 font-bold">書類確認</th>
                  <th className="p-4 font-bold">ステータス</th>
                  <th className="p-4 font-bold text-center">アクション</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {kycDocs.filter(d => !search || (d.user_name || '').toLowerCase().includes(search.toLowerCase())).map((doc, i) => (
                  <tr key={doc.id} className={`hover:bg-teal-50/50 transition-colors ${i % 2 === 1 ? 'bg-slate-50' : 'bg-white'}`}>
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{doc.user_name || '---'}</p>
                      <p className="text-xs text-gray-400 font-mono">{doc.user_id.slice(0, 8)}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-xs px-2 py-1 rounded font-bold bg-indigo-100 text-indigo-700">
                        {doc.document_type}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(doc.submitted_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="p-4">
                      <button className="text-xs bg-white border border-gray-300 px-2 py-1 rounded flex items-center gap-1 hover:bg-teal-50 hover:text-teal-700 text-gray-600 font-medium transition-colors">
                        <FileText size={12} /> 書類確認
                      </button>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        doc.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        doc.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {doc.status === 'APPROVED' ? '承認済' : doc.status === 'REJECTED' ? '否認' : '審査待ち'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {doc.status === 'PENDING' && (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleKycAction(doc.id, doc.user_id, 'APPROVED')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors" title="承認">
                            <CheckCircle size={20} />
                          </button>
                          <button onClick={() => handleKycAction(doc.id, doc.user_id, 'REJECTED')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="否認">
                            <XCircle size={20} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              ユーザーが見つかりません
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-white text-gray-500 text-xs uppercase border-b border-gray-100">
                <tr>
                  <th className="p-4 font-bold">氏名 / メール</th>
                  <th className="p-4 font-bold">ロール</th>
                  <th className="p-4 font-bold">KYC</th>
                  <th className="p-4 font-bold">状態</th>
                  <th className="p-4 font-bold">登録日</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user, i) => (
                  <tr key={user.id} className={`hover:bg-teal-50/50 transition-colors ${i % 2 === 1 ? 'bg-slate-50' : 'bg-white'}`}>
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded font-bold ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                        user.role === 'THERAPIST' ? 'bg-indigo-100 text-indigo-700' :
                        user.role === 'HOST' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{user.role}</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded font-bold ${
                        user.kyc_status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        user.kyc_status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>{user.kyc_status || 'NONE'}</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold ${user.is_active ? 'text-green-600' : 'text-red-500'}`}>
                        {user.is_active ? '有効' : '停止中'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('ja-JP')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
