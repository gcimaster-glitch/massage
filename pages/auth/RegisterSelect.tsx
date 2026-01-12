
import React from 'react';
import { useNavigate } from 'react-router-dom';
// Added ArrowRight to the import list to fix the missing component error on line 42
import { ArrowLeft, Award, Building2, Briefcase, ChevronRight, UserPlus, Sparkles, Zap, Heart, ArrowRight } from 'lucide-react';

const RegisterSelect: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4 py-20 text-gray-900 font-sans">
      <div className="bg-white rounded-[64px] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.1)] p-10 md:p-16 max-w-5xl w-full relative border border-gray-100 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50 rounded-full blur-[100px] opacity-30 translate-x-1/3 -translate-y-1/3"></div>
        
        <button onClick={() => navigate('/')} className="absolute top-12 left-12 text-gray-400 hover:text-teal-600 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Portal
        </button>

        <div className="text-center mb-16 mt-6 space-y-4">
          <span className="inline-block bg-teal-50 text-teal-600 px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.4em] border border-teal-100 shadow-sm">Join the Community</span>
          <h1 className="text-5xl font-black tracking-tighter text-gray-900">アカウント種別の選択</h1>
          <p className="text-gray-400 font-bold text-sm max-w-md mx-auto">HOGUSYへようこそ。あなたの目的に合ったアカウントをお選びください。</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
           {/* Left: User Path */}
           <div className="space-y-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-6">For Customers</h3>
              <button 
                onClick={() => navigate('/auth/signup/user')}
                className="w-full p-10 bg-teal-600 rounded-[48px] text-left text-white shadow-2xl hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden group border-4 border-teal-400"
              >
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform"><Sparkles size={120}/></div>
                 <div className="relative z-10 space-y-6">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-xl"><UserPlus size={32} /></div>
                    <div>
                       <h4 className="text-3xl font-black tracking-tighter mb-2">一般利用者登録</h4>
                       <p className="text-teal-50 font-bold text-sm leading-relaxed opacity-80">
                         最短30秒で完了。街中のCARE CUBEや出張施術を、今すぐ予約できます。
                       </p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-black/20 w-fit px-4 py-2 rounded-full">
                       Free Registration <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                 </div>
              </button>
           </div>

           {/* Right: Partner Path */}
           <div className="space-y-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-6">For Professional Partners</h3>
              <div className="grid gap-4">
                 <SelectCard 
                    title="セラピスト登録" 
                    desc="プロとして施術を提供したい方" 
                    icon={<Award className="text-indigo-600" />} 
                    onClick={() => navigate('/auth/signup/therapist')}
                    color="hover:border-indigo-500 bg-indigo-50/20"
                 />
                 <SelectCard 
                    title="施設ホスト登録" 
                    desc="CARE CUBEを設置し、場所を貸し出したい方" 
                    icon={<Building2 className="text-orange-600" />} 
                    onClick={() => navigate('/auth/signup/host')}
                    color="hover:border-orange-500 bg-orange-50/20"
                 />
                 <SelectCard 
                    title="事務所・エージェンシー" 
                    desc="複数のセラピストを管理・派遣する事業者" 
                    icon={<Briefcase className="text-blue-600" />} 
                    onClick={() => navigate('/auth/signup/office')}
                    color="hover:border-blue-600 bg-blue-50/20"
                 />
              </div>
           </div>
        </div>

        <div className="mt-20 text-center pt-10 border-t border-gray-50">
           <p className="text-sm font-bold text-gray-400">
             すでにアカウントをお持ちですか？ <button onClick={() => navigate('/auth/login')} className="text-teal-600 font-black hover:underline">ログイン画面へ</button>
           </p>
        </div>
      </div>
    </div>
  );
};

const SelectCard = ({ title, desc, icon, onClick, color }: any) => (
  <button 
    onClick={onClick}
    className={`p-6 bg-white border-2 border-gray-100 rounded-[32px] flex items-center gap-6 text-left hover:shadow-xl transition-all group ${color}`}
  >
     <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">{icon}</div>
     <div className="flex-1">
        <p className="font-black text-lg text-gray-900 leading-none">{title}</p>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">{desc}</p>
     </div>
     <ChevronRight className="text-gray-200 group-hover:translate-x-1 group-hover:text-gray-400 transition-all" size={20} />
  </button>
);

export default RegisterSelect;
