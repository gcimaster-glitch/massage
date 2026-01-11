
import React, { useState, useMemo } from 'react';
import { MOCK_STATEMENTS } from '../../constants';
import { PayoutStatus, MonthlyStatement, Role } from '../../types';
import { 
  FileText, Send, CheckCircle, JapaneseYen, RefreshCw, 
  AlertCircle, Calendar, ChevronRight, Download, BarChart3, 
  CheckSquare, Landmark, ShieldCheck, ArrowRightLeft, CreditCard
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

const AdminPayouts: React.FC = () => {
  const monthOptions = useMemo(() => {
    const today = new Date();
    const options = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      options.push({
        iso,
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        label: `${d.getFullYear()}年 ${d.getMonth() + 1}月`
      });
    }
    return options;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].iso);
  const [statements, setStatements] = useState<MonthlyStatement[]>(MOCK_STATEMENTS);

  const filteredStatements = statements.filter(s => s.targetMonth === selectedMonth);

  const handleCalculate = () => {
    if (confirm(`${selectedMonth}の売上集計をバッチ実行しますか？`)) {
       alert('精算バッチをキューに登録しました。完了後、各パートナーへ通知されます。');
    }
  };

  const handleBulkPayout = () => {
    if (confirm('承認済みの全パートナーに対して、振込確定（支払予約）を実行しますか？\n実行後、銀行送金用の全銀フォーマットCSVを出力できます。')) {
       alert('振込予約を完了しました。');
    }
  };

  return (
    <div className="space-y-12 pb-40 text-gray-900 font-sans animate-fade-in px-4">
      <div className="flex flex-col md:flex-row justify-between items-end gap-10">
        <div>
           <span className="inline-block bg-teal-50 text-teal-600 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.4em] mb-6 border border-teal-100 shadow-sm">財務ガバナンス</span>
           <h1 className="text-5xl font-black tracking-tighter">精算・送金管理</h1>
           <p className="text-gray-400 font-bold uppercase tracking-[0.3em] mt-2 text-xs">Settlement Cycle & Global Ledger</p>
        </div>
        <div className="flex gap-4">
           <button onClick={handleBulkPayout} className="bg-teal-600 text-white px-10 py-5 rounded-3xl font-black text-sm flex items-center gap-3 shadow-2xl hover:bg-teal-700 transition-all active:scale-95">
              <Landmark size={20} /> 承認済みを一括支払予約
           </button>
           <button onClick={handleCalculate} className="bg-gray-900 text-white px-10 py-5 rounded-3xl font-black text-sm flex items-center gap-3 hover:bg-gray-800 transition-all shadow-2xl active:scale-95">
              <RefreshCw size={20} /> 集計バッチ実行
           </button>
        </div>
      </div>

      <section className="bg-white p-12 rounded-[64px] shadow-sm border border-gray-100">
         <div className="flex justify-between items-center mb-10 px-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em] flex items-center gap-3">
               <Calendar size={18} className="text-teal-600" /> 対象月の選択
            </h3>
         </div>
         <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x -mx-4 px-4">
            {monthOptions.map(m => (
              <button
                key={m.iso}
                onClick={() => setSelectedMonth(m.iso)}
                className={`
                  min-w-[160px] flex-shrink-0 py-8 px-6 rounded-[40px] transition-all duration-500 border-2 flex flex-col items-center gap-4 snap-center
                  ${selectedMonth === m.iso 
                    ? 'bg-gray-900 border-gray-900 text-white shadow-2xl scale-110 -translate-y-2' 
                    : 'bg-white border-gray-50 text-gray-900 hover:border-teal-200 hover:bg-teal-50/20'
                  }
                `}
              >
                 <p className={`text-[10px] font-black uppercase tracking-widest ${selectedMonth === m.iso ? 'text-teal-400' : 'text-gray-300'}`}>{m.year}年</p>
                 <p className="text-3xl font-black tracking-tighter">{m.month}月</p>
                 <div className={`w-2 h-2 rounded-full ${selectedMonth === m.iso ? 'bg-teal-500 animate-pulse' : 'bg-gray-100'}`}></div>
              </button>
            ))}
         </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">受託決済総額</p>
            <h3 className="text-3xl font-black text-gray-900">¥14.2M</h3>
         </div>
         <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">未承認パートナー</p>
            <h3 className="text-3xl font-black text-orange-600">12<span className="text-xs ml-1 opacity-40">名</span></h3>
         </div>
         <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">支払予約済み</p>
            <h3 className="text-3xl font-black text-indigo-600">¥8.5M</h3>
         </div>
         <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">源泉税預り金</p>
            <h3 className="text-3xl font-black text-gray-900">¥845,000</h3>
         </div>
      </div>

      <div className="bg-white rounded-[64px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
           <div className="flex items-center gap-6">
              <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                 <FileText className="text-teal-600" /> パートナー別精算一覧
              </h3>
              <div className="flex gap-2">
                 <span className="bg-white px-3 py-1 rounded-full text-[9px] font-black border border-gray-200 text-gray-400 uppercase tracking-widest">全 {filteredStatements.length} 件</span>
              </div>
           </div>
           <div className="flex gap-3">
              <button className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
                 <CreditCard size={14}/> 全銀CSV出力
              </button>
              <button className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
                 <Download size={14}/> 振込依頼書 (FB)
              </button>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                <tr>
                   <th className="p-8"><CheckSquare size={16} className="text-gray-200" /></th>
                   <th className="p-8">パートナー</th>
                   <th className="p-8 text-right">売上総額</th>
                   <th className="p-8 text-right">差引額 (Net)</th>
                   <th className="p-8">振込先口座</th>
                   <th className="p-8 text-center">状況</th>
                   <th className="p-8 text-right"></th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-50 font-bold">
                {filteredStatements.map((stmt) => (
                   <tr key={stmt.id} className="hover:bg-gray-50/80 transition-all group cursor-pointer">
                      <td className="p-8"><CheckSquare size={16} className="text-teal-500" /></td>
                      <td className="p-8">
                         <p className="font-black text-gray-900 text-lg leading-none mb-1">{stmt.userName}</p>
                         <p className="text-[10px] text-gray-400 uppercase font-black">{stmt.userRole}</p>
                      </td>
                      <td className="p-8 text-right text-gray-400 font-mono text-sm">¥{stmt.totalSales.toLocaleString()}</td>
                      <td className="p-8 text-right">
                         <p className="text-2xl font-black text-gray-900 tracking-tighter font-mono">¥{stmt.payoutAmount.toLocaleString()}</p>
                      </td>
                      <td className="p-8">
                         <p className="text-[10px] text-gray-500 font-black">三菱UFJ / 普通</p>
                         <p className="text-[11px] text-gray-400 font-mono">***1234</p>
                      </td>
                      <td className="p-8 text-center">
                         <StatusBadge status={stmt.status as any} />
                      </td>
                      <td className="p-8 text-right">
                         <div className="bg-gray-50 w-12 h-12 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-teal-600 group-hover:text-white transition-all">
                            <ChevronRight size={20} />
                         </div>
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

export default AdminPayouts;
