
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from './PortalLayout';
// Added CheckCircle to imports to fix missing component error
import { ShieldCheck, MapPin, Home, Star, Clock, Heart, Zap, Award, Briefcase, TrendingUp, Box, Leaf, ShieldAlert, Move, Layers, Building2, CheckCircle } from 'lucide-react';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PortalLayout>
      {/* ヒーローセクション */}
      <div className="bg-gradient-to-b from-teal-50 to-white pt-32 pb-20 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-8 text-center">
          <span className="text-teal-600 font-bold text-base mb-6 block">私たちのビジョン</span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-10 leading-tight">
            ウェルネスを、<br/>
            <span className="text-teal-600">もっと身近で、自由なインフラへ。</span>
          </h1>
          <p className="text-gray-600 leading-relaxed text-xl font-medium max-w-3xl mx-auto">
            私たちは、独自のスマートブース「CARE CUBE」と<br className="hidden md:block"/>
            高度なマッチングテクノロジーにより、<br className="hidden md:block"/>
            あらゆる場所を最高のウェルネス・スポットへと変革します。
          </p>
        </div>
      </div>

      {/* 三者共栄のビジネスモデル */}
      <section className="py-32 bg-white max-w-6xl mx-auto px-8">
        <div className="text-center mb-24 space-y-6">
           <h2 className="text-5xl font-black text-gray-900">三者共栄のビジネスモデル</h2>
           <p className="text-gray-500 max-w-2xl mx-auto font-bold text-base">
              ハードウェアとソフトウェアの統合による持続可能な成長
           </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-10">
          {/* 利用者 */}
          <div className="bg-gray-50 p-12 rounded-3xl border-2 border-gray-100 shadow-lg space-y-8 group hover:bg-white hover:shadow-2xl hover:border-teal-200 transition-all duration-500">
            <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Zap size={40} />
            </div>
            <h3 className="text-3xl font-black text-gray-900">1. 利用者</h3>
            <p className="text-gray-600 text-base leading-relaxed font-medium">
              客室や自宅に人を招く抵抗感を解消。<br />
              身近な「CARE CUBE」で、プロの施術を、<br />
              事前決済・最短1分の予約で体験できます。
            </p>
            <ul className="text-sm text-gray-600 space-y-3 font-bold">
              <li className="flex items-center gap-3">
                <CheckCircle size={20} className="text-teal-500 flex-shrink-0"/> 
                完全なプライバシー確保
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle size={20} className="text-teal-500 flex-shrink-0"/> 
                キャッシュレス決済
              </li>
            </ul>
          </div>

          {/* セラピスト */}
          <div className="bg-gray-50 p-12 rounded-3xl border-2 border-gray-100 shadow-lg space-y-8 group hover:bg-white hover:shadow-2xl hover:border-indigo-200 transition-all duration-500">
            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Award size={40} />
            </div>
            <h3 className="text-3xl font-black text-gray-900">2. セラピスト</h3>
            <p className="text-gray-600 text-base leading-relaxed font-medium">
              固定店舗を持つリスクなく、<br />
              空き時間を最大限に収益化。<br />
              移動効率を飛躍的に高めることが可能です。
            </p>
            <ul className="text-sm text-gray-600 space-y-3 font-bold">
              <li className="flex items-center gap-3">
                <CheckCircle size={20} className="text-indigo-500 flex-shrink-0"/> 
                業界最大級 65~75% の還元
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle size={20} className="text-indigo-500 flex-shrink-0"/> 
                AI音声安全監視システム
              </li>
            </ul>
          </div>

          {/* ホスト */}
          <div className="bg-gray-50 p-12 rounded-3xl border-2 border-gray-100 shadow-lg space-y-8 group hover:bg-white hover:shadow-2xl hover:border-orange-200 transition-all duration-500">
            <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Building2 size={40} />
            </div>
            <h3 className="text-3xl font-black text-gray-900">3. 施設ホスト</h3>
            <p className="text-gray-600 text-base leading-relaxed font-medium">
              遊休スペースに、高単価な収益源を即座に構築。<br />
              「家具」扱いのブース設置により、<br />
              建築・消防法の手間を最小限に。
            </p>
            <ul className="text-sm text-gray-600 space-y-3 font-bold">
              <li className="flex items-center gap-3">
                <CheckCircle size={20} className="text-orange-500 flex-shrink-0"/> 
                消防法クリア（家具扱い）
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle size={20} className="text-orange-500 flex-shrink-0"/> 
                完全無人運用・集客不要
              </li>
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
