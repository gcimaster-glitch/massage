import React, { useState } from 'react';
import { JapaneseYen, Download, CheckCircle, Clock } from 'lucide-react';
import { MOCK_STATEMENTS } from '../../constants';
import { PayoutStatus, Role } from '../../types';

const HostEarnings: React.FC = () => {
  // Filter for the current logged in host (h1 for demo)
  const myStatements = MOCK_STATEMENTS.filter(s => s.userRole === Role.HOST);
  // Demo: Select the draft statement if exists
  const currentMonthStatement = myStatements.find(s => s.targetMonth === '2025-05');
  
  // Local state to simulate approval
  const [localStatement, setLocalStatement] = useState(currentMonthStatement);

  const handleApprove = () => {
    if (confirm('明細内容を確認し、承認しますか？\n承認後、管理者が支払確定処理を行います。')) {
      if (localStatement) {
        setLocalStatement({ ...localStatement, status: PayoutStatus.APPROVED_BY_PARTNER });
        alert('明細を承認しました。');
      }
    }
  };

  const getStatusDisplay = (status: PayoutStatus) => {
      switch(status) {
          case PayoutStatus.DRAFT: return { color: 'text-orange-600', text: '承認待ち', icon: <Clock size={16} /> };
          case PayoutStatus.APPROVED_BY_PARTNER: return { color: 'text-blue-600', text: '承認済・確定待ち', icon: <CheckCircle size={16} /> };
          case PayoutStatus.FIXED: return { color: 'text-purple-600', text: '支払確定', icon: <CheckCircle size={16} /> };
          case PayoutStatus.PAID: return { color: 'text-green-600', text: '振込完了', icon: <JapaneseYen size={16} /> };
          default: return { color: 'text-gray-400', text: '集計中', icon: <Clock size={16} /> };
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">売上管理・明細 (施設)</h1>
      </div>

      {/* Action Card for Current Month */}
      {localStatement ? (
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
           <div className="flex justify-between items-start">
              <div>
                 <h2 className="font-bold text-lg text-gray-900 mb-1">{localStatement.targetMonth}月度 施設利用報酬</h2>
                 <p className="text-sm text-gray-500 mb-4">ステータス: <span className={`font-bold ${getStatusDisplay(localStatement.status).color}`}>{getStatusDisplay(localStatement.status).text}</span></p>
                 <div className="text-3xl font-bold text-gray-900">¥{localStatement.payoutAmount.toLocaleString()}</div>
                 <p className="text-xs text-gray-500 mt-1">（対象売上: ¥{localStatement.totalSales.toLocaleString()}）</p>
              </div>
              <div className="flex flex-col gap-2">
                 {localStatement.status === PayoutStatus.DRAFT && (
                    <button 
                      onClick={handleApprove}
                      className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 shadow-sm flex items-center gap-2 animate-pulse"
                    >
                       <CheckCircle size={18} /> 明細を承認する
                    </button>
                 )}
                 <button className="text-orange-600 font-bold text-sm border border-orange-600 px-4 py-2 rounded-lg hover:bg-teal-50 flex items-center gap-2 justify-center">
                    <Download size={16} /> PDFダウンロード
                 </button>
              </div>
           </div>
           
           {/* Mini Breakdown */}
           <div className="mt-6 pt-4 border-t border-gray-100">
               <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">内訳プレビュー</h3>
               <div className="space-y-2">
                  {localStatement.details.slice(0, 3).map((d, i) => (
                      <div key={i} className="flex justify-between text-sm">
                         <span className="text-gray-600">{d.date} {d.description}</span>
                         <span className="font-mono">¥{d.amount.toLocaleString()}</span>
                      </div>
                  ))}
                  {localStatement.details.length > 3 && <div className="text-xs text-gray-400 text-center">他 {localStatement.details.length - 3} 件</div>}
               </div>
           </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
          現在、確認が必要な新しい明細はありません。
        </div>
      )}

      {/* Past Statements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-700">過去の明細履歴</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {myStatements.filter(s => s.targetMonth !== '2025-05').length > 0 ? (
            myStatements.filter(s => s.targetMonth !== '2025-05').map((stmt) => (
              <div key={stmt.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                 <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-3 rounded-lg text-gray-600 font-bold">
                       {stmt.targetMonth.split('-')[1]}月
                    </div>
                    <div>
                       <p className="font-bold text-gray-900">¥{stmt.payoutAmount.toLocaleString()}</p>
                       <p className="text-xs text-gray-500">ID: {stmt.id}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className={`flex items-center gap-1 text-sm font-bold ${getStatusDisplay(stmt.status).color}`}>
                       {getStatusDisplay(stmt.status).icon} {getStatusDisplay(stmt.status).text}
                    </div>
                    <button className="text-xs text-teal-600 hover:underline mt-1">詳細を見る</button>
                 </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400">
              過去の履歴はありません。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostEarnings;
