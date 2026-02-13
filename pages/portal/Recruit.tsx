
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PortalLayout from './PortalLayout';
import { CheckCircle, ArrowRight, User, Building2, Briefcase, ChevronRight, Zap, ShieldCheck, Heart, Sparkles, Award, TrendingUp, ChevronLeft, Users, Handshake } from 'lucide-react';

const RecruitPage: React.FC = () => {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const careCubeImages = [
    { src: '/care-cube-lobby.jpg', alt: 'CARE CUBE - ホテルロビー' },
    { src: '/care-cube-office-1.jpg', alt: 'CARE CUBE - オフィス設置例1' },
    { src: '/care-cube-office-2.jpg', alt: 'CARE CUBE - オフィス設置例2' },
    { src: '/care-cube-ryokan-1.jpg', alt: 'CARE CUBE - 旅館設置例1' },
    { src: '/care-cube-ryokan-2.jpg', alt: 'CARE CUBE - 旅館設置例2' },
    { src: '/care-cube-spa.jpg', alt: 'CARE CUBE - スパ・温泉施設' },
    { src: '/care-cube-retail.jpg', alt: 'CARE CUBE - 商業施設' },
    { src: '/care-cube-station.jpg', alt: 'CARE CUBE - 駅ナカ設置例' },
    { src: '/care-cube-corporate.jpg', alt: 'CARE CUBE - 企業オフィス' },
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % careCubeImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + careCubeImages.length) % careCubeImages.length);
  };

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
             <button onClick={() => scrollToSection('office')} className="bg-white text-slate-900 px-10 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-teal-400 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center gap-3">
               <Briefcase size={20} /> セラピストオフィス募集
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
            <StatItem label="提携オフィス" val="120+" sub="社" />
            <StatItem label="登録セラピスト" val="1,200+" sub="名" />
            <StatItem label="設置ブース (CUBE)" val="450+" sub="拠点" />
            <StatItem label="平均還元率" val="70" sub="%" />
         </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-32 space-y-48">
        
        {/* 1. Office / Agency Section — NEW: セラピストはオフィス経由で活動 */}
        <section id="office" className="scroll-mt-32">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
               <div>
                  <span className="bg-teal-50 text-teal-600 px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-6 inline-block border border-teal-100">For Therapist Offices & Agencies</span>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                    あなたの事務所を、<br/>
                    <span className="text-teal-600 underline decoration-teal-500/20 underline-offset-8">全国区のブランドへ。</span>
                  </h2>
               </div>
               <p className="text-gray-500 text-xl font-bold leading-relaxed italic">
                 セラピストの採用・管理・配信を、HOGUSYプラットフォーム上で一元化。<br/>
                 集客も、決済も、安全管理も、すべて本部がサポートします。
               </p>
               <div className="grid sm:grid-cols-2 gap-8">
                  <BenefitCard icon={<Users />} title="セラピスト管理機能" desc="所属セラピストの稼働管理、シフト管理、給与計算を自動化。管理コストを大幅削減。" />
                  <BenefitCard icon={<ShieldCheck />} title="Gemini ライブ安全監視" desc="全施術にAI音声モニタリングを標準装備。あなたの大切なセラピストを守ります。" />
                  <BenefitCard icon={<Zap />} title="集客はプラットフォーム任せ" desc="HOGUSYのアルゴリズムが最適な顧客を自動マッチング。営業活動は不要です。" />
                  <BenefitCard icon={<TrendingUp />} title="高い還元率" desc="オフィス手数料＋セラピスト取り分で、業界最高水準の70%以上を還元。" />
               </div>

               <div className="bg-teal-50 border border-teal-100 rounded-[32px] p-8 space-y-4">
                  <h4 className="font-black text-teal-800 text-lg flex items-center gap-2"><Handshake size={20} /> こんな事業者の方に最適です</h4>
                  <ul className="space-y-2 text-sm font-bold text-teal-700">
                     <li className="flex items-center gap-2"><CheckCircle size={16} className="text-teal-500 flex-shrink-0" /> 複数のセラピストを雇用・管理している事務所</li>
                     <li className="flex items-center gap-2"><CheckCircle size={16} className="text-teal-500 flex-shrink-0" /> 独立開業したいセラピストチーム</li>
                     <li className="flex items-center gap-2"><CheckCircle size={16} className="text-teal-500 flex-shrink-0" /> 地域のマッサージ・整体サロンのオーナー</li>
                     <li className="flex items-center gap-2"><CheckCircle size={16} className="text-teal-500 flex-shrink-0" /> フリーランスセラピスト（個人事務所として登録可能）</li>
                  </ul>
               </div>

               <button onClick={() => navigate('/auth/signup/office')} className="bg-slate-900 text-white px-12 py-6 rounded-[32px] font-black text-lg hover:bg-teal-600 transition-all shadow-2xl active:scale-95 flex items-center gap-4">
                 オフィスとして登録する <ArrowRight size={24} />
               </button>
            </div>
            <div className="relative">
               <div className="absolute -top-10 -left-10 w-40 h-40 bg-teal-500 rounded-full blur-[80px] opacity-20"></div>
               <div className="rounded-[80px] overflow-hidden shadow-[0_80px_160px_-40px_rgba(0,0,0,0.2)] aspect-[4/5] relative">
                  <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" alt="Therapist working" />
                  <div className="absolute bottom-12 left-12 right-12 bg-white/95 backdrop-blur-xl p-8 rounded-[48px] shadow-2xl">
                     <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-black text-xl">鈴</div>
                        <div>
                           <p className="font-black text-slate-900">リラクゼーション東京 <span className="text-xs font-bold text-gray-400 ml-2">セラピスト12名</span></p>
                           <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Certified Office Partner</p>
                        </div>
                     </div>
                     <p className="text-xs font-bold text-gray-500 italic">「HOGUSYに加盟してから、集客の心配がなくなりました。セラピストの管理も格段にラクに。」</p>
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
                  <div className="relative rounded-[64px] overflow-hidden shadow-2xl aspect-video border-8 border-white/5 group">
                     {/* メイン画像 */}
                     <img 
                       src={careCubeImages[currentImageIndex].src} 
                       className="w-full h-full object-cover transition-all duration-500" 
                       alt={careCubeImages[currentImageIndex].alt} 
                     />
                     
                     {/* 左矢印ボタン */}
                     <button
                       onClick={prevImage}
                       className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
                     >
                       <ChevronLeft size={24} />
                     </button>
                     
                     {/* 右矢印ボタン */}
                     <button
                       onClick={nextImage}
                       className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
                     >
                       <ChevronRight size={24} />
                     </button>
                     
                     {/* インジケーター（ドット） */}
                     <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                       {careCubeImages.map((_, index) => (
                         <button
                           key={index}
                           onClick={() => setCurrentImageIndex(index)}
                           className={`w-2 h-2 rounded-full transition-all ${
                             index === currentImageIndex 
                               ? 'bg-white w-6' 
                               : 'bg-white/40 hover:bg-white/60'
                           }`}
                         />
                       ))}
                     </div>
                     
                     {/* 画像カウンター */}
                     <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
                       {currentImageIndex + 1} / {careCubeImages.length}
                     </div>
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

        {/* 3. Area Partner / Franchise Section */}
        <section id="fc" className="scroll-mt-32">
           <div className="max-w-4xl mx-auto text-center space-y-12">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[32px] flex items-center justify-center mx-auto shadow-inner"><Award size={40}/></div>
              <div>
                 <h2 className="text-5xl font-black text-slate-900 tracking-tighter">エリア・独占パートナー</h2>
                 <p className="text-gray-400 font-bold uppercase tracking-[0.4em] mt-4 text-xs">Exclusive area partnership</p>
              </div>
              <p className="text-gray-500 text-xl font-bold leading-relaxed max-w-2xl mx-auto">
                特定エリアのCARE CUBE展開権を保有し、地域密着型の高収益モデルを構築。
                セラピストオフィスとして加盟後、エリアパートナーへのアップグレードも可能です。
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="bg-white p-10 rounded-[56px] border border-gray-100 shadow-sm text-left group hover:shadow-xl transition-all">
                    <h4 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">フリーランス歓迎</h4>
                    <p className="text-sm text-gray-500 font-bold leading-relaxed mb-8">個人のセラピストも「1人オフィス」として登録可能。管理画面で自分のスケジュール・料金・実績を一元管理できます。</p>
                    <button onClick={() => navigate('/auth/signup/office')} className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">個人で登録する <ArrowRight size={14}/></button>
                 </div>
                 <div className="bg-indigo-900 p-10 rounded-[56px] shadow-2xl text-left relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-[80px] opacity-10"></div>
                    <h4 className="text-2xl font-black text-white mb-4">エリア独占プラン</h4>
                    <p className="text-sm text-indigo-200 font-bold leading-relaxed mb-8">特定エリアのCARE CUBE展開権を独占。地域に根ざした安定収益を構築します。</p>
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
