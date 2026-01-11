
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, HelpCircle, AlertCircle, FileText, 
  ChevronRight, ArrowLeft, Zap, Heart, ShieldQuestion, 
  CreditCard, UserX, Loader2, Sparkles, Send, CheckCircle2, History
} from 'lucide-react';
import { api } from '../../services/api';
import { SupportCategory } from '../../types';

const SupportCenter: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'HOME' | 'CHAT' | 'HISTORY'>('HOME');
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [threads, setThreads] = useState<any[]>([]);

  const subjects = [
    { id: SupportCategory.BOOKING_ISSUE, label: '施術・セラピストに関するトラブル', icon: <UserX />, target: 'OFFICE', desc: '事務所（オフィス）が一次対応します' },
    { id: SupportCategory.PAYMENT, label: '決済・返金について', icon: <CreditCard />, target: 'ADMIN', desc: '本部事務局が対応します' },
    { id: SupportCategory.SYSTEM, label: 'システムの不具合・使い方', icon: <Zap />, target: 'AI', desc: 'AIコンシェルジュが即答・案内します' },
    { id: SupportCategory.PARTNER_INQUIRY, label: 'その他・パートナー加盟について', icon: <ShieldQuestion />, target: 'ADMIN', desc: '本部窓口へ連絡' },
  ];

  const handleStartInquiry = async (subj: any) => {
    setSelectedSubject(subj);
    setView('CHAT');
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 font-sans text-gray-900">
      <div className="py-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => view !== 'HOME' ? setView('HOME') : navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all">
            <ArrowLeft size={24} />
          </button>
          <div>
             <h1 className="text-3xl font-black tracking-tighter">サポートセンター</h1>
             <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Soothe Trust & Help</p>
          </div>
        </div>
        
        {view === 'HOME' && (
          <button onClick={() => setView('HISTORY')} className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-2xl text-xs font-black transition-all">
            <History size={16} /> 問い合わせ履歴
          </button>
        )}
      </div>

      {view === 'HOME' && (
        <div className="space-y-10 animate-fade-in">
           {/* FAQ / Bot Highlight */}
           <div className="bg-gray-900 text-white p-10 rounded-[56px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                 <div className="space-y-4">
                    <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center shadow-lg"><Sparkles size={24} /></div>
                    <h2 className="text-3xl font-black tracking-tight">AIコンシェルジュが<br/>24時間即答します</h2>
                    <p className="text-gray-400 font-bold text-sm">使い方の質問などは、AIが解決の手引きを行います。</p>
                 </div>
                 <button onClick={() => handleStartInquiry(subjects[2])} className="bg-white text-gray-900 px-10 py-5 rounded-3xl font-black text-lg hover:bg-teal-400 transition-all shadow-xl active:scale-95">
                    チャットを開始
                 </button>
              </div>
           </div>

           <div className="space-y-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-6">お問い合わせ内容の選択</h3>
              <div className="grid gap-4">
                 {subjects.map(s => (
                   <button 
                     key={s.id}
                     onClick={() => handleStartInquiry(s)}
                     className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:border-teal-500 transition-all"
                   >
                      <div className="flex items-center gap-8">
                         <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-all shadow-inner">
                            {s.icon}
                         </div>
                         <div className="text-left">
                            <p className="font-black text-xl text-gray-900 group-hover:text-teal-600 transition-colors">{s.label}</p>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{s.desc}</p>
                         </div>
                      </div>
                      <ChevronRight size={24} className="text-gray-200 group-hover:translate-x-2 group-hover:text-teal-500 transition-all" />
                   </button>
                 ))}
              </div>
           </div>
        </div>
      )}

      {view === 'CHAT' && selectedSubject && (
        <SupportChatUI 
          subject={selectedSubject.label} 
          category={selectedSubject.id} 
          onClose={() => setView('HOME')}
        />
      )}

      {view === 'HISTORY' && (
        <div className="animate-fade-in space-y-6">
           <h3 className="text-xl font-black mb-6 px-4">最近の問い合わせ</h3>
           <div className="space-y-4">
              <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center justify-between group opacity-60">
                 <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400"><CheckCircle2 /></div>
                    <div>
                       <p className="font-black text-lg">決済方法の変更について</p>
                       <p className="text-[10px] text-gray-400 font-bold uppercase">2025/05/10 ・ 解決済み</p>
                    </div>
                 </div>
                 <ChevronRight className="text-gray-200" />
              </div>
              <div className="text-center py-10">
                 <p className="text-gray-400 font-bold text-sm">過去1年分の履歴が表示されます。</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const SupportChatUI = ({ subject, category, onClose }: { subject: string, category: string, onClose: () => void }) => {
  const [messages, setMessages] = useState<any[]>([
    { role: 'ai', text: `お問い合わせありがとうございます。「${subject}」に関するサポートです。具体的な状況を詳しくお知らせください。` }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsSending(true);

    try {
      // 本番ではAPIを叩いてスレッドを作成・更新
      // await api.support.sendThreadMessage(...)
      
      // Mock Response
      setTimeout(() => {
        let reply = "担当者が内容を確認しております。しばらくお待ちください。";
        if (category === SupportCategory.SYSTEM) {
           reply = "AIコンシェルジュです。システムの不具合については現在調査中です。具体的なエラーコードが表示されている場合はお知らせください。";
        } else if (category === SupportCategory.BOOKING_ISSUE) {
           reply = "担当のセラピストオフィスへ通知を送信しました。事実確認のため最大24時間お時間をいただく場合がございます。";
        }
        setMessages(prev => [...prev, { role: 'ai', text: reply }]);
        setIsSending(false);
      }, 1500);
    } catch (err) {
      alert("エラーが発生しました。");
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white rounded-[56px] shadow-2xl border border-gray-100 h-[650px] flex flex-col overflow-hidden animate-fade-in-up">
       <div className="bg-gray-900 p-8 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg"><MessageSquare size={20} /></div>
             <div>
                <p className="font-black text-sm">{subject}</p>
                <p className="text-[9px] text-teal-400 font-bold uppercase tracking-widest">Active Support Session</p>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xs font-black uppercase">終了する</button>
       </div>

       <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/50 custom-scrollbar">
          {messages.map((m, i) => (
             <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-6 rounded-[32px] font-bold text-sm leading-relaxed shadow-sm ${
                  m.role === 'user' ? 'bg-gray-900 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                }`}>
                   {m.text}
                </div>
             </div>
          ))}
          {isSending && (
            <div className="flex justify-start">
               <div className="bg-white p-4 rounded-full shadow-sm animate-pulse">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
               </div>
            </div>
          )}
       </div>

       <form onSubmit={handleSend} className="p-8 bg-white border-t border-gray-100 flex gap-4">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="内容を入力してください..."
            className="flex-1 px-8 py-5 bg-gray-50 border-0 rounded-full font-bold text-sm outline-none focus:ring-4 focus:ring-teal-500/5 transition-all shadow-inner"
          />
          <button type="submit" disabled={!input.trim() || isSending} className="w-16 h-16 bg-teal-600 text-white rounded-full flex items-center justify-center hover:bg-teal-700 disabled:bg-gray-100 shadow-xl transition-all active:scale-90">
             <Send size={24} />
          </button>
       </form>
    </div>
  );
};

export default SupportCenter;
