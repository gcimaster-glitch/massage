
import React, { useState } from 'react';
import { JapaneseYen, Download, CheckCircle, Clock, Calendar, FileText, ChevronRight, Filter, TrendingUp, CreditCard } from 'lucide-react';
import { MOCK_STATEMENTS } from '../../constants';
import { PayoutStatus, Role } from '../../types';

const AffiliateEarnings: React.FC = () => {
  // アフィリエイト用データのフィルタリング
  const myStatements = MOCK_STATEMENTS.filter(s => s.userRole === Role.AFFILIATE);
  
  const [selectedMonth, setSelectedMonth] = useState('2025-05');

  const getStatusBadge = (status: PayoutStatus) => {
    switch(status) {
      case PayoutStatus.DRAFT: return <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black border border-amber-200">要承認</span>;
      case PayoutStatus.APPROVED_BY_PARTNER: return <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black border border-blue-200">承認済</span>;
      case PayoutStatus.FIXED: return <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-md">振込準備中</span>;
      case PayoutStatus.PAID: return <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-md">振込完了</span>;
      default: return <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-black">集計中</span>;
    }
  };

  const handleApprove = () => {
    if (confirm('明細内容を確認しましたか？承認後、支払サイクルに従って送金処理が行われます。')) {
      alert('明細を承認しました。');
    }
  };

  return (
    <div className="space-y-10 animate-fade-in text-gray-900 font-sans pb-32 px-4 pt-4">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
           <span className="inline-block bg-purple-50 text-purple-600 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.4em] mb-4 border border-purple-100 shadow-sm">パートナー収益</span>
           <h1 className="text-4xl font-black tracking-tighter">報酬明細・振込管理</h1>
           <p className="text-gray-400 font-bold uppercase tracking-[0.3em] mt-1 text-[10px]">Affiliate Revenue Ledger</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border-2 border-gray-100 text-gray-900 px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
              <Download size={14} /> 支払明細(PDF)
           </button>
           <button className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-teal-600 transition-all shadow-xl active:scale-95">
              <CreditCard size={14} /> 口座設定の変更
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><TrendingUp size={12}/> 今月の未払報酬</p>
            <h3 className="text-5xl font-black text-gray-900 tracking-tighter">¥45,000</h3>
            <p className="text-[9px] font-bold text-gray-400 mt-4 uppercase">Next Payout: 2025.06.10</p>
         </div>
         <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-2xl transition-all duration-500">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">総累計獲得報酬</p>
            <h3 className="text-5xl font-black text-teal-600 tracking-tighter">¥248,500</h3>
            <button className="text-[9px] font-black text-teal-600 mt-6 uppercase tracking-widest flex items-center gap-1 hover:underline">成果ログを全件表示 <ChevronRight size={10}/></button>
         </div>
         <div className="bg-indigo-900 p-10 rounded-[56px] shadow-2xl text-white relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><JapaneseYen size={80}/></div>
            <div className="relative z-10">
               <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">振込先口座</p>
               <p className="font-black text-lg">三菱UFJ銀行</p>
               <p className="font-bold opacity-60 text-sm">新宿中央支店 普通 1234567</p>
            </div>
            <p className="text-[9px] font-black uppercase text-teal-400 mt-6 tracking-[0.2em] border border-white/10 px-3 py-1 rounded-lg w-fit">Identity Verified</p>
         </div>
      </div>

      <div className="bg-white rounded-[56px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
           <h3 className="text-xl font-black flex items-center gap-4 text-gray-900">
              <FileText size={24} className="text-purple-600" /> 月次明細履歴
           </h3>
           <button className="p-4 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-gray-900 transition-all shadow-sm"><Filter size={20}/></button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
              <tr>
                <th className="p-8">対象年月</th>
                <th className="p-8">総対象売上額</th>
                <th className="p-8">報酬率</th>
                <th className="p-8 text-right">確定報酬額</th>
                <th className="p-8 text-center">状況</th>
                <th className="p-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-bold">
              {myStatements.map(stmt => (
                <tr key={stmt.id} className="hover:bg-gray-50/50 transition-all group">
                  <td className="p-8">
                     <p className="text-gray-900 font-black text-lg">{stmt.targetMonth}分</p>
                     <p className="text-[9px] text-gray-300 font-mono mt-1">ID: {stmt.id}</p>
                  </td>
                  <td className="p-8 text-gray-500 font-mono">¥{stmt.totalSales.toLocaleString()}</td>
                  <td className="p-8">
                     <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-[10px] font-black border border-purple-100">5.0%</span>
                  </td>
                  <td className="p-8 text-right">
                     <p className="text-2xl font-black text-gray-900 tracking-tighter font-mono">¥{stmt.payoutAmount.toLocaleString()}</p>
                  </td>
                  <td className="p-8 text-center">
                     {getStatusBadge(stmt.status)}
                  </td>
                  <td className="p-8 text-right">
                     {stmt.status === PayoutStatus.DRAFT ? (
                       <button onClick={handleApprove} className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-600 transition-all shadow-lg active:scale-95">承認する</button>
                     ) : (
                       <button className="bg-gray-100 p-3 rounded-2xl text-gray-300 group-hover:bg-white group-hover:text-teal-600 group-hover:shadow-md transition-all">
                          <ChevronRight size={20} />
                       </button>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AffiliateEarnings;
