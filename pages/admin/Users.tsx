import React, { useState } from 'react';
import { Search, MoreVertical, CheckCircle, XCircle, Shield, FileText } from 'lucide-react';
import { MOCK_THERAPISTS } from '../../constants';

const AdminUsers: React.FC = () => {
  // Mock applicants
  const [applicants, setApplicants] = useState([
    { id: 'app-1', name: '山田 太郎', type: 'LICENSED', status: 'PENDING', submittedAt: '2025-05-20' },
    { id: 'app-2', name: '鈴木 美咲', type: 'RELAXATION', status: 'PENDING', submittedAt: '2025-05-19' },
    { id: 'app-3', name: '田中 有紀', type: 'LICENSED', status: 'APPROVED', submittedAt: '2025-04-10' },
  ]);

  const handleReview = (id: string, action: 'APPROVE' | 'REJECT') => {
    if (confirm(`${action === 'APPROVE' ? '承認' : '否認'}しますか？`)) {
      setApplicants(applicants.map(a => 
        a.id === id ? { ...a, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : a
      ));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">ユーザー管理 / セラピスト審査</h1>
        <div className="relative">
          <input 
            type="text" 
            placeholder="名前やIDで検索" 
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white text-gray-900 placeholder-gray-400" 
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex gap-4">
          <button className="text-sm font-bold text-teal-700 border-b-2 border-teal-600 pb-1">審査待ち (2)</button>
          <button className="text-sm font-bold text-gray-500 hover:text-gray-800 pb-1">全ユーザー</button>
          <button className="text-sm font-bold text-gray-500 hover:text-gray-800 pb-1">停止中</button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead className="bg-white text-gray-500 text-xs uppercase border-b border-gray-100">
            <tr>
              <th className="p-4 font-bold">氏名 / ID</th>
              <th className="p-4 font-bold">区分</th>
              <th className="p-4 font-bold">申請日</th>
              <th className="p-4 font-bold">提出書類</th>
              <th className="p-4 font-bold">ステータス</th>
              <th className="p-4 font-bold text-center">アクション</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {applicants.map((app, index) => (
              <tr key={app.id} className={`hover:bg-teal-50/50 transition-colors ${index % 2 === 1 ? 'bg-slate-50' : 'bg-white'}`}>
                <td className="p-4">
                  <p className="font-bold text-gray-900">{app.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{app.id}</p>
                </td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded font-bold ${app.type === 'LICENSED' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                    {app.type === 'LICENSED' ? '国家資格' : 'リラクゼーション'}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {app.submittedAt}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="text-xs bg-white border border-gray-300 px-2 py-1 rounded flex items-center gap-1 hover:bg-teal-50 hover:text-teal-700 text-gray-600 font-medium transition-colors">
                      <FileText size={12} /> 身分証
                    </button>
                    {app.type === 'LICENSED' && (
                      <button className="text-xs bg-white border border-gray-300 px-2 py-1 rounded flex items-center gap-1 hover:bg-teal-50 hover:text-teal-700 text-gray-600 font-medium transition-colors">
                        <AwardIcon /> 資格証
                      </button>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    app.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {app.status === 'APPROVED' ? '承認済' : app.status === 'REJECTED' ? '否認' : '審査待ち'}
                  </span>
                </td>
                <td className="p-4 text-center">
                  {app.status === 'PENDING' && (
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => handleReview(app.id, 'APPROVE')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors" 
                        title="承認"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button 
                        onClick={() => handleReview(app.id, 'REJECT')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" 
                        title="否認"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  )}
                  {app.status === 'APPROVED' && (
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical size={20} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AwardIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7"></circle>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
  </svg>
);

export default AdminUsers;