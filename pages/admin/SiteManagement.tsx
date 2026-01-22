import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Search, Filter, Grid, List, Plus, Edit, Trash2, 
  Eye, MapPin, Calendar, CheckCircle, XCircle,
  AlertCircle, Download, RefreshCw, Archive, EyeOff, Hotel, Home
} from 'lucide-react';

interface Site {
  id: string;
  name: string;
  type: string;
  address: string;
  area: string;
  latitude: number;
  longitude: number;
  room_count: number;
  amenities: string;
  status: string;
  created_at: string;
  host_name?: string;
  available_rooms?: number;
}

type ViewMode = 'list' | 'card';

const SiteManagement: React.FC = () => {
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>([]);
  const [filteredSites, setFilteredSites] = useState<Site[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    filterSites();
  }, [sites, searchQuery, areaFilter, typeFilter, statusFilter]);

  const fetchSites = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/sites', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSites(data.sites || []);
      } else {
        setError('施設一覧の取得に失敗しました');
      }
    } catch (err) {
      setError('施設一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const filterSites = () => {
    let filtered = [...sites];

    // 検索フィルター
    if (searchQuery) {
      filtered = filtered.filter(site => 
        site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.area?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // エリアフィルター
    if (areaFilter !== 'ALL') {
      filtered = filtered.filter(site => site.area === areaFilter);
    }

    // タイプフィルター
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(site => site.type === typeFilter);
    }

    // ステータスフィルター
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(site => site.status === statusFilter);
    }

    setFilteredSites(filtered);
  };

  const handleSelectSite = (siteId: string) => {
    setSelectedSites(prev => 
      prev.includes(siteId) 
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSites.length === filteredSites.length) {
      setSelectedSites([]);
    } else {
      setSelectedSites(filteredSites.map(site => site.id));
    }
  };

  const handleBulkHide = async () => {
    if (selectedSites.length === 0) {
      setError('施設を選択してください');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/sites/bulk/hide', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedSites }),
      });

      if (response.ok) {
        setMessage(`${selectedSites.length}件の施設を非表示にしました`);
        setSelectedSites([]);
        fetchSites();
      } else {
        setError('一括非表示に失敗しました');
      }
    } catch (err) {
      setError('一括非表示に失敗しました');
    }
  };

  const handleBulkArchive = async () => {
    if (selectedSites.length === 0) {
      setError('施設を選択してください');
      return;
    }

    if (!confirm(`${selectedSites.length}件の施設をアーカイブしますか？`)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/sites/bulk/archive', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedSites }),
      });

      if (response.ok) {
        setMessage(`${selectedSites.length}件の施設をアーカイブしました`);
        setSelectedSites([]);
        fetchSites();
      } else {
        setError('一括アーカイブに失敗しました');
      }
    } catch (err) {
      setError('一括アーカイブに失敗しました');
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedSites.length === 0) {
      setError('施設を選択してください');
      return;
    }

    const statusLabels: { [key: string]: string } = {
      'APPROVED': '稼働中',
      'SUSPENDED': '停止中',
      'PENDING': 'メンテナンス',
      'REJECTED': '非表示'
    };

    if (!confirm(`${selectedSites.length}件の施設を「${statusLabels[newStatus]}」に変更しますか？`)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/sites/bulk/status', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedSites, status: newStatus }),
      });

      if (response.ok) {
        setMessage(`${selectedSites.length}件の施設を「${statusLabels[newStatus]}」に変更しました`);
        setSelectedSites([]);
        fetchSites();
      } else {
        setError('ステータス変更に失敗しました');
      }
    } catch (err) {
      setError('ステータス変更に失敗しました');
    }
  };

  const handleExportCSV = () => {
    if (selectedSites.length === 0) {
      setError('施設を選択してください');
      return;
    }

    const selectedData = filteredSites.filter(site => selectedSites.includes(site.id));
    
    const csvContent = [
      ['ID', '施設名', 'タイプ', '住所', 'エリア', '部屋数', 'ステータス', '作成日'],
      ...selectedData.map(site => [
        site.id,
        site.name,
        site.type,
        site.address,
        site.area,
        site.room_count,
        site.status,
        new Date(site.created_at).toLocaleDateString('ja-JP'),
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sites_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    setMessage(`${selectedSites.length}件の施設をエクスポートしました`);
  };

  const handleDeleteSite = async (siteId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/admin/sites/${siteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage('施設を削除しました');
        setShowDeleteModal(false);
        fetchSites();
      } else {
        setError('施設の削除に失敗しました');
      }
    } catch (err) {
      setError('施設の削除に失敗しました');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CARE_CUBE':
        return <Building2 className="w-4 h-4" />;
      case 'CHARGE':
        return <Home className="w-4 h-4" />;
      case 'HOTEL':
        return <Hotel className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CARE_CUBE':
        return 'bg-blue-100 text-blue-800';
      case 'CHARGE':
        return 'bg-purple-100 text-purple-800';
      case 'HOTEL':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
      ACTIVE: { label: '稼働中', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      INACTIVE: { label: '停止中', color: 'bg-gray-100 text-gray-800', icon: XCircle },
      MAINTENANCE: { label: 'メンテナンス', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      HIDDEN: { label: '非表示', color: 'bg-red-100 text-red-800', icon: EyeOff },
    };

    const statusInfo = statusMap[status] || statusMap.INACTIVE;
    const Icon = statusInfo.icon;

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {statusInfo.label}
      </span>
    );
  };

  const uniqueAreas = Array.from(new Set(sites.map(s => s.area).filter(Boolean)));
  const uniqueTypes = Array.from(new Set(sites.map(s => s.type).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">施設管理</h1>
                <p className="text-sm text-gray-600">全施設の管理・編集</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/sites/new')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              新規施設
            </button>
          </div>

          {/* 統計 */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">総施設数</p>
              <p className="text-2xl font-bold text-blue-600">{sites.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">稼働中</p>
              <p className="text-2xl font-bold text-green-600">
                {sites.filter(s => s.status === 'ACTIVE').length}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">メンテナンス</p>
              <p className="text-2xl font-bold text-yellow-600">
                {sites.filter(s => s.status === 'MAINTENANCE').length}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">選択中</p>
              <p className="text-2xl font-bold text-purple-600">{selectedSites.length}</p>
            </div>
          </div>
        </div>

        {/* メッセージ表示 */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* 検索・フィルター・一括操作 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {/* 検索 */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="施設名・住所・エリアで検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* エリアフィルター */}
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">全エリア</option>
              {uniqueAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>

            {/* タイプフィルター */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">全タイプ</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* ステータスフィルター */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">全ステータス</option>
              <option value="ACTIVE">稼働中</option>
              <option value="INACTIVE">停止中</option>
              <option value="MAINTENANCE">メンテナンス</option>
              <option value="HIDDEN">非表示</option>
            </select>

            {/* 表示切替 */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded-lg ${viewMode === 'card' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={fetchSites}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              title="リフレッシュ"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* 一括操作ボタン */}
          {selectedSites.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                CSV出力 ({selectedSites.length})
              </button>
              
              {/* ステータス変更ドロップダウン */}
              <div className="relative group">
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <CheckCircle className="w-4 h-4" />
                  ステータス変更 ({selectedSites.length})
                </button>
                <div className="hidden group-hover:block absolute top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                  <button
                    onClick={() => handleBulkStatusChange('APPROVED')}
                    className="w-full text-left px-4 py-2 hover:bg-green-50 text-green-700 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    稼働中にする
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('SUSPENDED')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    停止中にする
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('PENDING')}
                    className="w-full text-left px-4 py-2 hover:bg-yellow-50 text-yellow-700 flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    メンテナンスにする
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('REJECTED')}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-700 flex items-center gap-2"
                  >
                    <EyeOff className="w-4 h-4" />
                    非表示にする
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleBulkHide}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                <EyeOff className="w-4 h-4" />
                一括非表示 ({selectedSites.length})
              </button>
              <button
                onClick={handleBulkArchive}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Archive className="w-4 h-4" />
                一括アーカイブ ({selectedSites.length})
              </button>
            </div>
          )}
        </div>

        {/* 施設一覧 */}
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">読み込み中...</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedSites.length === filteredSites.length && filteredSites.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">施設名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">タイプ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">住所</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">エリア</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">部屋数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">作成日</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSites.map(site => (
                  <tr key={site.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedSites.includes(site.id)}
                        onChange={() => handleSelectSite(site.id)}
                        className="w-4 h-4 text-blue-600"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(site.type)}`}>
                          {getTypeIcon(site.type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{site.name}</p>
                          {site.host_name && (
                            <p className="text-xs text-gray-500">ホスト: {site.host_name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(site.type)}`}>
                        {site.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{site.address}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{site.area}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {site.room_count}室
                      {site.available_rooms !== undefined && (
                        <span className="text-green-600 ml-1">({site.available_rooms}空)</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(site.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(site.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/sites/${site.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="詳細"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSite(site);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="編集"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSite(site);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSites.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">施設が見つかりません</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSites.map(site => (
              <div key={site.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <input
                      type="checkbox"
                      checked={selectedSites.includes(site.id)}
                      onChange={() => handleSelectSite(site.id)}
                      className="w-5 h-5 text-blue-600 mt-1"
                    />
                    {getStatusBadge(site.status)}
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-lg ${getTypeColor(site.type)}`}>
                      {getTypeIcon(site.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{site.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(site.type)}`}>
                        {site.type}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {site.address}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4" />
                      {site.area} · {site.room_count}室
                      {site.available_rooms !== undefined && (
                        <span className="text-green-600">({site.available_rooms}空)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(site.created_at).toLocaleDateString('ja-JP')}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => navigate(`/admin/sites/${site.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                    >
                      <Eye className="w-4 h-4" />
                      詳細
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSite(site);
                        setShowEditModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                    >
                      <Edit className="w-4 h-4" />
                      編集
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSite(site);
                        setShowDeleteModal(true);
                      }}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredSites.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">施設が見つかりません</p>
              </div>
            )}
          </div>
        )}

        {/* 削除確認モーダル */}
        {showDeleteModal && selectedSite && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">施設の削除</h3>
              <p className="text-gray-600 mb-6">
                「{selectedSite.name}」を削除してもよろしいですか？この操作は取り消せません。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => handleDeleteSite(selectedSite.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  削除する
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteManagement;
