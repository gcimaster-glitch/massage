
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from './PortalLayout';
import { CheckCircle, DollarSign, TrendingUp, Users, ArrowRight, Link as LinkIcon, PieChart, Sparkles, Zap, ShieldCheck } from 'lucide-react';

const AffiliateRecruit: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PortalLayout>
      <section className="bg-[#0F172A] text-white pt-40 pb-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-12">
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2.5 rounded-full backdrop-blur-xl animate-fade-in shadow-2xl">
             <Sparkles size={18} className="text-purple-400" />
             <span className="text-xs font-black uppercase tracking-[0.4em]">Affiliate Partner Program 2025</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9]">
            その影響力を、<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">ウェルネスの力へ。</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed">
            Soothe アフィリエイトプログラム。紹介したユーザーが予約するたびに、<br className="hidden md:block"/>業界最高水準の成果報酬を継続的にお支払いします。
          </p>
          <div className="flex flex-wrap justify-center gap-6 pt-8">
             <button onClick={() => navigate('/auth/signup/user')} className="bg-white text-slate-950 px-12 py-6 rounded-[32px] font-black text-lg uppercase tracking-widest hover:bg-purple-400 hover:text-white transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95 flex items-center gap-4">
                パートナー申請を開始 <ArrowRight size={24} />
             </button>
          </div>
        </div>
      </section>

      <section className="py-32 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
             <h2 className="text-4xl font-black text-slate-900 tracking-tighter">圧倒的なパートナー・メリット</h2>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">High performance & Seamless tracking</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
             <BenefitItem 
               icon={<DollarSign size={40} />} 
               title="高還元率 5%〜" 
               desc="1件あたりの平均客単価が1万円前後のため、1回の予約で安定した収益が期待できます。リピート予約も成果対象に。" 
             />
             <BenefitItem 
               icon={<TrendingUp size={40} />} 
               title="30日間クッキー有効" 
               desc="リンクをクリックしてから30日以内の予約であれば、たとえその場で購入しなくてもあなたの成果となります。" 
             />
             <BenefitItem 
               icon={<PieChart size={40} />} 
               title="リアルタイム解析" 
               desc="専用ダッシュボードでクリック数、成約率、報酬見込を秒単位で追跡。透明性の高いパートナー体験を提供。" 
             />
          </div>
        </div>
      </section>

      <section className="py-32 bg-slate-50 px-6 border-y border-slate-100">
        <div className="max-w-4xl mx-auto text-center space-y-12">
           <div className="w-20 h-20 bg-indigo-600 text-white rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-600/20"><Zap size={40} /></div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tighter">インフルエンサー・メディア運営者様へ</h2>
           <p className="text-slate-500 text-xl font-bold leading-relaxed">
             ライフスタイル、美容、健康、ビジネス、旅行など、あらゆるカテゴリーのメディアにマッチ。
             「CARE CUBE」という先進的な体験は、あなたのフォロワーに新しい休息の価値を提供します。
           </p>
           <div className="grid sm:grid-cols-2 gap-6 text-left">
              <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex gap-6">
                 <ShieldCheck className="text-green-500 shrink-0" size={28} />
                 <div>
                    <h4 className="font-black text-lg mb-2">審査・登録料 0円</h4>
                    <p className="text-sm text-slate-400 font-bold leading-relaxed">固定費は一切かかりません。審査通過後、最短1時間でリンク発行が可能です。</p>
                 </div>
              </div>
              <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex gap-6">
                 <LinkIcon className="text-indigo-500 shrink-0" size={28} />
                 <div>
                    <h4 className="font-black text-lg mb-2">クリエイティブ提供</h4>
                    <p className="text-sm text-slate-400 font-bold leading-relaxed">SNS投稿、ブログバナー、公式素材写真をダッシュボードからダウンロードできます。</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      <section className="py-40 bg-white text-center">
         <div className="max-w-4xl mx-auto px-6 space-y-10">
            <h2 className="text-5xl font-black tracking-tighter">ウェルネスの輪を、<br/>広げませんか？</h2>
            <button 
              onClick={() => navigate('/auth/signup/user')}
              className="bg-indigo-600 text-white px-16 py-8 rounded-[40px] font-black text-2xl shadow-2xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 inline-flex items-center gap-4"
            >
               今すぐパートナー登録 <ArrowRight size={32} />
            </button>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-6">Soothe Japan Ecosystem</p>
         </div>
      </section>
    </PortalLayout>
  );
};

const BenefitItem = ({ icon, title, desc }: any) => (
  <div className="space-y-6 group">
    <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-[32px] flex items-center justify-center transition-all group-hover:bg-indigo-600 group-hover:text-white shadow-inner group-hover:shadow-2xl">
       {icon}
    </div>
    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
    <p className="text-slate-500 font-bold leading-relaxed">{desc}</p>
  </div>
);

export default AffiliateRecruit;
