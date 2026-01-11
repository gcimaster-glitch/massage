
import React, { useState } from 'react';
import { 
  Tag, Plus, TrendingUp, Users, Calendar, ArrowRight, 
  Percent, Trash2, Edit3, CheckCircle, Zap, Sparkles,
  BarChart3, MousePointer2, Gift, Clock
} from 'lucide-react';

const MarketingDashboard: React.FC = () => {
  const [coupons, setCoupons] = useState([
    { id: 'CP-001', code: 'WELCOME2025', type: 'FIXED', value: 1000, usage: 450, limit: 1000, status: 'ACTIVE' },
    { id: 'CP-002', code: 'SPRING_REBOOT', type: 'PERCENT', value: 15, usage: 120, limit: 500, status: 'ACTIVE' },
    { id: 'CP-003', code: 'NIGHT_CARE', type: 'FIXED', value: 500, usage: 890, limit: 1000, status: 'EXPIRED' },
  ]);

  return (
    <div className="space-y-10 animate-fade-in text-gray-900 font-sans pb-32 px-4">
      <div className="flex flex-col lg:flex-row justify-between items-end gap-6">
        <div>
           <span className="inline-block bg-indigo-50 text-indigo-600 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.4em] mb-6 border border-indigo-100 shadow-sm">グロース・マネジメント</span>
           <h1 className="text-5xl font-black tracking-tighter">キャンペーン・集客施策</h1>
           <p className="text-gray-400 font-bold uppercase tracking-[0.3em] mt-2 text-xs">Campaign, Promo & Growth Analytics</p>
        </div>
        <button className="bg-gray-900 text-white px-10 py-5 rounded-[28px] font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:bg-teal-600 transition-all active:scale-95">
           <Plus size={20} /> 新規クーポンを発行
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <MetricCard title="総クーポン利用額" value="¥1.24M" delta="+8.2%" icon={<Gift size={24}/>} color="text-teal-600" />
         <MetricCard title="キャンペーン経由CVR" value="5.8%" delta="+1.1%" icon={<MousePointer2 size={24}/>} color="text-indigo-600" />
         <MetricCard title="アクティブ施策数" value="4" delta="正常" icon={<Zap size={24}/>} color="text-orange-600" />
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[56px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h3 className="font-black text-xl flex items-center gap-4"><Tag className="text-indigo-600" /> 発行済みクーポン一覧</h3>
                 <div className="flex gap-2">
                    <span className="text-[10px] font-black bg-white px-4 py-2 rounded-2xl border border-gray-100 text-gray-400 uppercase tracking-widest">Active & Scheduled</span>
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                       <tr>
                          <th className="p-8">プロモコード</th>
                          <th className="p-8">特典内容</th>
                          <th className="p-8">消化率</th>
                          <th className="p-8 text-center">ステータス</th>
                          <th className="p-8"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {coupons.map(cp => (
                         <tr key={cp.id} className="hover:bg-gray-50/50 transition-all group">
                            <td className="p-8">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-mono font-black text-xs text-gray-500 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                     {cp.code.charAt(0)}
                                  </div>
                                  <span className="font-black text-lg text-gray-900 tracking-tight">{cp.code}</span>
                               </div>
                            </td>
                            <td className="p-8">
                               <p className="font-black text-gray-700">
                                  {cp.type === 'FIXED' ? `¥${cp.value.toLocaleString()} OFF` : `${cp.value}% OFF`}
                               </p>
                               <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Single Use / Per Member</p>
                            </td>
                            <td className="p-8">
                               <div className="space-y-2">
                                  <div className="flex justify-between text-[10px] font-black text-gray-400">
                                     <span>{cp.usage} / {cp.limit}</span>
                                     <span>{Math.round((cp.usage / cp.limit) * 100)}%</span>
                                  </div>
                                  <div className="h-1.5 w-40 bg-gray-100 rounded-full overflow-hidden">
                                     <div className="h-full bg-indigo-500" style={{ width: `${(cp.usage / cp.limit) * 100}%` }}></div>
                                  </div>
                                </div>
                            </td>
                            <td className="p-8 text-center">
                               <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                 cp.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-100 text-gray-400 border-gray-200'
                               }`}>
                                  {cp.status}
                               </span>
                            </td>
                            <td className="p-8 text-right">
                               <div className="flex gap-2">
                                  <button className="p-3 text-gray-300 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-xl transition-all"><Edit3 size={18}/></button>
                                  <button className="p-3 text-gray-300 hover:text-red-500 hover:bg-white hover:shadow-md rounded-xl transition-all"><Trash2 size={18}/></button>
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <section className="bg-gray-900 text-white p-10 rounded-[56px] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[100px] opacity-10 group-hover:scale-110 transition-transform duration-700"></div>
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-teal-400 shadow-inner"><Sparkles size={28}/></div>
                    <h3 className="text-xl font-black">AI 集客最適化提案</h3>
                 </div>
                 <p className="text-sm font-bold text-teal-100 leading-relaxed italic opacity-90">
                   「週末の18:00〜21:00にかけて、千代田区エリアでの予約供給が不足しています。この時間帯限定の『出張料金50%OFF』キャンペーンを実施することで、マッチング率が最大18%向上すると予測されます。」
                 </p>
                 <button className="w-full py-5 bg-teal-500 text-white rounded-[32px] font-black text-sm uppercase tracking-widest hover:bg-teal-400 transition-all shadow-xl active:scale-95">
                    施策を即時実行する
                 </button>
              </div>
           </section>

           <section className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
              <h3 className="font-black text-lg flex items-center gap-3 text-gray-900"><BarChart3 size={20} className="text-indigo-600" /> 特典配布ターゲット</h3>
              <div className="space-y-3">
                 <TargetToggle label="新規登録から24時間以内" count={12} active />
                 <TargetToggle label="過去30日利用なし" count={85} active />
                 <TargetToggle label="特定の施設(Cube)利用者" count={32} />
                 <TargetToggle label="上位1%の優良顧客 (VIP)" count={5} />
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, delta, icon, color }: any) => (
  <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 group hover:shadow-2xl transition-all duration-500">
    <div className={`w-14 h-14 bg-gray-50 ${color} rounded-2xl flex items-center justify-center mb-10 transition-all shadow-inner group-hover:scale-110`}>
       {icon}
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{title}</p>
    <div className="flex items-baseline justify-between">
       <h3 className="text-4xl font-black tracking-tighter text-gray-900">{value}</h3>
       <span className={`text-[11px] font-black ${delta.startsWith('+') ? 'text-green-500' : 'text-gray-400'}`}>{delta}</span>
    </div>
  </div>
);

const TargetToggle = ({ label, count, active = false }: any) => (
  <div className={`p-6 rounded-[32px] border-2 flex items-center justify-between transition-all group cursor-pointer ${active ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-gray-50 opacity-60 hover:opacity-100'}`}>
     <div>
        <p className="text-xs font-black text-gray-900">{label}</p>
        <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{count} members targeted</p>
     </div>
     <div className={`w-10 h-5 rounded-full p-1 transition-all ${active ? 'bg-indigo-600' : 'bg-gray-200'}`}>
        <div className={`w-3 h-3 bg-white rounded-full transition-all ${active ? 'translate-x-5' : 'translate-x-0'}`}></div>
     </div>
  </div>
);

export default MarketingDashboard;
