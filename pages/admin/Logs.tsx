import React, { useState } from 'react';
import { Search, Download, Filter, FileText, AlertCircle, CheckCircle, Clock, Shield } from 'lucide-react';
import SimpleLayout from '../../components/SimpleLayout';

const AdminLogs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'auth' | 'booking' | 'payment' | 'incident'>('all');

  // モックデータ
  const logs = [
    {
      id: 'LOG-001',
      timestamp: '2026-01-22 15:30:45',
      type: 'incident',
      severity: 'high',
      user: '山田 花子',
      action: 'SOS発報',
      details: '新宿CUBE-03でSOS発報。警備会社に通知済み。',
      ipAddress: '203.0.113.42'
    },
    {
      id: 'LOG-002',
      timestamp: '2026-01-22 14:25:12',
      type: 'payment',
      severity: 'medium',
      user: '佐藤 太郎',
      action: '決済失敗',
      details: 'クレジットカード決済失敗（残高不足）。予約ID: BK-12348',
      ipAddress: '198.51.100.23'
    },
    {
      id: 'LOG-003',
      timestamp: '2026-01-22 13:15:33',
      type: 'booking',
      severity: 'low',
      user: '田中 三郎',
      action: '予約完了',
      details: '予約ID: BK-12347の予約が完了しました。',
      ipAddress: '192.0.2.15'
    },
    {
      id: 'LOG-004',
      timestamp: '2026-01-22 12:45:21',
      type: 'auth',
      severity: 'low',
      user: 'admin@hogusy.com',
      action: 'ログイン',
      details: '管理者アカウントでログインしました。',
      ipAddress: '10.0.0.1'
    },
    {
      id: 'LOG-005',
      timestamp: '2026-01-22 11:30:08',
      type: 'booking',
      severity: 'low',
      user: '鈴木 美咲',
      action: 'セラピスト承認',
      details: 'セラピストアカウントが承認されました。',
      ipAddress: '203.0.113.99'
    },
    {
      id: 'LOG-006',
      timestamp: '2026-01-22 10:15:42',
      type: 'payment',
      severity: 'low',
      user: '高橋 次郎',
      action: '決済完了',
      details: '¥8,000の決済が完了しました。予約ID: BK-12345',
      ipAddress: '198.51.100.67'
    }
  ];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.includes(searchQuery) || 
                          log.action.includes(searchQuery) ||
                          log.details.includes(searchQuery);
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1">
            <AlertCircle size={12} />
            高
          </span>
        );
      case 'medium':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 flex items-center gap-1">
            <Clock size={12} />
            中
          </span>
        );
      case 'low':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle size={12} />
            低
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'incident':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'payment':
        return <FileText size={16} className="text-yellow-500" />;
      case 'booking':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'auth':
        return <Shield size={16} className="text-blue-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ['ログID', 'タイムスタンプ', 'タイプ', '重要度', 'ユーザー', 'アクション', '詳細', 'IPアドレス'].join(','),
      ...filteredLogs.map(l => 
        [l.id, l.timestamp, l.type, l.severity, l.user, l.action, l.details, l.ipAddress].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <SimpleLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">監査ログ・証跡</h1>
          <p className="text-gray-600">システムの操作履歴を確認できます</p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">総ログ数</p>
            <p className="text-3xl font-bold text-gray-900">{logs.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">高重要度</p>
            <p className="text-3xl font-bold text-red-600">{logs.filter(l => l.severity === 'high').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">中重要度</p>
            <p className="text-3xl font-bold text-orange-600">{logs.filter(l => l.severity === 'medium').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">低重要度</p>
            <p className="text-3xl font-bold text-green-600">{logs.filter(l => l.severity === 'low').length}</p>
          </div>
        </div>

        {/* 検索・フィルター */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 検索 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="ユーザー名、アクション、詳細で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* タイプフィルター */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">すべて</option>
                <option value="incident">インシデント</option>
                <option value="payment">決済</option>
                <option value="booking">予約</option>
                <option value="auth">認証</option>
              </select>
            </div>

            {/* CSV出力 */}
            <button
              onClick={handleExportCSV}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-all flex items-center gap-2"
            >
              <Download size={20} />
              CSV出力
            </button>
          </div>
        </div>

        {/* ログ一覧テーブル */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">タイムスタンプ</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">タイプ</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">重要度</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ユーザー</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">アクション</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">詳細</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">IPアドレス</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{log.timestamp}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(log.type)}
                        <span className="text-sm font-bold text-gray-900 capitalize">{log.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSeverityBadge(log.severity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">{log.user}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{log.action}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{log.details}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs text-gray-500 font-mono">{log.ipAddress}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="p-12 text-center">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-bold">ログが見つかりません</p>
            </div>
          )}
        </div>
      </div>
    </SimpleLayout>
  );
};

export default AdminLogs;
