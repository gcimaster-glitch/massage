import React, { useState } from 'react';
import { MOCK_INCIDENTS, MOCK_BOOKINGS } from '../../constants';
import { IncidentSeverity, Incident } from '../../types';
import { AlertTriangle, CheckCircle, Search, Filter, MapPin } from 'lucide-react';

const AdminIncidents: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');
  // Local state to simulate resolving incidents
  const [incidents, setIncidents] = useState(MOCK_INCIDENTS);

  const handleResolve = (id: string) => {
    if (confirm('このインシデントを「解決済み」にしますか？')) {
      setIncidents(incidents.map(inc => 
        inc.id === id ? { ...inc, status: 'RESOLVED' } : inc
      ));
    }
  };

  const filteredIncidents = incidents.filter(inc => {
    if (filter === 'ALL') return true;
    return inc.status === filter;
  });

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
        <h1 className="text-2xl font-bold text-gray-900">インシデント管理</h1>
        <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            すべて
          </button>
          <button 
            onClick={() => setFilter('OPEN')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'OPEN' ? 'bg-red-50 text-red-700' : 'text-gray-500 hover:text-gray-900'}`}
          >
            未対応
          </button>
          <button 
            onClick={() => setFilter('RESOLVED')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'RESOLVED' ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:text-gray-900'}`}
          >
            解決済
          </button>
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-400">
            該当するインシデントはありません
          </div>
        ) : (
          filteredIncidents.map(inc => {
            const booking = MOCK_BOOKINGS.find(b => b.id === inc.bookingId);
            return (
              <div key={inc.id} className={`bg-white rounded-xl shadow-sm border-l-4 p-6 ${inc.status === 'OPEN' ? 'border-red-500' : 'border-green-500'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${getSeverityStyle(inc.severity)}`}>
                      {inc.severity}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">{inc.type}</h3>
                    <span className="text-xs text-gray-400 font-mono">ID: {inc.id}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-bold ${inc.status === 'OPEN' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {inc.status === 'OPEN' ? 'OPEN / 未対応' : 'RESOLVED / 解決済'}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase">予約情報</p>
                    <p className="text-sm">予約ID: <span className="font-mono">{inc.bookingId}</span></p>
                    {booking && (
                      <>
                        <p className="text-sm flex items-center gap-1">
                          <MapPin size={14} /> {booking.location}
                        </p>
                        <p className="text-sm">担当: {booking.therapistName}</p>
                      </>
                    )}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase">発生日時</p>
                    <p className="text-sm font-mono">{new Date(inc.createdAt).toLocaleString('ja-JP')}</p>
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
                    <button 
                      onClick={() => handleResolve(inc.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 flex items-center gap-2"
                    >
                      <CheckCircle size={16} />
                      解決済みにする
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminIncidents;