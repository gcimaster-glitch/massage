import React, { useState } from 'react';
import { AlertTriangle, Plus, FileText, CheckCircle, Clock } from 'lucide-react';

const HostIncidents: React.FC = () => {
  // Mock incidents reported by host
  const [reports, setReports] = useState([
    { id: 'h-inc-1', date: '2025-05-15', type: '設備破損', status: 'RESOLVED', detail: 'ブース3の施術台の脚が不安定です。' },
    { id: 'h-inc-2', date: '2025-05-20', type: '清掃不備', status: 'OPEN', detail: '利用後のタオル回収ボックスが溢れています。' },
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("報告を送信しました。運営チームが確認します。");
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">インシデント報告</h1>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> 新しい報告
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-red-100">
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-500" /> 報告フォーム
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">カテゴリ</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none">
                <option>設備破損・故障</option>
                <option>清掃・衛生問題</option>
                <option>利用者トラブル（騒音等）</option>
                <option>無断利用</option>
                <option>その他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">詳細</label>
              <textarea 
                className="w-full p-3 border border-gray-300 rounded-lg h-24 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none" 
                placeholder="状況を詳しく記入してください..."
              ></textarea>
            </div>
            <div className="flex justify-end gap-3">
               <button 
                 type="button" 
                 onClick={() => setIsFormOpen(false)}
                 className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 rounded-lg transition-colors"
               >
                 キャンセル
               </button>
               <button 
                 type="submit" 
                 className="px-6 py-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
               >
                 送信
               </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
           <h2 className="font-bold text-gray-700">報告履歴</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {reports.map(report => (
            <div key={report.id} className="p-4 hover:bg-gray-50 bg-white">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                   <span className={`px-2 py-1 rounded text-xs font-bold ${
                     report.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                   }`}>
                     {report.status === 'RESOLVED' ? '解決済' : '対応中'}
                   </span>
                   <h3 className="font-bold text-gray-900">{report.type}</h3>
                </div>
                <span className="text-sm text-gray-500">{report.date}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{report.detail}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                 <span className="flex items-center gap-1">
                   <FileText size={12} /> ID: {report.id}
                 </span>
                 {report.status === 'RESOLVED' && (
                   <span className="flex items-center gap-1 text-green-600 font-medium">
                     <CheckCircle size={12} /> 運営対応完了
                   </span>
                 )}
                 {report.status === 'OPEN' && (
                   <span className="flex items-center gap-1 text-orange-500 font-medium">
                     <Clock size={12} /> 運営確認中
                   </span>
                 )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HostIncidents;