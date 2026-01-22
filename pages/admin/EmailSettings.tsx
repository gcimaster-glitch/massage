
import React, { useState } from 'react';
import { Mail, Send, Save, Code, Eye, RefreshCw } from 'lucide-react';

const AdminEmailSettings: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('booking_confirmed');
  const [subject, setSubject] = useState('【Soothe】ご予約が確定しました');
  const [body, setBody] = useState(`{{user_name}} 様

HOGUSYをご利用いただきありがとうございます。
以下の予約が確定いたしました。

■予約内容
日時: {{booking_date}} {{booking_time}}
場所: {{location_name}}
担当: {{therapist_name}}

当日は開始5分前までに現地へお越しください。
`);

  const handleTestSend = () => {
    alert('テストメールを送信しました（宛先: 運営管理者アドレス）');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">メール配信・テンプレート設定</h1>
        <div className="flex gap-2">
           <button onClick={handleTestSend} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-50">
             <Send size={16} /> テスト送信
           </button>
           <button className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-teal-600">
             <Save size={16} /> 保存
           </button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Left: Template List */}
        <div className="md:col-span-1 space-y-2">
           <h3 className="text-xs font-bold text-gray-500 uppercase px-2 mb-3">システム通知一覧</h3>
           {[
             { id: 'welcome', label: '新規会員登録完了' },
             { id: 'booking_confirmed', label: '予約確定通知' },
             { id: 'booking_reminder', label: '前日リマインダー' },
             { id: 'safety_sos', label: 'SOS発報通知 (管理用)' },
             { id: 'payout_ready', label: '報酬明細発行' },
           ].map(t => (
             <button
               key={t.id}
               onClick={() => setSelectedTemplate(t.id)}
               className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                 selectedTemplate === t.id ? 'bg-teal-50 text-teal-700 border border-teal-100 shadow-sm' : 'text-gray-600 hover:bg-white hover:shadow-sm'
               }`}
             >
               {t.label}
             </button>
           ))}
        </div>

        {/* Right: Editor */}
        <div className="md:col-span-3 space-y-6">
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
             <div className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-gray-500 mb-1">件名 (Subject)</label>
                   <input 
                     type="text" 
                     value={subject} 
                     onChange={e => setSubject(e.target.value)}
                     className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500" 
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 mb-1">利用可能変数</label>
                   <div className="flex flex-wrap gap-2">
                      {['user_name', 'booking_date', 'booking_time', 'location_name', 'therapist_name'].map(v => (
                        <code key={v} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                          {`{{${v}}}`}
                        </code>
                      ))}
                   </div>
                </div>
                <div className="flex border border-gray-200 rounded-lg overflow-hidden h-[400px]">
                   <div className="w-1/2 flex flex-col">
                      <div className="bg-gray-50 p-2 border-b border-gray-200 text-xs font-bold flex items-center gap-1">
                        <Code size={12} /> エディタ (HTML可)
                      </div>
                      <textarea 
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        className="flex-1 p-4 text-sm font-mono outline-none resize-none"
                      />
                   </div>
                   <div className="w-1/2 flex flex-col bg-slate-50 border-l border-gray-200">
                      <div className="bg-gray-50 p-2 border-b border-gray-200 text-xs font-bold flex items-center gap-1">
                        <Eye size={12} /> プレビュー
                      </div>
                      <div className="flex-1 p-6 bg-white m-4 rounded shadow-sm overflow-auto text-sm text-gray-800 whitespace-pre-wrap">
                        {body.replace(/\{\{user_name\}\}/g, '山田 花子')
                             .replace(/\{\{booking_date\}\}/g, '2025-05-25')
                             .replace(/\{\{booking_time\}\}/g, '14:00')
                             .replace(/\{\{location_name\}\}/g, 'CARE CUBE 渋谷')
                             .replace(/\{\{therapist_name\}\}/g, '田中 有紀')}
                      </div>
                   </div>
                </div>
             </div>
           </div>

           <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
              <RefreshCw className="text-blue-600 mt-1 flex-shrink-0" size={18} />
              <div className="text-xs text-blue-800 space-y-1">
                 <p className="font-bold">Resend サービス連携中</p>
                 <p>保存すると、即座にライブ配信システムに反映されます。配信エラーはログ画面で確認可能です。</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmailSettings;
