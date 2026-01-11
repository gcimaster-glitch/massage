
import React, { useState } from 'react';
import { 
  Building, Users, TrendingUp, CreditCard, PieChart, 
  Plus, Search, MoreVertical, Activity, Heart, ShieldCheck, 
  BarChart3, Calendar, Zap, ArrowUpRight, Download, Filter
} from 'lucide-react';

const AdminCorporateDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CLIENTS' | 'REPORTS'>('CLIENTS');

  const clients = [
    { id: 'c-001', name: 'テック・イノベーション株式会社', plan: 'プレミアム', employees: 120, credit: '¥450,000', usage: '82%', status: 'ACTIVE' },
    { id: 'c-002', name: 'グローバル・コンサルティング合同会社', plan: 'スタンダード', employees: 45, credit: '¥120,000', usage: '45%', status: 'ACTIVE' },
    { id: 'c-003', name: 'クリエイティブ・ラボ東京', plan: 'ライト', employees: 12, credit: '¥30,000', usage: '12%', status: 'PENDING' },
  ];

  return (
    <div className="space-y-10 animate-fade-in text-gray-900 font-sans pb-32 px-4">
      <div className="flex flex-col lg:flex-row justify-between items-end gap-10">
        <div>
           <span className="inline-block bg-indigo-50 text-indigo-600 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.4em] mb-6 border border-indigo-100 shadow-sm">B2B コーポレート・ガバナンス</span>
           <h1 className="text-5xl font-black tracking-tighter">健康経営・法人プログラム</h1>
           <p className="text-gray-400 font-bold uppercase tracking-[0.3em] mt-2 text-xs">Employee Wellness & Corporate Credit Control</p>
        </div>
        <div className="flex gap-4">
           <button className="bg-gray-900 text-white px-10 py-5 rounded-[28px] font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:bg-teal-600 transition-all active:scale-95">
              <Plus size={20} /> 新規法人クライアント登録
           </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
         <KPICard label="提携法人数" val="48" delta="+2" color="text-indigo-600" />
         <KPICard label="法人クレジット総残高" val="¥12.4M" delta="-5%" color="text-teal-600" />
         <KPICard label="今月の福利厚生利用数" val="842" delta="+18%" color="text-orange-600" />
         <KPICard label="法人PV (B2B LP)" val="4,200" delta="+42%" color="text-gray-400" />
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* クライアントリスト */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[56px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h3 className="font-black text-xl flex items-center gap-4"><Building className="text-indigo-600" /> クライアント企業一覧</h3>
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input type="text" placeholder="企業名で検索..." className="pl-10 pr-6 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none" />
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                       <tr>
                          <th className="p-8">企業名 / ID</th>
                          <th className="p-8">プラン</th>
                          <th className="p-8 text-right">クレジット残高</th>
                          <th className="p-8">消化率</th>
                          <th className="p-8 text-center">ステータス</th>
                          <th className="p-8"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {clients.map(client => (
                         <tr key={client.id} className="hover:bg-gray-50/50 transition-all group">
                            <td className="p-8">
                               <p className="font-black text-gray-900">{client.name}</p>
                               <p className="text-[9px] text-gray-300 font-mono mt-1">{client.id}</p>
                            </td>
                            <td className="p-8">
                               <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                 client.plan === 'プレミアム' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-gray-100 text-gray-400'
                               }`}>
                                  {client.plan}
                               </span>
                            </td>
                            <td className="p-8 text-right font-mono font-black text-gray-700">{client.credit}</td>
                            <td className="p-8">
                               <div className="flex items-center gap-3">
                                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                     <div className="h-full bg-teal-500" style={{ width: client.usage }}></div>
                                  </div>
                                  <span className="text-[10px] font-black text-teal-600">{client.usage}</span>
                               </div>
                            </td>
                            <td className="p-8 text-center">
                               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${client.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700 animate-pulse'}`}>
                                  {client.status}
                               </span>
                            </td>
                            <td className="p-8 text-right">
                               <button className="p-3 text-gray-300 hover:text-gray-900 transition-colors"><MoreVertical size={18}/></button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* 健康経営レポート */}
        <div className="lg:col-span-4 space-y-8">
           <section className="bg-indigo-900 text-white p-10 rounded-[56px] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[100px] opacity-10 group-hover:scale-110 transition-transform duration-700"></div>
              <div className="relative z-10 space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-teal-400 shadow-inner"><PieChart size={28}/></div>
                    <h3 className="text-xl font-black">AI 健康レポート生成</h3>
                 </div>
                 <p className="text-sm font-bold text-indigo-100 leading-relaxed italic opacity-90">
                   「全提携社員の匿名化された施術データから、組織全体の疲労傾向（ストレスエリア）を抽出。健康経営優良法人の申請に活用可能なエビデンスレポートを即座に生成します。」
                 </p>
                 <button className="w-full py-5 bg-teal-500 text-white rounded-[32px] font-black text-sm uppercase tracking-widest hover:bg-teal-400 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3">
                    <Download size={18}/> レポートを出力 (CSV/PDF)
                 </button>
              </div>
           </section>

           <section className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
              <h3 className="font-black text-lg flex items-center gap-3 text-gray-900"><Zap size={20} className="text-orange-500" /> 特急アクション</h3>
              <div className="space-y-3">
                 <ActionBtn label="一括クレジット付与 (全社員)" icon={<CreditCard size={16}/>} color="bg-gray-50 text-gray-700" />
                 <ActionBtn label="未払い法人への督促送信" icon={<Activity size={16}/>} color="bg-red-50 text-red-600" />
                 <ActionBtn label="利用上限アラート設定" icon={<Filter size={16}/>} color="bg-gray-50 text-gray-700" />
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ label, val, delta, color }: any) => (
  <div className="bg-white p-8 rounded-[36px] border border-gray-100 shadow-sm transition-all hover:shadow-xl group">
     <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">{label}</p>
     <div className="flex items-baseline justify-between">
        <h3 className={`text-3xl font-black ${color} tracking-tighter leading-none`}>{val}</h3>
        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${delta.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>{delta}</span>
     </div>
  </div>
);

const ActionBtn = ({ label, icon, color }: any) => (
  <button className={`w-full p-5 rounded-[24px] font-black text-xs flex items-center gap-4 hover:shadow-md transition-all ${color}`}>
     {icon} {label}
  </button>
);

export default AdminCorporateDashboard;
