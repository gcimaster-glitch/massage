
import React, { useState } from 'react';
import { 
  MessageSquare, Globe, Search, Filter, ArrowRight, 
  Settings, UserCheck, ShieldAlert, Clock, Sparkles 
} from 'lucide-react';
import { SupportCategory } from '../../types';

const AdminSupportInbox: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'CRITICAL' | 'AI_HANDLED'>('ALL');

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-black text-gray-900 tracking-tighter">グローバル・サポート・ハブ</h1>
           <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Platform-Wide Inquiry Management</p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-[24px]">
           <button onClick={() => setActiveTab('ALL')} className={`px-6 py-3 rounded-[20px] text-xs font-black transition-all ${activeTab === 'ALL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>すべて</button>
           <button onClick={() => setActiveTab('CRITICAL')} className={`px-6 py-3 rounded-[20px] text-xs font-black transition-all ${activeTab === 'CRITICAL' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>重要度: 高</button>
           <button onClick={() => setActiveTab('AI_HANDLED')} className={`px-6 py-3 rounded-[20px] text-xs font-black transition-all ${activeTab === 'AI_HANDLED' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>AI自動対応中</button>
        </div>
      </div>

      {/* AI Performance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between h-44">
            <div className="flex items-center gap-3 text-teal-600"><Sparkles size={24}/> <span className="text-[10px] font-black uppercase tracking-widest">AI解決率 (当月)</span></div>
            <h3 className="text-4xl font-black text-gray-900">82.4<span className="text-sm ml-1">%</span></h3>
            <p className="text-xs font-bold text-gray-400 tracking-tight">人間による介入が不要だった割合</p>
         </div>
         <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between h-44">
            <div className="flex items-center gap-3 text-red-600"><Clock size={24}/> <span className="text-[10px] font-black uppercase tracking-widest">平均初期レスポンス</span></div>
            <h3 className="text-4xl font-black text-gray-900">42<span className="text-sm ml-1">秒</span></h3>
            <p className="text-xs font-bold text-gray-400 tracking-tight">24時間体制の平均応答速度</p>
         </div>
         <div className="bg-gray-900 p-8 rounded-[40px] text-white flex flex-col justify-between h-44">
            <div className="flex items-center gap-3 text-teal-400"><Globe size={24}/> <span className="text-[10px] font-black uppercase tracking-widest">稼働中のスレッド</span></div>
            <h3 className="text-4xl font-black">152<span className="text-sm ml-1">件</span></h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-teal-400 underline text-left">リアルタイム監視パネル</button>
         </div>
      </div>

      <div className="bg-white rounded-[56px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
           <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
              <tr>
                 <th className="p-8">カテゴリ</th>
                 <th className="p-8">お名前</th>
                 <th className="p-8">件名</th>
                 <th className="p-8">最終更新</th>
                 <th className="p-8">担当</th>
                 <th className="p-8"></th>
              </tr>
           </thead>
           <tbody className="divide-y divide-gray-50">
              {[
                { id: '1', cat: SupportCategory.PAYMENT, name: '山田 太郎', sub: '二重決済の疑いがある', time: '14:20', owner: '本部: 佐藤' },
                { id: '2', cat: SupportCategory.SYSTEM, name: '新宿オフィス', sub: '一括入金データの不整合', time: '13:05', owner: 'AI Sentinel' },
                { id: '3', cat: SupportCategory.PARTNER_INQUIRY, name: 'リラクゼーション恵比寿', sub: '新規提携のご相談', time: '昨日', owner: '未割り当て' },
              ].map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-all group">
                   <td className="p-8">
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">{item.cat}</span>
                   </td>
                   <td className="p-8 font-black text-gray-900">{item.name}</td>
                   <td className="p-8">
                      <p className="font-black text-gray-700 text-sm">{item.sub}</p>
                   </td>
                   <td className="p-8 text-xs font-bold text-gray-400">{item.time}</td>
                   <td className="p-8">
                      <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${item.owner.includes('AI') ? 'bg-teal-500' : 'bg-indigo-500'}`}></div>
                         <span className="text-[10px] font-black uppercase">{item.owner}</span>
                      </div>
                   </td>
                   <td className="p-8 text-right">
                      <button className="bg-gray-100 text-gray-400 p-4 rounded-2xl group-hover:bg-gray-900 group-hover:text-white transition-all">
                         <ArrowRight size={20} />
                      </button>
                   </td>
                </tr>
              ))}
           </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSupportInbox;
