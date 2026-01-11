
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Zap, ArrowRight, ShieldCheck, Heart, Sparkles, Clock, Star } from 'lucide-react';

const SubscriptionPlans: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('STANDARD');

  const plans = [
    { id: 'LIGHT', name: 'ライトプラン', price: '4,900', desc: '月1回のメンテナンスに', benefits: ['月1回 60分チケット', 'CARE CUBE利用料 10%OFF', 'セラピスト優先マッチング'], color: 'text-gray-900', bg: 'bg-white' },
    { id: 'STANDARD', name: 'スタンダード', price: '12,000', desc: '一番人気の定期ケア', benefits: ['月3回 60分チケット', 'CARE CUBE利用料 無料', '特定セラピスト指名料 50%OFF', '24時間優先サポート'], color: 'text-white', bg: 'bg-teal-600', popular: true },
    { id: 'PREMIUM', name: 'プレミアム', price: '28,000', desc: '最高峰のリカバリー体験', benefits: ['通い放題 (月8回まで)', '全CARE CUBE利用無料', '最高ランクスタッフ確約', 'ギフトチケット月1回分付与'], color: 'text-white', bg: 'bg-gray-900' },
  ];

  return (
    <div className="space-y-12 pb-40 animate-fade-in text-gray-900 font-sans max-w-6xl mx-auto px-4 pt-10">
      <div className="text-center space-y-6">
         <span className="inline-block bg-teal-50 text-teal-600 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.4em] border border-teal-100 shadow-sm mb-4">Soothe Pass</span>
         <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">癒やしを、日常のインフラへ。</h1>
         <p className="text-gray-500 font-bold text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            サブスクリプションなら、もっと手軽に、もっとお得に。<br className="hidden md:block"/>
            あなたのライフスタイルに最適な「休養」の習慣を。
         </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 pt-10">
        {plans.map(plan => (
          <div 
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`rounded-[56px] p-10 flex flex-col justify-between border-4 transition-all duration-500 cursor-pointer relative overflow-hidden group ${
              selectedPlan === plan.id ? 'border-teal-400 scale-105 shadow-2xl' : 'border-white bg-white shadow-sm hover:border-teal-100'
            } ${plan.bg} ${plan.color}`}
          >
             {plan.popular && (
               <div className="absolute top-8 right-8 bg-teal-400 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl animate-pulse">Most Popular</div>
             )}
             
             <div>
                <div className="mb-8">
                   <h3 className="text-2xl font-black tracking-tight mb-2">{plan.name}</h3>
                   <p className={`text-sm font-bold opacity-70`}>{plan.desc}</p>
                </div>
                
                <div className="flex items-baseline gap-1 mb-10">
                   <span className="text-[11px] font-black uppercase opacity-60">JPY</span>
                   <span className="text-5xl font-black tracking-tighter">¥{plan.price}</span>
                   <span className="text-sm font-bold opacity-50">/ month</span>
                </div>

                <ul className="space-y-5">
                   {plan.benefits.map((b, i) => (
                     <li key={i} className="flex items-start gap-4">
                        <CheckCircle2 className={`${plan.id === 'STANDARD' ? 'text-teal-200' : 'text-teal-500'} shrink-0`} size={20} />
                        <span className="text-sm font-bold leading-tight opacity-90">{b}</span>
                     </li>
                   ))}
                </ul>
             </div>

             <button className={`w-full mt-12 py-6 rounded-[32px] font-black text-sm uppercase tracking-widest transition-all ${
               plan.id === 'STANDARD' ? 'bg-white text-teal-700 hover:bg-teal-50 shadow-xl' :
               plan.id === 'PREMIUM' ? 'bg-teal-600 text-white hover:bg-teal-500 shadow-xl' :
               'bg-gray-900 text-white hover:bg-teal-600 shadow-lg'
             }`}>
                {selectedPlan === plan.id ? 'このプランで継続' : 'プランを選択'}
             </button>
          </div>
        ))}
      </div>

      <div className="bg-indigo-900 text-white p-12 rounded-[64px] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 border-b-[16px] border-indigo-950">
         <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500 rounded-full blur-[120px] opacity-10"></div>
         <div className="relative z-10 space-y-6 max-w-xl">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-teal-400 shadow-inner"><ShieldCheck size={28}/></div>
               <h3 className="text-3xl font-black tracking-tighter italic">Corporate Wellness Program</h3>
            </div>
            <p className="text-lg font-bold text-indigo-100 leading-relaxed opacity-90">
               企業の福利厚生としてSootheを導入しませんか？<br/>
               社員の健康維持（肩こり・腰痛ケア）は、生産性向上の鍵となります。
            </p>
         </div>
         <button className="relative z-10 bg-white text-indigo-900 px-12 py-6 rounded-[32px] font-black text-lg hover:bg-teal-400 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center gap-4">
            法人契約のご相談はこちら <ArrowRight size={24}/>
         </button>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
