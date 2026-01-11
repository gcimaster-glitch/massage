
import React, { useState, useEffect } from 'react';
import { 
  MapPin, ArrowRight, JapaneseYen, Clock, Zap, Home, Building2, 
  ChevronRight, ShieldAlert, Timer, CheckCircle, FileText, 
  UserCheck, Info, Upload, Award, Camera, ShieldCheck 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import { systemStore } from '../../services/systemState';
import { BookingStatus, Role } from '../../types';

const TherapistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(() => JSON.parse(localStorage.getItem('currentUser') || '{}'));
  const [bookings, setBookings] = useState(systemStore.getBookings());

  // KYCステータスの簡易管理
  const [kycStatus, setKycStatus] = useState<'NONE' | 'PENDING' | 'VERIFIED'>(currentUser.kycStatus || 'NONE');

  const handleKycSubmit = (data: any) => {
    setKycStatus('PENDING');
    systemStore.submitKYC(currentUser.displayName, data);
    // 実際にはAPIで更新
    const updated = { ...currentUser, kycStatus: 'PENDING' };
    localStorage.setItem('currentUser', JSON.stringify(updated));
  };

  // 審査中の画面
  if (kycStatus !== 'VERIFIED') {
    return <TherapistKYCFlow status={kycStatus} onSubmit={handleKycSubmit} />;
  }

  return (
    <div className="space-y-10 animate-fade-in pb-20 text-gray-900 font-sans">
      <div className="flex justify-between items-end px-4">
        <div>
           <h1 className="text-4xl font-black text-gray-900 tracking-tighter">セラピスト・コンソール</h1>
           <p className="text-gray-400 text-xs font-black uppercase tracking-[0.4em] mt-2">Elite Performance Board</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
           <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
           <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Online / Ready to Match</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
         <StatItem label="当月の報酬額" val="¥142,500" icon={<JapaneseYen/>} color="text-teal-600" />
         <StatItem label="予約リクエスト" val={bookings.filter(b => b.status === BookingStatus.CONFIRMED).length} icon={<Clock/>} color="text-indigo-600" />
         <StatItem label="安全スコア" val="98%" icon={<ShieldCheck/>} color="text-teal-600" />
      </div>

      {/* 予約リスト連動 */}
      <div className="pt-10 px-4 space-y-8">
         <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tighter">直近のスケジュール</h2>
            <button className="text-xs font-black text-teal-600 hover:underline">カレンダーで詳細を見る</button>
         </div>
         <div className="bg-white rounded-[56px] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
            {bookings.length > 0 ? bookings.map(b => (
              <div key={b.id} className="p-10 flex flex-col md:flex-row items-center justify-between gap-8 hover:bg-gray-50 transition-all cursor-pointer group" onClick={() => navigate(`/app/booking/${b.id}`)}>
                 <div className="flex items-center gap-8 flex-1">
                    <div className="w-16 h-16 rounded-[24px] bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white transition-all shadow-inner">
                       {b.type === 'MOBILE' ? <Home size={32}/> : <Building2 size={32}/>}
                    </div>
                    <div className="space-y-1">
                       <div className="flex items-center gap-3">
                          <h4 className="font-black text-xl text-gray-900">{b.serviceName}</h4>
                          <StatusBadge status={b.status} />
                       </div>
                       <div className="flex items-center gap-5 text-sm font-bold text-gray-400">
                          <span className="flex items-center gap-2"><Clock size={16}/> {new Date(b.scheduledStart).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} 〜</span>
                          <span className="flex items-center gap-2"><MapPin size={16}/> {b.location}</span>
                       </div>
                    </div>
                 </div>
                 <button className="bg-gray-900 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-teal-600 transition-all">
                    <ArrowRight size={24} />
                 </button>
              </div>
            )) : (
              <div className="p-20 text-center text-gray-400 font-bold italic">
                 現在、確定済みの予約はありません
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, val, icon, color }: any) => (
  <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-xl transition-all h-48">
     <div className={`w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shadow-inner ${color}`}>
        {icon}
     </div>
     <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{val}</h3>
     </div>
  </div>
);

const TherapistKYCFlow = ({ status, onSubmit }: { status: string, onSubmit: (d: any) => void }) => {
  const [photo, setPhoto] = useState<string | null>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-12 py-20 px-4 text-gray-900 animate-fade-in">
       <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[32px] flex items-center justify-center mx-auto shadow-inner border border-indigo-100">
             {status === 'PENDING' ? <Timer size={48} className="animate-spin" /> : <Award size={48} />}
          </div>
          <h1 className="text-4xl font-black tracking-tighter">
             {status === 'PENDING' ? '現在審査中（1〜2営業日）' : '本人確認（KYC）が必要です'}
          </h1>
          <p className="text-gray-500 font-bold leading-relaxed max-w-md mx-auto">
             {status === 'PENDING' ? '事務局にて書類の真正性を確認しております。今しばらくお待ちください。' : '安全なサービスを提供するため、全セラピストに公的身分証および資格証の提出をお願いしております。'}
          </p>
       </div>

       {status === 'NONE' && (
         <div className="bg-white p-12 rounded-[64px] shadow-2xl border border-gray-100 space-y-10">
            <div className="grid md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">保有資格種別</label>
                  <select className="w-full p-5 bg-gray-50 border-0 rounded-[28px] font-bold outline-none shadow-inner">
                     <option>あん摩マッサージ指圧師</option>
                     <option>柔道整復師</option>
                     <option>認定セラピスト</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">業界経験年数</label>
                  <input type="number" placeholder="例: 10" className="w-full p-5 bg-gray-50 border-0 rounded-[28px] font-bold outline-none shadow-inner" />
               </div>
            </div>

            <div className="space-y-4">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">証明写真のアップロード</label>
               <div 
                 onClick={() => setPhoto('https://picsum.photos/400/300')}
                 className={`aspect-video rounded-[40px] border-4 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${photo ? 'border-teal-500 bg-teal-50' : 'border-gray-200 bg-gray-50 hover:bg-teal-50 hover:border-indigo-300'}`}
               >
                  {photo ? <img src={photo} className="w-full h-full object-cover" /> : <div className="text-center text-gray-300 space-y-2"><Camera size={40}/><p className="text-[10px] font-black uppercase">Click to Select File</p></div>}
               </div>
            </div>

            <button onClick={() => onSubmit({})} className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black text-xl hover:bg-indigo-700 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4">
               <ShieldCheck size={28} /> 審査申請を送信する
            </button>
         </div>
       )}
    </div>
  );
};

export default TherapistDashboard;
