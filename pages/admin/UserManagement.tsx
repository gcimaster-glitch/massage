import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Grid, List, Plus, Edit, Trash2, 
  Eye, Mail, Phone, MapPin, Calendar, CheckCircle, XCircle,
  AlertCircle, Download, RefreshCw, User, Award, Building2
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  avatar_url: string;
  email_verified: number;
  phone_verified: number;
  kyc_status: string;
  created_at: string;
  updated_at: string;
}

type ViewMode = 'list' | 'card';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        setError('ユーザー一覧の取得に失敗しました');
      }
    } catch (err) {
      setError('ユーザー一覧の取得に失敗しました');
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
        user.phone?.includes(searchQuery)
      );
    }

    // ロールフィルター
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage('ユーザーを削除しました');
        fetchUsers();
        setShowDeleteModal(false);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError('削除に失敗しました');
      }
    } catch (err) {
      setError('削除に失敗しました');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-700';
      case 'THERAPIST': return 'bg-indigo-100 text-indigo-700';
      case 'HOST': return 'bg-orange-100 text-orange-700';
      case 'THERAPIST_OFFICE': return 'bg-blue-100 text-blue-700';
      case 'USER': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'THERAPIST': return <Award size={16} />;
      case 'HOST': return <Building2 size={16} />;
      case 'THERAPIST_OFFICE': return <Building2 size={16} />;
      default: return <User size={16} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">
          ユーザー管理
        </h1>
        <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">
          User Management System
        </p>
      </div>

      {/* メッセージ表示 */}
      {message && (
        <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center gap-3">
          <CheckCircle className="text-teal-600" size={20} />
          <p className="text-teal-600 font-bold">{message}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-600 font-bold">{error}</p>
        </div>
      )}

      {/* フィルター・検索バー */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 検索 */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="名前、メール、電話番号で検索..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* ロールフィルター */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-12 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 appearance-none bg-white"
            >
              <option value="ALL">全ロール</option>
              <option value="USER">一般ユーザー</option>
              <option value="THERAPIST">セラピスト</option>
              <option value="HOST">施設ホスト</option>
              <option value="THERAPIST_OFFICE">セラピスト事務所</option>
              <option value="ADMIN">管理者</option>
            </select>
          </div>

          {/* 表示モード切替 */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-colors ${
                viewMode === 'list'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-3 rounded-xl transition-colors ${
                viewMode === 'card'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Grid size={20} />
            </button>
          </div>

          {/* リフレッシュ */}
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            更新
          </button>
        </div>

        {/* 統計情報 */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-2xl font-black text-gray-900">{users.length}</p>
            <p className="text-xs text-gray-500 font-bold">総ユーザー数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-green-600">
              {users.filter(u => u.role === 'USER').length}
            </p>
            <p className="text-xs text-gray-500 font-bold">一般ユーザー</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-indigo-600">
              {users.filter(u => u.role === 'THERAPIST').length}
            </p>
            <p className="text-xs text-gray-500 font-bold">セラピスト</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-orange-600">
              {users.filter(u => u.role === 'HOST').length}
            </p>
            <p className="text-xs text-gray-500 font-bold">施設ホスト</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-blue-600">
              {users.filter(u => u.role === 'THERAPIST_OFFICE').length}
            </p>
            <p className="text-xs text-gray-500 font-bold">事務所</p>
          </div>
        </div>
      </div>

      {/* ユーザー一覧 */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  ユーザー
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  ロール
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  連絡先
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  認証状態
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  登録日
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar_url || '/placeholder-user.jpg'}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={14} />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={14} />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {user.email_verified ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <XCircle size={16} className="text-gray-300" />
                      )}
                      {user.phone_verified ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <XCircle size={16} className="text-gray-300" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              ユーザーが見つかりません
            </div>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <img
                  src={user.avatar_url || '/placeholder-user.jpg'}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeColor(user.role)}`}>
                  {getRoleIcon(user.role)}
                  {user.role}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 text-lg mb-2">{user.name}</h3>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Mail size={14} />
                  {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} />
                    {user.phone}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  {new Date(user.created_at).toLocaleDateString('ja-JP')}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setShowEditModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit size={16} />
                  編集
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setShowDeleteModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  削除
                </button>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              ユーザーが見つかりません
            </div>
          )}
        </div>
      )}

      {/* 削除確認モーダル */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">ユーザー削除の確認</h3>
            <p className="text-gray-600 mb-6">
              <strong>{selectedUser.name}</strong> を削除してもよろしいですか？
              <br />
              この操作は取り消せません。
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUser.id)}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
