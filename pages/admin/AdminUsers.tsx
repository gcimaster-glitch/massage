
import React, { useState } from 'react';
import { 
  Search, CheckCircle, XCircle, JapaneseYen, Clock, 
  AlertTriangle, ArrowRight, UserCheck, ShieldAlert 
} from 'lucide-react';

/**
 * Renamed to AdminPricingApprovals to fix collision with AdminUsers (User Management)
 */
const AdminPricingApprovals: React.FC = () => {
  const [requests, setRequests] = useState([
    { id: 'req-1', name: '田中 有紀', current60: 7000, proposed60: 8500, current30: 3000, proposed30: 4000, date: '2025/05/21 10:00' },
    { id: 'req-2', name: '佐藤 健二', current60: 6000, proposed60: 6000, current30: 2000, proposed30: 3000, date: '2025/05/21 11:30' },
  ]);

  const handleApprove = (id: string) => {
    setRequests(requests.filter(r => r.id !== id));
    alert('価格改定を承認しました。システムへ即時反映されます。');
  };

  const handleReject = (id: string) => {
     const reason = prompt('却下理由を入力してください（セラピストに通知されます）');
     if (reason) {
        setRequests(requests.filter(r => r.id !== id));
        alert('申請を却下しました。');
     }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end px-2">
         <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">価格設定承認キュー</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest mt-2 text-xs">Therapist Pricing Approvals</p>
         </div>
         <div className="bg-red-50 text-red-600 px-6 py-2 rounded-2xl font-black text-xs flex items-center gap-2 border border-red-100 shadow-sm">
            <ShieldAlert size={14} /> 未処理: {requests.length}件
         </div>
      </div>

      <div className="grid gap-6">
        {requests.length === 0 ? (
          <div className="bg-white p-24 text-center text-gray-300 rounded-[48px] border border-dashed border-gray-200">
             <UserCheck size={48} className="mx-auto mb-4 opacity-20" />
             <p className="font-black text-lg">現在、承認待ちの価格申請はありません。</p>
          </div>
        ) : (
          requests.map(req => (
            <div key={req.id} className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col lg:flex-row justify-between items-center gap-10">
               <div className="flex-1 w-full">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-14 h-14 bg-teal-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-teal-600/20">{req.name.charAt(0)}</div>
                     <div>
                        <h4 className="text-xl font-black text-gray-900">{req.name}</h4>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Requested at: {req.date}</p>
                     </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                     <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-3 ml-1">60分単価の変更</p>
                        <div className="flex items-center gap-4">
                           <span className="text-sm font-bold text-gray-400 line-through">¥{req.current60.toLocaleString()}</span>
                           <ArrowRight className="text-teal-600" size={18} />
                           <span className="text-2xl font-black text-gray-900">¥{req.proposed60.toLocaleString()}</span>
                        </div>
                     </div>
                     <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-3 ml-1">延長30分単価の変更</p>
                        <div className="flex items-center gap-4">
                           <span className="text-sm font-bold text-gray-400 line-through">¥{req.current30.toLocaleString()}</span>
                           <ArrowRight className="text-teal-600" size={18} />
                           <span className="text-2xl font-black text-gray-900">¥{req.proposed30.toLocaleString()}</span>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-48">
                  <button 
                    onClick={() => handleApprove(req.id)}
                    className="flex-1 bg-teal-600 text-white py-4 rounded-[24px] font-black text-sm hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-teal-600/10"
                  >
                    <CheckCircle size={18} /> 承認
                  </button>
                  <button 
                    onClick={() => handleReject(req.id)}
                    className="flex-1 bg-white border-2 border-gray-100 text-gray-400 py-4 rounded-[24px] font-black text-sm hover:border-red-100 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} /> 否認
                  </button>
               </div>
            </div>
          ))
        )}
      </div>
      
      <div className="bg-indigo-900 rounded-[48px] p-10 text-white flex items-center justify-between overflow-hidden relative">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2"></div>
         <div className="relative z-10 space-y-2">
            <h3 className="text-xl font-black">価格設定の自動監視</h3>
            <p className="text-indigo-200 text-sm font-medium">不当に高額または低額な価格設定はAIがフラグを立てます。</p>
         </div>
         <button className="relative z-10 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/20 transition-all">
            監査ログを開く
         </button>
      </div>
    </div>
  );
};

export default AdminPricingApprovals;
