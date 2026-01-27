
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PortalLayout from './PortalLayout';
import { CheckCircle, ArrowRight, User, Building2, Briefcase, ChevronRight, Zap, ShieldCheck, Heart, Sparkles, Award, TrendingUp } from 'lucide-react';

const RecruitPage: React.FC = () => {
  const { hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <PortalLayout>
      {/* Hero Section */}
      <section className="bg-slate-900 text-white pt-32 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center space-y-10">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-2 rounded-full backdrop-blur-md animate-fade-in">
             <Sparkles size={16} className="text-teal-400" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Partner Program 2025</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9]">
            日本の「癒やし」を、<br/>
            <span className="text-teal-400">アップグレードする。</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed">
            HOGUSY は、技術、空間、安全を統合した次世代のインフラです。<br className="hidden md:block"/>
            あなたの専門性や資産を、新しいウェルネスの形へ。
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 pt-10">
             <button onClick={() => scrollToSection('therapist')} className="bg-white text-slate-900 px-10 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-teal-400 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center gap-3">
               <User size={20} /> セラピスト募集
             </button>
             <button onClick={() => scrollToSection('host')} className="bg-white/10 text-white border border-white/20 px-10 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all backdrop-blur-sm flex items-center gap-3">
               <Building2 size={20} /> 施設ホスト募集
             </button>
          </div>
        </div>
      </section>

      {/* Trust Statistics */}
      <section className="py-20 border-b border-gray-100">
         <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <StatItem label="提携セラピスト" val="1,200+" sub="名" />
            <StatItem label="設置ブース (CUBE)" val="450+" sub="拠点" />
            <StatItem label="平均還元率" val="70" sub="%" />
            <StatItem label="安全事故発生率" val="0.01" sub="%" />
         </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-32 space-y-48">
        
        {/* 1. Therapist Section */}
        <section id="therapist" className="scroll-mt-32">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
               <div>
                  <span className="bg-teal-50 text-teal-600 px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-6 inline-block border border-teal-100">For Professionals</span>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                    店舗リスクなしで、<br/>
                    <span className="text-teal-600 underline decoration-teal-500/20 underline-offset-8">プロとしてのキャリアを。</span>
                  </h2>
               </div>
               <p className="text-gray-500 text-xl font-bold leading-relaxed italic">
                 「出張」と「CARE CUBE」のハイブリッド。24時間、都内全域があなたの職場になります。
               </p>
               <div className="grid sm:grid-cols-2 gap-8">
                  <BenefitCard icon={<TrendingUp />} title="業界最高水準の報酬" desc="売上の65%〜75%を還元。指名料は全額セラピストの収益となります。" />
                  <BenefitCard icon={<ShieldCheck />} title="Gemini ライブ安全監視" desc="施術中はAIが常に音声をモニタリング。万が一のトラブルを未然に防ぎます。" />
                  <BenefitCard icon={<Zap />} title="集客はプラットフォーム任せ" desc="独自のアルゴリズムで、あなたのスキルに最適な顧客を自動マッチング。" />
                  <BenefitCard icon={<Award />} title="国家資格者優遇" desc="あん摩マッサージ指圧師、柔道整復師等の保有者は優先的に案件を配信。" />
               </div>
               <button onClick={() => navigate('/auth/signup/therapist')} className="bg-slate-900 text-white px-12 py-6 rounded-[32px] font-black text-lg hover:bg-teal-600 transition-all shadow-2xl active:scale-95 flex items-center gap-4">
                 セラピストとして登録する <ArrowRight size={24} />
               </button>
            </div>
            <div className="relative">
               <div className="absolute -top-10 -left-10 w-40 h-40 bg-teal-500 rounded-full blur-[80px] opacity-20"></div>
               <div className="rounded-[80px] overflow-hidden shadow-[0_80px_160px_-40px_rgba(0,0,0,0.2)] aspect-[4/5] relative">
                  <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" alt="Therapist working" />
                  <div className="absolute bottom-12 left-12 right-12 bg-white/95 backdrop-blur-xl p-8 rounded-[48px] shadow-2xl">
                     <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-black text-xl">優</div>
                        <div>
                           <p className="font-black text-slate-900">田中 有紀 <span className="text-xs font-bold text-gray-400 ml-2">歴12年</span></p>
                           <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Premium Partner</p>
                        </div>
                     </div>
                     <p className="text-xs font-bold text-gray-500 italic">「CARE CUBEがあるから、店舗を持たずに自分の名前で勝負できるようになりました。」</p>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* 2. Space Host Section */}
        <section id="host" className="scroll-mt-32">
          <div className="bg-slate-900 rounded-[100px] p-12 md:p-24 overflow-hidden relative text-white">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
               <div className="order-2 lg:order-1">
                  <div className="rounded-[64px] overflow-hidden shadow-2xl aspect-video border-8 border-white/5">
                     <img src="/care-cube-lobby.jpg" className="w-full h-full object-cover" alt="CARE CUBE Booth" />
                  </div>
               </div>
               <div className="space-y-10 order-1 lg:order-2">
                  <div>
                    <span className="bg-orange-500 text-white px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-6 inline-block shadow-lg">For Facility Owners</span>
                    <h2 className="text-5xl font-black tracking-tighter leading-tight">
                      遊休資産を、<br/>
                      <span className="text-orange-400 underline decoration-orange-400/20 underline-offset-8">自動収益ブースへ。</span>
                    </h2>
                  </div>
                  <p className="text-gray-400 text-xl font-bold leading-relaxed">
                    ホテルの客室、商業施設の余剰スペース、ビルの一室。CARE CUBEを設置するだけで、高単価なウェルネス予約を受け入れ可能。
                  </p>
                  <ul className="space-y-6">
                     <BenefitList icon={<CheckCircle className="text-orange-400" />} text="完全無人運営が可能（スマートキー連動）" />
                     <BenefitList icon={<CheckCircle className="text-orange-400" />} text="本部が集客、決済、セラピスト手配を一元管理" />
                     <BenefitList icon={<CheckCircle className="text-orange-400" />} text="既存の設備を活用した低コスト導入プランあり" />
                  </ul>
                  <button onClick={() => navigate('/auth/signup/host')} className="bg-orange-500 text-white px-12 py-6 rounded-[32px] font-black text-lg hover:bg-orange-600 transition-all shadow-2xl active:scale-95 flex items-center gap-4">
                    ホスト資料を請求する <ChevronRight size={24} />
                  </button>
               </div>
            </div>
          </div>
        </section>

        {/* 3. Office / Franchise Section */}
        <section id="fc" className="scroll-mt-32">
           <div className="max-w-4xl mx-auto text-center space-y-12">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[32px] flex items-center justify-center mx-auto shadow-inner"><Briefcase size={40}/></div>
              <div>
                 <h2 className="text-5xl font-black text-slate-900 tracking-tighter">事務所・エージェンシー加盟</h2>
                 <p className="text-gray-400 font-bold uppercase tracking-[0.4em] mt-4 text-xs">Build your own wellness network</p>
              </div>
              <p className="text-gray-500 text-xl font-bold leading-relaxed max-w-2xl mx-auto">
                地域の雇用を創出し、セラピストのマネジメントを通じて安定したストック収入を構築。
                本部のオペレーションシステムをそのまま活用できます。
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="bg-white p-10 rounded-[56px] border border-gray-100 shadow-sm text-left group hover:shadow-xl transition-all">
                    <h4 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">認定オフィス制度</h4>
                    <p className="text-sm text-gray-500 font-bold leading-relaxed mb-8">複数のセラピストを抱える事業者向け。管理画面を提供し、稼働と給与計算を自動化します。</p>
                    <button onClick={() => navigate('/auth/signup/office')} className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">More Details <ArrowRight size={14}/></button>
                 </div>
                 <div className="bg-indigo-900 p-10 rounded-[56px] shadow-2xl text-left relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-[80px] opacity-10"></div>
                    <h4 className="text-2xl font-black text-white mb-4">エリア・独占パートナー</h4>
                    <p className="text-sm text-indigo-200 font-bold leading-relaxed mb-8">特定エリアのCARE CUBE展開権を保有。地域密着型の高収益モデルを構築します。</p>
                    <button className="bg-white text-indigo-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest group-hover:bg-teal-400 group-hover:text-white transition-all">事業説明会を予約</button>
                 </div>
              </div>
           </div>
        </section>

      </div>
    </PortalLayout>
  );
};

const StatItem = ({ label, val, sub }: any) => (
  <div className="space-y-1">
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
    <p className="text-4xl font-black text-slate-900 tracking-tighter">
      {val}<span className="text-sm ml-1 font-bold text-gray-300">{sub}</span>
    </p>
  </div>
);

const BenefitCard = ({ icon, title, desc }: any) => (
  <div className="space-y-3 group">
    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-inner">
       {React.cloneElement(icon as React.ReactElement, { size: 24 })}
    </div>
    <h4 className="font-black text-slate-900 tracking-tight">{title}</h4>
    <p className="text-xs font-bold text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

const BenefitList = ({ icon, text }: any) => (
  <li className="flex items-center gap-4 font-bold text-gray-300 text-lg">
     <div className="flex-shrink-0">{icon}</div>
     <span>{text}</span>
  </li>
);

export default RecruitPage;
