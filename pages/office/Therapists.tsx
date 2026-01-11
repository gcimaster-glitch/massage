
import React from 'react';
import { Users, Star, TrendingUp, Calendar, MapPin, MoreVertical, ShieldCheck, Award } from 'lucide-react';
import { MOCK_THERAPISTS, MOCK_AREAS } from '../../constants';

const OfficeTherapists: React.FC = () => {
  // off1所属のセラピスト
  const myTherapists = MOCK_THERAPISTS.filter(t => t.officeId === 'off1');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">所属セラピスト管理</h1>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Managed Talent Pool</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-6 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
             <span className="text-[10px] font-black text-gray-400 uppercase">Active Now</span>
             <span className="text-xl font-black text-teal-600">8 / {myTherapists.length}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {myTherapists.map(t => (
          <div key={t.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 flex-1">
              <div className="relative">
                <img src={t.imageUrl} className="w-20 h-20 rounded-[28px] object-cover shadow-lg" alt="" />
                <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                   <ShieldCheck size={20} className="text-teal-600" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                   <h3 className="text-xl font-black text-gray-900">{t.name}</h3>
                   <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-2 py-0.5 rounded uppercase">Platinum</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                   <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400 fill-current" /> {t.rating} ({t.reviewCount})</span>
                   <span className="flex items-center gap-1"><MapPin size={14} /> {MOCK_AREAS.find(a => a.id === t.areas[0])?.name}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:px-10 border-x border-gray-50 flex-shrink-0">
               <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1">今月の売上</p>
                  <p className="text-lg font-black text-gray-900">¥128,000</p>
               </div>
               <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1">総施術数</p>
                  <p className="text-lg font-black text-gray-900">142 回</p>
               </div>
               <div className="hidden md:block">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1">オフィス移籍日</p>
                  <p className="text-sm font-bold text-gray-500">2025/03/15</p>
               </div>
            </div>

            <div className="flex gap-2">
               <button className="bg-gray-50 text-gray-600 px-6 py-3 rounded-2xl text-xs font-black hover:bg-gray-100 transition-all">
                  詳細 / 教育ログ
               </button>
               <button className="p-3 text-gray-300 hover:text-gray-900 transition-colors">
                  <MoreVertical />
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recruitment Teaser */}
      <div className="bg-teal-600 rounded-[48px] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-teal-600/20">
         <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-black">新しい才能を迎え入れましょう</h3>
            <p className="text-teal-100 font-bold opacity-80">採用パイプラインを動かして、オフィスの売上を最大化します。</p>
         </div>
         <button className="bg-white text-teal-600 px-10 py-5 rounded-3xl font-black text-lg shadow-xl hover:scale-105 transition-all">
            採用管理を開く
         </button>
      </div>
    </div>
  );
};

export default OfficeTherapists;
