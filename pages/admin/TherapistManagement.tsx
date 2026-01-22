import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Grid, List, Edit, Trash2, 
  Mail, Phone, Calendar, CheckCircle, XCircle,
  AlertCircle, RefreshCw, Award, Building2, Star
} from 'lucide-react';

interface Therapist {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  avatar_url: string;
  email_verified: number;
  phone_verified: number;
  kyc_status: string;
  bio: string;
  specialties: string;
  office_name: string;
  office_id: string;
  approval_status: string;
  created_at: string;
  updated_at: string;
}

type ViewMode = 'list' | 'card';

const TherapistManagement: React.FC = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [filteredTherapists, setFilteredTherapists] = useState<Therapist[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchTherapists();
  }, []);

  useEffect(() => {
    filterTherapists();
  }, [therapists, searchQuery, statusFilter]);

  const fetchTherapists = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/therapists', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTherapists(data.therapists || []);
      } else {
        setError('セラピスト一覧の取得に失敗しました');
      }
    } catch (err) {
      setError('セラピスト一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const filterTherapists = () => {
    let filtered = [...therapists];

    // 検索フィルター
    if (searchQuery) {
      filtered = filtered.filter(therapist => 
        therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        therapist.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        therapist.phone?.includes(searchQuery) ||
        therapist.office_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // ステータスフィルター
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(therapist => therapist.approval_status === statusFilter);
    }

    setFilteredTherapists(filtered);
  };

  const handleDeleteTherapist = async (therapistId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/therapists/${therapistId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage('セラピストを削除しました');
        fetchTherapists();
        setShowDeleteModal(false);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError('削除に失敗しました');
      }
    } catch (err) {
      setError('削除に失敗しました');
    }
  };

  const handleApprove = async (therapistId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/therapists/${therapistId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage('セラピストを承認しました');
        fetchTherapists();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError('承認に失敗しました');
      }
    } catch (err) {
      setError('承認に失敗しました');
    }
  };

  const handleReject = async (therapistId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/therapists/${therapistId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage('セラピストを却下しました');
        fetchTherapists();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError('却下に失敗しました');
      }
    } catch (err) {
      setError('却下に失敗しました');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'APPROVED': return '承認済';
      case 'PENDING': return '審査中';
      case 'REJECTED': return '却下';
      default: return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">
          セラピスト管理
        </h1>
        <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">
          Therapist Management System
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
              placeholder="名前、メール、電話番号、所属事務所で検索..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* ステータスフィルター */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-12 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 appearance-none bg-white"
            >
              <option value="ALL">全ステータス</option>
              <option value="APPROVED">承認済</option>
              <option value="PENDING">審査中</option>
              <option value="REJECTED">却下</option>
            </select>
          </div>

          {/* 表示モード切替 */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-3 rounded-xl transition-colors ${
                viewMode === 'card'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Grid size={20} />
            </button>
          </div>

          {/* リフレッシュ */}
          <button
            onClick={fetchTherapists}
            disabled={loading}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            更新
          </button>
        </div>

        {/* 統計情報 */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-black text-gray-900">{therapists.length}</p>
            <p className="text-xs text-gray-500 font-bold">総セラピスト数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-green-600">
              {therapists.filter(t => t.approval_status === 'APPROVED').length}
            </p>
            <p className="text-xs text-gray-500 font-bold">承認済</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-yellow-600">
              {therapists.filter(t => t.approval_status === 'PENDING').length}
            </p>
            <p className="text-xs text-gray-500 font-bold">審査中</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-red-600">
              {therapists.filter(t => t.approval_status === 'REJECTED').length}
            </p>
            <p className="text-xs text-gray-500 font-bold">却下</p>
          </div>
        </div>
      </div>

      {/* セラピスト一覧 */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  セラピスト
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  所属事務所
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  連絡先
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  ステータス
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
              {filteredTherapists.map((therapist) => (
                <tr key={therapist.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={therapist.avatar_url || '/placeholder-therapist.jpg'}
                        alt={therapist.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-gray-900">{therapist.name}</p>
                        <p className="text-sm text-gray-500">{therapist.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {therapist.office_name ? (
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-blue-600" />
                        <span className="text-sm font-bold text-blue-600">{therapist.office_name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">未所属</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={14} />
                        {therapist.email}
                      </div>
                      {therapist.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={14} />
                          {therapist.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(therapist.approval_status)}`}>
                      {getStatusLabel(therapist.approval_status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(therapist.created_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {therapist.approval_status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(therapist.id)}
                            className="px-3 py-1 text-xs bg-green-50 text-green-600 rounded-lg font-bold hover:bg-green-100 transition-colors"
                          >
                            承認
                          </button>
                          <button
                            onClick={() => handleReject(therapist.id)}
                            className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 transition-colors"
                          >
                            却下
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setSelectedTherapist(therapist);
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

          {filteredTherapists.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              セラピストが見つかりません
            </div>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTherapists.map((therapist) => (
            <div key={therapist.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <img
                  src={therapist.avatar_url || '/placeholder-therapist.jpg'}
                  alt={therapist.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(therapist.approval_status)}`}>
                  {getStatusLabel(therapist.approval_status)}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-2">
                <Award size={18} className="text-indigo-600" />
                {therapist.name}
              </h3>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Mail size={14} />
                  {therapist.email}
                </div>
                {therapist.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} />
                    {therapist.phone}
                  </div>
                )}
                {therapist.office_name && (
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-blue-600" />
                    <span className="font-bold text-blue-600">{therapist.office_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  {new Date(therapist.created_at).toLocaleDateString('ja-JP')}
                </div>
              </div>

              <div className="flex gap-2">
                {therapist.approval_status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleApprove(therapist.id)}
                      className="flex-1 px-4 py-2 bg-green-50 text-green-600 rounded-xl font-bold hover:bg-green-100 transition-colors"
                    >
                      承認
                    </button>
                    <button
                      onClick={() => handleReject(therapist.id)}
                      className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                    >
                      却下
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setSelectedTherapist(therapist);
                    setShowDeleteModal(true);
                  }}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  削除
                </button>
              </div>
            </div>
          ))}

          {filteredTherapists.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              セラピストが見つかりません
            </div>
          )}
        </div>
      )}

      {/* 削除確認モーダル */}
      {showDeleteModal && selectedTherapist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">セラピスト削除の確認</h3>
            <p className="text-gray-600 mb-6">
              <strong>{selectedTherapist.name}</strong> を削除してもよろしいですか？
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
                onClick={() => handleDeleteTherapist(selectedTherapist.id)}
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

export default TherapistManagement;
