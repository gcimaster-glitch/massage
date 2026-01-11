
import React, { useEffect, useState } from 'react';
import PortalLayout from './PortalLayout';
import { 
  BarChart3, Zap, ShieldCheck, Users, Building2, 
  ArrowUpRight, PieChart, Smartphone, Globe, 
  Cpu, Heart, Briefcase, CheckCircle2, Sparkles, Move, Layers, Radio, X, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BusinessStrategy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PortalLayout>
      <div className="bg-[#0F172A] text-white pt-40 pb-32 overflow-hidden relative">
        {/* 背景装飾 */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(20,184,166,0.15),transparent_70%)]"></div>
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px]"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="space-y-8 mb-24">
             <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2.5 rounded-full backdrop-blur-xl animate-fade-in shadow-2xl">
                <Sparkles size={18} className="text-teal-400" />
                <span className="text-xs font-black uppercase tracking-[0.4em]">Business Ecosystem & Strategy v4.5</span>
             </div>
             <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9]">
               癒やしを、<br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-indigo-300 to-orange-400">都市のインフラへ。</span>
             </h1>
             <p className="text-slate-400 text-lg md:text-2xl max-w-3xl font-medium leading-relaxed">
               ハードウェア（CARE CUBE）とAI（Gemini Sentinel）を統合。<br/>
               日本の「場所の制限」と「安全の懸念」をテクノロジーで解体します。
             </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* 1. Core Model: CARE CUBE Advantage */}
            <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-[64px] p-12 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                  <Cpu size={240} />
               </div>
               <div className="relative z-10 space-y-12">
                  <div className="space-y-4">
                     <h3 className="text-3xl font-black flex items-center gap-4">
                        <BoxIcon className="text-teal-400" size={32} /> 
                        CARE CUBE: 高速展開 IaaS モデル
                     </h3>
                     <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
                        建築物ではなく「家具」としての設置。消防法・建築基準法をクリアしながら、最短数日で都心部の一等地にプライベート施術空間を創出します。
                     </p>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                     <FeatureItem title="IoT 環境制御" desc="空調・アロマ・照明・BGMをアプリから自動同期" />
                     <FeatureItem title="家具ステータス" desc="建築確認不要。ホテル・オフィスへの導入コストを80%削減" />
                     <FeatureItem title="無人運用" desc="スマートキーとAI監視により、管理スタッフの常駐を排除" />
                  </div>
               </div>
            </div>

            {/* 2. Safety Tech: Sentinel AI */}
            <div className="lg:col-span-4 bg-gradient-to-br from-red-600 to-rose-700 rounded-[64px] p-12 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><Radio className="animate-pulse" /> Sentinel AI</h3>
               <div className="space-y-6">
                  <p className="font-bold leading-relaxed">
                    「密室リスク」の完全解消。Gemini Live APIによる常時音声監視が、暴力・ハラスメント・規約違反をミリ秒単位で検知。
                  </p>
                  <div className="p-6 bg-black/20 rounded-[32px] border border-white/10">
                     <div className="flex gap-1 items-end h-8 mb-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                           <div key={i} className="w-1 bg-white/40 rounded-full animate-pulse" style={{ height: `${20+Math.random()*80}%` }}></div>
                        ))}
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Semantic Analysis Active</p>
                  </div>
               </div>
            </div>

            {/* 3. Revenue Flow (Economic Loop) */}
            <div className="lg:col-span-12 bg-white rounded-[64px] p-12 md:p-16 text-slate-900 shadow-2xl">
               <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-20">
                  <div className="space-y-4">
                     <h3 className="text-4xl font-black tracking-tighter">Tri-Win 経済圏の構築</h3>
                     <p className="text-slate-500 font-bold text-lg">各ステークホルダーに最適化された収益分配システム</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex items-center gap-8">
                     <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Average GMV</p>
                        <p className="text-3xl font-black">¥10,000</p>
                     </div>
                     <div className="h-10 w-px bg-slate-200"></div>
                     <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fee Rate</p>
                        <p className="text-3xl font-black text-teal-600">15.0%</p>
                     </div>
                  </div>
               </div>

               <div className="grid md:grid-cols-3 gap-12 relative mb-20">
                  <div className="hidden md:block absolute top-1/2 left-[30%] right-[30%] h-1 border-t-4 border-dashed border-slate-100 -translate-y-1/2"></div>
                  <WinBox icon={<Users className="text-indigo-600" />} role="Therapists" split="65~75%" value="店舗維持費0で独立、高還元率を実現" />
                  <WinBox icon={<Building2 className="text-orange-500" />} role="Space Hosts" split="20~30%" value="遊休資産の自動収益化、完全無人運営" />
                  <WinBox icon={<Globe className="text-teal-600" />} role="Platform" split="10~15%" value="インフラ提供、集客代行、安全保障" />
               </div>

               {/* 比較表を追加 */}
               <div className="bg-slate-50 rounded-[48px] p-10 border border-slate-100">
                  <h4 className="text-2xl font-black mb-8 text-center">従来モデルとの比較</h4>
                  <div className="overflow-x-auto">
                     <table className="w-full">
                        <thead>
                           <tr className="border-b-2 border-slate-200">
                              <th className="text-left py-4 px-6 font-black text-slate-900">項目</th>
                              <th className="text-center py-4 px-6 font-black text-slate-400">従来の店舗型</th>
                              <th className="text-center py-4 px-6 font-black text-teal-600">Soothe Model</th>
                           </tr>
                        </thead>
                        <tbody>
                           <ComparisonRow 
                              item="初期投資" 
                              traditional="500-1000万円" 
                              soothe="0円" 
                              isGood={true}
                           />
                           <ComparisonRow 
                              item="セラピスト収益率" 
                              traditional="40-50%" 
                              soothe="65-75%" 
                              isGood={true}
                           />
                           <ComparisonRow 
                              item="固定費/月" 
                              traditional="30-50万円" 
                              soothe="0円" 
                              isGood={true}
                           />
                           <ComparisonRow 
                              item="集客コスト" 
                              traditional="自己負担" 
                              soothe="プラットフォーム負担" 
                              isGood={true}
                           />
                           <ComparisonRow 
                              item="安全対策" 
                              traditional="スタッフ常駐" 
                              soothe="AI監視（自動）" 
                              isGood={true}
                           />
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>

            {/* 4. Multi-Agency Strategy */}
            <div className="lg:col-span-12 bg-indigo-900 rounded-[64px] p-12 md:p-16 text-white relative overflow-hidden border-b-[16px] border-indigo-950">
               <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(20,184,166,0.2),transparent_50%)] opacity-50"></div>
               <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
                  <div className="space-y-10">
                     <div className="space-y-4">
                        <span className="bg-teal-500 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Growth Engine</span>
                        <h3 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">認定事務所（Agency）モデルによる多層的成長</h3>
                     </div>
                     <p className="text-indigo-100 text-lg font-bold leading-relaxed">日本特有の「人材派遣・管理」の文化をシステム化。既存の店舗やエージェントが「認定事務所」として参画し、供給力を爆発的に向上させます。</p>
                     <ul className="space-y-4">
                        <CheckListItem text="事務所専用管理パネルによる高度な運行管理" />
                        <CheckListItem text="セラピストの二次分配・給与計算の自動化" />
                        <CheckListItem text="本部からの優先案件配信と教育プログラム提供" />
                     </ul>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[48px] border border-white/10 flex flex-col justify-between h-64 shadow-2xl">
                        <Briefcase size={32} className="text-teal-400" />
                        <h4 className="text-4xl font-black tabular-nums">48 <span className="text-sm font-bold opacity-40">Agencies</span></h4>
                        <p className="text-xs font-bold opacity-60">提携済み事務所数</p>
                     </div>
                     <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[48px] border border-white/10 flex flex-col justify-between h-64 mt-12 shadow-2xl">
                        <Zap size={32} className="text-orange-400" />
                        <h4 className="text-4xl font-black tabular-nums">1.2k <span className="text-sm font-bold opacity-40">Active</span></h4>
                        <p className="text-xs font-bold opacity-60">稼働プロフェッショナル</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

