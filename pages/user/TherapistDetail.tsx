
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Award, CheckCircle, Clock, ArrowLeft, 
  Heart, MessageSquare, ShieldCheck, Zap, JapaneseYen, 
  ChevronRight, ThumbsUp, Calendar, Info, Camera,
  UserCheck, Sparkles, Quote, Check, ExternalLink, Scissors, LayoutGrid, Plus, MoreHorizontal, ArrowRight,
  Shield, Tag, Coffee, Wind, Music, User, Smartphone, Target, Move, AlertCircle, Ban
} from 'lucide-react';
import { MOCK_THERAPISTS, MASTER_COURSES, MASTER_OPTIONS, MOCK_AREAS } from '../../constants';

const TherapistDetail: React.FC = () => {
  const { therapistId } = useParams();
  const navigate = useNavigate();
  const therapist = MOCK_THERAPISTS.find(t => t.id === therapistId) || MOCK_THERAPISTS[0];
  
  const [activeTab, setActiveTab] = useState<'BIO' | 'MENU' | 'REVIEW' | 'GALLERY'>('BIO');
  const [isFavorite, setIsFavorite] = useState(false);

  const menuData = useMemo(() => {
    const approved = (therapist as any).approvedMenu;
    if (!approved) return { courses: [], options: [] };
    return {
      courses: (approved.courses || []).map((ac: any) => ({
        ...MASTER_COURSES.find(mc => mc.id === ac.masterId),
        price: ac.price
      })),
      options: (approved.options || []).map((ao: any) => ({
        ...MASTER_OPTIONS.find(mo => mo.id === ao.masterId),
        price: ao.price
      }))
    };
  }, [therapist]);

  // 日本標準の空き状況シミュレーション
  const scheduleData = useMemo(() => {
    const days = ['本日', '明日', '5/24(土)', '5/25(日)', '5/26(月)', '5/27(火)', '5/28(水)'];
    const times = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    return { days, times };
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-40 animate-fade-in font-sans text-gray-900">
      
      {/* 1. ヒーロー・プロフィールセクション */}
      <section className="bg-white border-b border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-50 rounded-full blur-[120px] opacity-30 translate-x-1/3 -translate-y-1/3"></div>
        
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 relative z-10">
           <div className="flex items-center justify-between mb-8">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-teal-600 transition-colors group">
                 <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 戻る
              </button>
              <div className="flex items-center gap-3">
                 <button className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all"><ExternalLink size={18}/></button>
                 <button 
                   onClick={() => setIsFavorite(!isFavorite)}
                   className={`p-3 rounded-2xl transition-all shadow-sm ${isFavorite ? 'bg-rose-50 text-rose-500' : 'bg-gray-50 text-gray-300 hover:text-rose-500'}`}
                 >
                    <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                 </button>
              </div>
           </div>

           <div className="flex flex-col lg:flex-row gap-12 items-start">
              <div className="w-full lg:w-[400px] space-y-4">
                 <div className="aspect-[4/5] rounded-[56px] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border-8 border-white relative group">
                    <img src={therapist.imageUrl} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" alt={therapist.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute bottom-8 left-8 right-8 flex flex-wrap gap-2">
                       {therapist.categories.includes('LICENSED') && (
                         <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-black px-4 py-2 rounded-full border border-white/30 shadow-xl uppercase tracking-widest">国家資格保有</span>
                       )}
                       <span className="bg-teal-500 text-white text-[9px] font-black px-4 py-2 rounded-full shadow-xl flex items-center gap-1.5 border border-teal-400">
                          <Sparkles size={12} /> Soothe 人気スタッフ
                       </span>
                    </div>
                 </div>
                 <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:border-teal-500 transition-all hover:-translate-y-1">
                        <img src={`https://picsum.photos/400/400?random=therapist${i+50}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <div className="aspect-square rounded-2xl bg-gray-900 flex items-center justify-center text-white cursor-pointer hover:bg-teal-600 transition-all">
                       <div className="text-center">
                          <Camera size={16} className="mx-auto mb-1 opacity-50" />
                          <span className="text-[8px] font-black uppercase">More</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex-1 space-y-10">
                 <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                       <span className="bg-teal-50 text-teal-600 text-[10px] font-black px-4 py-1.5 rounded-full border border-teal-100 flex items-center gap-2 uppercase tracking-widest shadow-sm">
                          <CheckCircle size={14}/> ID VERIFIED
                       </span>
                       <span className="bg-gray-900 text-white text-[10px] font-black px-4 py-1.5 rounded-full flex items-center gap-2 uppercase tracking-[0.2em] shadow-lg">
                          <Zap size={14} className="text-teal-400" /> 本日即時予約OK
                       </span>
                    </div>
                    <div>
                       <div className="flex flex-col md:flex-row md:items-end gap-4">
                          <h1 className="text-6xl font-black tracking-tighter text-gray-900 leading-none">{therapist.name}</h1>
                          <span className="text-lg font-bold text-gray-300 tracking-[0.3em] uppercase mb-1">TANAKA YUKI</span>
                       </div>
                       <p className="text-lg font-bold text-gray-400 mt-6 flex flex-wrap items-center gap-4">
                          <span>業界歴 <span className="text-gray-900">12年</span></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                          <span className="text-gray-900 border-b-2 border-teal-500/20 pb-0.5">深層筋リリース / 骨盤調整 / 快眠ドライヘッド</span>
                       </p>
                    </div>
                 </div>

                 <div className="flex flex-wrap items-center gap-x-12 gap-y-6">
                    <div className="flex items-center gap-4">
                       <div className="flex text-yellow-400">
                          {[1, 2, 3, 4, 5].map(i => <Star key={i} size={24} fill="currentColor" />)}
                       </div>
                       <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-black text-gray-900 tabular-nums">{therapist.rating}</span>
                          <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">/ 5.0</span>
                       </div>
                    </div>
                    <div className="h-10 w-px bg-gray-100 hidden md:block"></div>
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Reviews</p>
                       <p className="text-2xl font-black text-gray-900 leading-none tabular-nums">{therapist.reviewCount}<span className="text-sm ml-1 text-gray-300 font-bold">件</span></p>
                    </div>
                 </div>

                 <div className="bg-gray-50 p-10 rounded-[48px] border border-gray-100 relative group overflow-hidden">
                    <Quote className="text-teal-500/30 mb-4" size={32} />
                    <p className="text-gray-700 font-bold text-xl leading-relaxed italic pl-4">
                       「デスクワークで固まった首や肩甲骨の深層筋へ。指圧とストレッチを組み合わせた『痛気持ちいい』絶妙な圧で、翌朝の圧倒的な軽さを実現します。」
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 2. タブ・コンテンツエリア */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-12 flex flex-col lg:flex-row gap-12">
         <div className="flex-1 space-y-12">
            <div className="sticky top-20 z-40 bg-[#FDFCFB]/95 backdrop-blur-md pt-2">
               <div className="flex gap-2 p-2 bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-x-auto no-scrollbar">
                  {[
                    { id: 'BIO', label: 'スタッフ紹介', icon: <UserCheck size={16}/> },
                    { id: 'MENU', label: 'メニュー・クーポン', icon: <Tag size={16}/> },
                    { id: 'REVIEW', label: '口コミ評価', icon: <MessageSquare size={16}/> },
                    { id: 'GALLERY', label: 'こだわり・写真', icon: <Camera size={16}/> },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 flex items-center justify-center gap-3 py-5 px-8 rounded-[24px] text-[11px] font-black transition-all whitespace-nowrap ${
                        activeTab === tab.id ? 'bg-gray-900 text-white shadow-2xl scale-[1.03]' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                       {tab.icon} {tab.label}
                    </button>
                  ))}
               </div>
            </div>

            <div className="bg-white p-12 rounded-[64px] shadow-sm border border-gray-100 min-h-[700px] animate-fade-in relative overflow-hidden">
               {activeTab === 'BIO' && (
                 <div className="space-y-16 animate-fade-in relative z-10">
                    {/* 日本標準：空き状況クイックカレンダー */}
                    <section className="space-y-8">
                       <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-black text-gray-900 flex items-center gap-4 tracking-tight">
                             <span className="w-2 h-8 bg-teal-500 rounded-full"></span> 
                             空き状況カレンダー
                          </h3>
                          <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-4 py-2 rounded-full border border-teal-100">指名予約可能</span>
                       </div>
                       
                       <div className="overflow-x-auto pb-4 no-scrollbar">
                          <table className="w-full text-center border-collapse min-w-[600px]">
                             <thead>
                                <tr className="border-b border-gray-100">
                                   <th className="py-4 px-2 bg-gray-50/50 rounded-tl-3xl">時間</th>
                                   {scheduleData.days.map((d, i) => (
                                      <th key={i} className={`py-4 px-2 font-black text-xs ${d.includes('土') ? 'text-blue-600' : d.includes('日') ? 'text-red-600' : 'text-gray-900'} ${i === scheduleData.days.length-1 ? 'rounded-tr-3xl' : ''}`}>
                                         {d}
                                      </th>
                                   ))}
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-50">
                                {scheduleData.times.map((t, ti) => (
                                   <tr key={ti} className="hover:bg-gray-50/50 transition-colors">
                                      <td className="py-4 px-2 font-black text-[11px] text-gray-400 bg-gray-50/30 font-mono">{t}</td>
                                      {scheduleData.days.map((_, di) => {
                                         const isAvailable = (ti + di) % 3 === 0;
                                         const isBusy = (ti + di) % 5 === 0;
                                         return (
                                            <td key={di} className="py-4 px-2">
                                               <button 
                                                 onClick={() => isAvailable && navigate(`/app/booking/new?therapistId=${therapist.id}`)}
                                                 className={`w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition-all ${
                                                 isAvailable ? 'text-teal-600 hover:bg-teal-500 hover:text-white hover:shadow-lg scale-110' : 'text-gray-100 cursor-not-allowed'
                                               }`}>
                                                  {isAvailable ? <span className="text-2xl leading-none">○</span> : isBusy ? <Ban size={16} /> : <span className="text-xl opacity-20">×</span>}
                                               </button>
                                            </td>
                                         );
                                      })}
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                       <p className="text-[10px] text-gray-400 font-bold text-center italic">「○」をクリックするとその時間帯で予約画面へ進みます</p>
                    </section>

                    <hr className="border-gray-50" />

                    <section className="space-y-8">
                       <h3 className="text-3xl font-black text-gray-900 flex items-center gap-4 tracking-tight">
                          <span className="w-2 h-10 bg-teal-500 rounded-full"></span> 
                          プロフェッショナル背景
                       </h3>
                       <p className="text-gray-600 font-medium leading-relaxed text-xl">
                         都内の有名整体院と高級ホテルスパで計12年の研鑽を積み、累計1万5000人以上の施術を担当。解剖学的な視点から、不調の根本となっている筋肉の癒着を丁寧に剥がしていきます。
                       </p>
                    </section>
                 </div>
               )}

               {activeTab === 'MENU' && (
                 <div className="space-y-12 animate-fade-in relative z-10">
                    <h3 className="text-3xl font-black text-gray-900 flex items-center gap-4 tracking-tight">
                       <span className="w-2 h-10 bg-teal-500 rounded-full"></span> 
                       施術メニュー・クーポン
                    </h3>
                    <div className="p-1 bg-gradient-to-br from-orange-400 to-rose-500 rounded-[56px] shadow-2xl">
                       <div className="bg-white rounded-[55px] p-10 md:p-12 relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-rose-500 text-white px-8 py-2 rounded-bl-[24px] text-[10px] font-black uppercase tracking-widest shadow-xl">Best Value</div>
                          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                             <div className="space-y-4 flex-1">
                                <span className="bg-rose-50 text-rose-600 px-4 py-1.5 rounded-full text-[10px] font-black border border-rose-100 uppercase tracking-widest flex items-center gap-2 w-fit">
                                   <Tag size={12} /> 初回限定クーポン
                                </span>
                                <h4 className="text-4xl font-black text-gray-900 tracking-tighter leading-tight">【人気NO.1】全身深層筋リリース＋快眠ドライヘッド (90分)</h4>
                             </div>
                             <div className="text-center md:text-right">
                                <p className="text-gray-300 font-black line-through text-xl">¥13,000</p>
                                <p className="text-6xl font-black text-rose-500 tracking-tighter mb-6">¥10,000</p>
                                <button className="bg-rose-500 text-white px-10 py-5 rounded-full font-black text-lg shadow-xl hover:bg-rose-600 transition-all active:scale-95 flex items-center gap-3">
                                   クーポンで予約 <ChevronRight size={24}/>
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="grid gap-6">
                       {menuData.courses.map((c: any) => (
                         <div key={c.id} className="p-10 bg-gray-50/50 rounded-[48px] border-2 border-transparent hover:border-teal-500 hover:bg-white hover:shadow-2xl transition-all flex flex-col md:flex-row justify-between items-center gap-8 group cursor-pointer shadow-inner">
                            <div className="flex-1">
                               <div className="flex items-center gap-3 mb-3">
                                  <span className="bg-gray-200 text-gray-500 text-[8px] font-black px-2 py-0.5 rounded uppercase">{c.category}</span>
                                  <h4 className="text-2xl font-black text-gray-900 group-hover:text-teal-600 transition-colors tracking-tight">{c.name}</h4>
                               </div>
                               <div className="flex items-center gap-6 text-sm font-bold text-gray-400">
                                  <span className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-gray-100 shadow-sm"><Clock size={16} className="text-teal-500" /> {c.duration}分</span>
                               </div>
                            </div>
                            <div className="flex items-center gap-8">
                               <p className="text-4xl font-black text-gray-900 tracking-tighter font-outfit">¥{c.price.toLocaleString()}</p>
                               <button onClick={() => navigate(`/app/booking/new?therapistId=${therapist.id}&service=${c.id}`)} className="bg-gray-900 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl hover:bg-teal-600 transition-all group-hover:rotate-[-5deg]">
                                  <ArrowRight size={28} />
                               </button>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {activeTab === 'REVIEW' && (
                 <div className="space-y-16 animate-fade-in relative z-10">
                    <div className="bg-gray-50 rounded-[56px] p-12 flex flex-col md:flex-row items-center gap-12 shadow-inner border border-gray-100">
                       <div className="text-center shrink-0">
                          <h3 className="text-9xl font-black text-gray-900 tracking-tighter tabular-nums leading-none">{therapist.rating}</h3>
                          <div className="flex justify-center gap-1.5 text-yellow-400 mt-6">
                             {[1, 2, 3, 4, 5].map(i => <Star key={i} fill="currentColor" size={28} />)}
                          </div>
                          <p className="text-[10px] font-bold text-gray-300 mt-6 uppercase tracking-widest">Trust verified by {therapist.reviewCount} Users</p>
                       </div>
                       <div className="flex-1 w-full space-y-5 md:px-12 border-l border-gray-200/50">
                          {[{ l: '技術力・効果', v: 98, c: 'bg-teal-500' }, { l: '接客・サービス', v: 96, c: 'bg-indigo-500' }, { l: '衛生・清潔感', v: 100, c: 'bg-cyan-500' }, { l: '安心・安全性', v: 100, c: 'bg-emerald-500' }].map(s => (
                            <div key={s.l} className="space-y-2.5">
                               <div className="flex justify-between text-[11px] font-black text-gray-500 uppercase tracking-widest">
                                  <span>{s.l}</span><span className="text-gray-900">{s.v}%</span>
                               </div>
                               <div className="h-1.5 w-full bg-white rounded-full overflow-hidden shadow-inner border border-gray-100">
                                  <div className={`h-full transition-all duration-[2000ms] ${s.c}`} style={{ width: `${s.v}%` }}></div>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="grid gap-10">
                       {[
                         { u: 'T.Kさん', d: '2025.05.20', r: 5, t: '長年のコリが嘘のように軽くなりました！', tags: ['技術が高い', '丁寧な接客'], content: '強めの圧をお願いしましたが、揉み返しも全くなく、翌朝の身体の軽さに驚きました。', reply: 'T.K様、ご来店ありがとうございました！またお疲れが溜まる前にぜひメンテナンスにお越しください。' },
                       ].map((rev, i) => (
                         <div key={i} className="space-y-6">
                            <div className="p-10 bg-white border-2 border-gray-50 rounded-[48px] shadow-sm relative group hover:shadow-xl transition-all">
                               <div className="flex justify-between items-start mb-6">
                                  <div className="flex items-center gap-5">
                                     <div className="w-14 h-14 bg-gray-50 text-teal-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner border border-gray-100">{rev.u.charAt(0)}</div>
                                     <div><p className="font-black text-gray-900 text-lg mb-1">{rev.u}</p><p className="text-[10px] text-gray-400 font-bold uppercase">{rev.d}</p></div>
                                  </div>
                                  <div className="flex text-yellow-400 gap-0.5">{[1, 2, 3, 4, 5].map(j => <Star key={j} size={18} fill={j <= rev.r ? 'currentColor' : 'none'} className={j > rev.r ? 'text-gray-100' : ''} />)}</div>
                               </div>
                               <h5 className="font-black text-gray-900 text-2xl mb-4 tracking-tight">「{rev.t}」</h5>
                               <p className="text-gray-500 font-medium leading-relaxed text-lg mb-8">{rev.content}</p>
                               <div className="flex flex-wrap gap-3">{rev.tags.map(tag => <span key={tag} className="text-[10px] font-black text-teal-700 bg-teal-50 px-4 py-2 rounded-full flex items-center gap-2 border border-teal-100"><ThumbsUp size={12} /> {tag}</span>)}</div>
                            </div>
                            <div className="ml-10 p-8 bg-gray-50 rounded-[40px] border border-gray-100 relative">
                               <div className="flex items-center gap-4 mb-4"><img src={therapist.imageUrl} className="w-10 h-10 rounded-xl object-cover" /><div><p className="text-[10px] font-black text-gray-900">セラピストからの返信</p></div></div>
                               <p className="text-sm font-bold text-gray-600 italic">「{rev.reply}」</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {activeTab === 'GALLERY' && (
                 <div className="space-y-12 animate-fade-in relative z-10">
                    <h3 className="text-3xl font-black text-gray-900 flex items-center gap-4 tracking-tight">
                       <span className="w-2 h-10 bg-teal-500 rounded-full"></span> 
                       こだわり・フォト
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                       {[1, 2, 3, 4, 5, 6].map(i => (
                          <div key={i} className="aspect-[4/3] rounded-[40px] overflow-hidden border-4 border-white shadow-xl group cursor-zoom-in">
                             <img src={`https://picsum.photos/600/400?random=gallery${i+100}`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                          </div>
                       ))}
                    </div>
                 </div>
               )}
            </div>
         </div>

         {/* 3. サイドバー: Sticky Conversion Panel */}
         <aside className="w-full lg:w-[380px]">
            <div className="sticky top-24 space-y-6">
               <div className="bg-white p-12 rounded-[72px] shadow-[0_80px_160px_-40px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-4 bg-teal-500"></div>
                  <div className="space-y-12">
                     <div>
                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.4em] mb-4 flex items-center gap-2 animate-pulse"><Zap size={14}/> Starting Price</p>
                        <div className="flex items-baseline gap-2"><span className="text-7xl font-black text-gray-900 tracking-tighter">¥{menuData.courses[0]?.price.toLocaleString() || '7,480'}</span><span className="text-gray-400 font-bold text-base">/ 60min</span></div>
                     </div>
                     <div className="space-y-4">
                        <div className="p-6 bg-emerald-50 rounded-[32px] border border-emerald-100 flex items-start gap-4">
                           <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-2 animate-pulse"></div>
                           <div><p className="text-xs font-black text-emerald-800 uppercase">本日 予約可能枠あり</p><p className="text-[11px] text-emerald-600 font-bold mt-1.5 leading-relaxed">18:30 / 20:00 / 21:30 〜</p></div>
                        </div>
                     </div>
                     <button onClick={() => navigate(`/app/booking/new?therapistId=${therapist.id}`)} className="w-full bg-gray-900 text-white py-10 rounded-[48px] font-black text-2xl hover:bg-teal-600 transition-all shadow-[0_30px_90px_rgba(0,0,0,0.3)] flex items-center justify-center gap-4 active:scale-[0.97] group relative overflow-hidden">
                        <span className="relative z-10">今すぐ予約へ</span><ArrowRight size={32} className="relative z-10 group-hover:translate-x-2 transition-transform" />
                     </button>
                     <div className="flex items-center justify-center gap-6">
                        <div className="text-center"><p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Secure Payment</p><p className="text-[9px] font-black text-gray-400">キャッシュレス対応</p></div>
                        <div className="w-px h-6 bg-gray-100"></div>
                        <div className="text-center"><p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Identity</p><p className="text-[9px] font-black text-gray-400">本人確認済スタッフ</p></div>
                     </div>
                  </div>
               </div>
               <div className="bg-gray-900 p-10 rounded-[64px] text-white shadow-2xl relative overflow-hidden border-b-[12px] border-teal-600 group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[120px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.4em] mb-10 flex items-center gap-3 text-teal-400"><ShieldCheck size={20} /> Safety Protocol</h4>
                  <ul className="space-y-8 relative z-10">
                     <li className="flex gap-5"><div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner group-hover:bg-teal-500/20 transition-colors"><Check size={18} className="text-teal-400"/></div><div><p className="text-xs font-black text-white">100% 本人・資格確認</p><p className="text-[10px] font-bold text-gray-500 mt-1 leading-relaxed">全てのパートナーと対面面談を実施しています。</p></div></li>
                  </ul>
                  <button className="mt-12 w-full py-4 border-2 border-white/10 rounded-[28px] text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-gray-400">安全への取り組み</button>
               </div>
            </div>
         </aside>
      </div>
    </div>
  );
};

export default TherapistDetail;
