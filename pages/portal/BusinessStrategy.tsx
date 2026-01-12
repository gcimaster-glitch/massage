
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
      <div className="bg-[#0F172A] text-white pt-32 pb-20 overflow-hidden relative">
        {/* 背景装飾 */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(20,184,166,0.15),transparent_70%)]"></div>
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px]"></div>

        <div className="max-w-6xl mx-auto px-8 relative z-10">
          {/* ヒーローセクション */}
          <div className="space-y-10 mb-32">
             <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-8 py-3 rounded-full backdrop-blur-xl">
                <Sparkles size={20} className="text-teal-400" />
                <span className="text-sm font-bold tracking-wider">事業戦略</span>
             </div>
             
             <h1 className="text-5xl md:text-7xl font-black leading-tight">
               癒やしを、<br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-blue-400 to-indigo-400">
                 もっと身近に。
               </span>
             </h1>
             
             <p className="text-slate-300 text-xl md:text-2xl max-w-3xl leading-relaxed">
               場所の制約を取り払い、<br />
               安心できる環境を、AIの力で実現します。
             </p>
          </div>

          {/* コンテンツグリッド */}
          <div className="grid lg:grid-cols-12 gap-10">
            
            {/* 1. CARE CUBE */}
            <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-3xl p-10 md:p-12 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-16 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                  <Cpu size={240} />
               </div>
               
               <div className="relative z-10 space-y-10">
                  <div className="space-y-6">
                     <h3 className="text-3xl md:text-4xl font-black flex items-center gap-4 leading-tight">
                        <BoxIcon className="text-teal-400" size={40} /> 
                        CARE CUBE
                     </h3>
                     <p className="text-slate-300 text-lg md:text-xl leading-relaxed">
                        建築物ではなく「家具」として設置。<br />
                        消防法・建築基準法をクリアしながら、<br />
                        最短数日で都心の一等地に施術空間を作ります。
                     </p>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-8">
                     <FeatureItem 
                        title="環境制御" 
                        desc="空調・照明・アロマを自動で最適化" 
                     />
                     <FeatureItem 
                        title="低コスト導入" 
                        desc="建築確認不要で導入費用を80%削減" 
                     />
                     <FeatureItem 
                        title="無人運用" 
                        desc="スマートロックとAI監視で完全自動化" 
                     />
                  </div>
               </div>
            </div>

            {/* 2. AI見守り */}
            <div className="lg:col-span-4 bg-gradient-to-br from-rose-600 to-pink-700 rounded-3xl p-10 md:p-12 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               
               <h3 className="text-2xl md:text-3xl font-black mb-8 flex items-center gap-3">
                  <Radio className="animate-pulse" size={32} /> 
                  AI見守り
               </h3>
               
               <div className="space-y-8">
                  <p className="text-lg font-bold leading-relaxed">
                    密室での不安を解消。<br />
                    AIが音声を常時監視し、<br />
                    異常を瞬時に検知します。
                  </p>
                  
                  <div className="p-8 bg-black/20 rounded-2xl border border-white/10">
                     <div className="flex gap-1.5 items-end h-10 mb-6">
                        {Array.from({ length: 12 }).map((_, i) => (
                           <div 
                              key={i} 
                              className="w-1.5 bg-white/40 rounded-full animate-pulse" 
                              style={{ 
                                 height: `${20+Math.random()*80}%`,
                                 animationDelay: `${i * 0.1}s`
                              }}
                           ></div>
                        ))}
                     </div>
                     <p className="text-xs font-bold text-white/60">リアルタイム解析中</p>
                  </div>
               </div>
            </div>

            {/* 3. 収益分配 */}
            <div className="lg:col-span-12 bg-white rounded-3xl p-10 md:p-16 text-slate-900 shadow-2xl">
               <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
                  <div className="space-y-6">
                     <h3 className="text-4xl md:text-5xl font-black leading-tight">
                        三者が得する<br />経済モデル
                     </h3>
                     <p className="text-slate-600 font-bold text-xl leading-relaxed">
                        セラピスト・ホスト・プラットフォームの<br />
                        みんなが幸せになる仕組み
                     </p>
                  </div>
                  
                  <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 flex items-center gap-10">
                     <div className="text-center">
                        <p className="text-xs font-bold text-slate-500 mb-2">平均単価</p>
                        <p className="text-4xl font-black">¥10,000</p>
                     </div>
                     <div className="h-12 w-px bg-slate-300"></div>
                     <div className="text-center">
                        <p className="text-xs font-bold text-slate-500 mb-2">手数料率</p>
                        <p className="text-4xl font-black text-teal-600">15%</p>
                     </div>
                  </div>
               </div>

               <div className="grid md:grid-cols-3 gap-10 mb-16">
                  <WinBox 
                     icon={<Users className="text-indigo-600" />} 
                     role="セラピスト" 
                     split="65~75%" 
                     value="店舗維持費ゼロで独立。高い収益率を実現" 
                  />
                  <WinBox 
                     icon={<Building2 className="text-orange-500" />} 
                     role="ホスト" 
                     split="20~30%" 
                     value="遊休スペースが自動で収益化。完全無人運営" 
                  />
                  <WinBox 
                     icon={<Globe className="text-teal-600" />} 
                     role="プラットフォーム" 
                     split="10~15%" 
                     value="インフラ提供、集客代行、安全保障を担当" 
                  />
               </div>

               {/* 比較表 */}
               <div className="bg-slate-50 rounded-2xl p-10 border border-slate-200">
                  <h4 className="text-3xl font-black mb-10 text-center">従来モデルとの比較</h4>
                  
                  <div className="overflow-x-auto">
                     <table className="w-full">
                        <thead>
                           <tr className="border-b-2 border-slate-300">
                              <th className="text-left py-6 px-8 font-black text-slate-900 text-lg">項目</th>
                              <th className="text-center py-6 px-8 font-black text-slate-500 text-lg">従来の店舗型</th>
                              <th className="text-center py-6 px-8 font-black text-teal-600 text-lg">このサービス</th>
                           </tr>
                        </thead>
                        <tbody>
                           <ComparisonRow 
                              item="初期投資" 
                              traditional="500~1000万円" 
                              soothe="0円" 
                           />
                           <ComparisonRow 
                              item="セラピスト収益率" 
                              traditional="40~50%" 
                              soothe="65~75%" 
                           />
                           <ComparisonRow 
                              item="月額固定費" 
                              traditional="30~50万円" 
                              soothe="0円" 
                           />
                           <ComparisonRow 
                              item="集客コスト" 
                              traditional="自己負担" 
                              soothe="プラットフォーム負担" 
                           />
                           <ComparisonRow 
                              item="安全対策" 
                              traditional="スタッフ常駐" 
                              soothe="AI監視（自動）" 
                           />
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>

            {/* 4. 事務所モデル */}
            <div className="lg:col-span-12 bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-3xl p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(20,184,166,0.2),transparent_50%)] opacity-50"></div>
               
               <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                  <div className="space-y-10">
                     <div className="space-y-6">
                        <span className="bg-teal-500 text-white px-6 py-3 rounded-full text-sm font-bold">
                           成長戦略
                        </span>
                        <h3 className="text-4xl md:text-5xl font-black leading-tight">
                           認定事務所モデルで<br />急成長を実現
                        </h3>
                     </div>
                     
                     <p className="text-indigo-100 text-xl font-bold leading-relaxed">
                        既存の店舗やエージェントが「認定事務所」として参画。<br />
                        日本特有の派遣・管理文化を活かし、供給力を一気に拡大します。
                     </p>
                     
                     <ul className="space-y-5">
                        <CheckListItem text="専用管理パネルで運営を簡単に" />
                        <CheckListItem text="給与計算や分配を自動化" />
                        <CheckListItem text="本部から優先案件を配信" />
                     </ul>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                     <div className="bg-white/10 backdrop-blur-xl p-10 rounded-2xl border border-white/10 flex flex-col justify-between h-72 shadow-2xl">
                        <Briefcase size={40} className="text-teal-400" />
                        <div>
                           <h4 className="text-5xl font-black tabular-nums mb-2">48</h4>
                           <p className="text-sm font-bold text-white/60">提携事務所数</p>
                        </div>
                     </div>
                     <div className="bg-white/10 backdrop-blur-xl p-10 rounded-2xl border border-white/10 flex flex-col justify-between h-72 mt-12 shadow-2xl">
                        <Zap size={40} className="text-orange-400" />
                        <div>
                           <h4 className="text-5xl font-black tabular-nums mb-2">1,200</h4>
                           <p className="text-sm font-bold text-white/60">稼働セラピスト</p>
                        </div>
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
  <div className="space-y-4">
     <h4 className="font-black text-white text-xl">{title}</h4>
     <p className="text-sm font-medium text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

