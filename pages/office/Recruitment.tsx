
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, Search, Filter, MoreHorizontal, MessageSquare, 
  Calendar, ChevronRight, CheckCircle2, UserCheck, 
  Clock, Award, Smartphone, MapPin, Star, MoreVertical, LayoutGrid, List
} from 'lucide-react';

const OfficeRecruitment: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');

  const [columns, setColumns] = useState([
    { id: 'APPLIED', title: '新規応募', color: 'bg-blue-500', items: [
      { id: 'app-1', name: '佐々木 健太', type: '国家資格保有', date: '10分前', note: '前職: 都内有名ホテルスパ', rating: 4.5 },
      { id: 'app-2', name: '三浦 由佳', type: 'リラクゼーション', date: '3時間前', note: '出張マッサージ経験5年', rating: 4.2 },
    ]},
    { id: 'INTERVIEW', title: '面談・実技審査', color: 'bg-indigo-500', items: [
      { id: 'app-3', name: '小林 亮', type: '国家資格保有', date: '昨日', note: '5/22 14:00〜 オンライン面談', rating: 4.8 },
    ]},
    { id: 'TRAINING', title: '研修中・CARE CUBE講習', color: 'bg-orange-500', items: [
      { id: 'app-4', name: '高橋 瞳', type: 'リラクゼーション', date: '2日前', note: 'ブース入室フロー習得済み', rating: 4.0 },
    ]},
    { id: 'READY', title: 'デビュー間近', color: 'bg-teal-500', items: [
      { id: 'app-5', name: '渡辺 誠', type: '国家資格保有', date: '5/18', note: '宣材写真・プロフィール審査中', rating: 4.9 },
    ]},
  ]);

  return (
    <div className="space-y-8 animate-fade-in text-gray-900 font-sans h-screen flex flex-col pb-10">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-4 flex-shrink-0">
        <div>
           <h1 className="text-4xl font-black tracking-tighter">採用パイプライン</h1>
           <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Talent Lifecycle Management</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="bg-gray-100 p-1.5 rounded-2xl flex shadow-inner">
              <button onClick={() => setViewMode('KANBAN')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'KANBAN' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><LayoutGrid size={18}/></button>
              <button onClick={() => setViewMode('LIST')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'LIST' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}><List size={18}/></button>
           </div>
           <button className="bg-gray-900 text-white px-8 py-4 rounded-[22px] font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-teal-600 transition-all active:scale-95">
              <UserPlus size={18} /> パブリック募集URLを発行
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar px-4 pb-12 flex gap-8">
        {columns.map(col => (
          <div key={col.id} className="w-[340px] flex-shrink-0 flex flex-col gap-6">
             <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                   <div className={`w-2.5 h-2.5 rounded-full ${col.color}`}></div>
                   <h3 className="font-black text-slate-900 text-sm tracking-tight">{col.title}</h3>
                </div>
                <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black shadow-inner">{col.items.length}</span>
             </div>
             
             <div className="flex-1 bg-slate-100/50 rounded-[48px] p-5 space-y-4 border border-slate-200/40 custom-scrollbar overflow-y-auto">
                {col.items.map(item => (
                   <div 
                     key={item.id} 
                     onClick={() => navigate(`/o/recruitment/${item.id}`)}
                     className="bg-white p-6 rounded-[36px] shadow-sm border border-transparent hover:border-teal-500 hover:shadow-2xl transition-all cursor-pointer group active:scale-[0.98] relative overflow-hidden"
                   >
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-1.5">
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded tracking-tighter uppercase ${item.type.includes('国家資格') ? 'bg-indigo-600 text-white shadow-sm' : 'bg-teal-500 text-white shadow-sm'}`}>
                               {item.type}
                            </span>
                         </div>
                         <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{item.date}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-4">
                         <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-gray-300 shadow-inner group-hover:bg-teal-50 group-hover:text-teal-500 transition-all">
                            {item.name.charAt(0)}
                         </div>
                         <div>
                            <h4 className="font-black text-slate-900 text-lg leading-tight group-hover:text-teal-600 transition-colors">{item.name}</h4>
                            <div className="flex items-center gap-1 text-yellow-500 mt-1">
                               <Star size={10} fill="currentColor" />
                               <span className="text-[10px] font-black">{item.rating}</span>
                            </div>
                         </div>
                      </div>

                      <p className="text-[11px] text-gray-500 font-bold leading-relaxed line-clamp-2 bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-4 italic group-hover:bg-white transition-all">
                        「{item.note}」
                      </p>
                      
                      <div className="pt-2 flex justify-between items-center">
                         <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center shadow-sm text-gray-400 group-hover:border-teal-100 transition-all"><MessageSquare size={14}/></div>
                            <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center shadow-sm text-gray-400 group-hover:border-teal-100 transition-all"><Calendar size={14}/></div>
                         </div>
                         <button className="text-[9px] font-black text-teal-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            PROCESS <ChevronRight size={10} />
                         </button>
                      </div>
                   </div>
                ))}
                
                <button className="w-full py-6 rounded-[36px] border-4 border-dashed border-gray-200 text-gray-400 text-[10px] font-black hover:bg-white hover:border-teal-500 hover:text-teal-500 transition-all uppercase tracking-widest active:scale-95">
                   + Add Applicant
                </button>
             </div>
          </div>
        ))}
        
        {/* New State / Add Column */}
        <div className="w-80 flex-shrink-0 flex items-center justify-center h-full border-4 border-dashed border-slate-200 rounded-[56px] bg-slate-50/50 group hover:border-teal-200 transition-all">
           <button className="flex flex-col items-center gap-4 text-slate-300 group-hover:text-teal-400 transition-colors">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><UserPlus size={32} /></div>
              <span className="text-xs font-black uppercase tracking-[0.3em]">New Stage</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default OfficeRecruitment;
