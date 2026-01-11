
import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  Sparkles, Save, FileText, CheckCircle, ArrowLeft, Loader2, 
  ClipboardCheck, Activity, Target, Camera, Trash2, ShieldCheck, 
  Info, Zap, History, LayoutGrid
} from 'lucide-react';
import { generateSessionSoapNote } from '../../services/aiService';
import BodyMap from '../../components/BodyMap';
import { BookingType } from '../../types';

const SessionSummary: React.FC = () => {
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const isCubeSite = searchParams.get('type') === BookingType.ONSITE;
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [note, setNote] = useState<any>(null);
  const [therapistInput, setTherapistInput] = useState('');
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);
  const [evidencePhoto, setEvidencePhoto] = useState<string | null>(null);

  const toggleBodyPart = (id: string) => {
    setSelectedBodyParts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const partsText = selectedBodyParts.length > 0 ? `重点施術箇所: ${selectedBodyParts.join(', ')}` : '';
      const mockTranscript = `首の凝りがひどい。特に右側。仕事はデスクワーク中心。${partsText}`;
      const result = await generateSessionSoapNote(mockTranscript, therapistInput);
      setNote(result);
    } catch (e) {
      alert("AIカルテ生成に失敗しました。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (isCubeSite && !evidencePhoto) {
       alert("CARE CUBE利用時は、退室前の清掃証跡写真のアップロードが必要です。");
       return;
    }
    alert("AIカルテと清掃証跡を保存しました。ブースを「清掃待ち」ステータスに変更しました。");
    navigate('/t');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32 px-4 pt-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="bg-teal-50 text-teal-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-teal-100 shadow-sm">Session Complete</span>
              {isCubeSite && <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100 shadow-sm">CARE CUBE Protocol</span>}
           </div>
           <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">施術レポート・完了手続</h1>
        </div>
        <button onClick={() => navigate(-1)} className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all text-gray-400">
           <ArrowLeft size={24} />
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        
        {/* Step 1: Physical Assessment (左 5) */}
        <div className="lg:col-span-5 space-y-8">
           <section className="bg-white p-12 rounded-[64px] shadow-sm border border-gray-100 space-y-10 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-teal-500"></div>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shadow-inner"><Target size={24} /></div>
                 <h3 className="text-2xl font-black tracking-tight text-gray-900">1. 施術ポイントの記録</h3>
              </div>
              <BodyMap selectedIds={selectedBodyParts} onToggle={toggleBodyPart} />
              <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Info size={14}/> 選ばれた重点箇所</p>
                 <div className="flex flex-wrap gap-2">
                    {selectedBodyParts.length === 0 ? (
                       <p className="text-xs font-bold text-gray-300 italic">マップをタップして部位を選択してください</p>
                    ) : (
                       selectedBodyParts.map(id => (
                         <span key={id} className="bg-white text-gray-700 px-4 py-2 rounded-2xl text-[11px] font-black border border-gray-200 shadow-sm animate-scale-in">{id}</span>
                       ))
                    )}
                 </div>
              </div>
           </section>

           {isCubeSite && (
              <section className="bg-white p-12 rounded-[64px] shadow-xl border-4 border-orange-50 space-y-10">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-inner"><Camera size={24} /></div>
                    <h3 className="text-2xl font-black tracking-tight text-gray-900">2. 清掃・原状復帰証跡</h3>
                 </div>
                 
                 <div 
                   onClick={() => setEvidencePhoto('https://picsum.photos/800/600?random=cleanup')}
                   className={`aspect-video rounded-[40px] border-4 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group ${evidencePhoto ? 'border-teal-500' : 'border-gray-100 bg-gray-50 hover:bg-orange-50 hover:border-orange-200'}`}
                 >
                    {evidencePhoto ? (
                       <>
                          <img src={evidencePhoto} className="w-full h-full object-cover" alt="Cleanup Evidence" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <span className="bg-white text-gray-900 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2"><Trash2 size={14}/> 撮り直す</span>
                          </div>
                          <div className="absolute bottom-6 right-6 bg-teal-500 text-white px-4 py-2 rounded-2xl text-[10px] font-black flex items-center gap-2 shadow-2xl">
                             <ShieldCheck size={14}/> AI確認: 正常 (98%)
                          </div>
                       </>
                    ) : (
                       <div className="text-center space-y-4">
                          <div className="w-16 h-16 bg-white rounded-3xl mx-auto flex items-center justify-center text-gray-300 shadow-sm group-hover:scale-110 transition-transform"><Camera /></div>
                          <p className="font-black text-gray-400 text-sm">退室前のブース内を撮影</p>
                       </div>
                    )}
                 </div>
                 <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
                    ※ リネンの回収、オイルの拭き取り、備品の補充確認を行ってください。写真は施設ホストおよび運営に共有されます。
                 </p>
              </section>
           )}
        </div>

        {/* Step 2: AI Records (右 7) */}
        <div className="lg:col-span-7 space-y-8">
           <section className="bg-white p-12 rounded-[64px] shadow-sm border border-gray-100 space-y-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner"><Edit3 size={24} /></div>
                 <h3 className="text-2xl font-black tracking-tight text-gray-900">3. 専門所見とAIカルテ</h3>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 block">セラピスト・プライベートメモ</label>
                 <textarea 
                    className="w-full p-8 bg-gray-50 border-0 rounded-[48px] font-bold text-gray-800 h-48 outline-none focus:ring-8 focus:ring-teal-500/5 focus:bg-white transition-all shadow-inner leading-relaxed"
                    placeholder="施術中に気づいた筋肉の状態や、お客様との会話内容..."
                    value={therapistInput}
                    onChange={e => setTherapistInput(e.target.value)}
                 />
                 <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !therapistInput || selectedBodyParts.length === 0}
                    className="w-full py-6 bg-gray-900 text-white rounded-[32px] font-black text-lg flex items-center justify-center gap-4 hover:bg-teal-600 transition-all shadow-2xl active:scale-95 disabled:bg-gray-100 disabled:text-gray-300"
                 >
                    {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles className="text-teal-400" />}
                    AIカルテを自動生成
                 </button>
              </div>

              {note && (
                 <div className="animate-fade-in space-y-8 pt-10 border-t border-gray-50">
                    <div className="grid md:grid-cols-2 gap-8">
                       <RecordBlock label="Subjective (主訴)" text={note.subjective} />
                       <RecordBlock label="Objective (身体所見)" text={note.objective} />
                       <RecordBlock label="Assessment (分析)" text={note.assessment} />
                       <RecordBlock label="Next Plan (セルフケア)" text={note.plan} color="teal" />
                    </div>
                    
                    <div className="bg-gray-900 p-10 rounded-[48px] text-white relative overflow-hidden shadow-2xl">
                       <div className="absolute top-0 right-0 p-8 opacity-10"><Zap size={100}/></div>
                       <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Activity size={14}/> ユーザー向け要約（マイページ掲載用）</h4>
                       <p className="text-sm font-bold leading-relaxed opacity-90 italic">「{note.summary}」</p>
                    </div>

                    <button 
                       onClick={handleSave}
                       className="w-full py-8 bg-teal-600 text-white rounded-[40px] font-black text-2xl shadow-xl shadow-teal-500/20 hover:bg-teal-700 transition-all active:scale-95 flex items-center justify-center gap-6"
                    >
                       <Save size={32} /> 施術を完了して送信
                    </button>
                 </div>
              )}
           </section>
        </div>
      </div>
    </div>
  );
};

const RecordBlock = ({ label, text, color = "gray" }: { label: string, text: string, color?: "gray" | "teal" }) => (
  <div className="space-y-3 group">
     <p className={`text-[10px] font-black uppercase tracking-widest ml-4 ${color === 'teal' ? 'text-teal-600' : 'text-gray-400'}`}>{label}</p>
     <div className={`p-6 rounded-[32px] border-2 transition-all ${color === 'teal' ? 'bg-teal-50 border-teal-100 text-teal-900' : 'bg-gray-50 border-transparent text-gray-700 group-hover:bg-white group-hover:border-teal-500/20'}`}>
        <p className="text-xs font-bold leading-relaxed">{text}</p>
     </div>
  </div>
);

const Edit3 = ({ size, className = "" }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export default SessionSummary;