const WinBox = ({ icon, role, split, value }: any) => (
  <div className="p-10 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-8 group hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-500">
     <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-slate-100 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon as React.ReactElement, { size: 36 })}
     </div>
     <div className="space-y-5">
        <div className="flex justify-between items-end gap-4">
           <h4 className="text-2xl font-black text-slate-900">{role}</h4>
           <span className="text-3xl font-black text-teal-600 tabular-nums">{split}</span>
        </div>
        <p className="text-base font-bold text-slate-600 leading-relaxed border-l-4 border-slate-300 pl-5">{value}</p>
     </div>
  </div>
);

const CheckListItem = ({ text }: { text: string }) => (
  <li className="flex items-start gap-4 text-indigo-100 font-bold text-lg">
     <CheckCircle2 size={24} className="text-teal-400 mt-1 flex-shrink-0" />
     <span>{text}</span>
  </li>
);

const ComparisonRow = ({ item, traditional, soothe }: { item: string, traditional: string, soothe: string }) => (
  <tr className="border-b border-slate-200 hover:bg-slate-100 transition-colors">
     <td className="py-6 px-8 font-bold text-slate-900 text-lg">{item}</td>
     <td className="py-6 px-8 text-center">
        <div className="flex items-center justify-center gap-3">
           <X size={20} className="text-red-400 flex-shrink-0" />
           <span className="font-semibold text-slate-500 text-base">{traditional}</span>
        </div>
     </td>
     <td className="py-6 px-8 text-center">
        <div className="flex items-center justify-center gap-3">
           <Check size={20} className="text-teal-600 flex-shrink-0" />
           <span className="font-bold text-teal-600 text-lg">{soothe}</span>
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
