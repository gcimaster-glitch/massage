import React, { useState, useEffect } from 'react';
import { Building2, Search, Check } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';

interface Site {
  id: string;
  name: string;
  type: string;
  address: string;
  area: string;
  status: string;
  room_count: number;
  host_name?: string;
}

const SiteManagement: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [filteredSites, setFilteredSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // 施設データを取得
  useEffect(() => {
    fetchSites();
  }, []);

  // フィルター適用
  useEffect(() => {
    filterSites();
  }, [sites, searchQuery, statusFilter]);

  const fetchSites = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/sites', {
        headers: { 'Authorization': `Bearer ${token}` }
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

    if (searchQuery) {
      filtered = filtered.filter(site =>
        site.name.includes(searchQuery) ||
        site.address.includes(searchQuery) ||
        site.area.includes(searchQuery)
      );
    }

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
        setMessage(`${selectedSites.length}件の施設のステータスを変更しました`);
        setSelectedSites([]);
        fetchSites();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError('ステータス変更に失敗しました');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('ステータス変更に失敗しました');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleExportCSV = () => {
    if (selectedSites.length === 0) {
      setError('施設を選択してください');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const selectedData = filteredSites.filter(site => selectedSites.includes(site.id));
    const csvContent = [
      ['ID', '施設名', 'タイプ', '住所', 'エリア', '部屋数', 'ステータス'].join(','),
      ...selectedData.map(site => [
        site.id,
        site.name,
        site.type,
        site.address,
        site.area,
        site.room_count,
        site.status
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sites_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    setMessage(`${selectedSites.length}件の施設をCSV出力しました`);
    setTimeout(() => setMessage(''), 3000);
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { label: string; color: string } } = {
      'APPROVED': { label: '稼働中', color: 'bg-green-100 text-green-800' },
      'SUSPENDED': { label: '停止中', color: 'bg-gray-100 text-gray-800' },
      'PENDING': { label: 'メンテナンス', color: 'bg-yellow-100 text-yellow-800' },
      'REJECTED': { label: '非表示', color: 'bg-red-100 text-red-800' }
    };
    const badge = badges[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">施設管理</h1>
          <p className="text-gray-600 mt-2">全施設の管理と一括操作</p>
        </div>

        {/* メッセージ */}
        {message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* フィルター */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 検索 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="施設名、住所、エリアで検索"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* ステータスフィルター */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="ALL">全ステータス</option>
              <option value="APPROVED">稼働中</option>
              <option value="SUSPENDED">停止中</option>
              <option value="PENDING">メンテナンス</option>
              <option value="REJECTED">非表示</option>
            </select>

            {/* 選択数 */}
            <div className="flex items-center justify-end">
              <span className="text-sm text-gray-600 font-bold">
                {selectedSites.length > 0 && `${selectedSites.length}件選択中 / `}
                全{filteredSites.length}件
              </span>
            </div>
          </div>
        </div>

        {/* 一括操作ボタン */}
        {selectedSites.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-all"
              >
                CSV出力 ({selectedSites.length})
              </button>
              <button
                onClick={() => handleBulkStatusChange('APPROVED')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all"
              >
                稼働中にする ({selectedSites.length})
              </button>
              <button
                onClick={() => handleBulkStatusChange('SUSPENDED')}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600 transition-all"
              >
                停止中にする ({selectedSites.length})
              </button>
              <button
                onClick={() => handleBulkStatusChange('PENDING')}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600 transition-all"
              >
                メンテナンスにする ({selectedSites.length})
              </button>
              <button
                onClick={() => handleBulkStatusChange('REJECTED')}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all"
              >
                非表示にする ({selectedSites.length})
              </button>
            </div>
          </div>
        )}

        {/* 施設一覧テーブル */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">読み込み中...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedSites.length === filteredSites.length && filteredSites.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">施設名</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">タイプ</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">エリア</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">部屋数</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">ステータス</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">ホスト</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSites.map((site) => (
                  <tr key={site.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedSites.includes(site.id)}
                        onChange={() => handleSelectSite(site.id)}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Building2 size={20} className="text-gray-400" />
                        <div>
                          <p className="font-bold text-gray-900">{site.name}</p>
                          <p className="text-sm text-gray-500">{site.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{site.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{site.area}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{site.room_count}室</td>
                    <td className="px-6 py-4">{getStatusBadge(site.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{site.host_name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SiteManagement;
