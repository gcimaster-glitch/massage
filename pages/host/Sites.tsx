
import React, { useState } from 'react';
import { MOCK_SITES } from '../../constants';
import { Building, MapPin, Plus, Clock, ShieldCheck, Edit2, ChevronRight, X, Save, Trash2, CalendarCheck, AlertCircle, TrendingUp, BarChart3, Info } from 'lucide-react';
import { BusinessHours, DayConfig, TimeBlock } from '../../types';

const defaultHours: BusinessHours = {
  monday: { isOpen: true, timeBlocks: [{ start: '10:00', end: '22:00' }] },
  tuesday: { isOpen: true, timeBlocks: [{ start: '10:00', end: '22:00' }] },
  wednesday: { isOpen: true, timeBlocks: [{ start: '10:00', end: '22:00' }] },
  thursday: { isOpen: true, timeBlocks: [{ start: '10:00', end: '22:00' }] },
  friday: { isOpen: true, timeBlocks: [{ start: '10:00', end: '23:00' }] },
  saturday: { isOpen: true, timeBlocks: [{ start: '09:00', end: '23:00' }] },
  sunday: { isOpen: true, timeBlocks: [{ start: '09:00', end: '21:00' }] },
};

const HostSites: React.FC = () => {
  const [sites, setSites] = useState(MOCK_SITES);
  const [editingHoursId, setEditingHoursId] = useState<string | null>(null);
  const [hours, setHours] = useState<BusinessHours>(defaultHours);
  const [showAnalyticsId, setShowAnalyticsId] = useState<string | null>(null);

  const handleUpdateDayStatus = (day: keyof BusinessHours, isOpen: boolean) => {
    setHours(prev => ({ ...prev, [day]: { ...prev[day], isOpen } }));
  };

  const updateTimeBlock = (day: keyof BusinessHours, idx: number, field: keyof TimeBlock, value: string) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeBlocks: prev[day].timeBlocks.map((b, i) => i === idx ? { ...b, [field]: value } : b)
      }
    }));
  };

  return (
    <div className="space-y-10 pb-20 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-black text-gray-900 tracking-tighter">施設・拠点管理</h1>
           <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Infrastructure Control</p>
        </div>
        <button className="bg-gray-900 text-white px-10 py-4 rounded-[28px] font-black text-sm hover:bg-teal-600 transition-all flex items-center gap-2 shadow-2xl active:scale-95">
          <Plus size={20} /> 新規拠点を登録
        </button>
      </div>

      <div className="grid gap-10">
        {sites.map(site => (
          <div key={site.id} className="bg-white rounded-[64px] shadow-sm border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div className="p-12 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-10 bg-white">
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-[32px] flex items-center justify-center shadow-inner">
                  <Building size={40} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">{site.name}</h2>
                  <p className="text-gray-400 flex items-center gap-2 mt-2 font-bold text-sm">
                    <MapPin size={18} className="text-teal-500" /> {site.address}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                 <button 
                   onClick={() => setEditingHoursId(site.id)}
                   className="flex-1 md:flex-none bg-gray-900 text-white px-8 py-4 rounded-3xl font-black text-xs flex items-center justify-center gap-2 hover:bg-teal-600 transition-all shadow-xl"
                 >
                    <Clock size={18} /> 営業時間設定
                 </button>
                 <button 
                   onClick={() => setShowAnalyticsId(showAnalyticsId === site.id ? null : site.id)}
                   className={`flex-1 md:flex-none px-8 py-4 rounded-3xl font-black text-xs flex items-center justify-center gap-2 transition-all border-2 ${showAnalyticsId === site.id ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                 >
                    <BarChart3 size={18} /> 稼働解析
                 </button>
              </div>
            </div>

            {showAnalyticsId === site.id && (
              <div className="p-12 bg-teal-50/30 animate-fade-in border-b border-gray-100 overflow-x-auto">
                 <div className="flex justify-between items-center mb-8 min-w-[600px]">
                    <h3 className="text-xl font-black flex items-center gap-3"><TrendingUp className="text-teal-600" /> 時間帯別・稼働ヒートマップ</h3>
                    <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-teal-100">Past 30 Days Data</span>
                 </div>
                 
                 {/* Fixed Grid for 24 Hours */}
                 <div className="grid h-36 gap-1.5 min-w-[900px]" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
                    {Array.from({ length: 24 }).map((_, hour) => {
                       const intensity = hour >= 18 && hour <= 22 ? 'bg-teal-600' : hour >= 10 && hour <= 17 ? 'bg-teal-400' : 'bg-teal-100';
                       const occupancy = Math.random() * 80 + 20;
                       return (
                          <div key={hour} className="group relative flex flex-col justify-end h-full">
                             <div 
                               className={`w-full rounded-t-lg transition-all hover:brightness-90 ${intensity}`} 
                               style={{ height: `${occupancy}%` }}
                             ></div>
                             <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl border border-white/20 pointer-events-none">
                                {hour}:00 - {intensity === 'bg-teal-600' ? '高稼働' : intensity === 'bg-teal-400' ? '通常' : '空きあり'}<br/>
                                稼働率: {Math.round(occupancy)}%
                             </div>
                             <span className="text-[9px] font-black text-gray-400 mt-3 text-center border-t border-gray-200 pt-1 flex-shrink-0">{hour}h</span>
                          </div>
                       );
                    })}
                 </div>
                 
                 <div className="mt-10 bg-white p-8 rounded-[40px] border border-teal-100 flex items-center gap-8 min-w-[600px]">
                    <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-3xl flex items-center justify-center shadow-inner flex-shrink-0"><Info size={32} /></div>
                    <div className="space-y-1">
                       <p className="text-base font-bold text-teal-900 leading-relaxed">
                          夜間（19:00以降）の稼働が集中しています。
                       </p>
                       <p className="text-sm text-teal-700 font-medium opacity-80">
                          金・土曜日の営業時間を2時間延長することで、推計 <span className="font-black text-lg underline">¥45,000/月</span> の収益向上が見込めます。
                       </p>
                    </div>
                 </div>
              </div>
            )}

            <div className="p-12 bg-gray-50/50 grid md:grid-cols-3 gap-10">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">稼働ステータス</h3>
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center justify-between">
                   <div>
                      <p className="font-black text-gray-900 text-xl">稼働中</p>
                      <p className="text-[10px] text-teal-600 font-black uppercase mt-1">Online & Active</p>
                   </div>
                   <div className="w-5 h-5 bg-teal-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(20,184,166,0.6)]"></div>
                </div>
              </div>

              <div className="space-y-4 md:col-span-2">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">現在の営業時間</h3>
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-wrap gap-4 items-center">
                   <Clock className="text-teal-600" size={28} />
                   <div className="flex gap-2">
                      {hours.monday.timeBlocks.map((b, i) => (
                        <span key={i} className="bg-teal-50 text-teal-700 px-6 py-3 rounded-2xl font-black text-lg border border-teal-100 shadow-sm">
                           {b.start} - {b.end}
                        </span>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Business Hours Modal */}
      {editingHoursId && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
           <div className="bg-white rounded-[64px] w-full max-w-4xl p-12 shadow-2xl relative overflow-hidden animate-fade-in-up border border-white/10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500 rounded-full blur-[150px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
              
              <div className="relative z-10 flex flex-col h-full max-h-[85vh]">
                 <div className="flex justify-between items-start mb-12">
                    <div>
                       <h2 className="text-4xl font-black text-gray-900 tracking-tighter">営業可能時間の設定</h2>
                       <p className="text-gray-400 text-sm font-bold mt-2 uppercase tracking-[0.2em]">Facility Operation Manager</p>
                    </div>
                    <button onClick={() => setEditingHoursId(null)} className="p-4 bg-gray-100 rounded-[24px] hover:bg-gray-200 transition-colors shadow-inner"><X/></button>
                 </div>

                 <div className="flex-1 overflow-y-auto pr-6 custom-scrollbar space-y-4">
                    {(Object.keys(hours) as Array<keyof BusinessHours>).map(day => (
                      <div key={day} className={`p-8 rounded-[48px] border-2 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 ${hours[day].isOpen ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50 border-transparent opacity-50'}`}>
                         <div className="flex items-center gap-8 min-w-[180px]">
                            <label className="relative inline-flex items-center cursor-pointer">
                               <input type="checkbox" className="sr-only peer" checked={hours[day].isOpen} onChange={e => handleUpdateDayStatus(day, e.target.checked)} />
                               <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                            <span className="font-black text-xl text-gray-900 uppercase">{day}</span>
                         </div>
                         {hours[day].isOpen ? (
                            <div className="flex-1 space-y-3">
                               {hours[day].timeBlocks.map((block, idx) => (
                                 <div key={idx} className="flex items-center gap-4 animate-fade-in">
                                    <input type="time" value={block.start} onChange={e => updateTimeBlock(day, idx, 'start', e.target.value)} className="p-4 bg-white border border-gray-200 rounded-2xl font-black text-sm outline-none text-gray-900 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm" />
                                    <span className="text-gray-300 font-black uppercase text-[10px] tracking-widest">to</span>
                                    <input type="time" value={block.end} onChange={e => updateTimeBlock(day, idx, 'end', e.target.value)} className="p-4 bg-white border border-gray-200 rounded-2xl font-black text-sm outline-none text-gray-900 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm" />
                                    {idx > 0 && <button className="p-3 text-red-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>}
                                 </div>
                               ))}
                               <button className="text-[10px] font-black text-teal-600 hover:underline uppercase tracking-[0.2em] mt-2">+ Add Operating Block</button>
                            </div>
                         ) : (
                            <span className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex-1 text-right">Closed / 定休日</span>
                         )}
                      </div>
                    ))}
                 </div>

                 <div className="mt-12 pt-10 border-t border-gray-100 flex gap-6">
                    <button onClick={() => setEditingHoursId(null)} className="px-10 py-6 bg-gray-100 text-gray-500 rounded-[32px] font-black text-sm">キャンセル</button>
                    <button onClick={() => setEditingHoursId(null)} className="flex-1 bg-gray-900 text-white rounded-[32px] font-black text-lg shadow-2xl hover:bg-teal-600 transition-all flex items-center justify-center gap-3 active:scale-95">
                       <Save size={24} /> 設定を保存して反映
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default HostSites;
