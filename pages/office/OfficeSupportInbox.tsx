
import React, { useState } from 'react';
import { 
  MessageSquare, Clock, CheckCircle, AlertCircle, 
  Search, Filter, User, Calendar, ArrowRight, ShieldAlert 
} from 'lucide-react';

const OfficeSupportInbox: React.FC = () => {
  const [threads, setThreads] = useState([
    { id: 'sup-1', user: '鈴木 一郎', subject: 'セラピストの遅刻について', status: 'OPEN', date: '10分前', bookingId: 'b-102' },
    { id: 'sup-2', user: '佐藤 恵', subject: '忘れ物の確認をお願いします', status: 'IN_PROGRESS', date: '2時間前', bookingId: 'b-098' },
    { id: 'sup-3', user: '高橋 健', subject: '当日の道順について', status: 'RESOLVED', date: '昨日', bookingId: 'b-095' },
  ]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-black text-gray-900 tracking-tighter">サポート対応管理</h1>
           <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Managed User Inquiries</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-red-50 text-red-600 px-6 py-2 rounded-2xl font-black text-xs border border-red-100 shadow-sm flex items-center gap-2">
              <AlertCircle size={14} /> 未対応: 1件
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[48px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="名前・予約IDで検索..." className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-[20px] font-bold text-sm outline-none focus:ring-4 focus:ring-teal-500/10 transition-all" />
           </div>
           <button className="p-4 bg-white border border-gray-200 rounded-[20px] text-gray-400 hover:text-gray-900 transition-all"><Filter size={20}/></button>
        </div>

        <div className="divide-y divide-gray-50">
           {threads.map(t => (
             <div key={t.id} className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-gray-50 transition-all cursor-pointer group">
                <div className="flex items-center gap-6 flex-1">
                   <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 shadow-inner font-black">{t.user.charAt(0)}</div>
                   <div className="space-y-1">
                      <div className="flex items-center gap-3">
                         <h4 className="font-black text-lg text-gray-900 group-hover:text-teal-600 transition-colors">{t.subject}</h4>
                         <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                           t.status === 'OPEN' ? 'bg-red-100 text-red-600' : 
                           t.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
                         }`}>
                            {t.status}
                         </span>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                         <span className="flex items-center gap-1"><User size={12}/> {t.user}</span>
                         <span className="flex items-center gap-1"><Calendar size={12}/> {t.date}</span>
                         <span className="text-teal-600">Booking ID: {t.bookingId}</span>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="text-right hidden md:block">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Last Response</p>
                      <p className="text-xs font-bold text-gray-700">---</p>
                   </div>
                   <button className="bg-gray-900 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-teal-600 transition-all shadow-lg shadow-gray-200 group-hover:scale-105">
                      <ArrowRight size={20} />
                   </button>
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="bg-indigo-50 p-10 rounded-[48px] border border-indigo-100 flex items-start gap-8">
         <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-xl flex-shrink-0">
            <ShieldAlert size={32} />
         </div>
         <div className="space-y-2">
            <h3 className="text-xl font-black text-indigo-900 tracking-tight">重大なトラブルが発生した場合</h3>
            <p className="text-sm font-bold leading-relaxed text-indigo-700">
               セラピストの規約違反、重大なクレーム、または事故が疑われる場合は、オフィス側で判断せず、即座に**「運営本部へエスカレーション」**を行ってください。
               本部が弁護士、警察、保険会社と連携し、組織的な対応を開始します。
            </p>
         </div>
      </div>
    </div>
  );
};

export default OfficeSupportInbox;
