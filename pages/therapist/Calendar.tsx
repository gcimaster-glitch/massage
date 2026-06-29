import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  CalendarRange, Settings2, Sparkles, Save, Loader2
} from 'lucide-react';

const DAYS_JP = ['日', '月', '火', '水', '木', '金', '土'];
const DAYS_FULL = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`);

interface Schedule {
  id: string;
  therapist_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: number;
}

const TherapistCalendar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GRID' | 'TEMPLATE'>('GRID');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [dailySlots, setDailySlots] = useState<Record<string, boolean>>({});
  const [weeklyTemplate, setWeeklyTemplate] = useState<Record<number, { start: string; end: string; enabled: boolean }>>({
    0: { start: '10:00', end: '18:00', enabled: false },
    1: { start: '09:00', end: '20:00', enabled: true },
    2: { start: '09:00', end: '20:00', enabled: true },
    3: { start: '09:00', end: '20:00', enabled: true },
    4: { start: '09:00', end: '20:00', enabled: true },
    5: { start: '09:00', end: '20:00', enabled: true },
    6: { start: '10:00', end: '18:00', enabled: true },
  });

  const getToken = () => localStorage.getItem('auth_token') || '';

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch('/api/therapists/schedules', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        const scheds: Schedule[] = data.schedules || [];
        if (scheds.length > 0) {
          const template: Record<number, { start: string; end: string; enabled: boolean }> = {
            0: { start: '10:00', end: '18:00', enabled: false },
            1: { start: '09:00', end: '20:00', enabled: false },
            2: { start: '09:00', end: '20:00', enabled: false },
            3: { start: '09:00', end: '20:00', enabled: false },
            4: { start: '09:00', end: '20:00', enabled: false },
            5: { start: '09:00', end: '20:00', enabled: false },
            6: { start: '10:00', end: '18:00', enabled: false },
          };
          scheds.forEach((s) => {
            if (s.day_of_week !== null && s.day_of_week !== undefined) {
              template[s.day_of_week] = { start: s.start_time, end: s.end_time, enabled: s.is_available === 1 };
            }
          });
          setWeeklyTemplate(template);
        }
      }
    } catch (e) {
      console.error('スケジュール取得エラー:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  useEffect(() => {
    const dayOfWeek = new Date(selectedDate).getDay();
    const template = weeklyTemplate[dayOfWeek];
    const slots: Record<string, boolean> = {};
    TIME_SLOTS.forEach(time => {
      const hour = parseInt(time);
      const startHour = parseInt(template?.start || '09:00');
      const endHour = parseInt(template?.end || '18:00');
      slots[time] = template?.enabled ? (hour >= startHour && hour < endHour) : false;
    });
    setDailySlots(slots);
  }, [selectedDate, weeklyTemplate]);

  const toggleSlot = (time: string) => {
    setDailySlots(prev => ({ ...prev, [time]: !prev[time] }));
  };

  const saveWeeklyTemplate = async () => {
    setSaving(true);
    try {
      const scheduleData = Object.entries(weeklyTemplate).map(([day, v]) => ({
        day_of_week: parseInt(day),
        start_time: v.start,
        end_time: v.end,
        is_available: v.enabled
      }));
      const res = await fetch('/api/therapists/schedules/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ schedules: scheduleData })
      });
      if (res.ok) {
        setMessage('週間スケジュールを保存しました');
        await fetchSchedules();
      } else {
        setMessage('保存に失敗しました');
      }
    } catch (e) {
      setMessage('エラーが発生しました');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32 animate-fade-in text-gray-900 font-sans px-4">
      {message && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg z-50">
          {message}
        </div>
      )}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black text-gray-900 tracking-tighter">稼働スケジュール管理</h1>
           <p className="text-gray-400 font-bold uppercase tracking-widest mt-1 text-[10px]">Professional Availability Control</p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit shadow-inner">
           <button onClick={() => setActiveTab('GRID')} className={`px-8 py-3 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${activeTab === 'GRID' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-400'}`}>
              <CalendarRange size={16} /> 日別調整
           </button>
           <button onClick={() => setActiveTab('TEMPLATE')} className={`px-8 py-3 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${activeTab === 'TEMPLATE' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-400'}`}>
              <Settings2 size={16} /> 週間定型
           </button>
        </div>
      </div>

      {activeTab === 'GRID' && (
        <div className="space-y-8 animate-fade-in">
           <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar snap-x">
              {dateStrip.map(d => (
                <button key={d.iso} onClick={() => setSelectedDate(d.iso)} className={`min-w-[80px] py-5 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all snap-center ${selectedDate === d.iso ? 'bg-gray-900 border-gray-900 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400'}`}>
                   <p className={`text-[10px] font-black ${selectedDate === d.iso ? 'text-indigo-400' : d.isSunday ? 'text-red-400' : ''}`}>{d.dow}</p>
                   <p className="text-xl font-black tracking-tighter">{d.day}</p>
                </button>
              ))}
           </div>
           <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 <h3 className="font-black text-sm tracking-tight">{selectedDate} の予約枠開放設定</h3>
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400"><div className="w-3 h-3 bg-indigo-600 rounded-full"></div> 稼働</div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400"><div className="w-3 h-3 bg-gray-100 rounded-full border"></div> 休み</div>
                 </div>
              </div>
              <div className="p-6 grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
                 {TIME_SLOTS.map(time => {
                    const isActive = dailySlots[time] || false;
                    return (
                       <button key={time} onClick={() => toggleSlot(time)} className={`py-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-300 hover:border-indigo-200'}`}>
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
                       タップで枠のON/OFFを切り替えできます。<br/>
                       <span className="text-indigo-600 font-black">週間定型タブ</span>で基本パターンを設定すると効率的です。
                    </p>
                 </div>
                 <button className="bg-gray-900 text-white px-8 py-3 rounded-xl font-black text-xs hover:bg-teal-600 transition-all shadow-xl flex items-center gap-2">
                    <Save size={14} /> 変更を保存
                 </button>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'TEMPLATE' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-black text-sm tracking-tight">週間定型スケジュール</h3>
              <p className="text-xs text-gray-400 mt-1">毎週の基本パターンを設定します。日別調整で個別に変更も可能です。</p>
            </div>
            <div className="divide-y divide-gray-50">
              {[1, 2, 3, 4, 5, 6, 0].map(day => (
                <div key={day} className="p-5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <button
                    onClick={() => setWeeklyTemplate(prev => ({ ...prev, [day]: { ...prev[day], enabled: !prev[day].enabled } }))}
                    className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center transition-all ${weeklyTemplate[day].enabled ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-300'}`}
                  >
                    {DAYS_JP[day]}
                  </button>
                  <span className={`text-sm font-bold w-16 ${weeklyTemplate[day].enabled ? 'text-gray-900' : 'text-gray-300'}`}>
                    {DAYS_FULL[day]}
                  </span>
                  {weeklyTemplate[day].enabled ? (
                    <div className="flex items-center gap-2 ml-auto">
                      <select value={weeklyTemplate[day].start} onChange={(e) => setWeeklyTemplate(prev => ({ ...prev, [day]: { ...prev[day], start: e.target.value } }))} className="bg-gray-100 border-0 rounded-xl px-4 py-2 text-sm font-bold text-gray-700">
                        {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <span className="text-gray-300 font-bold">〜</span>
                      <select value={weeklyTemplate[day].end} onChange={(e) => setWeeklyTemplate(prev => ({ ...prev, [day]: { ...prev[day], end: e.target.value } }))} className="bg-gray-100 border-0 rounded-xl px-4 py-2 text-sm font-bold text-gray-700">
                        {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                        <option value="22:00">22:00</option>
                      </select>
                    </div>
                  ) : (
                    <span className="ml-auto text-xs font-bold text-gray-300">休業日</span>
                  )}
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button onClick={saveWeeklyTemplate} disabled={saving} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-black text-xs hover:bg-teal-600 transition-all shadow-xl flex items-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                週間パターンを保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistCalendar;
