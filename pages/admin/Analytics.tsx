
import React, { useState } from 'react';
import { 
  TrendingUp, Users, MousePointer, CreditCard, ArrowUpRight, ArrowDownRight, 
  Activity, Calendar, Zap, Filter, Sparkles, PieChart as PieChartIcon, 
  MapPin, Clock, ChevronRight, Download
} from 'lucide-react';

const AdminAnalytics: React.FC = () => {
  const [period, setPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH'>('MONTH');

  return (
    <div className="space-y-12 pb-32 animate-fade-in text-gray-900 font-sans px-4">
      <div className="flex flex-col lg:flex-row justify-between items-end gap-10">
        <div>
           <span className="inline-block bg-teal-50 text-teal-600 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.4em] mb-6 border border-teal-100 shadow-sm">プラットフォーム解析</span>
           <h1 className="text-5xl font-black tracking-tighter">経営指標・流通実績</h1>
           <p className="text-gray-400 font-bold uppercase tracking-[0.3em] mt-2 text-xs">Infrastructure Performance Monitoring</p>
        </div>
        
        <div className="flex bg-gray-100 p-1.5 rounded-[32px] shadow-inner">
           {[
             { id: 'TODAY', label: '本日' },
             { id: 'WEEK', label: '直近7日間' },
             { id: 'MONTH', label: '過去30日間' }
           ].map(p => (
             <button 
               key={p.id}
               onClick={() => setPeriod(p.id as any)}
               className={`px-8 py-4 rounded-[24px] text-[11px] font-black uppercase tracking-widest transition-all ${period === p.id ? 'bg-white text-teal-700 shadow-xl scale-105' : 'text-gray-400 hover:text-gray-600'}`}
             >
                {p.label}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
         <StatCard title="有効PV" value="128,400" change="+12.4%" positive icon={<TrendingUp size={20}/>} />
         <StatCard title="予約リクエスト数" value="2,342" change="+5.1%" positive icon={<Calendar size={20}/>} />
         <StatCard title="予約転換率 (CVR)" value="3.24%" change="-0.4%" positive={false} icon={<MousePointer size={20}/>} />
         <StatCard title="流通総額 (GMV)" value="¥14.2M" change="+18.2%" positive icon={<CreditCard size={20}/>} />
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Onsite vs Mobile Trend */}
        <div className="lg:col-span-8 space-y-10">
           <div className="bg-white p-12 rounded-[64px] shadow-sm border border-gray-100 group hover:shadow-2xl transition-all duration-700">
              <div className="flex justify-between items-start mb-16">
                 <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
                      <Activity size={28} className="text-teal-600" /> モデル別売上推移
                    </h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Hybrid Revenue Flow Analysis</p>
                 </div>
                 <div className="flex gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                       <div className="w-2.5 h-2.5 bg-teal-500 rounded-full"></div> 店舗利用 (CUBE)
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                       <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div> 出張訪問 (Mobile)
                    </div>
                 </div>
              </div>
              
              <div className="h-80 flex items-end justify-between gap-2 md:gap-4 px-4 mb-8">
                 {Array.from({ length: 20 }).map((_, i) => {
                   const onsiteH = 30 + Math.random() * 50;
                   const mobileH = 10 + Math.random() * 30;
                   return (
                     <div key={i} className="flex-1 flex flex-col gap-1.5 items-center group/bar relative">
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-black p-3 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-2xl border border-white/10">
                           {i+1}日目<br/>
                           合計: ¥{(onsiteH + mobileH).toFixed(1)}k
                        </div>
                        <div style={{ height: `${onsiteH}%` }} className="w-full bg-teal-500/80 rounded-t-lg transition-all group-hover/bar:brightness-110"></div>
                        <div style={{ height: `${mobileH}%` }} className="w-full bg-orange-500/80 rounded-b-lg transition-all group-hover/bar:brightness-110"></div>
                        <span className="text-[8px] font-black text-gray-300 mt-4 group-hover/bar:text-teal-600 transition-colors uppercase">{i+1}日</span>
                     </div>
                   );
                 })}
              </div>
           </div>

           <div className="bg-white rounded-[48px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h3 className="font-black text-lg flex items-center gap-3"><MapPin className="text-indigo-600" /> エリア別・収益詳細統計</h3>
                 <button className="text-[10px] font-black text-indigo-600 bg-white px-4 py-2 rounded-xl border border-indigo-100 hover:shadow-md transition-all flex items-center gap-2">
                    <Download size={14}/> CSV出力
                 </button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                       <tr>
                          <th className="p-8">エリア</th>
                          <th className="p-8 text-right">流通総額 (GMV)</th>
                          <th className="p-8 text-right">予約件数</th>
                          <th className="p-8 text-right">客単価</th>
                          <th className="p-8 text-right">CVR</th>
                          <th className="p-8 text-center">前月比</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-bold text-sm">
                       {[
                         { area: '渋谷区', gmv: '¥4,250,000', count: 482, arpu: '¥8,817', cvr: '4.2%', trend: '+12%' },
                         { area: '港区', gmv: '¥3,890,000', count: 320, arpu: '¥12,156', cvr: '3.8%', trend: '+8%' },
                         { area: '新宿区', gmv: '¥2,950,000', count: 340, arpu: '¥8,676', cvr: '4.5%', trend: '-2%' },
                         { area: '千代田区', gmv: '¥1,580,000', count: 124, arpu: '¥12,741', cvr: '2.1%', trend: '+15%' },
                       ].map(row => (
                         <tr key={row.area} className="hover:bg-gray-50 transition-colors">
                            <td className="p-8 font-black text-gray-900">{row.area}</td>
                            <td className="p-8 text-right font-mono">¥{row.gmv}</td>
                            <td className="p-8 text-right text-gray-500">{row.count}件</td>
                            <td className="p-8 text-right text-gray-500">{row.arpu}</td>
                            <td className="p-8 text-right text-teal-600">{row.cvr}</td>
                            <td className="p-8 text-center">
                               <span className={`px-2 py-0.5 rounded text-[10px] font-black ${row.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {row.trend}
                               </span>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* AI Insight Column */}
        <div className="lg:col-span-4 space-y-8">
           <section className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-8 flex items-center justify-between tracking-tight">
                 流入元コンバージョン分析
                 <span className="text-[8px] font-black bg-orange-100 text-orange-600 px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">Hot Channels</span>
              </h3>
              <div className="space-y-4">
                 {[
                   { label: 'Google Search (LPO)', views: '12,400', cv: '4.2%' },
                   { label: 'Instagram Ads', views: '8,200', cv: '5.8%' },
                   { label: 'ホテル提携リファラル', views: '7,500', cv: '12.1%' },
                 ].map((lp, i) => (
                   <div key={i} className="flex items-center justify-between p-6 bg-gray-50 rounded-[32px] hover:bg-white hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer border border-transparent hover:border-gray-100 shadow-inner">
                      <div>
                         <p className="text-sm font-black text-gray-900 tracking-tight">{lp.label}</p>
                         <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{lp.views} リーチ</p>
                      </div>
                      <div className="text-right">
                         <p className="text-xl font-black text-teal-600 tracking-tighter">{lp.cv}</p>
                         <p className="text-[8px] text-gray-300 font-black uppercase tracking-widest">CVR</p>
                      </div>
                   </div>
                 ))}
              </div>
           </section>

           <section className="bg-indigo-900 rounded-[56px] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[100px] opacity-10 group-hover:scale-110 transition-transform duration-700"></div>
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-teal-400 shadow-inner"><PieChartIcon size={24}/></div>
                    <h4 className="font-black text-lg">AI 経営戦略サジェスト</h4>
                 </div>
                 <p className="text-sm font-bold leading-relaxed text-indigo-100 italic opacity-90">
                   「港区エリアの夜間(21:00以降)の予約飽和状態が続いています。近隣エリアのセラピストへ当該時間帯のインセンティブを強化し、供給の分散を推奨します。推計期待売上: +¥350,000/月」
                 </p>
                 <button className="w-full py-5 bg-teal-500 text-white rounded-3xl font-black text-xs hover:bg-teal-400 transition-all shadow-xl active:scale-95 uppercase tracking-widest">
                    全データレポートを生成
                 </button>
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, positive, icon }: any) => (
  <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 group hover:shadow-2xl transition-all duration-500">
    <div className={`w-14 h-14 rounded-3xl flex items-center justify-center mb-10 transition-all ${positive ? 'bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white' : 'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white shadow-inner'}`}>
      {icon}
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">{title}</p>
      <div className="flex items-baseline justify-between">
        <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{value}</h3>
        <div className={`flex items-center gap-1 text-[11px] font-black ${positive ? 'text-green-500' : 'text-red-500'}`}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </div>
      </div>
    </div>
  </div>
);

export default AdminAnalytics;
