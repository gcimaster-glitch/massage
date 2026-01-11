
import React, { useState } from 'react';
import { 
  ArrowLeft, Activity, Target, Sparkles, Calendar, 
  ChevronRight, ArrowRight, Zap, ShieldCheck, Heart, 
  Clock, TrendingUp, Info, LayoutGrid, Loader2, Map, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BodyMap from '../../components/BodyMap';
import { GoogleGenAI } from "@google/genai";

const WellnessJournal: React.FC = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<string | null>(null);
  
  // 過去の凝りポイント履歴（蓄積データ）
  const chronicTensionPoints = ['shoulder_r', 'neck', 'back_upper'];
  
  const history = [
    { date: '2025.05.10', service: '深層筋ボディケア', therapist: '田中 有紀', note: '右肩甲骨周りに強い張りと癒着あり。姿勢改善のストレッチを推奨。' },
    { date: '2025.04.15', service: '極上アロマオイル', therapist: '佐藤 健二', note: '腰椎4番付近に疲労蓄積。冷えによる血行不良の傾向。' },
  ];

  const generateRoadmap = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        あなたはトップレベルの理学療法士・ウェルネスコンサルタントです。
        以下のユーザーデータに基づき、今後4週間のパーソナライズされた「リカバリー・ロードマップ」を日本語で作成してください。
        
        【悩み履歴】: ${chronicTensionPoints.join(', ')}
        【過去のメモ】: ${history.map(h => h.note).join(' / ')}
        
        形式はMarkdownで、以下の項目を含めてください：
        1. 現状の分析（なぜ右肩に集中しているか）
        2. 週ごとの具体的なアクション（セルフストレッチ、睡眠環境の改善等）
        3. 推奨される施術頻度とアプローチ
        
        回答は、ユーザーが前向きになれる励ましのトーンでお願いします。
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      setRoadmap(response.text || "");
    } catch (e) {
      alert("ロードマップの生成に失敗しました。");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-40 px-4 pt-10 font-sans text-gray-900 animate-fade-in">
      <div className="max-w-6xl mx-auto flex items-center gap-6 mb-16">
         <button onClick={() => navigate(-1)} className="p-4 bg-white rounded-3xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all text-gray-400">
           <ArrowLeft size={24} />
         </button>
         <div>
            <h1 className="text-4xl font-black tracking-tighter">ウェルネス・ジャーナル</h1>
            <p className="text-gray-400 text-xs font-black uppercase tracking-[0.4em] mt-1 ml-1">Body Intelligence & History</p>
         </div>
      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-12">
        
        {/* 左: ビジュアル・インサイト (5) */}
        <div className="lg:col-span-5 space-y-8">
           <section className="bg-white p-12 rounded-[64px] shadow-sm border border-gray-100 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500"></div>
              <h3 className="text-xl font-black text-gray-900 mb-10 flex items-center justify-center gap-3">
                 <Activity size={24} className="text-indigo-600" /> 慢性疲労・蓄積エリア
              </h3>
              <div className="relative inline-block scale-110">
                 <BodyMap selectedIds={chronicTensionPoints} onToggle={() => {}} readonly />
                 <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_60%_25%,rgba(79,70,229,0.1),transparent_40%)]"></div>
              </div>
              <div className="mt-12 grid grid-cols-2 gap-4">
                 <div className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100 shadow-inner group hover:bg-white transition-all">
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">注意エリア</p>
                    <p className="text-base font-black text-indigo-900">右肩・頸椎部</p>
                 </div>
                 <div className="bg-teal-50 p-6 rounded-[32px] border border-teal-100 shadow-inner group hover:bg-white transition-all">
                    <p className="text-[9px] font-black text-teal-400 uppercase tracking-widest mb-1">改善傾向</p>
                    <p className="text-base font-black text-teal-900">腰椎・骨盤周り</p>
                 </div>
              </div>
           </section>

           <section className="bg-gray-900 text-white p-12 rounded-[64px] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500 rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-1000"></div>
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center shadow-lg"><Sparkles size={24}/></div>
                    <h3 className="text-xl font-black">AI Wellness Roadmap</h3>
                 </div>
                 <p className="text-sm font-bold leading-relaxed text-indigo-100 italic opacity-90">
                   あなたの過去の全セッションデータと悩み傾向をGeminiが解析し、パーソナライズされたリカバリープランを生成します。
                 </p>
                 <button 
                   onClick={generateRoadmap}
                   disabled={isGenerating}
                   className="w-full py-6 bg-teal-500 text-white rounded-[32px] font-black text-sm hover:bg-teal-400 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:bg-gray-700 disabled:text-gray-500 group/btn"
                 >
                    {isGenerating ? <Loader2 className="animate-spin" /> : <TrendingUp size={18} className="group-hover/btn:translate-y-[-2px] transition-transform"/>}
                    {isGenerating ? 'プランを構築中...' : 'ロードマップを生成'}
                 </button>
              </div>
           </section>
        </div>

        {/* 右: タイムライン & ロードマップ表示 (7) */}
        <div className="lg:col-span-7 space-y-8">
           {roadmap && (
             <section className="bg-white p-12 rounded-[64px] shadow-xl border-4 border-teal-50 animate-fade-in-up relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Map size={120}/></div>
                <div className="flex items-center justify-between mb-10 relative z-10">
                   <h3 className="text-3xl font-black text-gray-900 flex items-center gap-4 tracking-tighter">
                      <span className="w-2 h-10 bg-teal-500 rounded-full"></span>
                      4週間のリカバリープラン
                   </h3>
                   <button onClick={() => setRoadmap(null)} className="p-3 bg-gray-50 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"><X size={20}/></button>
                </div>
                <div className="prose prose-sm prose-teal max-w-none font-medium text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50/50 p-8 rounded-[48px] border border-gray-100 shadow-inner relative z-10 italic">
                   {roadmap}
                </div>
                <div className="mt-10 pt-10 border-t border-gray-100 flex items-center justify-between relative z-10 px-4">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 shadow-inner"><FileText size={24}/></div>
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Status</p>
                         <p className="text-base font-black text-teal-600">Active Recovery</p>
                      </div>
                   </div>
                   <button className="bg-gray-900 text-white px-10 py-5 rounded-[28px] font-black text-sm uppercase tracking-widest shadow-xl hover:bg-teal-600 transition-all active:scale-95">プランを保存</button>
                </div>
             </section>
           )}

           <section className="bg-white rounded-[64px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                 <h3 className="text-xl font-black text-gray-900 flex items-center gap-4 tracking-tight"><History size={24} className="text-teal-600" /> 施術ジャーナル</h3>
                 <span className="text-[10px] font-black bg-white px-4 py-2 rounded-2xl border border-gray-100 text-gray-400 uppercase tracking-widest">Last 12 Months</span>
              </div>
              <div className="p-10 space-y-12">
                 {history.map((item, idx) => (
                   <div key={idx} className="relative pl-14 group">
                      {idx !== history.length - 1 && (
                        <div className="absolute left-[24px] top-12 bottom-[-48px] w-1 bg-gray-100 group-hover:bg-teal-200 transition-colors"></div>
                      )}
                      <div className="absolute left-0 top-0 w-12 h-12 bg-white border-4 border-teal-500 rounded-full flex items-center justify-center z-10 shadow-lg group-hover:scale-110 transition-all group-hover:shadow-teal-500/20">
                         <div className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-pulse"></div>
                      </div>
                      
                      <div className="space-y-6">
                         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{item.date}</span>
                            <div className="flex items-center gap-4">
                               <p className="text-sm font-black text-gray-900">{item.therapist} <span className="text-[10px] text-gray-300 font-bold ml-1 uppercase tracking-tighter">Practitioner</span></p>
                               <span className="bg-teal-50 text-teal-600 px-4 py-1 rounded-full text-[10px] font-black border border-teal-100 shadow-sm">{item.service}</span>
                            </div>
                         </div>
                         <div className="p-10 bg-gray-50/30 rounded-[48px] border-2 border-transparent group-hover:border-teal-500/10 group-hover:bg-white transition-all shadow-inner hover:shadow-2xl">
                            <p className="text-lg font-bold text-gray-600 leading-relaxed italic">「{item.note}」</p>
                            <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                               <button className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] flex items-center gap-3 hover:underline">
                                  <FileText size={16}/> 専門カルテ (SOAP) を表示 <ChevronRight size={14}/>
                               </button>
                               <div className="flex gap-2">
                                  <button className="p-4 bg-white rounded-2xl shadow-sm text-gray-300 hover:text-rose-500 transition-all active:scale-90"><Heart size={20}/></button>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
              <button className="w-full py-10 bg-gray-50 text-[11px] font-black text-gray-400 uppercase tracking-[0.5em] hover:bg-gray-100 transition-all border-t border-gray-100">
                 さらに過去の記録を読み込む
              </button>
           </section>
        </div>
      </div>
    </div>
  );
};

const X = ({ size, className = "" }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default WellnessJournal;
