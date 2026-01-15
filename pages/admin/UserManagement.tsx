import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Edit2, Trash2, Archive, RotateCcw,
  ChevronLeft, ChevronRight, Eye, Shield, Mail, Phone, Calendar,
  CheckCircle, XCircle, Loader2, AlertCircle
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  avatar_url: string | null;
  email_verified: number;
  phone_verified: number;
  kyc_status: string;
  is_archived: number;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  social_accounts_count: number;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      console.log('🔍 Auth Token:', token ? 'EXISTS' : 'MISSING');
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        archived: showArchived.toString(),
      });

      const url = `/api/admin/users?${params}`;
      console.log('📡 Fetching:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📊 Response Status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Users loaded:', data);
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
      } else {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
      }
    } catch (error) {
      console.error('❌ Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, search, roleFilter, showArchived]);

  const handleArchive = async (userId: string) => {
    const token = localStorage.getItem('auth_token');
    await fetch(`/api/admin/users/${userId}/archive`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    loadUsers();
  };

  const handleRestore = async (userId: string) => {
    const token = localStorage.getItem('auth_token');
    await fetch(`/api/admin/users/${userId}/restore`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    loadUsers();
  };

  const handleDelete = async (userId: string) => {
    const token = localStorage.getItem('auth_token');
    await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    setShowDeleteConfirm(false);
    setSelectedUser(null);
    loadUsers();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">ユーザー管理</h1>
          <p className="text-gray-600">登録ユーザーの管理、編集、削除</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="名前、メール、電話番号で検索..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">全ての役割</option>
                <option value="USER">ユーザー</option>
                <option value="THERAPIST">セラピスト</option>
                <option value="HOST">施設ホスト</option>
                <option value="ADMIN">管理者</option>
              </select>
            </div>

            {/* Archive Toggle */}
            <div>
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`w-full px-4 py-3 rounded-xl font-bold transition-all ${
                  showArchived
                    ? 'bg-orange-100 text-orange-600 border-2 border-orange-300'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
                }`}
              >
                {showArchived ? 'アーカイブ表示中' : '通常表示中'}
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin text-teal-600" size={48} />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                        ユーザー
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                        役割
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                        連絡先
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                        認証状態
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                        登録日
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-black text-gray-600 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center font-bold text-teal-600">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' :
                            user.role === 'THERAPIST' ? 'bg-blue-100 text-blue-600' :
                            user.role === 'HOST' ? 'bg-green-100 text-green-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail size={14} />
                              {user.email_verified ? (
                                <CheckCircle size={14} className="text-green-500" />
                              ) : (
                                <XCircle size={14} className="text-red-500" />
                              )}
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone size={14} />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {user.social_accounts_count > 0 && (
                              <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold">
                                Google連携
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString('ja-JP')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="詳細"
                            >
                              <Eye size={18} className="text-gray-600" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowEditModal(true);
                              }}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="編集"
                            >
                              <Edit2 size={18} className="text-blue-600" />
                            </button>
                            {user.is_archived ? (
                              <>
                                <button
                                  onClick={() => handleRestore(user.id)}
                                  className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                                  title="復元"
                                >
                                  <RotateCcw size={18} className="text-green-600" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowDeleteConfirm(true);
                                  }}
                                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                  title="完全削除"
                                >
                                  <Trash2 size={18} className="text-red-600" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleArchive(user.id)}
                                className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
                                title="アーカイブ"
                              >
                                <Archive size={18} className="text-orange-600" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronLeft size={20} />
                  前へ
                </button>
                <span className="text-sm text-gray-600">
                  ページ {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  次へ
                  <ChevronRight size={20} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle size={24} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">完全削除の確認</h3>
                  <p className="text-sm text-gray-600">この操作は取り消せません</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                <strong>{selectedUser.name}</strong> を完全に削除しますか？
                <br />
                すべてのデータが削除され、復元できません。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => handleDelete(selectedUser.id)}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                >
                  完全削除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
