
import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, MapPin, Phone, MessageSquare, Clock, 
  AlertTriangle, Radio, Shield, Zap, History, Users, 
  Siren, ShieldCheck, Navigation, ArrowUpRight, Search,
  Activity, Video, Volume2, Maximize2, MoreHorizontal
} from 'lucide-react';
import { MOCK_THERAPISTS } from '../../constants';

const OfficeSafety: React.FC = () => {
  const [monitors, setMonitors] = useState([
    { id: 'm1', name: '田中 有紀', status: 'IN_SERVICE', location: '渋谷区道玄坂 2-1-1', type: 'CUBE', elapsed: '45/60', alert: false, score: 98 },
    { id: 'm2', name: '鈴木 絵美', status: 'IN_SERVICE', location: '港区六本木 6-10-1', type: 'MOBILE', elapsed: '75/60', alert: true, score: 42 },
    { id: 'm3', name: '伊藤 大輔', status: 'MOVING', location: '新宿区歌舞伎町', type: 'MOBILE', elapsed: 'ETA 12m', alert: false, score: 100 },
  ]);

  return (
    <div className="space-y-10 animate-fade-in text-gray-900 font-sans pb-32 px-4">
      <div className="flex flex-col lg:flex-row justify-between items-end gap-10">
        <div>
           <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border border-red-100 shadow-sm mb-6">
              <Radio size={14} className="animate-pulse" /> Sentinel Live Control
           </div>
           <h1 className="text-5xl font-black tracking-tighter">安全監視・司令センター</h1>
           <p className="text-gray-400 text-xs font-black uppercase tracking-[0.4em] mt-3 ml-1 text-xs">Live Operational Security Deck</p>
        </div>
        
        <div className="flex bg-gray-100 p-1.5 rounded-[32px] shadow-inner">
           <button className="px-8 py-4 bg-white text-gray-900 rounded-[24px] font-black text-[11px] uppercase tracking-widest shadow-xl scale-105">リアルタイム動態</button>
           <button className="px-8 py-4 text-gray-400 hover:text-gray-600 font-black text-[11px] uppercase tracking-widest">アラート履歴</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* Left: Live Dynamic Map Reconstruction (8) */}
        <div className="lg:col-span-8 space-y-10">
           <div className="bg-slate-900 rounded-[64px] h-[650px] relative overflow-hidden shadow-2xl border border-white/5 group">
              {/* Mock High-Contrast Dark Map */}
              <img src="https://picsum.photos/1200/800?grayscale&blur=3" className="w-full h-full object-cover opacity-20 contrast-125" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950 opacity-60"></div>
              
              {/* Animated Scanline Effect */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(20,184,166,0.1)_1px,transparent_1px)] bg-[length:100%_4px] animate-[shimmer_10s_linear_infinite]"></div>

              {/* Live Location Pings */}
              <MapMarker top="35%" left="25%" name="田中 有紀" type="CUBE" status="SAFE" />
              <MapMarker top="65%" left="75%" name="鈴木 絵美" type="MOBILE" status="CRITICAL" alert />
              <MapMarker top="50%" left="45%" name="伊藤 大輔" type="MOVING" status="SAFE" />

              {/* Map UI Overlays */}
              <div className="absolute top-10 left-10 space-y-4">
                 <div className="bg-black/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/10 shadow-2xl">
                    <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity size={14}/> System Pulse</p>
                    <div className="flex gap-1 items-end h-10">
                       {Array.from({ length: 15 }).map((_, i) => (
                          <div key={i} className="w-1 bg-teal-500/40 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="absolute bottom-10 right-10 flex flex-col gap-3">
                 <button className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"><Maximize2 size={24}/></button>
                 <button className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"><MapPin size={24}/></button>
              </div>
           </div>

           <div className="bg-white rounded-[48px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                 {/* Fix: Added Users to imports above to resolve error on this line */}
                 <h3 className="font-black text-lg flex items-center gap-3"><Users className="text-indigo-600" /> 稼働全スタッフ・ステータス</h3>
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input type="text" placeholder="名前を検索..." className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all" />
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                       <tr>
                          <th className="p-8">スタッフ</th>
                          <th className="p-8">状態 / 経過</th>
                          <th className="p-8">Trust Score</th>
                          <th className="p-8">現在地</th>
                          <th className="p-8 text-right"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {monitors.map(m => (
                         <tr key={m.id} className={`hover:bg-gray-50/80 transition-colors group ${m.alert ? 'bg-red-50/30' : ''}`}>
                            <td className="p-8">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-black text-gray-400 shadow-inner">{m.name.charAt(0)}</div>
                                  <div>
                                     <p className="font-black text-slate-900">{m.name}</p>
                                     <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">{m.type} Session</p>
                                  </div>
                               </div>
                            </td>
                            <td className="p-8">
                               <div className="space-y-1">
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${m.status === 'IN_SERVICE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{m.status}</span>
                                  <p className="text-xs font-mono font-bold text-slate-500">{m.elapsed}</p>
                               </div>
                            </td>
                            <td className="p-8">
                               <div className="flex items-center gap-3">
                                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-24">
                                     <div className={`h-full transition-all ${m.score < 50 ? 'bg-red-500' : 'bg-teal-500'}`} style={{ width: `${m.score}%` }}></div>
                                  </div>
                                  <span className="text-xs font-black text-teal-600">{m.score}%</span>
                               </div>
                            </td>
                            <td className="p-8">
                               <p className="text-xs font-bold text-slate-500 truncate max-w-[150px]">{m.location}</p>
                            </td>
                            <td className="p-8 text-right">
                               <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-indigo-600 hover:shadow-md transition-all"><MoreHorizontal size={18}/></button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* Right: Critical Incident Response (4) */}
        <div className="lg:col-span-4 space-y-8">
           <section className="bg-red-600 text-white p-10 rounded-[64px] shadow-[0_40px_80px_-20px_rgba(220,38,38,0.4)] space-y-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000"></div>
              <div className="relative z-10 flex items-center justify-between">
                 <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3"><Siren size={28} className="animate-bounce" /> Active SOS Alert</h3>
                 <span className="bg-white/20 px-3 py-1 rounded-lg text-[9px] font-black uppercase border border-white/20">Lv.3 High Risk</span>
              </div>

              <div className="relative z-10 space-y-6">
                 <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[48px] border border-white/10 shadow-inner">
                    <div className="flex items-center gap-4 mb-4">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 font-black text-xl shadow-2xl">鈴</div>
                       <div>
                          <p className="font-black text-lg">鈴木 絵美</p>
                          <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest">Mobile Session #b-104</p>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div className="flex items-center gap-3 text-xs font-bold">
                          <MapPin size={16} /> 港区六本木 6-10-1 ...
                       </div>
                       <div className="p-4 bg-black/40 rounded-2xl border border-white/5 animate-pulse">
                          <p className="text-[10px] font-black text-red-300 uppercase tracking-widest mb-2 flex items-center gap-2"><Volume2 size={12}/> AI Audio Semantic Alert</p>
                          <p className="text-xs font-bold leading-relaxed italic opacity-90">「不穏な大声と、物が倒れるような衝撃音を検知しました。緊急確認を推奨。」</p>
                       </div>
                    </div>
                 </div>

                 <div className="grid gap-3 pt-4">
                    <button className="w-full py-5 bg-white text-red-600 rounded-[32px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-red-50 transition-all active:scale-95">緊急直通架電 (Dispatch)</button>
                    <button className="w-full py-5 bg-red-950/30 border-2 border-white/20 text-white rounded-[32px] font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">ALSOK警備員 急行要請</button>
                 </div>
              </div>
           </section>

           <section className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 space-y-8">
              <div className="flex items-center justify-between">
                 <h3 className="text-lg font-black text-gray-900 flex items-center gap-3 tracking-tight"><ShieldCheck className="text-teal-600" /> セキュリティ設定</h3>
                 <button className="p-3 text-gray-300 hover:text-teal-600 transition-all"><Maximize2 size={18}/></button>
              </div>
              <div className="space-y-3">
                 <SecurityToggle label="AI Sentinel 常時監視" checked={true} />
                 <SecurityToggle label="GPS リアルタイムトラッキング" checked={true} />
                 <SecurityToggle label="SOS 発報時 警察自動連携" checked={false} />
                 <SecurityToggle label="セッション録音データの保存" checked={true} />
              </div>
              <p className="text-[10px] text-gray-400 font-bold leading-relaxed text-center italic">
                 ※ 各種プライバシー設定は本部ガバナンスに従います
              </p>
           </section>
        </div>
      </div>
    </div>
  );
};

const MapMarker = ({ top, left, name, type, status, alert }: any) => (
  <div className="absolute transition-all duration-1000" style={{ top, left }}>
     <div className="relative group/pin flex flex-col items-center">
        <div className={`absolute -top-14 bg-black/90 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-xl border border-white/10 shadow-2xl scale-0 group-hover/pin:scale-100 transition-all origin-bottom z-20 whitespace-nowrap`}>
           {name} ({type})<br/>
           <span className={alert ? 'text-red-400' : 'text-teal-400'}>Trust Score: {alert ? 'Critical' : 'Safe'}</span>
        </div>
        <div className={`w-12 h-12 rounded-3xl border-4 border-white shadow-2xl flex items-center justify-center transition-all ${alert ? 'bg-red-600 animate-ping' : 'bg-teal-500'}`}>
           <Navigation size={24} className={`text-white transition-transform ${alert ? 'rotate-0' : 'rotate-45'}`} />
        </div>
        {alert && <div className="absolute top-0 left-0 w-12 h-12 rounded-3xl bg-red-600 border-4 border-white shadow-2xl flex items-center justify-center animate-pulse"><AlertTriangle size={24} className="text-white"/></div>}
     </div>
  </div>
);

const SecurityToggle = ({ label, checked }: { label: string, checked: boolean }) => (
  <div className="flex items-center justify-between p-5 bg-gray-50 rounded-[32px] border border-transparent hover:border-gray-100 transition-all group">
     <span className="text-xs font-black text-gray-700 group-hover:text-slate-900 transition-colors">{label}</span>
     <div className={`w-12 h-6 rounded-full p-1 transition-all ${checked ? 'bg-teal-600' : 'bg-gray-200'}`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
     </div>
  </div>
);

export default OfficeSafety;
