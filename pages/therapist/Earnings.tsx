
import React, { useState } from 'react';
import { JapaneseYen, Download, CheckCircle, Clock, Calendar, ArrowUpRight, FileText, ChevronRight, Filter } from 'lucide-react';
import { MOCK_STATEMENTS } from '../../constants';
import { PayoutStatus } from '../../types';

const TherapistEarnings: React.FC = () => {
  // ログイン中のセラピスト（t1）のデータ
  const myStatements = MOCK_STATEMENTS.filter(s => s.userId === 't1');
  const [selectedYear, setSelectedYear] = useState('2025');

  const getStatusBadge = (status: PayoutStatus) => {
    switch(status) {
      case PayoutStatus.DRAFT: return <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-black border border-amber-200">要確認</span>;
      case PayoutStatus.APPROVED_BY_PARTNER: return <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black border border-blue-200">承認済</span>;
      case PayoutStatus.FIXED: return <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-black border border-indigo-200">支払予約</span>;
      case PayoutStatus.PAID: return <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] font-black shadow-sm">振込完了</span>;
      default: return <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-black">集計中</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-gray-900 font-sans pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-4">
        <div>
           <h1 className="text-3xl font-black tracking-tighter">報酬・支払元帳</h1>
           <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Professional Financial Ledger</p>
        </div>
        <div className="flex gap-2">
           <select className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-black outline-none focus:ring-2 focus:ring-teal-500/20 shadow-sm">
              <option>2025年度</option>
              <option>2024年度</option>
           </select>
           <button className="bg-gray-900 text-white px-6 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg hover:bg-teal-600 transition-all">
              <Download size={14} /> 年間支払証明書(PDF)
           </button>
        </div>
      </div>

      {/* サマリー・メトリクス */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
         <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">未払報酬残高 (確定済)</p>
            <h3 className="text-3xl font-black text-gray-900">¥124,500</h3>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">当月受取予定</p>
            <h3 className="text-3xl font-black text-teal-600">¥45,800</h3>
         </div>
         <div className="bg-indigo-900 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><JapaneseYen size={64}/></div>
            <p className="text-[10px] font-black text-indigo-300 uppercase mb-1">次回振込予定日</p>
            <h3 className="text-3xl font-black">2025.06.10</h3>
         </div>
      </div>

      {/* 明細テーブル */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex justify-between items-center">
           <h3 className="text-sm font-black flex items-center gap-2 text-gray-700">
              <FileText size={16} /> 月次支払明細一覧
           </h3>
           <div className="flex gap-4">
              <button className="text-[10px] font-black text-gray-400 flex items-center gap-1 hover:text-gray-900"><Filter size={12}/> 絞り込み</button>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-8 py-4">対象年月</th>
                <th className="px-8 py-4">売上総額 (税込)</th>
                <th className="px-8 py-4">システム手数料</th>
                <th className="px-8 py-4">源泉徴収税</th>
                <th className="px-8 py-4 text-right">差引支払額</th>
                <th className="px-8 py-4 text-center">状況</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs font-bold">
              {myStatements.map(stmt => (
                <tr key={stmt.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6 text-gray-900 font-black">{stmt.targetMonth}分</td>
                  <td className="px-8 py-6 text-gray-400 font-mono">¥{stmt.totalSales.toLocaleString()}</td>
                  <td className="px-8 py-6 text-red-400 font-mono">- ¥{(stmt.totalSales * 0.35).toLocaleString()}</td>
                  <td className="px-8 py-6 text-gray-400 font-mono">▲ ¥1,234</td>
                  <td className="px-8 py-6 text-right">
                     <span className="text-lg font-black text-gray-900 font-mono">¥{stmt.payoutAmount.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                     {getStatusBadge(stmt.status)}
                  </td>
                  <td className="px-8 py-6 text-right">
                     <button className="bg-gray-100 p-2 rounded-lg text-gray-400 group-hover:bg-teal-600 group-hover:text-white transition-all">
                        <ChevronRight size={16} />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 補足事項 */}
      <div className="px-6 py-8 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
         <h4 className="text-xs font-black text-gray-900 mb-4 flex items-center gap-2"><Clock size={16} className="text-teal-600"/> 支払スケジュール・規定</h4>
         <div className="grid md:grid-cols-2 gap-8 text-[11px] text-gray-500 font-bold leading-relaxed">
            <div className="space-y-2">
               <p>・毎月月末締め、翌月10日払い（休日の場合は翌営業日）。</p>
               <p>・振込手数料は一律220円をセラピスト負担として差し引かせていただきます。</p>
            </div>
            <div className="space-y-2">
               <p>・「承認待ち」の明細は内容を確認後、速やかに「承認」ボタンを押下してください。</p>
               <p>・承認が完了しない場合、支払サイクルが翌月に繰り越される場合があります。</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default TherapistEarnings;
