
import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Plus, Trash2, Home, Building2, 
  Check, X, ChevronRight, Info, CalendarDays, Zap, Settings2, Copy, ChevronLeft, CalendarRange, Sparkles
} from 'lucide-react';

const DAYS_JP = ['日', '月', '火', '水', '木', '金', '土'];
const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => `${i + 8}:00`);

const TherapistCalendar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GRID' | 'TEMPLATE'>('GRID');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const dateStrip = useMemo(() => {
    const arr = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      arr.push({
        iso: d.toISOString().split('T')[0],
        day: d.getDate(),
        dow: DAYS_JP[d.getDay()],
        isSunday: d.getDay() === 0
      });
    }
    return arr;
  }, []);

  return (
    <div className="space-y-8 pb-32 animate-fade-in text-gray-900 font-sans px-4">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black text-gray-900 tracking-tighter">稼働スケジュール管理</h1>
           <p className="text-gray-400 font-bold uppercase tracking-widest mt-1 text-[10px]">Professional Availability Control</p>
        </div>
        
        <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit shadow-inner">
           <button 
             onClick={() => setActiveTab('GRID')}
             className={`px-8 py-3 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${activeTab === 'GRID' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-400'}`}
           >
              <CalendarRange size={16} /> 日別調整
           </button>
           <button 
             onClick={() => setActiveTab('TEMPLATE')}
             className={`px-8 py-3 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${activeTab === 'TEMPLATE' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-400'}`}
           >
              <Settings2 size={16} /> 週間定型
           </button>
        </div>
      </div>

      {activeTab === 'GRID' && (
        <div className="space-y-8 animate-fade-in">
           {/* 日付選択チップ */}
           <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar snap-x">
              {dateStrip.map(d => (
                <button
                  key={d.iso}
                  onClick={() => setSelectedDate(d.iso)}
                  className={`min-w-[80px] py-5 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all snap-center ${selectedDate === d.iso ? 'bg-gray-900 border-gray-900 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400'}`}
                >
                   <p className={`text-[10px] font-black ${selectedDate === d.iso ? 'text-indigo-400' : d.isSunday ? 'text-red-400' : ''}`}>{d.dow}</p>
                   <p className="text-xl font-black tracking-tighter">{d.day}</p>
                </button>
              ))}
           </div>

           {/* 高効率グリッドエディタ */}
           <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h3 className="font-black text-sm tracking-tight">{selectedDate} の予約枠開放設定</h3>
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400">
                       <div className="w-3 h-3 bg-indigo-600 rounded-full"></div> 稼働
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400">
                       <div className="w-3 h-3 bg-gray-100 rounded-full border"></div> 休み
                    </div>
                 </div>
              </div>

              <div className="p-6 grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
                 {TIME_SLOTS.map(time => {
                    const isActive = parseInt(time) >= 10 && parseInt(time) <= 18;
                    return (
                       <button 
                         key={time}
                         className={`py-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-300'}`}
                       >
                          <span className="text-sm font-black tracking-tighter">{time}</span>
                          <span className="text-[8px] font-bold opacity-50">{isActive ? 'OPEN' : 'CLOSED'}</span>
                       </button>
                    );
                 })}
              </div>

              <div className="p-8 bg-indigo-50 border-t border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><Sparkles size={24}/></div>
                    <p className="text-xs font-bold text-indigo-900 leading-relaxed">
                       「{selectedDate}」は付近で大型イベントがあります。<br/>
                       <span className="text-indigo-600 font-black">20:00以降の枠を開放</span>すると予約率が高まる見込です。
                    </p>
                 </div>
                 <button className="bg-gray-900 text-white px-8 py-3 rounded-xl font-black text-xs hover:bg-teal-600 transition-all shadow-xl">変更を保存</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TherapistCalendar;
