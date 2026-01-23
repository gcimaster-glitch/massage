import React, { useState, useEffect } from 'react';
import { Bell, Megaphone, Mail, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface Notification {
  id: string;
  type: 'GENERAL' | 'PERSONAL';
  title: string;
  content: string;
  created_at: string;
  read: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

const TherapistNotifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'PERSONAL'>('GENERAL');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  const fetchNotifications = async () => {
    setLoading(true);
    // モックデータ
    const mockData: Notification[] = [
      {
        id: 'notif-1',
        type: 'GENERAL',
        title: '【重要】システムメンテナンスのお知らせ',
        content: '2026年1月25日（土）2:00〜6:00の間、システムメンテナンスを実施いたします。この間、予約の確認・変更ができなくなります。',
        created_at: '2026-01-20',
        read: false,
        priority: 'HIGH'
      },
      {
        id: 'notif-2',
        type: 'GENERAL',
        title: '新機能リリースのお知らせ',
        content: 'セラピストポータルに「出張設定」機能を追加しました。移動方法や対応可能エリアを設定できます。',
        created_at: '2026-01-18',
        read: true,
        priority: 'MEDIUM'
      },
      {
        id: 'notif-3',
        type: 'PERSONAL',
        title: '【要確認】プロフィール情報の更新をお願いします',
        content: 'プロフィールの「資格・スキル」情報が未登録です。より多くの予約を獲得するために、登録をお願いします。',
        created_at: '2026-01-22',
        read: false,
        priority: 'MEDIUM'
      },
      {
        id: 'notif-4',
        type: 'PERSONAL',
        title: '報酬明細が確定しました',
        content: '2026年1月分の報酬明細が確定しました。報酬管理ページよりご確認ください。',
        created_at: '2026-01-23',
        read: false,
        priority: 'MEDIUM'
      }
    ];

    const filtered = mockData.filter(n => n.type === activeTab);
    setNotifications(filtered);
    setLoading(false);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">重要</span>;
      case 'MEDIUM':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">通常</span>;
      case 'LOW':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded">参考</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">お知らせ</h1>
        <p className="text-gray-600">運営からの重要なお知らせを確認できます</p>
      </div>

      {/* タブ */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('GENERAL')}
          className={`px-6 py-3 font-bold text-sm transition-all ${
            activeTab === 'GENERAL'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Megaphone size={18} />
            一般お知らせ
          </div>
        </button>
        <button
          onClick={() => setActiveTab('PERSONAL')}
          className={`px-6 py-3 font-bold text-sm transition-all ${
            activeTab === 'PERSONAL'
              ? 'text-teal-600 border-b-2 border-teal-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Mail size={18} />
            個別お知らせ
          </div>
        </button>
      </div>

      {/* お知らせ一覧 */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-bold">お知らせはありません</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${
                notif.read ? 'border-gray-300' : 'border-teal-500'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {!notif.read && (
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  )}
                  <div>
                    {getPriorityBadge(notif.priority)}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock size={14} />
                  <span>{notif.created_at}</span>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {notif.title}
              </h3>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                {notif.content}
              </p>
              
              {!notif.read && (
                <button
                  onClick={() => handleMarkAsRead(notif.id)}
                  className="text-sm text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1"
                >
                  <CheckCircle size={16} />
                  既読にする
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TherapistNotifications;
