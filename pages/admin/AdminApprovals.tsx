
import React, { useState } from 'react';
/* Added MapPin to the import list to fix the missing component error */
import { ShieldCheck, XCircle, CheckCircle, Search, Eye, FileText, Filter, ArrowRight, User, UserCheck, Building2, Smartphone, MapPin } from 'lucide-react';
import { Role } from '../../types';

const AdminApprovals: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'KYC' | 'PARTNER'>('KYC');

  // Mock Data for KYC
  const [kycRequests, setKycRequests] = useState([
    { id: 'kyc-1', userId: 'u-102', userName: '佐藤 太郎', type: '身分証（免許証）', image: 'https://picsum.photos/400/250?grayscale', date: '2025/05/21 14:20', score: 94 },
    { id: 'kyc-2', userId: 'u-105', userName: '鈴木 花子', type: 'パスポート', image: 'https://picsum.photos/400/250?sepia', date: '2025/05/21 15:05', score: 88 },
  ]);

  // Mock Data for Partners (Therapists/Hosts)
  const [partnerRequests, setPartnerRequests] = useState([
    { id: 'p-1', name: '渡辺 健', role: Role.THERAPIST, area: '新宿', date: '2025/05/20', docs: ['免許証', '鍼灸師免許'], note: '実技審査合格済み' },
    { id: 'p-2', name: 'ホテル・サフィニア', role: Role.HOST, area: '渋谷', date: '2025/05/19', docs: ['営業許可証'], note: 'ブース設置工事中' },
  ]);

  const handleApprove = (id: string, list: 'KYC' | 'PARTNER') => {
    if (confirm(`承認してよろしいですか？ユーザーに通知が送信されます。`)) {
      if (list === 'KYC') setKycRequests(prev => prev.filter(r => r.id !== id));
      else setPartnerRequests(prev => prev.filter(r => r.id !== id));
      alert(`承認しました。`);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-black text-gray-900 tracking-tighter">グローバル承認キュー</h1>
           <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Identity & Partner Review Hub</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-gray-100 rounded-3xl">
           <button 
             onClick={() => setActiveTab('KYC')}
             className={`px-8 py-3 rounded-[22px] text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'KYC' ? 'bg-white text-teal-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
           >
              <UserCheck size={16} /> 本人確認 ({kycRequests.length})
           </button>
           <button 
             onClick={() => setActiveTab('PARTNER')}
             className={`px-8 py-3 rounded-[22px] text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'PARTNER' ? 'bg-white text-indigo-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
           >
              <Smartphone size={16} /> パートナー申請 ({partnerRequests.length})
           </button>
        </div>
      </div>

      <div className="grid gap-6">
        {activeTab === 'KYC' ? (
          kycRequests.length === 0 ? (
            <div className="bg-white p-32 text-center rounded-[56px] border border-dashed border-gray-200">
               <CheckCircle size={64} className="mx-auto text-gray-100 mb-6" />
               <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">No Pending KYC Items</h3>
            </div>
          ) : (
            kycRequests.map(req => (
              <div key={req.id} className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-10">
                 <div className="w-full lg:w-80 h-48 bg-gray-100 rounded-[32px] overflow-hidden relative group border border-gray-100 shadow-inner">
                    <img src={req.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="ID" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button className="bg-white p-4 rounded-full text-gray-900 shadow-2xl"><Eye size={24} /></button>
                    </div>
                 </div>
                 
                 <div className="flex-1 space-y-6">
                    <div className="flex justify-between items-start">
                       <div>
                          <h4 className="text-2xl font-black text-gray-900">{req.userName}</h4>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Global Account ID: {req.userId}</p>
                       </div>
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                          Submitted: {req.date}
                       </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Document Source</p>
                          <p className="text-sm font-bold text-gray-700 flex items-center gap-2"><FileText size={16} className="text-gray-300" /> {req.type}</p>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">AI Vision Trust Score</p>
                          <div className="flex items-center gap-3">
                             <div className="h-2.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]" style={{width: `${req.score}%`}}></div>
                             </div>
                             <span className="text-xs font-black text-teal-600">{req.score}%</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="w-full lg:w-56 flex flex-row lg:flex-col gap-3">
                    <button 
                      onClick={() => handleApprove(req.id, 'KYC')}
                      className="flex-1 bg-teal-600 text-white py-5 rounded-3xl font-black text-sm hover:bg-teal-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-teal-500/10"
                    >
                       <CheckCircle size={20} /> 承認
                    </button>
                    <button 
                      className="flex-1 bg-white border-2 border-red-100 text-red-500 py-5 rounded-3xl font-black text-sm hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-3"
                    >
                       <XCircle size={20} /> 否認
                    </button>
                 </div>
              </div>
            ))
          )
        ) : (
          partnerRequests.map(req => (
            <div key={req.id} className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-10">
               <div className="w-full lg:w-32 flex flex-col items-center justify-center bg-gray-50 rounded-[40px] border border-gray-100 py-8 gap-4">
                  {req.role === Role.THERAPIST ? <User size={40} className="text-indigo-600" /> : <Building2 size={40} className="text-orange-600" />}
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${req.role === Role.THERAPIST ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                     {req.role}
                  </span>
               </div>

               <div className="flex-1 space-y-6">
                  <div className="flex justify-between items-start">
                     <div>
                        <h4 className="text-2xl font-black text-gray-900">{req.name}</h4>
                        <p className="text-xs font-bold text-gray-500 flex items-center gap-1"><MapPin size={12}/> {req.area} エリア展開希望</p>
                     </div>
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{req.date} 登録</span>
                  </div>

                  <div className="space-y-3">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">提出済み資格・書類</p>
                     <div className="flex flex-wrap gap-2">
                        {req.docs.map(doc => (
                          <span key={doc} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-2xl text-[11px] font-bold border border-gray-200 flex items-center gap-2">
                             <FileText size={14} className="text-gray-400" /> {doc}
                          </span>
                        ))}
                     </div>
                  </div>
                  
                  <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100">
                     <p className="text-[11px] text-teal-800 font-bold italic leading-relaxed">
                        <span className="font-black uppercase mr-2">Admin Note:</span> {req.note}
                     </p>
                  </div>
               </div>

               <div className="w-full lg:w-56 flex flex-row lg:flex-col gap-3 justify-center">
                  <button 
                    onClick={() => handleApprove(req.id, 'PARTNER')}
                    className="flex-1 bg-gray-900 text-white py-5 rounded-3xl font-black text-sm hover:bg-teal-600 transition-all flex items-center justify-center gap-3 shadow-xl"
                  >
                     <ShieldCheck size={20} /> 審査通過・本登録
                  </button>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminApprovals;