const FeatureItem = ({ title, desc }: any) => (
  <div className="space-y-3">
     <h4 className="font-black text-white text-lg">{title}</h4>
     <p className="text-xs font-bold text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

const WinBox = ({ icon, role, split, value }: any) => (
  <div className="p-10 bg-slate-50 rounded-[48px] border border-slate-100 space-y-8 group hover:bg-white hover:shadow-2xl hover:scale-105 transition-all duration-500">
     <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
        {React.cloneElement(icon as React.ReactElement, { size: 32 })}
     </div>
     <div className="space-y-4">
        <div className="flex justify-between items-end">
           <h4 className="text-xl font-black text-slate-900">{role}</h4>
           <span className="text-2xl font-black text-teal-600 tabular-nums">{split}</span>
        </div>
        <p className="text-sm font-bold text-slate-500 leading-relaxed italic border-l-4 border-slate-200 pl-4">{value}</p>
     </div>
  </div>
);

const CheckListItem = ({ text }: { text: string }) => (
  <li className="flex items-center gap-4 text-indigo-200 font-bold">
     <CheckCircle2 size={20} className="text-teal-400" />
     <span>{text}</span>
  </li>
);

const ComparisonRow = ({ item, traditional, soothe, isGood }: { item: string, traditional: string, soothe: string, isGood: boolean }) => (
  <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
     <td className="py-5 px-6 font-bold text-slate-900">{item}</td>
     <td className="py-5 px-6 text-center">
        <div className="flex items-center justify-center gap-2">
           <X size={16} className="text-red-400" />
           <span className="font-semibold text-slate-500">{traditional}</span>
        </div>
     </td>
     <td className="py-5 px-6 text-center">
        <div className="flex items-center justify-center gap-2">
           <Check size={16} className="text-teal-600" />
           <span className="font-bold text-teal-600">{soothe}</span>
        </div>
     </td>
  </tr>
);

const BoxIcon = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

export default BusinessStrategy;
