
import React, { useState } from 'react';
import { Copy, Users, JapaneseYen, TrendingUp, Link as LinkIcon, Check } from 'lucide-react';

const AffiliateDashboard: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const referralCode = "WELLNESS-MEDIA-2025";
  const referralLink = `https://soothe-carecube.jp?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">アフィリエイトダッシュボード</h1>
        <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold">
          ランク: ゴールドパートナー
        </div>
      </div>

      {/* Referral Link Card */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
          <LinkIcon size={20} /> あなたの紹介リンク
        </h2>
        <p className="text-purple-100 text-sm mb-4">
          このリンク経由で予約が発生すると、売上の5%が成果報酬として支払われます。
        </p>
        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg flex items-center gap-3 border border-white/30">
          <code className="flex-1 font-mono text-sm truncate select-all">{referralLink}</code>
          <button 
            onClick={handleCopy}
            className="bg-white text-purple-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-50 transition-colors flex items-center gap-2"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'コピー完了' : 'コピー'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-bold mb-1">今月のクリック数</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-gray-900">2,450</h3>
            <span className="text-green-600 text-sm font-bold flex items-center gap-1">
              <TrendingUp size={14} /> +12%
            </span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-bold mb-1">成約数 (CV)</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-gray-900">120</h3>
            <span className="text-gray-400 text-sm">CVR 4.8%</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-bold mb-1">報酬見込 (今月)</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-purple-600">¥40,000</h3>
            <span className="text-gray-400 text-sm">確定待ち</span>
          </div>
        </div>
      </div>

      {/* Recent Conversions Mock */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-700">最近の成果発生ログ</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-white text-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4">発生日時</th>
              <th className="p-4">ステータス</th>
              <th className="p-4 text-right">予約金額</th>
              <th className="p-4 text-right">報酬額 (5%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="p-4 text-gray-600">2025/05/20 14:{30 + i}</td>
                <td className="p-4">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">発生</span>
                </td>
                <td className="p-4 text-right font-mono">¥8,000</td>
                <td className="p-4 text-right font-bold text-purple-600">¥400</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 text-center border-t border-gray-100">
          <button className="text-purple-600 font-bold text-sm hover:underline">すべて見る</button>
        </div>
      </div>
    </div>
  );
};

export default AffiliateDashboard;
