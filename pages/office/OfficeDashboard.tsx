
import React, { useState, useEffect } from 'react';
import { 
  Users, JapaneseYen, Activity, ShieldAlert, 
  MapPin, Calendar, ArrowRight, Loader2
} from 'lucide-react';
import { MOCK_THERAPISTS, MOCK_BOOKINGS, MOCK_AREAS } from '../../constants';
import StatusBadge from '../../components/StatusBadge';
import { api } from '../../services/api';

const OfficeDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [therapists, setTherapists] = useState(MOCK_THERAPISTS.filter(t => t.officeId === 'off1'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const list = await api.therapists.list();
        if (list && list.length > 0) {
          setTherapists(list.filter((t: any) => t.officeId === 'off1'));
        }
      } catch (e) {
        console.warn("API Error, using fallback data");
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">セラピストオフィス管理ボード</h1>
          <p className="text-gray-400 text-sm font-bold mt-1 uppercase tracking-[0.2em]">新宿ウェルネス・エージェンシー</p>
        </div>
        <div className="bg-teal-600 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg shadow-teal-500/20">
           本部への支払後見込: ¥867,000
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: '所属セラピスト', val: therapists.length, unit: '名', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Users },
           { label: '今月のオフィス総売上', val: '¥1,245,000', unit: '', color: 'text-teal-600', bg: 'bg-teal-50', icon: JapaneseYen },
           { label: 'リアルタイム稼働', val: '5', unit: '件', color: 'text-orange-600', bg: 'bg-orange-50', icon: Activity },
         ].map((stat, i) => (
           <div key={i} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-xl transition-all">
             <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner`}>
               <stat.icon size={24} />
             </div>
             <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
               <h3 className="text-3xl font-black text-gray-900">{stat.val}<span className="text-sm ml-1 font-bold">{stat.unit}</span></h3>
             </div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
           <div className="flex justify-between items-center px-4">
              <h2 className="text-xl font-black text-gray-900">所属セラピスト稼働状況</h2>
              <button className="text-xs font-black text-teal-600 hover:underline flex items-center gap-1">全員を見る <ArrowRight size={14}/></button>
           </div>
           <div className="space-y-4">
              {therapists.map(t => (
                <div key={t.id} className="bg-white p-6 rounded-[32px] border border-gray-100 flex items-center justify-between group hover:border-teal-500 transition-all shadow-sm">
                   <div className="flex items-center gap-4">
                      <img src={t.imageUrl} className="w-14 h-14 rounded-2xl object-cover shadow-md" />
                      <div>
                         <h4 className="font-black text-gray-900 group-hover:text-teal-600 transition-colors">{t.name}</h4>
                         <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 mt-1">
                            <span className="flex items-center gap-1"><Calendar size={12}/> 本日3件</span>
                            <span className="flex items-center gap-1"><MapPin size={12}/> {MOCK_AREAS.find(a => a.id === t.areas[0])?.name}</span>
                         </div>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-xs font-black text-gray-900">¥{(120000).toLocaleString()}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Monthly Sales</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="space-y-8">
           <section className="bg-gray-900 text-white p-8 rounded-[48px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 rounded-full blur-3xl opacity-20"></div>
              <h3 className="text-lg font-black mb-6 flex items-center gap-2"><ShieldAlert className="text-red-500" /> オフィス安全アラート</h3>
              <div className="space-y-4">
                 <div className="bg-white/5 border border-white/10 p-5 rounded-3xl">
                    <p className="text-xs font-black text-red-400 mb-2 uppercase tracking-widest">🚨 SOS発報中</p>
                    <p className="text-xs text-gray-300 font-bold leading-relaxed">田中 有紀さんが新宿区にてSOSボタンを押しました。警察への連携が必要です。</p>
                    <button className="w-full mt-4 bg-red-600 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-red-700 transition-colors">対応パネルを開く</button>
                 </div>
              </div>
           </section>

           <section className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm">
              <h3 className="font-black text-gray-900 mb-6">収益配分設定</h3>
              <div className="space-y-6">
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">所属セラピストへの支払率</p>
                    <div className="flex items-center justify-between">
                       <span className="text-2xl font-black text-gray-900">60 <span className="text-sm font-bold text-gray-300">%</span></span>
                       <button className="text-[10px] font-black text-teal-600 bg-teal-50 px-4 py-2 rounded-full border border-teal-100 hover:bg-teal-100 transition-all">変更</button>
                    </div>
                 </div>
                 <div className="pt-4 border-t border-gray-50">
                    <p className="text-[10px] font-bold text-gray-400 leading-relaxed">
                      ※ 本部手数料(15%)を差し引いた後の純売上に対して、各セラピストへの二次配分を決定します。
                    </p>
                 </div>
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default OfficeDashboard;
