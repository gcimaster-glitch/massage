
import React from 'react';
import { User, CreditCard, Bell, Shield, LogOut, ChevronRight, Edit2, Activity, Target, ShieldCheck, Heart, HelpCircle, History, Sparkles, Link2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BodyMap from '../../components/BodyMap';

interface AccountProps {
  onLogout: () => void;
}

const Account: React.FC = ({ onLogout }: any) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-24 px-4 font-sans text-gray-900 animate-fade-in pt-10">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex justify-between items-end px-4">
           <div>
              <h1 className="text-6xl font-black tracking-tighter">マイアカウント</h1>
              <p className="text-gray-400 text-xs font-black uppercase tracking-[0.4em] mt-4 ml-1">Elite Membership Console</p>
           </div>
        </div>

        <div className="bg-white p-10 md:p-14 rounded-[80px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col md:flex-row items-center gap-16 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-teal-500"></div>
          <div className="relative shrink-0">
            <div className="w-48 h-48 bg-teal-50 rounded-[64px] flex items-center justify-center text-4xl font-black text-teal-600 shadow-inner group-hover:scale-105 transition-transform overflow-hidden border-8 border-white relative z-10">
               <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover" alt="Profile" />
            </div>
            <button 
              onClick={() => navigate('/app/account/profile')}
              className="absolute -bottom-4 -right-4 bg-gray-900 text-white p-5 rounded-[28px] shadow-2xl ring-8 ring-white z-20 hover:bg-teal-600 transition-all active:scale-90"
            >
              <Edit2 size={24} />
            </button>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-8">
            <div className="space-y-2">
               <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                  <h2 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">山田 花子</h2>
                  <span className="bg-teal-50 text-teal-700 px-5 py-2 rounded-full text-[10px] font-black border border-teal-100 flex items-center gap-2 shadow-sm uppercase tracking-widest">
                     <ShieldCheck size={16}/> Identity Verified
                  </span>
               </div>
               <p className="text-gray-400 font-bold text-lg">Premium Member / Joined April 2024</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
               <div className="bg-gray-900 text-white text-[10px] font-black px-5 py-2.5 rounded-2xl uppercase tracking-[0.2em] shadow-xl">Gold Tier</div>
               <div className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-5 py-2.5 rounded-2xl border border-indigo-100 uppercase tracking-[0.2em]">24 Sessions Completed</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 px-4">
           {/* メインメニュー (左 7) */}
           <div className="lg:col-span-7 space-y-8">
              <section className="bg-white rounded-[64px] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                 <MenuButton onClick={() => navigate('/app/account/wellness')} icon={<History className="text-indigo-500" />} label="ウェルネス・ジャーナル (履歴・カルテ)" highlighted />
                 <MenuButton onClick={() => navigate('/app/account/profile')} icon={<User size={20} />} label="プロフィール・通知設定" />
                 <MenuButton onClick={() => navigate('/app/account/social')} icon={<Link2 size={20} className="text-blue-600" />} label="ソーシャルアカウント連携" />
                 <MenuButton onClick={() => navigate('/app/account/payment')} icon={<CreditCard size={20} />} label="お支払い方法の管理" />
                 <MenuButton onClick={() => navigate('/app/support')} icon={<HelpCircle size={20} className="text-teal-600" />} label="ヘルプ・サポートセンター" />
                 <MenuButton onClick={() => navigate('/app/account/safety')} icon={<Shield size={20} className="text-red-500" />} label="セキュリティ・緊急連絡先" />
              </section>

              <button 
                onClick={onLogout}
                className="w-full py-10 bg-red-50 text-red-600 rounded-[56px] font-black text-lg flex items-center justify-center gap-4 hover:bg-red-100 transition-all active:scale-[0.98] border-4 border-transparent hover:border-red-200 shadow-sm"
              >
                 <LogOut size={28} /> ログアウト
              </button>
           </div>

           {/* 身体のステータスサマリー (右 5) */}
           <div className="lg:col-span-5">
              <section className="bg-gray-900 text-white p-12 rounded-[72px] shadow-2xl relative overflow-hidden flex flex-col h-full border-b-[16px] border-teal-600 group">
                 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500 rounded-full blur-[150px] opacity-10 translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-[3000ms]"></div>
                 <div className="relative z-10 flex items-center justify-between mb-16">
                    <div className="flex items-center gap-5">
                       <div className="w-16 h-16 bg-teal-500/20 text-teal-400 rounded-3xl flex items-center justify-center shadow-inner"><Activity size={32} /></div>
                       <div>
                          <h3 className="text-3xl font-black tracking-tight leading-none">Body Insights</h3>
                          <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] mt-2">Updated: 2025.05.20</p>
                       </div>
                    </div>
                    <Sparkles className="text-teal-400 animate-pulse" size={32} />
                 </div>
                 
                 <div className="relative z-10 flex-1 space-y-12">
                    <div className="p-10 bg-white/5 border border-white/10 rounded-[48px] backdrop-blur-xl">
                       <p className="text-[10px] font-black text-teal-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                          <Target size={16} className="animate-ping" /> Critical Tension Points
                       </p>
                       <div className="flex items-center gap-8">
                          <div className="w-24 h-24 rounded-3xl overflow-hidden flex-shrink-0 grayscale opacity-40 border border-white/10 scale-125 origin-left">
                             <BodyMap selectedIds={['shoulder_r', 'neck']} onToggle={() => {}} readonly />
                          </div>
                          <div className="space-y-2">
                             <p className="text-2xl font-black text-white leading-tight">右肩・首の緊張</p>
                             <p className="text-sm font-bold text-gray-400 leading-relaxed italic opacity-80">前回のセッションから蓄積傾向にあります。早めのケアをお勧めします。</p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <button 
                         onClick={() => navigate('/app/account/wellness')}
                         className="w-full py-8 bg-teal-500 text-white rounded-[32px] font-black text-lg hover:bg-teal-400 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-teal-500/20 active:scale-95 group/btn"
                       >
                          <span>ジャーナル詳細を表示</span>
                          <ChevronRight size={24} className="group-hover/btn:translate-x-1 transition-transform" />
                       </button>
                    </div>
                 </div>

                 <div className="relative z-10 mt-12 pt-8 border-t border-white/5 text-center">
                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.6em]">Soothe Body Analytics v4.5</p>
                 </div>
              </section>
           </div>
        </div>
      </div>
    </div>
  );
};

const MenuButton: React.FC<{ onClick: () => void, icon: React.ReactNode, label: string, highlighted?: boolean }> = ({ onClick, icon, label, highlighted = false }) => (
  <button 
    onClick={onClick}
    className={`w-full p-10 flex items-center justify-between transition-all text-left group ${highlighted ? 'bg-indigo-50/20' : 'hover:bg-gray-50/50'}`}
  >
    <div className="flex items-center gap-8">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform ${highlighted ? 'bg-white text-indigo-600 border border-indigo-100 shadow-xl' : 'bg-gray-50 text-gray-400'}`}>
         {icon}
      </div>
      <span className={`text-xl font-black tracking-tight ${highlighted ? 'text-gray-900' : 'text-gray-600'}`}>{label}</span>
    </div>
    <div className="flex items-center gap-4">
       {highlighted && <span className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest animate-pulse shadow-lg">New Data</span>}
       <ChevronRight className="text-gray-200 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" size={28} />
    </div>
  </button>
);

export default Account;
