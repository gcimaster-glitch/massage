import React, { useState } from 'react';
import { MessageCircle, Mail, Send, AlertCircle, HelpCircle, Building2 } from 'lucide-react';
import SimpleLayout from '../../components/SimpleLayout';

interface Message {
  id: string;
  from: 'me' | 'office' | 'admin';
  sender_name: string;
  message: string;
  timestamp: string;
}

const TherapistSupport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'email' | 'chat'>('email');
  const [chatTarget, setChatTarget] = useState<'office' | 'admin'>('office');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  const [chatMessage, setChatMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      from: 'office',
      sender_name: '新宿ウェルネス・エージェンシー',
      message: 'こんにちは。何かご質問はありますか？',
      timestamp: '2026-01-23 10:00'
    },
    {
      id: '2',
      from: 'me',
      sender_name: 'あなた',
      message: '今月の報酬明細について確認したいです',
      timestamp: '2026-01-23 10:05'
    },
    {
      id: '3',
      from: 'office',
      sender_name: '新宿ウェルネス・エージェンシー',
      message: '承知しました。報酬明細は毎月25日に確定し、翌月5日に振り込まれます。',
      timestamp: '2026-01-23 10:10'
    }
  ]);

  const handleSendEmail = () => {
    if (!emailSubject || !emailBody) {
      alert('件名と本文を入力してください');
      return;
    }
    alert(`メールを送信しました\n件名: ${emailSubject}`);
    setEmailSubject('');
    setEmailBody('');
  };

  const handleSendChat = () => {
    if (!chatMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      from: 'me',
      sender_name: 'あなた',
      message: chatMessage,
      timestamp: new Date().toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setMessages(prev => [...prev, newMessage]);
    setChatMessage('');

    // デモ用の自動返信
    setTimeout(() => {
      const autoReply: Message = {
        id: (Date.now() + 1).toString(),
        from: chatTarget,
        sender_name: chatTarget === 'office' ? '新宿ウェルネス・エージェンシー' : 'HOGUSY 事務局',
        message: 'メッセージを受け取りました。担当者が確認次第、ご返信いたします。',
        timestamp: new Date().toLocaleString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      setMessages(prev => [...prev, autoReply]);
    }, 2000);
  };

  return (
    <SimpleLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle className="text-teal-600" />
            サポート
          </h1>
          <p className="text-sm text-gray-600 mt-1">問い合わせメール、チャット（オフィス、事務局）</p>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('email')}
                className={`flex-1 px-6 py-3 font-medium text-sm ${
                  activeTab === 'email'
                    ? 'border-b-2 border-teal-600 text-teal-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Mail size={20} />
                  問い合わせメール
                </div>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 px-6 py-3 font-medium text-sm ${
                  activeTab === 'chat'
                    ? 'border-b-2 border-teal-600 text-teal-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <MessageCircle size={20} />
                  チャット
                </div>
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* メールタブ */}
            {activeTab === 'email' && (
              <div>
                <div className="mb-6">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <AlertCircle className="text-blue-600 mt-0.5" size={20} />
                    <div className="flex-1">
                      <p className="text-sm text-blue-900 font-medium">メールでのお問い合わせ</p>
                      <p className="text-xs text-blue-700 mt-1">
                        通常1営業日以内にご返信いたします。緊急の場合はチャットをご利用ください。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      宛先
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option>HOGUSY 事務局</option>
                      <option>所属オフィス（新宿ウェルネス・エージェンシー）</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      カテゴリ
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                      <option>一般的な質問</option>
                      <option>報酬・支払いについて</option>
                      <option>予約・スケジュールについて</option>
                      <option>技術的な問題</option>
                      <option>アカウント設定</option>
                      <option>その他</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      件名 *
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="お問い合わせ内容を簡潔にご記入ください"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      本文 *
                    </label>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="詳細をご記入ください"
                      rows={8}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={handleSendEmail}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <Send size={20} />
                    送信
                  </button>
                </div>
              </div>
            )}

            {/* チャットタブ */}
            {activeTab === 'chat' && (
              <div>
                {/* チャット先選択 */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setChatTarget('office')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                        chatTarget === 'office'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Building2 size={20} />
                      オフィス
                    </button>
                    <button
                      onClick={() => setChatTarget('admin')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                        chatTarget === 'admin'
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <HelpCircle size={20} />
                      事務局
                    </button>
                  </div>
                </div>

                {/* チャットメッセージエリア */}
                <div className="border border-gray-200 rounded-lg">
                  <div className="h-96 overflow-y-auto p-4 space-y-4">
                    {messages
                      .filter(msg => 
                        msg.from === 'me' || 
                        (chatTarget === 'office' && msg.from === 'office') ||
                        (chatTarget === 'admin' && msg.from === 'admin')
                      )
                      .map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              msg.from === 'me'
                                ? 'bg-teal-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-xs font-medium mb-1 opacity-75">
                              {msg.sender_name}
                            </p>
                            <p className="text-sm">{msg.message}</p>
                            <p className="text-xs mt-1 opacity-75">
                              {msg.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="border-t border-gray-200 p-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                        placeholder="メッセージを入力..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleSendChat}
                        className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* よくある質問 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <HelpCircle className="text-teal-600" />
            よくある質問
          </h2>
          <div className="space-y-4">
            <details className="border border-gray-200 rounded-lg p-4">
              <summary className="font-medium text-gray-900 cursor-pointer">
                報酬の振込日はいつですか？
              </summary>
              <p className="mt-2 text-sm text-gray-600">
                報酬は毎月25日に確定し、翌月5日に振り込まれます。5日が土日祝日の場合は、前営業日となります。
              </p>
            </details>
            <details className="border border-gray-200 rounded-lg p-4">
              <summary className="font-medium text-gray-900 cursor-pointer">
                予約のキャンセルはどうすればいいですか？
              </summary>
              <p className="mt-2 text-sm text-gray-600">
                施術管理ページから該当の予約を選択し、キャンセルボタンを押してください。キャンセル理由の入力が必要です。
              </p>
            </details>
            <details className="border border-gray-200 rounded-lg p-4">
              <summary className="font-medium text-gray-900 cursor-pointer">
                プロフィール情報の変更方法は？
              </summary>
              <p className="mt-2 text-sm text-gray-600">
                個人設定 → プロフィールから編集できます。変更内容は審査が必要な場合があります。
              </p>
            </details>
            <details className="border border-gray-200 rounded-lg p-4">
              <summary className="font-medium text-gray-900 cursor-pointer">
                緊急時のSOSボタンはどこにありますか？
              </summary>
              <p className="mt-2 text-sm text-gray-600">
                安全管理ページ（/t/safety）に大きな赤いSOSボタンがあります。緊急時は迷わずに押してください。
              </p>
            </details>
          </div>
        </div>
      </div>
    </SimpleLayout>
  );
};

export default TherapistSupport;
