import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, ArrowRight, UserCheck, Radio, Globe, Zap, 
  JapaneseYen, ChevronRight, 
  AlertCircle, MapPin, 
  AlertTriangle, Search, Filter
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { systemStore } from '../../services/systemState';
import StatusBadge from '../../components/StatusBadge';
import { BookingStatus, IncidentSeverity } from '../../types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const bookings = systemStore.getBookings();
  
  // リアルタイムフィード
  const [feed, setFeed] = useState([
    { id: 101, type: 'INCIDENT', text: 'SOS発報: 渋谷区道玄坂エリア / 鈴木 絵美', time: '現在', icon: <AlertTriangle size={14} className="text-red-500" />, severity: 'CRITICAL', status: 'ALERT' },
    { id: 102, type: 'BOOKING', text: '新規予約成立: 港区六本木 / 田中 有紀', time: '2分前', icon: <Zap size={14} className="text-teal-500" /> },
    { id: 103, type: 'PAYMENT', text: '決済完了: 予約 #b-982 ¥12,000', time: '5分前', icon: <JapaneseYen size={14} className="text-indigo-500" /> },
    { id: 104, type: 'CHECKIN', text: '入室検知: CARE CUBE 渋谷ANNEX', time: '8分前', icon: <MapPin size={14} className="text-orange-500" /> },
  ]);

  const autoMatchingBookings = bookings.filter(b => b.therapistId === 'auto' && b.status === BookingStatus.PENDING_PAYMENT);

  return (
    <AdminLayout>
      <div className="space-y-10 animate-fade-in text-gray-900 font-sans p-8">
      
      {/* 1. 全体メトリクス & 司令部ヘッダー */}
      <div className="flex flex-col lg:flex-row justify-between items-end gap-6 px-4 pt-4">
        <div>
           <span className="inline-block bg-teal-50 text-teal-600 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.4em] mb-6 border border-teal-100 shadow-sm">運営司令部 (Command Center)</span>
           <h1 className="text-5xl font-black tracking-tighter">プラットフォーム動態</h1>
           <p className="text-gray-400 font-bold uppercase tracking-[0.3em] mt-2 text-xs">Live Global Operations Dashboard v4.5</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white p-2 rounded-2xl border border-gray-100 flex shadow-sm">
              <button onClick={() => navigate('/admin/analytics')} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">Overview</button>
              <button onClick={() => navigate('/app/map')} className="px-6 py-3 text-gray-400 hover:text-gray-900 font-black text-[10px] uppercase tracking-widest">Live Map</button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
         <KPICard label="本日流通総額" val="¥1.42M" delta="+15%" color="text-teal-600" icon={<JapaneseYen size={16}/>} />
         <KPICard label="稼働中セッション" val="48" delta="高負荷" color="text-indigo-600" icon={<Activity size={16}/>} />
         <KPICard label="アサイン待ち予約" val={autoMatchingBookings.length} delta="緊急" color="text-orange-600" icon={<Zap size={16}/>} isAlert={autoMatchingBookings.length > 0} />
         <KPICard label="システム稼働率" val="99.9%" delta="正常" color="text-teal-600" icon={<Globe size={16}/>} />
      </div>

      {/* 2. 重大アラート / アサイン待ちバナー */}
      {autoMatchingBookings.length > 0 && (
        <section className="px-4">
           <div className="bg-indigo-600 rounded-[56px] p-10 text-white shadow-2xl relative overflow-hidden group border-b-[16px] border-indigo-800 animate-fade-in">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                 <div className="flex items-center gap-10">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[40px] flex items-center justify-center animate-pulse border border-white/30">
                       <Zap size={56} className="text-teal-300" fill="currentColor" />
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center gap-3">
                          <span className="bg-white text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Urgent: Auto-Assignment in Progress</span>
                       </div>
                       <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">指名なし予約のアサイン待機中</h2>
                       <p className="text-indigo-100 font-bold mt-2 leading-relaxed max-w-xl text-lg">
                         現在 {autoMatchingBookings.length} 件のスピード予約がアサインを待っています。AIがマッチング中ですが、必要に応じて手動での強制アサインが可能です。
                       </p>
                    </div>
                 </div>
                 <button 
                   onClick={() => navigate('/admin/logs')}
                   className="bg-white text-indigo-600 px-12 py-6 rounded-[32px] font-black text-lg shadow-2xl hover:bg-teal-50 transition-all flex items-center gap-4 group"
                 >
                    アサイン状況を確認 <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
           </div>
        </section>
      )}

      <div className="w-full">
         
         {/* リアルタイム・ライブフィード */}
         <div className="space-y-10">
            <div className="bg-white rounded-[64px] shadow-sm border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-700">
               <div className="bg-gray-900 p-10 flex flex-col md:flex-row justify-between items-start md:items-center text-white gap-6">
                  <div className="flex items-center gap-5">
                     <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                        <Radio size={28} className="animate-pulse" />
                     </div>
                     <div>
                        <h2 className="font-black tracking-tight text-2xl leading-none">全セッション・リアルタイムフィード</h2>
                        <p className="text-teal-400 text-[9px] font-black uppercase tracking-[0.4em] mt-2">Active Surveillance & Platform Stream</p>
                     </div>
                  </div>
                  <div className="flex gap-3">
                     <button className="bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition-all"><Search size={20}/></button>
                     <button className="bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition-all"><Filter size={20}/></button>
                  </div>
               </div>

               <div className="divide-y divide-gray-50">
                  {feed.map((item) => (
                    <div key={item.id} className={`p-10 flex flex-col md:flex-row items-center justify-between gap-8 hover:bg-gray-50/80 transition-all cursor-pointer group/row ${item.status === 'ALERT' ? 'bg-red-50/40 border-l-[8px] border-l-red-600' : 'border-l-[8px] border-l-transparent'}`}>
                       <div className="flex items-center gap-8 flex-1">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner border border-gray-100 flex-shrink-0 group-hover/row:scale-110 transition-transform ${
                            item.type === 'INCIDENT' ? 'bg-red-50 text-red-600' : 
                            item.type === 'BOOKING' ? 'bg-teal-50 text-teal-600' :
                            item.type === 'PAYMENT' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                             {item.icon}
                          </div>
                          <div className="space-y-1">
                             <div className="flex items-center gap-3">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded tracking-tighter uppercase ${
                                  item.type === 'INCIDENT' ? 'bg-red-600 text-white' : 
                                  item.type === 'BOOKING' ? 'bg-teal-600 text-white' : 'bg-gray-900 text-white'
                                }`}>
                                   {item.type}
                                </span>
                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{item.time}</span>
                             </div>
                             <h4 className="font-black text-lg text-gray-900 group-hover/row:text-teal-600 transition-colors tracking-tight">{item.text}</h4>
                          </div>
                       </div>
                       <button 
                         onClick={() => navigate(item.type === 'INCIDENT' ? `/admin/incident/${item.id}` : '#')}
                         className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-300 hover:text-gray-900 transition-all"
                       >
                          <ChevronRight size={20} />
                       </button>
                    </div>
                  ))}
               </div>
               
               <button onClick={() => navigate('/admin/logs')} className="w-full py-8 bg-gray-50 text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] hover:bg-teal-50 hover:text-teal-700 transition-all border-t border-gray-100 flex items-center justify-center gap-3 active:bg-white group">
                  アクティビティログを全件表示 <Activity size={16} className="group-hover:rotate-180 transition-transform duration-700" />
               </button>
            </div>
         </div>
      </div>
      </div>
    </AdminLayout>
  );
};

const KPICard = ({ label, val, delta, color, icon, isAlert = false }: any) => (
  <div className={`bg-white p-8 rounded-[48px] border-2 shadow-sm transition-all hover:shadow-2xl hover:scale-[1.03] flex flex-col justify-between h-48 ${isAlert ? 'border-orange-100 bg-orange-50/20' : 'border-transparent'}`}>
     <div>
        <div className="flex justify-between items-start mb-4">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
           <div className={`p-2 rounded-lg bg-gray-50 ${color} shadow-inner`}>{icon}</div>
        </div>
        <h3 className={`text-4xl font-black ${color} tracking-tighter leading-none`}>{val}</h3>
     </div>
     <span className={`text-[10px] font-black px-3 py-1 rounded-full w-fit ${isAlert ? 'bg-orange-500 text-white animate-pulse' : 'text-green-600 bg-green-50'}`}>{delta}</span>
  </div>
);

const GovLink = ({ label, icon, count, color = "text-white", onClick }: any) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-[24px] transition-all group"
  >
     <div className="flex items-center gap-4">
        <span className={`${color} opacity-60 group-hover:opacity-100 transition-opacity group-hover:scale-110`}>{icon}</span>
        <span className={`text-xs font-black ${color} tracking-tight`}>{label}</span>
     </div>
     <div className="flex items-center gap-4">
        {count !== undefined && (
           <span className="text-[10px] font-black bg-teal-500 text-white px-2.5 py-1 rounded-lg shadow-lg">{count}</span>
        )}
        <ChevronRight size={14} className="text-white/20 group-hover:text-white transition-all group-hover:translate-x-1" />
     </div>
  </button>
);

const Shield = ({ size, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
  </svg>
);

export default AdminDashboard;
