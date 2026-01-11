import React from 'react';
import PortalLayout from './PortalLayout';

const NewsPage: React.FC = () => {
  const news = [
    { date: '2025.05.20', cat: '店舗', title: '【新店舗】CARE CUBE 六本木ミッドタウン前店がオープンしました！' },
    { date: '2025.05.15', cat: 'アプリ', title: 'アプリバージョン 0.2.1 をリリースしました（安全機能の強化）' },
    { date: '2025.05.01', cat: 'キャンペーン', title: 'GW限定！出張料金無料キャンペーン実施中' },
    { date: '2025.04.20', cat: 'お知らせ', title: 'サーバーメンテナンスのお知らせ（5/25 2:00-4:00）' },
  ];

  return (
    <PortalLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">お知らせ</h1>
        <div className="space-y-4">
          {news.map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow flex flex-col md:flex-row gap-2 md:items-center">
              <div className="flex items-center gap-3 w-48 flex-shrink-0">
                <span className="text-gray-500 font-mono text-sm">{item.date}</span>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-bold">{item.cat}</span>
              </div>
              <h3 className="font-bold text-gray-900 flex-1 hover:text-teal-600 cursor-pointer">{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
};

export default NewsPage;