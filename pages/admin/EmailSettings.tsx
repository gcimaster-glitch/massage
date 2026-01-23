
import React, { useState } from 'react';
import { Mail, Send, Save, Code, Eye, RefreshCw, FileSignature } from 'lucide-react';
import SimpleLayout from '../../components/SimpleLayout';

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

  const [signature, setSignature] = useState(`──────────────────
HOGUSY カスタマーサポート
メール: support@hogusy.com
電話: 0120-XXX-XXX
営業時間: 平日 10:00-18:00
公式サイト: https://hogusy.com
──────────────────`);

  const handleTestSend = () => {
    if (selectedTemplate === 'signature') {
      alert('署名のテスト送信は行えません。テンプレートを選択してください。');
    } else {
      alert('テストメールを送信しました（宛先: 運営管理者アドレス）\n\n※メール本文の末尾に署名が自動追加されます。');
    }
  };

  const handleSave = () => {
    if (selectedTemplate === 'signature') {
      alert('署名を保存しました。\n\n今後、すべてのメールテンプレートの末尾に自動的に追加されます。');
    } else {
      alert('テンプレートを保存しました。\n\n※メール本文の末尾に署名が自動追加されます。');
    }
  };

  return (
    <SimpleLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">メール配信・テンプレート設定</h1>
        <div className="flex gap-2">
           <button onClick={handleTestSend} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-50">
             <Send size={16} /> テスト送信
           </button>
           <button onClick={handleSave} className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-teal-600">
             <Save size={16} /> 保存
           </button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Left: Template List */}
        <div className="md:col-span-1 space-y-2">
           <h3 className="text-xs font-bold text-gray-500 uppercase px-2 mb-3">システム通知一覧</h3>
           {[
             { id: 'welcome', label: '新規会員登録完了', icon: Mail },
             { id: 'booking_confirmed', label: '予約確定通知', icon: Mail },
             { id: 'booking_reminder', label: '前日リマインダー', icon: Mail },
             { id: 'safety_sos', label: 'SOS発報通知 (管理用)', icon: Mail },
             { id: 'payout_ready', label: '報酬明細発行', icon: Mail },
           ].map(t => (
             <button
               key={t.id}
               onClick={() => setSelectedTemplate(t.id)}
               className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                 selectedTemplate === t.id ? 'bg-teal-50 text-teal-700 border border-teal-100 shadow-sm' : 'text-gray-600 hover:bg-white hover:shadow-sm'
               }`}
             >
               <t.icon size={16} />
               {t.label}
             </button>
           ))}
           
           <div className="pt-4 mt-4 border-t border-gray-200">
             <h3 className="text-xs font-bold text-gray-500 uppercase px-2 mb-3">共通設定</h3>
             <button
               onClick={() => setSelectedTemplate('signature')}
               className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                 selectedTemplate === 'signature' ? 'bg-purple-50 text-purple-700 border border-purple-100 shadow-sm' : 'text-gray-600 hover:bg-white hover:shadow-sm'
               }`}
             >
               <FileSignature size={16} />
               メール署名設定
             </button>
           </div>
        </div>

        {/* Right: Editor */}
        <div className="md:col-span-3 space-y-6">
           {selectedTemplate === 'signature' ? (
             /* 署名設定画面 */
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
               <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <FileSignature className="text-purple-600" size={24} />
                    <h2 className="text-xl font-bold text-gray-900">メール署名設定</h2>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-800 font-bold mb-2">📝 署名について</p>
                    <p className="text-xs text-purple-700">
                      ここで設定した署名は、すべてのメールテンプレートの末尾に自動的に追加されます。
                      会社情報、連絡先、営業時間などを記載してください。
                    </p>
                  </div>

                  <div className="flex border border-gray-200 rounded-lg overflow-hidden h-[500px]">
                     <div className="w-1/2 flex flex-col">
                        <div className="bg-gray-50 p-2 border-b border-gray-200 text-xs font-bold flex items-center gap-1">
                          <Code size={12} /> 署名エディタ
                        </div>
                        <textarea 
                          value={signature}
                          onChange={e => setSignature(e.target.value)}
                          className="flex-1 p-4 text-sm font-mono outline-none resize-none"
                          placeholder="署名を入力してください..."
                        />
                     </div>
                     <div className="w-1/2 flex flex-col bg-slate-50 border-l border-gray-200">
                        <div className="bg-gray-50 p-2 border-b border-gray-200 text-xs font-bold flex items-center gap-1">
                          <Eye size={12} /> プレビュー
                        </div>
                        <div className="flex-1 p-6 bg-white m-4 rounded shadow-sm overflow-auto">
                          <div className="text-sm text-gray-800 whitespace-pre-wrap mb-6">
                            {`山田 花子 様

HOGUSYをご利用いただきありがとうございます。
以下の予約が確定いたしました。

■予約内容
日時: 2025-05-25 14:00
場所: CARE CUBE 渋谷
担当: 田中 有紀

当日は開始5分前までに現地へお越しください。

`}
                          </div>
                          <div className="text-sm text-gray-600 whitespace-pre-wrap border-t border-gray-200 pt-4">
                            {signature}
                          </div>
                        </div>
                     </div>
                  </div>
               </div>
             </div>
           ) : (
             /* テンプレート編集画面 */
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
                      <div className="flex-1 p-6 bg-white m-4 rounded shadow-sm overflow-auto">
                        <div className="text-sm text-gray-800 whitespace-pre-wrap mb-6">
                          {body.replace(/\{\{user_name\}\}/g, '山田 花子')
                               .replace(/\{\{booking_date\}\}/g, '2025-05-25')
                               .replace(/\{\{booking_time\}\}/g, '14:00')
                               .replace(/\{\{location_name\}\}/g, 'CARE CUBE 渋谷')
                               .replace(/\{\{therapist_name\}\}/g, '田中 有紀')}
                        </div>
                        <div className="text-sm text-gray-600 whitespace-pre-wrap border-t border-gray-200 pt-4">
                          {signature}
                        </div>
                      </div>
                   </div>
                </div>
             </div>
           </div>
           )}

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
      </div>
    </SimpleLayout>
  );
};

export default AdminEmailSettings;
