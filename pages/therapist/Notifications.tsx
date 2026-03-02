import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Megaphone, Mail, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  is_read: number;
}

const TherapistNotifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'SYSTEM' | 'PERSONAL'>('ALL');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const typeParam = activeTab !== 'ALL' ? `&type=${activeTab}` : '';
      const res = await fetch(`/api/notify/notifications?limit=50${typeParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('通知の取得に失敗しました');
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(`/api/notify/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch('/api/notify/notifications/read-all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  const getPriorityBadge = (type: string) => {
    if (type === 'SYSTEM') return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">重要</span>;
    if (type === 'PERSONAL') return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">個人</span>;
    return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded">{type}</span>;
  };

  const formatDate = (dt: string) => {
    const d = new Date(dt);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}分前`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}時間前`;
    return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-gray-900">
            お知らせ
            {unreadCount > 0 && (
              <span className="ml-3 text-sm bg-red-500 text-white px-2 py-1 rounded-full font-black">{unreadCount}</span>
            )}
          </h1>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.2em] mt-1">Notifications</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="text-xs font-black text-teal-600 bg-teal-50 px-4 py-2 rounded-full border border-teal-100 hover:bg-teal-100 transition-all">
              全て既読
            </button>
          )}
          <button onClick={fetchNotifications} className="bg-gray-100 text-gray-700 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1 hover:bg-gray-200">
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-gray-100 rounded-3xl">
        {(['ALL', 'SYSTEM', 'PERSONAL'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2.5 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
            {tab === 'ALL' ? '全て' : tab === 'SYSTEM' ? 'システム' : '個人'}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">読み込み中...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white p-16 rounded-[48px] border border-gray-100 text-center">
          <Bell className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 font-bold">お知らせはありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => !n.is_read && handleMarkAsRead(n.id)}
              className={`bg-white rounded-2xl border p-5 transition-all cursor-pointer hover:shadow-md ${!n.is_read ? 'border-teal-200 bg-teal-50/30' : 'border-gray-100'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {!n.is_read && <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0" />}
                  <span className="font-black text-gray-900 text-sm">{n.title}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {getPriorityBadge(n.type)}
                  {n.is_read ? (
                    <CheckCircle size={14} className="text-gray-300" />
                  ) : (
                    <div className="w-2 h-2 bg-teal-500 rounded-full" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">{n.message}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock size={12} />
                {formatDate(n.created_at)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TherapistNotifications;
