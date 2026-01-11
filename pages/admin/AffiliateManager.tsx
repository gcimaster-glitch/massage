
import React from 'react';
import { Users, TrendingUp, DollarSign, Award, ArrowUpRight, Search, Filter, MoreVertical, MessageSquare } from 'lucide-react';

const AdminAffiliateManager: React.FC = () => {
  return (
    <div className="space-y-10 animate-fade-in text-gray-900 font-sans pb-32">
      <div className="flex flex-col lg:flex-row justify-between items-end gap-6 px-4">
        <div>
           <span className="inline-block bg-purple-50 text-purple-600 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.4em] mb-6 border border-purple-100 shadow-sm">パートナーシップ管理</span>
           <h1 className="text-5xl font-black tracking-tighter">アフィリエイト・プログラム</h1>
           <p className="text-gray-400 font-bold uppercase tracking-[0.3em] mt-2 text-xs">Partner Ecosystem & Performance Control</p>
        </div>
        <button className="bg-gray-900 text-white px-10 py-5 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-teal-600 transition-all active:scale-95">
           新規パートナーを招待
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
         <KPICard label="登録パートナー数" val="142" delta="+12" color="text-purple-600" icon={<Users size={16}/>} />
         <KPICard label="紹介経由売上 (GMV)" val="¥4.8M" delta="+24%" color="text-teal-600" icon={<DollarSign size={16}/>} />
         <KPICard label="平均CVR" val="5.2%" delta="+0.4%" color="text-indigo-600" icon={<TrendingUp size={16}/>} />
         <KPICard label="支払予定報酬" val="¥245,000" delta="今月末" color="text-gray-900" icon={<Award size={16}/>} />
      </div>

      <div className="px-4">
         <div className="bg-white rounded-[56px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50/50">
               <h3 className="font-black text-xl flex items-center gap-3"><Award className="text-purple-600" /> トップアフィリエイター</h3>
               <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input type="text" placeholder="パートナー名、メディア名で検索..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-bold outline-none" />
               </div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                     <tr>
                        <th className="p-8">パートナー名称</th>
                        <th className="p-8">メディアURL / SNS</th>
                        <th className="p-8 text-right">クリック数</th>
                        <th className="p-8 text-right">成約数</th>
                        <th className="p-8 text-right">獲得報酬累計</th>
                        <th className="p-8 text-center">ステータス</th>
                        <th className="p-8"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-bold text-sm">
                     {[
                       { name: 'ウェルネス通信', url: 'wellness-blog.jp', clicks: '14,200', cv: 420, earnings: '¥420,000', status: 'ACTIVE' },
                       { name: '美容・健康ライフ', url: 'instagram.com/beauty_life', clicks: '8,500', cv: 152, earnings: '¥152,000', status: 'ACTIVE' },
                       { name: 'ホテルステイ研究会', url: 'hotel-stay.com', clicks: '2,400', cv: 84, earnings: '¥84,000', status: 'ACTIVE' },
                     ].map(aff => (
                       <tr key={aff.name} className="hover:bg-gray-50 transition-colors group">
                          <td className="p-8 font-black text-gray-900">{aff.name}</td>
                          <td className="p-8 text-gray-400 font-mono text-xs">{aff.url}</td>
                          <td className="p-8 text-right text-gray-500">{aff.clicks}</td>
                          <td className="p-8 text-right text-teal-600 font-black">{aff.cv}件</td>
                          <td className="p-8 text-right font-black">{aff.earnings}</td>
                          <td className="p-8 text-center">
                             <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-100">{aff.status}</span>
                          </td>
                          <td className="p-8 text-right">
                             <div className="flex gap-2 justify-end">
                                <button className="p-3 text-gray-300 hover:text-purple-600 transition-colors"><MessageSquare size={18}/></button>
                                <button className="p-3 text-gray-300 hover:text-gray-900 transition-colors"><MoreVertical size={18}/></button>
                             </div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
};

const KPICard = ({ label, val, delta, color, icon }: any) => (
  <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm transition-all hover:shadow-xl group">
     <div className="flex justify-between items-start mb-6">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <div className={`p-2 rounded-lg bg-gray-50 ${color} shadow-inner`}>{icon}</div>
     </div>
     <div className="flex items-baseline justify-between">
        <h3 className={`text-3xl font-black ${color} tracking-tighter`}>{val}</h3>
        <span className="text-[10px] font-black text-green-500 flex items-center gap-0.5"><ArrowUpRight size={10}/> {delta}</span>
     </div>
  </div>
);

export default AdminAffiliateManager;
