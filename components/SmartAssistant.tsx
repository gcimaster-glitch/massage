
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, User, ArrowRight, Loader2 } from 'lucide-react';
import { suggestTherapist } from '../services/aiService';
import { useNavigate } from 'react-router-dom';
import { MOCK_THERAPISTS } from '../constants';

const SmartAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string, recommendations?: any[] }[]>([
    { role: 'ai', content: 'こんにちは！今日はどのようなお悩みがありますか？（例：デスクワークで肩が痛い、リラックスしたい等）' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsLoading(true);

    try {
      const result = await suggestTherapist(userText);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: result.message || 'こちらのセラピストがおすすめです。',
        recommendations: result.recommendations 
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', content: '申し訳ありません、現在コンシェルジュが離席しております。直接検索をご利用ください。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="w-[380px] h-[550px] bg-white rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden border border-gray-100 mb-4 animate-fade-in-up">
           <div className="bg-gray-900 p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                    <Sparkles size={20} />
                 </div>
                 <div>
                    <h3 className="font-black text-sm tracking-tight">AI Concierge</h3>
                    <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">Soothe Smart Match</p>
                 </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
           </div>

           <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] space-y-4 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`p-5 rounded-[28px] text-sm font-bold leading-relaxed ${
                        msg.role === 'user' ? 'bg-gray-900 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
                      }`}>
                         {msg.content}
                      </div>
                      
                      {msg.recommendations && (
                        <div className="grid gap-3">
                           {msg.recommendations.map((rec: any) => {
                             const therapist = MOCK_THERAPISTS.find(t => t.id === rec.id);
                             return therapist ? (
                               <div key={rec.id} className="bg-white p-4 rounded-3xl border border-teal-100 shadow-sm flex flex-col gap-3">
                                  <div className="flex items-center gap-3">
                                     <img src={therapist.imageUrl} className="w-10 h-10 rounded-xl object-cover" />
                                     <p className="text-xs font-black text-gray-900">{therapist.name}</p>
                                  </div>
                                  <p className="text-[10px] text-gray-500 font-bold leading-tight">{rec.reason}</p>
                                  <button 
                                    onClick={() => navigate(`/app/therapist/${therapist.id}`)}
                                    className="w-full py-2 bg-teal-50 text-teal-700 rounded-xl font-black text-[10px] flex items-center justify-center gap-2 hover:bg-teal-100 transition-all"
                                  >
                                     詳細を見る <ArrowRight size={12} />
                                  </button>
                               </div>
                             ) : null;
                           })}
                        </div>
                      )}
                   </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                   <div className="bg-white p-5 rounded-[28px] rounded-tl-none shadow-sm border border-gray-100">
                      <Loader2 className="animate-spin text-teal-600" size={20} />
                   </div>
                </div>
              )}
           </div>

           <div className="p-6 bg-white border-t border-gray-100">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative">
                 <input 
                   type="text" 
                   value={input}
                   onChange={e => setInput(e.target.value)}
                   placeholder="悩みを入力してください..." 
                   className="w-full pl-6 pr-14 py-4 bg-gray-50 border-0 rounded-full text-sm font-bold outline-none focus:ring-4 focus:ring-teal-500/10 transition-all"
                 />
                 <button className="absolute right-2 top-2 w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-teal-600 transition-all shadow-lg active:scale-90">
                    <Send size={18} />
                 </button>
              </form>
           </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-95 ${isOpen ? 'bg-gray-900 text-white rotate-90' : 'bg-teal-600 text-white'}`}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        {!isOpen && (
           <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full animate-bounce"></div>
        )}
      </button>
    </div>
  );
};

export default SmartAssistant;
