import React, { useState, useEffect, useCallback } from 'react';
import { IncidentSeverity } from '../../types';
import { AlertTriangle, CheckCircle, MapPin, RefreshCw, Loader2 } from 'lucide-react';

interface Incident {
  id: string;
  booking_id: string;
  reporter_name?: string;
  severity: IncidentSeverity;
  type: string;
  description: string;
  status: string;
  created_at: string;
  resolved_at?: string;
  scheduled_at?: string;
  service_name?: string;
}

const AdminIncidents: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchIncidents = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const statusParam = filter !== 'ALL' ? `&status=${filter}` : '';
      const res = await fetch(`/api/admin/incidents?limit=50${statusParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('インシデントの取得に失敗しました');
      const data = await res.json();
      setIncidents(data.incidents || []);
      setTotal(data.total || 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  const handleResolve = async (id: string) => {
    if (!confirm('このインシデントを「解決済み」にしますか？')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/admin/incidents/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVED' }),
      });
      if (!res.ok) throw new Error('更新に失敗しました');
      setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'RESOLVED' } : inc));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '更新に失敗しました');
    }
  };

  const getSeverityStyle = (severity: IncidentSeverity) => {
    switch (severity) {
      case IncidentSeverity.CRITICAL: return 'bg-red-100 text-red-800 border-red-200';
      case IncidentSeverity.HIGH: return 'bg-orange-100 text-orange-800 border-orange-200';
      case IncidentSeverity.MEDIUM: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case IncidentSeverity.LOW: return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">インシデント管理</h1>
          <p className="text-sm text-gray-500 mt-1">全 {total} 件</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchIncidents} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            {(['ALL', 'OPEN', 'RESOLVED'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === f ? (f === 'OPEN' ? 'bg-red-50 text-red-700' : f === 'RESOLVED' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-900') : 'text-gray-500 hover:text-gray-900'}`}>
                {f === 'ALL' ? 'すべて' : f === 'OPEN' ? '未対応' : '解決済'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : incidents.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-400">
          該当するインシデントはありません
        </div>
      ) : (
        <div className="space-y-4">
          {incidents.map(inc => (
            <div key={inc.id} className={`bg-white rounded-xl shadow-sm border-l-4 p-6 ${inc.status === 'OPEN' ? 'border-red-500' : 'border-green-500'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold border ${getSeverityStyle(inc.severity as IncidentSeverity)}`}>
                    {inc.severity}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">{inc.type}</h3>
                  <span className="text-xs text-gray-400 font-mono">ID: {inc.id.slice(0, 8)}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-bold ${inc.status === 'OPEN' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {inc.status === 'OPEN' ? 'OPEN / 未対応' : 'RESOLVED / 解決済'}
                </span>
              </div>

              <p className="text-sm text-gray-700 mb-4 leading-relaxed">{inc.description}</p>

              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase">予約情報</p>
                  <p className="text-sm">予約ID: <span className="font-mono">{inc.booking_id?.slice(0, 8)}</span></p>
                  {inc.service_name && <p className="text-sm">サービス: {inc.service_name}</p>}
                  {inc.reporter_name && <p className="text-sm">報告者: {inc.reporter_name}</p>}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase">発生日時</p>
                  <p className="text-sm font-mono">{new Date(inc.created_at).toLocaleString('ja-JP')}</p>
                  {inc.resolved_at && (
                    <p className="text-sm text-green-600">解決: {new Date(inc.resolved_at).toLocaleString('ja-JP')}</p>
                  )}
                  <p className="text-xs font-bold text-gray-500 uppercase mt-2">アクション</p>
                  <div className="flex gap-2">
                    <button className="text-xs bg-white border border-gray-300 px-2 py-1 rounded hover:bg-gray-50">ログ確認</button>
                    <button className="text-xs bg-white border border-gray-300 px-2 py-1 rounded hover:bg-gray-50">位置追跡</button>
                    <button className="text-xs bg-white border border-gray-300 px-2 py-1 rounded hover:bg-gray-50">警察連携</button>
                  </div>
                </div>
              </div>

              {inc.status === 'OPEN' && (
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button onClick={() => handleResolve(inc.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 flex items-center gap-2">
                    <CheckCircle size={16} />
                    解決済みにする
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminIncidents;
