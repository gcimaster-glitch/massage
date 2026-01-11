
import React, { useState } from 'react';
import { 
  Search, CheckCircle, XCircle, JapaneseYen, Clock, 
  AlertTriangle, ArrowRight, UserCheck, ShieldAlert, Sparkles, Filter, MoreVertical, BadgeCheck, Plus
} from 'lucide-react';
import { MASTER_COURSES, MASTER_OPTIONS } from '../../constants';

const AdminPricingApprovals: React.FC = () => {
  const [requests, setRequests] = useState([
    { 
      id: 'req-101', 
      requester: '新宿ウェルネス・エージェンシー', 
      therapistName: '田中 有紀', 
      date: '2025/05/21 14:05',
      changes: {
        courses: [
          { masterId: 'mc_15', name: '無重力ストレッチ', price: 11000, type: 'NEW' },
          { masterId: 'mc_17', name: 'デジタルデトックス・ヘッド', price: 9500, type: 'NEW' },
          { masterId: 'mc_1', name: '深層筋ボディケア', price: 7800, type: 'PRICE_UPDATE' },
        ],
        options: [
          { masterId: 'mo_24', name: 'プレミアムCBDバーム', price: 3000, type: 'NEW' },
          { masterId: 'mo_39', name: 'サイレント・セッション指定', price: 0, type: 'NEW' }
        ]
      }
    },
    { 
      id: 'req-102', 
      requester: '佐藤 健二 (個人)', 
      therapistName: '佐藤 健二', 
      date: '2025/05/21 15:30',
      changes: {
        courses: [{ masterId: 'mc_22', name: '快眠導入プレミアム', price: 9500, type: 'NEW' }],
        options: [{ masterId: 'mo_25', name: '高濃度酸素吸入', price: 1500, type: 'NEW' }]
      }
    }
  ]);

  const handleApprove = (id: string) => {
    setRequests(requests.filter(r => r.id !== id));
    alert('申請された構成を承認しました。ユーザーの予約画面に即時反映されます。');
  };

  return (
    <div className="space-y-10 animate-fade-in text-gray-900 font-sans pb-20">
      <div className="flex justify-between items-end px-4">
        <div>
           <h1 className="text-4xl font-black tracking-tighter text-gray-900">メニュー・価格審査センター</h1>
           <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-2">メニュー品質・価格ガバナンス</p>
        </div>
        <div className="bg-teal-50 text-teal-600 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border border-teal-100 flex items-center gap-2">
           <BadgeCheck size={14} /> AI 整合性スコア: 正常
        </div>
      </div>

      <div className="grid gap-12 px-4">
        {requests.length === 0 ? (
          <div className="bg-white p-32 text-center rounded-[64px] border-4 border-dashed border-gray-100">
             <CheckCircle size={80} className="mx-auto text-gray-100 mb-8" />
             <h3 className="text-2xl font-black text-gray-300 uppercase tracking-widest">審査待ちの申請はありません</h3>
          </div>
        ) : (
          requests.map(req => (
            <div key={req.id} className="bg-white rounded-[64px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-gray-50 overflow-hidden group hover:shadow-2xl transition-all duration-700">
               <div className="p-10 md:p-12 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-gray-50/50">
                  <div className="flex items-center gap-8">
                     <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center font-black text-3xl shadow-2xl text-teal-600 border-4 border-teal-50">
                        {req.therapistName.charAt(0)}
                     </div>
                     <div>
                        <h2 className="text-3xl font-black tracking-tighter text-gray-900">{req.therapistName} <span className="text-sm font-bold text-gray-300 ml-4">ID: {req.id}</span></h2>
                        <p className="text-sm font-bold text-teal-600 flex items-center gap-2 mt-2 bg-white px-4 py-1.5 rounded-full border border-teal-100 w-fit">申請元: {req.requester}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">申請日時</p>
                     <p className="text-base font-black text-gray-900">{req.date}</p>
                  </div>
               </div>

               <div className="p-12 md:p-16 grid md:grid-cols-2 gap-20">
                  <div className="space-y-10">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center"><Sparkles size={24}/></div>
                        <h3 className="text-xl font-black uppercase tracking-widest text-gray-900">コースの追加・価格改定</h3>
                     </div>
                     <div className="space-y-4">
                        {req.changes.courses.map(c => (
                          <div key={c.masterId} className="bg-gray-50 p-8 rounded-[40px] border-2 border-transparent hover:border-teal-500/20 transition-all flex items-center justify-between group/item">
                             <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                   <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${c.type === 'NEW' ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white'}`}>
                                      {c.type === 'NEW' ? '新規追加' : '価格改定'}
                                   </span>
                                   <span className="font-black text-gray-700 text-lg">{c.name}</span>
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold">マスターID: {c.masterId}</p>
                             </div>
                             <p className="font-black text-3xl text-gray-900 tracking-tighter">¥{c.price.toLocaleString()}</p>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-10">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Plus size={24}/></div>
                        <h3 className="text-xl font-black uppercase tracking-widest text-gray-900">オプション申請</h3>
                     </div>
                     <div className="space-y-4">
                        {req.changes.options.length > 0 ? req.changes.options.map(o => (
                          <div key={o.masterId} className="bg-indigo-50/30 p-8 rounded-[40px] border-2 border-transparent hover:border-indigo-500/20 transition-all flex items-center justify-between group/item">
                             <span className="font-black text-lg text-gray-700">{o.name}</span>
                             <p className="font-black text-2xl text-gray-900 tracking-tighter">¥{o.price.toLocaleString()}</p>
                          </div>
                        )) : <div className="p-20 text-center text-gray-300 font-bold italic border-2 border-dashed border-gray-100 rounded-[40px]">追加・変更なし</div>}
                     </div>
                  </div>
               </div>

               <div className="p-12 bg-gray-900 flex flex-col md:flex-row gap-8 justify-end items-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,rgba(20,184,166,0.1),transparent_50%)]"></div>
                  <div className="mr-auto hidden md:block">
                     <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest mb-2 flex items-center gap-2"><ShieldAlert size={14}/> 本部コンプライアンス確認</p>
                     <p className="text-xs text-gray-500 font-bold leading-relaxed max-w-md">承認ボタンの押下により、本メニューおよび価格が本番環境へ公開されることに同意したとみなされます。</p>
                  </div>
                  <button className="w-full md:w-auto px-12 py-6 rounded-[32px] border-2 border-white/10 text-gray-400 font-black text-sm hover:bg-white/5 transition-all uppercase tracking-widest">
                     却下して差戻し
                  </button>
                  <button 
                    onClick={() => handleApprove(req.id)}
                    className="w-full md:w-auto bg-teal-600 text-white px-20 py-7 rounded-[32px] font-black text-xl shadow-[0_20px_50px_rgba(20,184,166,0.3)] hover:bg-teal-500 transition-all active:scale-95 group relative overflow-hidden"
                  >
                     <span className="relative z-10 flex items-center gap-3"><CheckCircle size={24} /> 構成を承認・一般公開</span>
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </button>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPricingApprovals;
