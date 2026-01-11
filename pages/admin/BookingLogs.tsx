
import React, { useState } from 'react';
import { History, Search, Download, Shield, Eye, Lock, Clock, Filter, AlertTriangle } from 'lucide-react';

const AdminBookingLogs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SYSTEM' | 'ACCESS'>('SYSTEM');

  const logs = [
    { id: 'log-1', timestamp: '2025-05-20 14:05:12', actor: '田中 有紀', action: 'ステータス変更', details: '予約 #b-101: 確定 -> 入室済', severity: '情報' },
    { id: 'log-2', timestamp: '2025-05-20 14:10:05', actor: 'システム', action: '決済完了', details: '予約 #b-102: Stripe 決済成功 (¥13,200)', severity: '情報' },
    { id: 'log-3', timestamp: '2025-05-20 14:15:22', actor: 'ユーザー: u1', action: 'SOS発報', details: '重大: 予約 #b-102 で緊急ボタンが押されました', severity: '緊急' },
  ];

  const accessLogs = [
    { id: 'acc-1', timestamp: '2025-05-21 10:30:00', actor: '新宿オフィス管理者', resource: 'チャット履歴 (b-101)', purpose: '精算監査', status: '成功' },
    { id: 'acc-2', timestamp: '2025-05-21 11:45:12', actor: '本部システム管理者', resource: '本人確認書類 (田中 有紀)', purpose: '定期審査', status: '成功' },
    { id: 'acc-3', timestamp: '2025-05-21 13:02:44', actor: '未承認デバイス', resource: 'ユーザー住所一覧', purpose: '不明', status: 'ブロック' },
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-20 px-4">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
             <History size={32} className="text-teal-600" /> システム証跡・監査ログ
           </h1>
           <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.3em] mt-1">Infrastructure Integrity & Security Audit Trail</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-gray-100 rounded-3xl shadow-inner">
           <button onClick={() => setActiveTab('SYSTEM')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'SYSTEM' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>システム実行ログ</button>
           <button onClick={() => setActiveTab('ACCESS')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ACCESS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>個人情報アクセス証跡</button>
        </div>
      </div>

      <div className="bg-white rounded-[56px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-6 justify-between items-center">
           <div className="relative flex-1 w-full">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
             <input type="text" placeholder="操作主体、予約ID、イベント内容で検索..." className="w-full pl-16 pr-8 py-5 bg-white border border-gray-200 rounded-[28px] font-bold text-sm outline-none focus:ring-4 focus:ring-teal-500/10 transition-all shadow-inner" />
           </div>
           <div className="flex gap-4">
              <button className="px-6 py-4 bg-white border border-gray-200 rounded-[20px] font-black text-xs flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm"><Filter size={16}/> 絞り込み</button>
              <button className="px-8 py-4 bg-gray-900 text-white rounded-[20px] font-black text-xs flex items-center gap-2 shadow-xl active:scale-95 transition-all"><Download size={16}/> CSV出力</button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
              {activeTab === 'SYSTEM' ? (
                <tr>
                  <th className="p-10">記録時刻</th>
                  <th className="p-10">操作主体</th>
                  <th className="p-10">イベント種別</th>
                  <th className="p-10">詳細証跡</th>
                  <th className="p-10">重要度</th>
                </tr>
              ) : (
                <tr>
                  <th className="p-10">アクセス時刻</th>
                  <th className="p-10">閲覧者</th>
                  <th className="p-10">対象リソース</th>
                  <th className="p-10">目的</th>
                  <th className="p-10">結果</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-gray-50 font-mono">
              {activeTab === 'SYSTEM' ? (
                logs.map(log => (
                  <tr key={log.id} className={`hover:bg-gray-50/80 transition-all ${log.severity === '緊急' ? 'bg-red-50/30' : ''}`}>
                    <td className="p-10 text-gray-400 text-xs">{log.timestamp}</td>
                    <td className="p-10 font-black text-gray-900 text-sm">{log.actor}</td>
                    <td className="p-10"><span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter">{log.action}</span></td>
                    <td className="p-10 text-gray-600 font-sans font-bold text-sm leading-relaxed">{log.details}</td>
                    <td className="p-10">
                       <span className={`px-3 py-1 rounded-full font-black text-[9px] border ${log.severity === '緊急' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-teal-50 text-teal-700 border-teal-100'}`}>{log.severity}</span>
                    </td>
                  </tr>
                ))
              ) : (
                accessLogs.map(acc => (
                  <tr key={acc.id} className={`hover:bg-gray-50/80 transition-all ${acc.status === 'ブロック' ? 'bg-orange-50/50' : ''}`}>
                    <td className="p-10 text-gray-400 text-xs">{acc.timestamp}</td>
                    <td className="p-10 font-black text-gray-900 flex items-center gap-3 text-sm">
                       <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-inner"><Eye size={16}/></div>
                       {acc.actor}
                    </td>
                    <td className="p-10 font-bold text-gray-700 font-sans text-sm">{acc.resource}</td>
                    <td className="p-10 font-bold text-gray-400 font-sans text-xs">{acc.purpose}</td>
                    <td className="p-10">
                       <span className={`px-4 py-1.5 rounded-full font-black text-[9px] border ${acc.status === '成功' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-600 text-white border-red-700'}`}>{acc.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-indigo-950 rounded-[64px] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative shadow-2xl">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_70%_20%,rgba(20,184,166,0.15),transparent_50%)] opacity-30"></div>
         <div className="relative z-10 space-y-6 max-w-2xl">
            <h3 className="text-3xl font-black tracking-tighter flex items-center gap-4"><Shield className="text-teal-400" /> データ保護・消去ポリシーの適用</h3>
            <p className="text-indigo-200 text-sm font-bold leading-relaxed">
               プラットフォームの透明性維持のため、全システム操作は物理的な書き換え不可能な形式で記録されています。
               また、**「5年間の法定保存期間」**を過ぎた個人情報およびチャットログは、毎月1日のバッチ処理により自動的に物理削除されます。
            </p>
         </div>
         <div className="relative z-10 bg-white/5 p-8 rounded-[40px] border border-white/10 backdrop-blur-xl text-center">
            <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-3">次回のデータクリーンアップ</p>
            <p className="text-3xl font-black tracking-tighter">2025/06/01 03:00</p>
         </div>
      </div>
    </div>
  );
};

export default AdminBookingLogs;
