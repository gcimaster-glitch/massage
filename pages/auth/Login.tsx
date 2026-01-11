
import React, { useState } from 'react';
import { Role } from '../../types';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Award, Building2, Briefcase, Shield, Loader2, Heart } from 'lucide-react';

interface LoginProps {
  onLogin: (role: Role) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickLogin = (role: Role) => {
    setIsSubmitting(true);
    // デモ用に即時ログイン
    onLogin(role);
    
    const paths: Record<string, string> = {
      [Role.ADMIN]: '/admin',
      [Role.THERAPIST]: '/t',
      [Role.HOST]: '/h',
      [Role.THERAPIST_OFFICE]: '/o',
      [Role.USER]: '/app',
      [Role.AFFILIATE]: '/affiliate'
    };

    setTimeout(() => {
      navigate(paths[role] || '/app');
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 text-gray-900 font-sans">
      <div className="bg-white rounded-[56px] shadow-2xl p-10 md:p-16 max-w-lg w-full relative border border-gray-200">
        <button onClick={() => navigate('/')} className="absolute top-10 left-10 text-gray-400 hover:text-teal-600 transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest">
          <ArrowLeft size={18} /> TOPへ戻る
        </button>

        <div className="text-center mb-12 mt-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">Soothe ログイン</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em]">Select Role for Prototype Preview</p>
        </div>

        {isSubmitting ? (
          <div className="py-20 flex flex-col items-center gap-4">
             <Loader2 className="animate-spin text-teal-600" size={48} />
             <p className="font-black text-gray-400 uppercase text-xs tracking-widest">Entering Dashboard...</p>
          </div>
        ) : (
          <div className="grid gap-3">
            <LoginButton role={Role.ADMIN} icon={<Shield size={20}/>} label="運営本部 (総管理者)" onClick={handleQuickLogin} color="border-gray-900 bg-gray-900 text-white hover:bg-gray-800" />
            <div className="py-2 flex items-center gap-4">
               <div className="flex-1 h-px bg-gray-100"></div>
               <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Partner Access</span>
               <div className="flex-1 h-px bg-gray-100"></div>
            </div>
            <LoginButton role={Role.USER} icon={<User size={20}/>} label="一般ユーザー" onClick={handleQuickLogin} color="border-gray-100 hover:border-teal-500" />
            <LoginButton role={Role.THERAPIST} icon={<Award size={20}/>} label="セラピスト" onClick={handleQuickLogin} color="border-gray-100 hover:border-indigo-500" />
            <LoginButton role={Role.HOST} icon={<Building2 size={20}/>} label="施設ホスト" onClick={handleQuickLogin} color="border-gray-100 hover:border-orange-500" />
            <LoginButton role={Role.THERAPIST_OFFICE} icon={<Briefcase size={20}/>} label="提携事務所" onClick={handleQuickLogin} color="border-gray-100 hover:border-blue-600" />
            <LoginButton role={Role.AFFILIATE} icon={<Heart size={20}/>} label="アフィリエイト" onClick={handleQuickLogin} color="border-gray-100 hover:border-purple-600" />
          </div>
        )}

        <div className="mt-10 text-center pt-6 border-t border-gray-50">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
              Soothe x CARE CUBE Japan<br/>
              Governance & Operations Suite v4.5
           </p>
        </div>
      </div>
    </div>
  );
};

const LoginButton: React.FC<{ role: Role, icon: any, label: string, onClick: (r: Role) => void, color: string }> = ({ role, icon, label, onClick, color }) => (
  <button onClick={() => onClick(role)} className={`w-full p-4 border-2 rounded-[24px] flex items-center gap-4 transition-all group active:scale-[0.98] font-black ${color}`}>
    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center transition-all shadow-inner group-hover:scale-110">{icon}</div>
    <span className="text-base tracking-tight">{label}</span>
  </button>
);

export default Login;
