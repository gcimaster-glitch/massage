
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from './PortalLayout';
// Added CheckCircle to imports to fix missing component error
import { ShieldCheck, MapPin, Home, Star, Clock, Heart, Zap, Award, Briefcase, TrendingUp, Box, Leaf, ShieldAlert, Move, Layers, Building2, CheckCircle } from 'lucide-react';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PortalLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-teal-50 to-white py-24 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-teal-600 font-bold tracking-widest uppercase text-sm mb-4 block">Our Vision</span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
            ウェルネスを、<br/>
            <span className="text-teal-600 text-3xl md:text-4xl">もっと身近で、自由なインフラへ。</span>
          </h1>
          <p className="text-gray-600 leading-relaxed text-lg font-medium">
            私たちは、独自のスマートブース「CARE CUBE」と高度なマッチングテクノロジーにより、<br className="hidden md:block"/>あらゆる場所を最高のウェルネス・スポットへと変革します。
          </p>
        </div>
      </div>

      {/* Tri-Win Business Model */}
      <section className="py-24 bg-white max-w-7xl mx-auto px-4">
        <div className="text-center mb-20 space-y-4">
           <h2 className="text-4xl font-black text-gray-900 tracking-tighter">三者共栄（Tri-Win）の事業モデル</h2>
           <p className="text-gray-500 max-w-2xl mx-auto font-bold uppercase tracking-widest text-xs">Sustainability through Hardware & Software Integration</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          {/* User */}
          <div className="bg-gray-50 p-10 rounded-[56px] border border-gray-100 shadow-sm space-y-6 group hover:bg-white hover:shadow-2xl transition-all duration-500">
            <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <Zap size={32} />
            </div>
            <h3 className="text-2xl font-black text-gray-900">1. 利用者 (User)</h3>
            <p className="text-gray-600 text-sm leading-relaxed font-bold">
              客室や自宅に人を招く抵抗感を解消。身近な「CARE CUBE」で、国家資格者を含むプロの施術を、事前決済・最短1分の予約で体験できます。
            </p>
            <ul className="text-[11px] text-gray-400 space-y-2 font-black uppercase tracking-widest">
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-teal-500"/> 完全なプライバシー確保</li>
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-teal-500"/> キャッシュレス決済</li>
            </ul>
          </div>

          {/* Therapist */}
          <div className="bg-gray-50 p-10 rounded-[56px] border border-gray-100 shadow-sm space-y-6 group hover:bg-white hover:shadow-2xl transition-all duration-500">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <Award size={32} />
            </div>
            <h3 className="text-2xl font-black text-gray-900">2. セラピスト (Therapist)</h3>
            <p className="text-gray-600 text-sm leading-relaxed font-bold">
              固定店舗を持つリスクなく、空き時間を最大限に収益化。「CARE CUBE」拠点を活用することで、移動効率を飛躍的に高めることが可能です。
            </p>
            <ul className="text-[11px] text-gray-400 space-y-2 font-black uppercase tracking-widest">
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-500"/> 業界最大級 65%〜75% の還元</li>
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-indigo-500"/> AI音声安全監視システム</li>
            </ul>
          </div>

          {/* Host */}
          <div className="bg-gray-50 p-10 rounded-[56px] border border-gray-100 shadow-sm space-y-6 group hover:bg-white hover:shadow-2xl transition-all duration-500">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <Building2 size={32} />
            </div>
            <h3 className="text-2xl font-black text-gray-900">3. 施設ホスト (Host)</h3>
            <p className="text-gray-600 text-sm leading-relaxed font-bold">
              ホテルの廊下や遊休スペースに、高単価な収益源を即座に構築。「家具」扱いのブース設置により、建築・消防法の手間を最小限に。
            </p>
            <ul className="text-[11px] text-gray-400 space-y-2 font-black uppercase tracking-widest">
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-orange-500"/> 消防法クリア(家具扱い)</li>
              <li className="flex items-center gap-2"><CheckCircle size={14} className="text-orange-500"/> 完全無人運用・集客不要</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CORE TECH: CARE CUBE */}
      <section className="py-24 bg-gray-50 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-20 items-center">
           <div className="space-y-10 relative z-10">
              <h2 className="text-4xl font-black text-gray-900 tracking-tighter leading-tight">
                ハードウェアが実現する、<br/><span className="text-teal-600 underline decoration-teal-500/20 underline-offset-8">圧倒的な遍在性。</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed font-medium">
                 CARE CUBEは、独自の設計により「建築物」ではなく「家具」として設置が可能です。これにより、従来の店舗型では数ヶ月かかっていた出店プロセスを数日に短縮。あらゆるビルやホテルが、即座にウェルネス拠点へとアップデートされます。
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                 <div className="p-6 bg-white rounded-3xl border border-gray-100 space-y-3 shadow-sm">
                    <ShieldCheck className="text-teal-500" size={24} />
                    <h4 className="font-black text-gray-900">高強度・サステナブル</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-bold">航空輸送にも使われる強靭な素材を採用。100%リサイクル可能で、環境への配慮とプロの施術に耐える堅牢性を両立。</p>
                 </div>
                 <div className="p-6 bg-white rounded-3xl border border-gray-100 space-y-3 shadow-sm">
                    <Zap className="text-indigo-500" size={24} />
                    <h4 className="font-black text-gray-900">スマート利用体験</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-bold">予約から入室、施術中の環境管理（空調・アロマ・BGM）、決済までをすべてアプリで完結。受付の介在しないシームレスな体験。</p>
                 </div>
              </div>
           </div>
           <div className="relative">
              <div className="aspect-[4/3] rounded-[60px] overflow-hidden shadow-2xl border-8 border-white group">
                 <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-gray-900 text-white p-10 rounded-[48px] shadow-2xl max-w-xs border border-white/10">
                 <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-3">Compliance Insight</p>
                 <h4 className="text-lg font-black leading-tight italic">「店舗」ではなく、<br/>「インフラ」になる。</h4>
                 <p className="text-[11px] text-gray-400 mt-4 leading-relaxed font-bold">
                    CARE CUBEは素材の特性を活かし、短時間での組み立てと自由な移設を可能にしました。だからこそ、需要のある場所へ即座にインフラを提供できるのです。
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* Safety Architecture */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">世界基準の Trust & Safety 構造</h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Technology driven security protocols</p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: <ShieldCheck />, title: "厳格な資格・面談審査", desc: "セラピストは資格証確認と対面面談を100%実施。ユーザーは身分証登録を必須化。" },
            { icon: <MapPin />, title: "リアルタイムGPS監視", desc: "施術中、GPSによりリアルタイムで動態を確認。異常な状況を自動検知。" },
            { icon: <Zap />, title: "Gemini AI 安全監視", desc: "AIがセッション中の音声をモニタリング。トラブルの兆候を検知し即座に警備連携。" },
            { icon: <Award />, title: "国家資格者優遇", desc: "あん摩マッサージ指圧師、柔道整復師等の有資格者を重点的にアサイン。" },
          ].map((item, i) => (
            <div key={i} className="p-8 bg-white rounded-3xl border border-gray-100 text-center space-y-4 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-teal-50 shadow-inner rounded-full flex items-center justify-center mx-auto text-teal-600">{item.icon}</div>
              <h4 className="font-bold text-gray-900">{item.title}</h4>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-teal-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <h2 className="text-4xl font-bold tracking-tighter">ウェルネスの未来を、共に創る。</h2>
          <p className="text-teal-100 text-lg font-medium">利用者、セラピスト、ホスト。すべての皆様の参加をお待ちしています。</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => navigate('/app')} className="bg-white text-teal-700 px-10 py-4 rounded-full font-black text-lg hover:bg-teal-50 transition-all shadow-xl active:scale-95">
              今すぐ予約・体験する
            </button>
            <button onClick={() => navigate('/recruit')} className="bg-teal-700 text-white border border-teal-500 px-10 py-4 rounded-full font-black text-lg hover:bg-teal-800 transition-all shadow-xl active:scale-95">
              パートナーとして参画する
            </button>
          </div>
        </div>
      </section>
    </PortalLayout>
  );
};

export default AboutPage;
