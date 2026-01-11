
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, ArrowLeft, ShieldAlert, Lock, MapPin, AlertTriangle, 
  Info, Clock, Loader2, Languages, Zap, Sparkles 
} from 'lucide-react';
import { api } from '../../services/api';
import { BookingStatus, Role } from '../../types';
import { MOCK_BOOKINGS } from '../../constants';
import { GoogleGenAI } from "@google/genai";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text: string;
  translatedText?: string;
  timestamp: string;
}

const Chat: React.FC = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [currentUser] = useState<any>(() => JSON.parse(localStorage.getItem('currentUser') || '{}'));
  const [booking, setBooking] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTranslationOn, setIsTranslationOn] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const isClosed = booking?.status === BookingStatus.COMPLETED || booking?.status === BookingStatus.CANCELLED;

  useEffect(() => {
    const loadData = async () => {
      if (!bookingId) return;
      try {
        const [bData, mData] = await Promise.all([
          api.bookings.get(bookingId),
          api.bookings.getMessages(bookingId).catch(() => [])
        ]);
        setBooking(bData);
        setMessages(mData);
      } catch (err) {
        const mockB = MOCK_BOOKINGS.find(b => b.id === bookingId);
        if (mockB) setBooking(mockB);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [bookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const translateMessage = async (text: string, targetLang: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the following chat message to ${targetLang}. Only return the translated text. Context: Wellness/Massage service booking communication. Message: "${text}"`
    });
    return response.text || text;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isClosed || !bookingId) return;

    let textToSend = newMessage;
    let translated = undefined;

    if (isTranslationOn) {
      setIsTranslating(true);
      try {
         // シンプルな判定：日本語なら英語へ、それ以外なら日本語へ
         const targetLang = /[ぁ-んァ-ン一-龠]/.test(newMessage) ? 'English' : 'Japanese';
         translated = await translateMessage(newMessage, targetLang);
      } catch (e) {
         console.warn("Translation failed");
      } finally {
         setIsTranslating(false);
      }
    }

    const optimisticMsg: Message = {
      id: `opt-${Date.now()}`,
      senderId: currentUser.id || 'me',
      senderName: currentUser.displayName || '自分',
      senderRole: currentUser.role,
      text: textToSend,
      translatedText: translated,
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, optimisticMsg]);
    setNewMessage('');
    // 本来はAPI経由で送信
  };

  if (isLoading && !booking) return (
    <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-teal-600" size={48} /></div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-5xl mx-auto bg-white rounded-[48px] shadow-2xl border border-gray-100 overflow-hidden animate-fade-in font-sans">
      <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white z-10">
        <div className="flex items-center gap-5">
          <button onClick={() => navigate(-1)} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              {currentUser.role === Role.USER ? `セラピスト: ${booking?.therapistName || '---'}` : `お客様: ${booking?.userName || 'ゲスト'}`}
            </h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] text-teal-600 font-black uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded">運行・合流用チャット</span>
            </div>
          </div>
        </div>

        {/* AI Translation Toggle */}
        <button 
          onClick={() => setIsTranslationOn(!isTranslationOn)}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
            isTranslationOn ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
          }`}
        >
           <Languages size={14} className={isTranslationOn ? 'animate-pulse' : ''} />
           AIリアルタイム翻訳: {isTranslationOn ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/30 custom-scrollbar">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id || msg.id.startsWith('opt-');
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-3 mb-2 px-2">
                 <span className="font-black text-gray-900 text-[11px]">{msg.senderName}</span>
                 <span className="text-[9px] font-bold text-gray-300">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className={`max-w-[80%] rounded-[32px] px-8 py-5 shadow-sm border ${
                isMe 
                  ? 'bg-gray-900 text-white border-gray-900 rounded-tr-none' 
                  : 'bg-white text-gray-800 border-gray-100 rounded-tl-none'
              }`}>
                <p className="text-sm font-bold leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                {msg.translatedText && (
                  <div className="mt-3 pt-3 border-t border-white/10 text-[11px] opacity-70 italic font-medium flex items-start gap-2">
                     <Sparkles size={12} className="mt-0.5 flex-shrink-0" />
                     <span>{msg.translatedText}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {!isClosed ? (
        <form onSubmit={handleSend} className="p-8 bg-white border-t border-gray-100 flex gap-6 items-center">
          <div className="flex-1 relative">
             <input
               type="text"
               value={newMessage}
               onChange={(e) => setNewMessage(e.target.value)}
               placeholder={isTranslationOn ? "AIが自動で翻訳して送信します..." : "メッセージを入力..."}
               className="w-full bg-gray-50 border-0 rounded-[24px] px-8 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-teal-500/5 transition-all shadow-inner"
             />
             {isTranslating && (
               <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <Loader2 className="animate-spin text-indigo-500" size={18} />
               </div>
             )}
          </div>
          <button 
            type="submit"
            disabled={!newMessage.trim() || isTranslating}
            className="bg-teal-600 text-white w-16 h-16 rounded-[24px] flex items-center justify-center hover:bg-teal-700 disabled:bg-gray-100 transition-all shadow-xl active:scale-95"
          >
            <Send size={28} />
          </button>
        </form>
      ) : (
        <div className="p-12 bg-gray-50 border-t border-gray-100 text-center flex flex-col items-center gap-4">
           <Lock size={32} className="text-gray-400" />
           <h3 className="text-lg font-black text-gray-900">運行完了のためクローズ</h3>
        </div>
      )}
    </div>
  );
};

export default Chat;
