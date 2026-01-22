import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Grid, List, Edit, Trash2, 
  Mail, Phone, Calendar, CheckCircle, XCircle,
  AlertCircle, RefreshCw, Building, MapPin, Download, Archive, EyeOff
} from 'lucide-react';

interface Host {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  avatar_url: string;
  email_verified: number;
  phone_verified: number;
  site_count: number;
  approval_status: string;
  created_at: string;
  updated_at: string;
}

type ViewMode = 'list' | 'card';

const HostManagement: React.FC = () => {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [filteredHosts, setFilteredHosts] = useState<Host[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHosts, setSelectedHosts] = useState<string[]>([]);

  useEffect(() => {
    fetchHosts();
  }, []);

  useEffect(() => {
    filterHosts();
  }, [hosts, searchQuery, statusFilter]);

  const fetchHosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/hosts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHosts(data.hosts || []);
      } else {
        setError('拠点ホスト一覧の取得に失敗しました');
      }
    } catch (err) {
      setError('拠点ホスト一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const filterHosts = () => {
    let filtered = [...hosts];

    // 検索フィルター
    if (searchQuery) {
      filtered = filtered.filter(host => 
        host.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        host.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        host.phone?.includes(searchQuery)
      );
    }

    // ステータスフィルター
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(host => host.approval_status === statusFilter);
    }

    setFilteredHosts(filtered);
  };

  const handleSelectHost = (hostId: string) => {
    setSelectedHosts(prev => 
      prev.includes(hostId) 
        ? prev.filter(id => id !== hostId)
        : [...prev, hostId]
    );
  };

  const handleSelectAll = () => {
    if (selectedHosts.length === filteredHosts.length) {
      setSelectedHosts([]);
    } else {
      setSelectedHosts(filteredHosts.map(h => h.id));
    }
  };

  const handleExportCSV = () => {
    if (selectedHosts.length === 0) {
      setError('拠点ホストを選択してください');
      return;
    }

    const selectedData = filteredHosts.filter(h => selectedHosts.includes(h.id));
    
    const csvContent = [
      ['ID', '名前', 'メール', '電話', '管理拠点数', 'ステータス', '作成日'],
      ...selectedData.map(h => [
        h.id,
        h.name,
        h.email,
        h.phone || '',
        h.site_count || 0,
        h.approval_status,
        new Date(h.created_at).toLocaleDateString('ja-JP'),
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `hosts_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    setMessage(`${selectedHosts.length}件の拠点ホストをエクスポートしました`);
  };

  const handleBulkArchive = async () => {
    if (selectedHosts.length === 0) {
      setError('拠点ホストを選択してください');
      return;
    }

    if (!confirm(`${selectedHosts.length}件の拠点ホストをアーカイブしますか？`)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      let successCount = 0;
      
      for (const hostId of selectedHosts) {
        const response = await fetch(`/api/admin/hosts/${hostId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          successCount++;
        }
      }
      
      setMessage(`${successCount}件の拠点ホストをアーカイブしました`);
      setSelectedHosts([]);
      fetchHosts();
    } catch (err) {
      setError('一括アーカイブに失敗しました');
    }
  };

  const handleDeleteHost = async (hostId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/hosts/${hostId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage('拠点ホストを削除しました');
        fetchHosts();
        setShowDeleteModal(false);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError('削除に失敗しました');
      }
    } catch (err) {
      setError('削除に失敗しました');
    }
  };

  const handleApprove = async (hostId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/hosts/${hostId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage('拠点ホストを承認しました');
        fetchHosts();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError('承認に失敗しました');
      }
    } catch (err) {
      setError('承認に失敗しました');
    }
  };

  const handleReject = async (hostId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/hosts/${hostId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage('拠点ホストを却下しました');
        fetchHosts();
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
          拠点ホスト管理
        </h1>
        <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">
          Facility Host Management System
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
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* ステータスフィルター */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-12 pr-8 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 appearance-none bg-white"
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
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-3 rounded-xl transition-colors ${
                viewMode === 'card'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Grid size={20} />
            </button>
          </div>

          {/* リフレッシュ */}
          <button
            onClick={fetchHosts}
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
            <p className="text-2xl font-black text-gray-900">{hosts.length}</p>
            <p className="text-xs text-gray-500 font-bold">総ホスト数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-green-600">
              {hosts.filter(h => h.approval_status === 'APPROVED').length}
            </p>
            <p className="text-xs text-gray-500 font-bold">承認済</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-yellow-600">
              {hosts.filter(h => h.approval_status === 'PENDING').length}
            </p>
            <p className="text-xs text-gray-500 font-bold">審査中</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-red-600">
              {hosts.filter(h => h.approval_status === 'REJECTED').length}
            </p>
            <p className="text-xs text-gray-500 font-bold">却下</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-purple-600">{selectedHosts.length}</p>
            <p className="text-xs text-gray-500 font-bold">選択中</p>
          </div>
        </div>

        {/* 一括操作ボタン */}
        {selectedHosts.length > 0 && (
          <div className="flex gap-3 pt-4 mt-4 border-t">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              CSV出力 ({selectedHosts.length})
            </button>
            <button
              onClick={handleBulkArchive}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Archive className="w-4 h-4" />
              一括アーカイブ ({selectedHosts.length})
            </button>
          </div>
        )}
      </div>

      {/* ホスト一覧 */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedHosts.length === filteredHosts.length && filteredHosts.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-orange-600"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  ホスト
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  拠点数
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
              {filteredHosts.map((host) => (
                <tr key={host.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedHosts.includes(host.id)}
                      onChange={() => handleSelectHost(host.id)}
                      className="w-4 h-4 text-orange-600"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={host.avatar_url || '/placeholder-user.jpg'}
                        alt={host.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-gray-900">{host.name}</p>
                        <p className="text-sm text-gray-500">{host.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-orange-600" />
                      <span className="text-sm font-bold text-orange-600">{host.site_count || 0} 拠点</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={14} />
                        {host.email}
                      </div>
                      {host.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={14} />
                          {host.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(host.approval_status)}`}>
                      {getStatusLabel(host.approval_status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(host.created_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {host.approval_status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(host.id)}
                            className="px-3 py-1 text-xs bg-green-50 text-green-600 rounded-lg font-bold hover:bg-green-100 transition-colors"
                          >
                            承認
                          </button>
                          <button
                            onClick={() => handleReject(host.id)}
                            className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 transition-colors"
                          >
                            却下
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setSelectedHost(host);
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

          {filteredHosts.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              拠点ホストが見つかりません
            </div>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHosts.map((host) => (
            <div key={host.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedHosts.includes(host.id)}
                    onChange={() => handleSelectHost(host.id)}
                    className="w-5 h-5 text-orange-600 mt-1"
                  />
                  <img
                    src={host.avatar_url || '/placeholder-user.jpg'}
                    alt={host.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(host.approval_status)}`}>
                  {getStatusLabel(host.approval_status)}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-2">
                <Building size={18} className="text-orange-600" />
                {host.name}
              </h3>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Mail size={14} />
                  {host.email}
                </div>
                {host.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} />
                    {host.phone}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-orange-600" />
                  <span className="font-bold text-orange-600">{host.site_count || 0} 拠点</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  {new Date(host.created_at).toLocaleDateString('ja-JP')}
                </div>
              </div>

              <div className="flex gap-2">
                {host.approval_status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleApprove(host.id)}
                      className="flex-1 px-4 py-2 bg-green-50 text-green-600 rounded-xl font-bold hover:bg-green-100 transition-colors"
                    >
                      承認
                    </button>
                    <button
                      onClick={() => handleReject(host.id)}
                      className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                    >
                      却下
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setSelectedHost(host);
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

          {filteredHosts.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              拠点ホストが見つかりません
            </div>
          )}
        </div>
      )}

      {/* 削除確認モーダル */}
      {showDeleteModal && selectedHost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">拠点ホスト削除の確認</h3>
            <p className="text-gray-600 mb-6">
              <strong>{selectedHost.name}</strong> を削除してもよろしいですか？
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
                onClick={() => handleDeleteHost(selectedHost.id)}
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

export default HostManagement;
