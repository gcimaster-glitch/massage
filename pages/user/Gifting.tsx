
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Gift, Heart, Send, CheckCircle, ArrowLeft, 
  Sparkles, Zap, Smartphone, Mail, Copy, 
  CreditCard, ChevronRight, Share2, Palette, Clock
} from 'lucide-react';

const Gifting: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedAmount, setSelectedAmount] = useState(10000);
  const [design, setDesign] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const amounts = [5000, 10000, 15000, 30000];
  const designs = [
    { id: 1, name: 'Minimal Zen', color: 'bg-teal-500' },
    { id: 2, name: 'Sakura Pink', color: 'bg-rose-400' },
    { id: 3, name: 'Midnight Gold', color: 'bg-slate-900' },
  ];

  const handlePurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-40 px-4 pt-10 font-sans text-gray-900 animate-fade-in">
      <div className="flex items-center justify-between">
         <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter">ウェルネス・ギフト</h1>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em] ml-1">Send care to your loved ones</p>
         </div>
         <button onClick={() => navigate(-1)} className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-400 hover:text-gray-900 transition-all">
           <ArrowLeft size={24} />
         </button>
      </div>

      {step === 1 && (
        <div className="grid lg:grid-cols-2 gap-12 animate-fade-in">
           {/* カード・プレビュー */}
           <div className="space-y-8">
              <div className={`aspect-[1.6/1] rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl transition-all duration-700 ${designs.find(d => d.id === design)?.color}`}>
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                 <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                       <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl"><Gift size={24}/></div>
                       <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Value Ticket</p>
                          <p className="text-3xl font-black tracking-tighter">¥{selectedAmount.toLocaleString()}</p>
                       </div>
                    </div>
                    <div>
                       <p className="text-sm font-bold opacity-80 mb-1">TO: SPECIAL SOMEONE</p>
                       <h2 className="text-2xl font-black tracking-tight">いつも、お疲れ様。</h2>
                    </div>
                 </div>
                 <div className="absolute bottom-10 right-10 flex items-center gap-2 opacity-30">
                    <span className="text-[10px] font-black uppercase tracking-widest">Soothe Japan</span>
                 </div>
              </div>

              <div className="space-y-6">
                 <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-2"><Palette size={14}/> デザインを選択</h3>
                 <div className="flex gap-4">
                    {designs.map(d => (
                       <button 
                         key={d.id} 
                         onClick={() => setDesign(d.id)}
                         className={`w-16 h-16 rounded-2xl transition-all border-4 ${d.color} ${design === d.id ? 'border-gray-900 scale-110 shadow-lg' : 'border-white shadow-sm'}`}
                       />
                    ))}
                 </div>
              </div>
           </div>

           {/* 設定・金額入力 */}
           <div className="space-y-10">
              <div className="space-y-6">
                 <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-2"><CreditCard size={14}/> 金額を選択</h3>
                 <div className="grid grid-cols-2 gap-4">
                    {amounts.map(amt => (
                       <button 
                         key={amt} 
                         onClick={() => setSelectedAmount(amt)}
                         className={`py-6 rounded-[32px] font-black text-xl border-2 transition-all ${selectedAmount === amt ? 'bg-gray-900 text-white border-gray-900 shadow-xl' : 'bg-white text-gray-400 border-gray-100 hover:border-teal-500'}`}
                       >
                          ¥{amt.toLocaleString()}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 block">メッセージ (Optional)</label>
                 <textarea 
                   className="w-full p-6 bg-gray-50 border-0 rounded-[32px] font-bold text-gray-900 h-32 focus:ring-4 focus:ring-teal-500/5 focus:bg-white transition-all shadow-inner outline-none"
                   placeholder="日頃の感謝を込めて、メッセージを添えましょう..."
                 />
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full py-8 bg-gray-900 text-white rounded-[40px] font-black text-2xl shadow-2xl hover:bg-teal-600 transition-all active:scale-95 flex items-center justify-center gap-4"
              >
                 次へ進む <ChevronRight size={32} />
              </button>
           </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-2xl mx-auto space-y-10 animate-fade-in text-center">
           <div className="bg-white p-12 rounded-[64px] shadow-2xl border border-gray-100 space-y-10">
              <h2 className="text-3xl font-black tracking-tighter">ご購入内容の確認</h2>
              <div className="flex justify-between items-center p-8 bg-gray-50 rounded-[40px]">
                 <div className="text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Wellness Gift Card</p>
                    <p className="text-2xl font-black">¥{selectedAmount.toLocaleString()}</p>
                 </div>
                 <div className={`w-20 h-12 rounded-xl ${designs.find(d => d.id === design)?.color}`}></div>
              </div>
              
              <div className="space-y-4">
                 <p className="text-sm font-bold text-gray-500">決済完了後、プレゼント用のリンクが発行されます。</p>
                 <button 
                   onClick={handlePurchase}
                   disabled={isProcessing}
                   className="w-full py-8 bg-teal-600 text-white rounded-[40px] font-black text-2xl shadow-xl shadow-teal-500/20 hover:bg-teal-700 transition-all flex items-center justify-center gap-4 disabled:bg-gray-100"
                 >
                    {isProcessing ? <Zap className="animate-spin" /> : <CreditCard size={32} />}
                    {isProcessing ? '決済処理中...' : '決済を確定する'}
                 </button>
              </div>
           </div>
           <button onClick={() => setStep(1)} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors">内容を修正する</button>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-2xl mx-auto space-y-12 animate-fade-in-up text-center">
           <div className="bg-white p-16 rounded-[80px] shadow-2xl border border-gray-50 space-y-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-4 bg-teal-500"></div>
              <div className="w-24 h-24 bg-teal-50 text-teal-600 rounded-[32px] flex items-center justify-center mx-auto shadow-inner ring-8 ring-teal-50/20 animate-bounce">
                 <CheckCircle size={56} />
              </div>
              <h2 className="text-4xl font-black tracking-tighter">ギフトの準備が整いました！</h2>
              <p className="text-gray-500 font-bold text-lg leading-relaxed">
                以下のURLをコピーして、LINEやSNSで相手に送ってください。リンクを開くとギフトカードが表示されます。
              </p>
              
              <div className="flex items-center gap-3 p-6 bg-gray-50 rounded-[32px] border-2 border-teal-500/20 shadow-inner group">
                 <input readOnly value={`https://soothe.jp/gift/redeem/XF-829-${Math.floor(100+Math.random()*900)}`} className="flex-1 bg-transparent border-0 font-mono text-sm font-black text-teal-700 outline-none truncate" />
                 <button className="bg-white p-4 rounded-2xl shadow-sm text-teal-600 hover:bg-teal-50 transition-all active:scale-90"><Copy size={20}/></button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button className="py-5 bg-teal-600 text-white rounded-[28px] font-black text-sm flex items-center justify-center gap-3 shadow-xl active:scale-95"><Share2 size={18}/> LINEで送る</button>
                 <button className="py-5 bg-gray-900 text-white rounded-[28px] font-black text-sm flex items-center justify-center gap-3 shadow-xl active:scale-95"><Mail size={18}/> メールで送る</button>
              </div>
           </div>

           <div className="bg-indigo-900 text-white p-10 rounded-[56px] shadow-2xl relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-8 opacity-10"><Sparkles size={80}/></div>
              <h4 className="text-xs font-black uppercase tracking-widest text-teal-400 mb-6 flex items-center gap-2"><Clock size={14}/> 有効期限: 180日間</h4>
              <p className="text-sm font-bold text-indigo-100 leading-relaxed italic opacity-90">
                 「受け取った方は、Sootheアプリからお好きなセラピストや CARE CUBE を選んで予約いただけます。」
              </p>
           </div>

           <button onClick={() => navigate('/app')} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">マイページへ戻る</button>
        </div>
      )}
    </div>
  );
};

export default Gifting;
