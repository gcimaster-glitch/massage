import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Search, Filter, Download, RefreshCw, CheckCircle, XCircle,
  AlertCircle, Mail, Phone, Calendar, Eye, Ban, Trash2, FileText
} from 'lucide-react';
import SimpleLayout from '../../components/SimpleLayout';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  email_verified: number;
  phone_verified: number;
  kyc_status: string;
  status: string;
  created_at: string;
  last_login: string;
}

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter, statusFilter, verificationFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        // モックデータ
        setUsers([
          {
            id: 'user-001',
            email: 'yamada@example.com',
            name: '山田 花子',
            phone: '090-1234-5678',
            role: 'USER',
            email_verified: 1,
            phone_verified: 1,
            kyc_status: 'APPROVED',
            status: 'ACTIVE',
            created_at: '2026-01-15',
            last_login: '2026-01-22 14:30'
          },
          {
            id: 'user-002',
            email: 'sato@example.com',
            name: '佐藤 太郎',
            phone: '090-2345-6789',
            role: 'USER',
            email_verified: 1,
            phone_verified: 0,
            kyc_status: 'PENDING',
            status: 'ACTIVE',
            created_at: '2026-01-18',
            last_login: '2026-01-22 13:15'
          },
          {
            id: 'user-003',
            email: 'tanaka@example.com',
            name: '田中 三郎',
            phone: '090-3456-7890',
            role: 'USER',
            email_verified: 1,
            phone_verified: 1,
            kyc_status: 'REJECTED',
            status: 'SUSPENDED',
            created_at: '2026-01-10',
            last_login: '2026-01-20 10:00'
          },
          {
            id: 'user-004',
            email: 'suzuki@example.com',
            name: '鈴木 美咲',
            phone: '090-4567-8901',
            role: 'USER',
            email_verified: 0,
            phone_verified: 0,
            kyc_status: 'NOT_SUBMITTED',
            status: 'ACTIVE',
            created_at: '2026-01-20',
            last_login: '2026-01-22 11:20'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // 検索フィルター
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery)
      );
    }

    // ロールフィルター
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // ステータスフィルター
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // 認証ステータスフィルター
    if (verificationFilter !== 'all') {
      if (verificationFilter === 'verified') {
        filtered = filtered.filter(user => user.email_verified === 1 && user.phone_verified === 1);
      } else if (verificationFilter === 'unverified') {
        filtered = filtered.filter(user => user.email_verified === 0 || user.phone_verified === 0);
      }
    }

    setFilteredUsers(filtered);
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
      setShowBulkActions(false);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
      setShowBulkActions(true);
    }
  };

  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      const newSelected = selectedUsers.filter(id => id !== userId);
      setSelectedUsers(newSelected);
      setShowBulkActions(newSelected.length > 0);
    } else {
      const newSelected = [...selectedUsers, userId];
      setSelectedUsers(newSelected);
      setShowBulkActions(true);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    const confirmation = window.confirm(
      `選択した${selectedUsers.length}件のユーザーに対して「${action}」を実行しますか？`
    );

    if (!confirmation) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          user_ids: selectedUsers,
          action: action
        })
      });

      if (response.ok) {
        alert(`${action}を実行しました`);
        setSelectedUsers([]);
        setShowBulkActions(false);
        fetchUsers();
      } else {
        alert(`${action}に失敗しました`);
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
      alert('一括操作に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ['ユーザーID', 'メール', '氏名', '電話番号', 'ロール', 'メール認証', '電話認証', 'KYCステータス', 'ステータス', '登録日', '最終ログイン'].join(','),
      ...filteredUsers.map(u => 
        [u.id, u.email, u.name, u.phone, u.role, u.email_verified ? '済' : '未', u.phone_verified ? '済' : '未', u.kyc_status, u.status, u.created_at, u.last_login].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">有効</span>;
      case 'SUSPENDED':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">停止中</span>;
      case 'PENDING':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">保留</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const getKYCBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle size={12} />承認済</span>;
      case 'PENDING':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 flex items-center gap-1"><AlertCircle size={12} />審査中</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1"><XCircle size={12} />却下</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">未提出</span>;
    }
  };

  return (
    <SimpleLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* ヘッダー */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">一般ユーザー管理</h1>
            <p className="text-gray-600">ユーザーの検索・管理・一括操作ができます</p>
          </div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            更新
          </button>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">総ユーザー数</p>
            <p className="text-3xl font-bold text-gray-900">{users.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">有効</p>
            <p className="text-3xl font-bold text-green-600">{users.filter(u => u.status === 'ACTIVE').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">停止中</p>
            <p className="text-3xl font-bold text-red-600">{users.filter(u => u.status === 'SUSPENDED').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">KYC承認済</p>
            <p className="text-3xl font-bold text-blue-600">{users.filter(u => u.kyc_status === 'APPROVED').length}</p>
          </div>
        </div>

        {/* 検索・フィルター */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 検索 */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="氏名、メール、電話番号で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* ステータスフィルター */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">すべてのステータス</option>
              <option value="ACTIVE">有効</option>
              <option value="SUSPENDED">停止中</option>
              <option value="PENDING">保留</option>
            </select>

            {/* 認証フィルター */}
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">すべて</option>
              <option value="verified">認証済</option>
              <option value="unverified">未認証</option>
            </select>

            {/* CSV出力 */}
            <button
              onClick={handleExportCSV}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-2"
            >
              <Download size={20} />
              CSV出力
            </button>
          </div>
        </div>

        {/* 一括操作バー */}
        {showBulkActions && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-bold text-blue-900">{selectedUsers.length}件選択中</span>
              <button
                onClick={() => {
                  setSelectedUsers([]);
                  setShowBulkActions(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-bold"
              >
                選択解除
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('ACTIVATE')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700"
              >
                有効化
              </button>
              <button
                onClick={() => handleBulkAction('SUSPEND')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700"
              >
                停止
              </button>
              <button
                onClick={() => handleBulkAction('SEND_EMAIL')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
              >
                メール送信
              </button>
              <button
                onClick={() => handleBulkAction('EXPORT')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-bold hover:bg-gray-700"
              >
                エクスポート
              </button>
            </div>
          </div>
        )}

        {/* ユーザー一覧テーブル */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-teal-600 rounded"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">ユーザー</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">連絡先</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">認証状況</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">KYC</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">ステータス</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">登録日</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="w-4 h-4 text-teal-600 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail size={14} className="text-gray-400" />
                          <span className="text-gray-900">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={14} className="text-gray-400" />
                          <span className="text-gray-600">{user.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {user.email_verified ? (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle size={12} />
                            メール認証済
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-red-600">
                            <XCircle size={12} />
                            メール未認証
                          </div>
                        )}
                        {user.phone_verified ? (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle size={12} />
                            電話認証済
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-red-600">
                            <XCircle size={12} />
                            電話未認証
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getKYCBadge(user.kyc_status)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{user.created_at}</div>
                      <div className="text-xs text-gray-500">最終: {user.last_login}</div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                        className="text-teal-600 hover:text-teal-700 font-bold text-sm flex items-center gap-1"
                      >
                        <Eye size={16} />
                        詳細
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-bold">ユーザーが見つかりません</p>
            </div>
          )}
        </div>
      </div>
    </SimpleLayout>
  );
};

export default UserManagement;
