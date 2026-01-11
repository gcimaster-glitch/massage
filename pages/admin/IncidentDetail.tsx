
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShieldAlert, MapPin, Radio, MessageSquare, 
  Phone, Siren, FileText, CheckCircle, Navigation, 
  Clock, AlertTriangle, Download, Gavel, Users, Zap
} from 'lucide-react';
import { MOCK_INCIDENTS, MOCK_BOOKINGS } from '../../constants';

const AdminIncidentDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const incident = MOCK_INCIDENTS.find(i => i.id === id) || MOCK_INCIDENTS[0];
  const booking = MOCK_BOOKINGS.find(b => b.id === incident.bookingId);

  return (
    <div className="space-y-8 animate-fade-in text-gray-900 font-sans pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-4">
           <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-gray-900 transition-all">
              <ArrowLeft size={16} /> Back to Sentinel
           </button>
           <div className="flex items-center gap-4">
              <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest animate-pulse shadow-lg">Critical Emergency</span>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Case Registry: {incident.id}</h1>
           </div>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border-2 border-gray-100 p-4 rounded-2xl hover:bg-gray-50 shadow-sm"><Download size={20}/></button>
           <button className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 shadow-xl active:scale-95 flex items-center gap-3">
              <Siren size={18} /> 緊急配備要請 (Dispatch)
           </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 px-4">
        
        {/* Left Column: Forensic Data (8) */}
        <div className="lg:col-span-8 space-y-10">
           {/* GPS Path Reconstruction */}
           <section className="bg-white rounded-[56px] h-[500px] relative overflow-hidden shadow-sm border border-gray-100">
              <img src="https://picsum.photos/1200/800?grayscale&blur=2" className="w-full h-full object-cover opacity-20" />
              <div className="absolute inset-0 p-10 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div className="bg-white/90 backdrop-blur-md p-6 rounded-[32px] border border-gray-100 shadow-2xl max-w-sm">
                       <p className="text-[10px] font-black text-red-600 uppercase mb-3 flex items-center gap-2"><Navigation size={14}/> SOS 発信座標</p>
                       <p className="font-black text-gray-900 text-lg leading-tight">{booking?.location}</p>
                       <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">Lat: 35.6586, Lng: 139.7454</p>
                    </div>
                 </div>
                 {/* Mock Path Overlay (SVG) */}
                 <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <path d="M 200 400 L 250 380 L 320 350 L 400 320 L 450 420" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="8 4" className="animate-[shimmer_2s_linear_infinite]" />
                    <circle cx="450" cy="420" r="10" fill="#ef4444" className="animate-ping" />
                    <circle cx="450" cy="420" r="6" fill="#ef4444" />
                 </svg>
                 <div className="flex justify-end gap-2">
                    <button className="bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">ストリートビュー確認</button>
                 </div>
              </div>
           </section>

           {/* Sentinel AI Transcript Audit */}
           <section className="bg-white p-12 rounded-[56px] border border-gray-100 shadow-sm space-y-10">
              <div className="flex justify-between items-center">
                 <h3 className="text-xl font-black flex items-center gap-3"><Radio className="text-red-500" /> AIセンチネル・解析ログ</h3>
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sentiment Analysis Enabled</span>
              </div>
              <div className="space-y-6">
                 <TranscriptItem time="14:12:05" user="SYSTEM" text="高頻度位置情報の取得を開始。エリア外離脱アラートは正常。" />
                 <TranscriptItem time="14:15:22" user="AI MONITOR" text="音声セマンティック分析: ユーザーの発言に威圧的なキーワードを検知（フラグ付与）。" severity="MEDIUM" />
                 <TranscriptItem time="14:15:45" user="USER" text="SOSボタンが手動で作動されました。即座にバックグラウンド録音を開始。" severity="HIGH" />
                 <TranscriptItem time="14:16:02" user="SECURITY" text="警備会社(ALSOK)へ暗号化データパケットを自動送信。確認中。" />
              </div>
           </section>
        </div>

        {/* Right Column: Case Management (4) */}
        <div className="lg:col-span-4 space-y-8">
           <section className="bg-gray-900 text-white p-10 rounded-[56px] shadow-2xl space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 rounded-full blur-[80px] opacity-20"></div>
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Participant Profiles</h3>
              <div className="space-y-6">
                 <UserBrief label="Therapist" name={booking?.therapistName || "---"} kyc="VERIFIED" />
                 <UserBrief label="User / Client" name="山田 太郎" kyc="VERIFIED" risk="LEVEL 3" />
              </div>
           </section>

           <section className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
              <h3 className="text-lg font-black flex items-center gap-2"><Gavel size={20} className="text-indigo-600" /> ガバナンス・アクション</h3>
              <div className="space-y-3">
                 <ActionButton icon={<ShieldAlert size={16}/>} label="ユーザーアカウントを永久凍結" color="text-red-600 bg-red-50" />
                 <ActionButton icon={<FileText size={16}/>} label="証跡データパッケージ(ZIP)作成" />
                 <ActionButton icon={<Users size={16}/>} label="法務・弁護士チームへ共有" />
              </div>
              <div className="pt-6 border-t border-gray-100">
                 <button className="w-full py-5 bg-gray-900 text-white rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-teal-600 transition-all shadow-xl active:scale-95">
                    解決済みとしてクローズ
                 </button>
              </div>
           </section>

           <div className="p-8 bg-indigo-50 rounded-[40px] border border-indigo-100">
              <p className="text-[10px] text-indigo-700 font-bold leading-relaxed">
                 ※ このインシデントに関する全データ（音声、位置情報、チャット）は、日本の法律に基づき、裁判所の命令なしに第三者へ開示されることはありません。
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

const TranscriptItem = ({ time, user, text, severity }: any) => (
  <div className={`p-6 rounded-[32px] border-2 transition-all flex gap-4 ${
    severity === 'HIGH' ? 'bg-red-50 border-red-200' : 
    severity === 'MEDIUM' ? 'bg-orange-50 border-orange-100' : 
    'bg-gray-50 border-transparent'
  }`}>
     <span className="text-[10px] font-mono text-gray-400 mt-1">{time}</span>
     <div className="space-y-1">
        <p className={`text-[10px] font-black uppercase tracking-tighter ${severity === 'HIGH' ? 'text-red-600' : 'text-gray-400'}`}>{user}</p>
        <p className="text-sm font-bold text-gray-800 leading-relaxed">{text}</p>
     </div>
  </div>
);

const UserBrief = ({ label, name, kyc, risk }: any) => (
  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
     <div>
        <p className="text-[9px] font-black text-gray-500 uppercase mb-1">{label}</p>
        <p className="font-black text-base">{name}</p>
     </div>
     <div className="text-right">
        <span className="text-[9px] font-black bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded uppercase">{kyc}</span>
        {risk && <p className="text-[9px] font-black text-red-500 uppercase mt-1">Risk: {risk}</p>}
     </div>
  </div>
);

const ActionButton = ({ icon, label, color = "text-gray-700 bg-gray-50" }: any) => (
  <button className={`w-full p-4 rounded-2xl font-black text-xs flex items-center gap-3 hover:shadow-md transition-all ${color}`}>
     {icon} {label}
  </button>
);

export default AdminIncidentDetail;
