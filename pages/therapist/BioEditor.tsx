
import React, { useState } from 'react';
import { 
  Save, Camera, Award, Star, CheckCircle, ArrowLeft, 
  Plus, X, Tag, UserCheck, ShieldCheck, Heart, Sparkles,
  Scissors, LayoutGrid, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BioEditor: React.FC = () => {
  const navigate = useNavigate();
  const [tags, setTags] = useState(['深層筋', '肩甲骨はがし', '小顔調整', 'スポーツストレッチ']);
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (t: string) => setTags(tags.filter(item => item !== t));

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32 animate-fade-in text-gray-900 font-sans pt-10">
      <div className="flex justify-between items-end px-4">
        <div>
           <h1 className="text-4xl font-black tracking-tighter">ポートフォリオ・ブランド編集</h1>
           <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.4em] mt-2">Professional Identity Manager</p>
        </div>
        <button onClick={() => navigate(-1)} className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all text-gray-400">
           <ArrowLeft size={24} />
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 px-4">
        {/* 左: ビジュアル・宣材 (5) */}
        <div className="lg:col-span-5 space-y-8">
           <section className="bg-white p-12 rounded-[64px] shadow-sm border border-gray-100 text-center space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-teal-500"></div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                 <Camera size={14} /> プロフィール写真の管理
              </p>
              <div className="relative inline-block">
                 <div className="w-56 h-56 rounded-[64px] overflow-hidden border-8 border-white shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1580281658626-ee379f3cce93?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" />
                 </div>
                 <button className="absolute -bottom-4 -right-4 w-16 h-16 bg-gray-900 text-white rounded-3xl flex items-center justify-center shadow-2xl ring-8 ring-white hover:bg-teal-600 transition-all active:scale-90">
                    <Camera size={28} />
                 </button>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-6">
                 {[1, 2].map(i => (
                    <div key={i} className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:bg-teal-50 hover:border-teal-200 transition-all cursor-pointer">
                       <Plus size={20}/>
                    </div>
                 ))}
                 <div className="aspect-square bg-teal-50 rounded-2xl border-2 border-teal-100 flex items-center justify-center">
                    <span className="text-[8px] font-black text-teal-600 uppercase text-center leading-tight">AI審査<br/>完了済</span>
                 </div>
              </div>
           </section>

           <section className="bg-indigo-900 text-white p-10 rounded-[56px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500 rounded-full blur-[80px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-teal-400 shadow-inner"><Sparkles size={24}/></div>
                    <h3 className="text-xl font-black">AI 自己紹介アシスト</h3>
                 </div>
                 <p className="text-sm font-bold text-indigo-100 leading-relaxed opacity-90 italic">
                   「経歴と得意科目を箇条書きにするだけで、AIが予約率を最大化する魅力的な紹介文を自動作成します。」
                 </p>
                 <button className="w-full py-5 bg-white text-indigo-900 rounded-[32px] font-black text-sm uppercase tracking-widest hover:bg-teal-400 hover:text-white transition-all shadow-xl">
                    紹介文をAIで生成する
                 </button>
              </div>
           </section>
        </div>

        {/* 右: 詳細エディタ (7) */}
        <div className="lg:col-span-7 space-y-8">
           <section className="bg-white p-12 rounded-[64px] shadow-sm border border-gray-100 space-y-10">
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 block">プロフィール紹介文 (Bio)</label>
                 <textarea 
                    className="w-full p-8 bg-gray-50 border-0 rounded-[48px] font-bold text-gray-800 h-64 outline-none focus:ring-8 focus:ring-teal-500/5 focus:bg-white transition-all shadow-inner leading-relaxed"
                    defaultValue="インナーマッスルへの的確なアプローチで、翌朝驚くほど身体が軽くなる体験をご提供します。都内のホテルスパや高級サロンでの経験を活かし、一人ひとりのお悩みに合わせたオーダーメイドの施術を心がけています。"
                 />
              </div>

              <div className="space-y-6">
                 <div className="flex items-center justify-between ml-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Tag size={12}/> 得意な技術タグ (Max 6)</label>
                    <span className="text-[10px] font-black text-teal-600">{tags.length}/6</span>
                 </div>
                 <div className="flex flex-wrap gap-3 p-8 bg-gray-50 rounded-[40px] border border-transparent focus-within:border-teal-500/10 focus-within:bg-white transition-all shadow-inner">
                    {tags.map(t => (
                      <span key={t} className="bg-white text-gray-700 px-4 py-2 rounded-2xl text-[11px] font-black border border-gray-200 shadow-sm flex items-center gap-2 group animate-scale-in">
                         {t} <button onClick={() => removeTag(t)} className="text-gray-300 hover:text-red-500"><X size={14}/></button>
                      </span>
                    ))}
                    <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                       <input 
                         type="text" 
                         value={newTag} 
                         onChange={e => setNewTag(e.target.value)}
                         onKeyPress={e => e.key === 'Enter' && addTag()}
                         placeholder="タグを追加..." 
                         className="bg-transparent border-0 outline-none text-xs font-bold w-full p-2"
                       />
                       <button onClick={addTag} className="p-2 bg-gray-900 text-white rounded-xl"><Plus size={16}/></button>
                    </div>
                 </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 block">業界経験年数</label>
                    <div className="relative">
                       <input type="number" defaultValue={12} className="w-full p-5 bg-gray-50 border-0 rounded-3xl font-black text-2xl outline-none focus:ring-4 focus:ring-teal-500/5 transition-all shadow-inner pl-8 pr-16" />
                       <span className="absolute right-8 top-1/2 -translate-y-1/2 font-black text-gray-300">年</span>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 block">最高資格</label>
                    <select className="w-full p-6 bg-gray-50 border-0 rounded-3xl font-black text-sm outline-none focus:ring-4 focus:ring-teal-500/5 transition-all shadow-inner appearance-none">
                       <option>あん摩マッサージ指圧師</option>
                       <option>柔道整復師</option>
                       <option>鍼灸師</option>
                       <option>民間認定・ディプロマ</option>
                    </select>
                 </div>
              </div>

              <div className="bg-teal-50 p-8 rounded-[40px] border border-teal-100 flex items-start gap-4">
                 <ShieldCheck className="text-teal-600 mt-1 flex-shrink-0" />
                 <p className="text-xs text-teal-800 font-bold leading-relaxed">
                    変更内容は運営本部による承認後に一般公開されます。<br/>
                    虚偽の内容や公序良俗に反する単語の使用は、アカウント停止の対象となりますのでご注意ください。
                 </p>
              </div>

              <button className="w-full py-8 bg-gray-900 text-white rounded-[40px] font-black text-2xl shadow-2xl hover:bg-teal-600 transition-all active:scale-95 flex items-center justify-center gap-4">
                 <Save size={32} /> 変更内容を保存して申請
              </button>
           </section>
        </div>
      </div>
    </div>
  );
};

export default BioEditor;
