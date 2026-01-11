import React from 'react';
import { Bell, Calendar, Info, ShieldAlert, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  
  const notifications = [
    {
      id: 1,
      type: 'BOOKING',
      title: '予約が確定しました',
      body: '5月25日 14:00〜「深層筋マッサージ」の予約がセラピストによって承認されました。',
      time: '10分前',
      isRead: false,
      link: '/app/bookings'
    },
    {
      id: 2,
      type: 'INFO',
      title: 'Mobile Boost キャンペーン',
      body: '今週末限定！出張予約で使える1,000円OFFクーポンを配布中です。コード: MOBILE2025',
      time: '2時間前',
      isRead: true,
      link: null
    },
    {
      id: 3,
      type: 'SAFETY',
      title: '本人確認が完了しました',
      body: '提出いただいた身分証明書の確認が完了しました。全ての機能をご利用いただけます。',
      time: '1日前',
      isRead: true,
      link: '/app/account'
    }
  ];

  const getIcon = (type: string) => {
    switch(type) {
      case 'BOOKING': return <Calendar className="text-teal-600" size={20} />;
      case 'SAFETY': return <ShieldAlert className="text-green-600" size={20} />;
      default: return <Info className="text-blue-600" size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">お知らせ</h1>
        <button className="text-sm text-teal-600 font-bold hover:underline">すべて既読にする</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
        {notifications.map(notif => (
          <div 
            key={notif.id} 
            onClick={() => notif.link && navigate(notif.link)}
            className={`p-4 flex gap-4 hover:bg-gray-50 transition-colors cursor-pointer ${notif.isRead ? 'bg-white' : 'bg-teal-50/30'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.isRead ? 'bg-gray-100' : 'bg-white shadow-sm border border-gray-100'}`}>
              {getIcon(notif.type)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className={`text-sm font-bold ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</h3>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{notif.time}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{notif.body}</p>
            </div>
            {!notif.isRead && (
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
            )}
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="p-8 text-center text-gray-400 flex flex-col items-center">
            <Bell size={48} className="mb-4 opacity-20" />
            <p>新しいお知らせはありません</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;