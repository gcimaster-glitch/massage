
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Lock, Phone, ChevronRight, CheckCircle, Award, Building2, Briefcase, Info, ShieldCheck
} from 'lucide-react';
import { Role } from '../../types';

const RegisterPartner: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-gray-900 font-sans text-gray-900">
        <div className="bg-white rounded-[56px] shadow-2xl p-12 md:p-20 max-w-2xl w-full text-center space-y-10 border border-gray-100">
           <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[32px] flex items-center justify-center mx-auto shadow-inner ring-8 ring-indigo-50/30 animate-bounce">
              <CheckCircle size={56} />
           </div>
           <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tighter text-gray-900">パートナー仮登録が完了しました</h1>
              <p className="text-gray-700 font-bold leading-relaxed text-lg">
                 認証メールをお送りしました。まずはログインしてダッシュボードをご確認ください。
              </p>
           </div>
           <div className="bg-gray-50 p-8 rounded-[36px] text-left border border-gray-100 space-y-4">
              <p className="font-black text-indigo-600 flex items-center gap-2 text-lg"><Info size={24}/> 審査の進め方について</p>
              <p className="text-base text-gray-900 font-bold leading-relaxed">
                 1. ログイン後、マイページから「資格証」や「身分証」の写真をアップロードしてください。<br/>
                 2. 書類の確認ができ次第、運営チームより面談（オンラインまたは対面）のご案内を差し上げます。
              </p>
           </div>
           <button 
             onClick={() => navigate('/auth/login')}
             className="w-full bg-gray-900 text-white py-6 rounded-[28px] font-black text-lg hover:bg-teal-600 transition-all shadow-xl active:scale-95"
           >
              ログイン画面へ進む
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-20 text-gray-900 font-sans">
      <div className="bg-white rounded-[56px] shadow-2xl p-10 md:p-16 max-w-3xl w-full relative border border-gray-100">
        <button 
          onClick={() => selectedRole ? setSelectedRole(null) : navigate('/')}
          className="absolute top-10 left-10 text-gray-400 hover:text-teal-600 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> BACK
        </button>

        {!selectedRole ? (
          <div className="animate-fade-in space-y-12 mt-6">
             <div className="text-center">
                <h1 className="text-4xl font-black tracking-tighter text-gray-900">パートナー登録 (Partner)</h1>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em] mt-3">Start your wellness business</p>
             </div>

             <div className="grid gap-4">
                <button onClick={() => setSelectedRole(Role.THERAPIST)} className="p-8 bg-white border-2 border-gray-100 rounded-[40px] flex items-center gap-8 text-left hover:border-indigo-500 hover:shadow-xl transition-all group">
                   <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner"><Award size={32}/></div>
                   <div className="flex-1">
                     <p className="font-black text-xl text-gray-900">個人セラピスト (Therapist)</p>
                     <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-1">Independent Professional</p>
                   </div>
                   <ChevronRight className="text-gray-200 group-hover:text-indigo-500" />
                </button>
                <button onClick={() => setSelectedRole(Role.HOST)} className="p-8 bg-white border-2 border-gray-100 rounded-[40px] flex items-center gap-8 text-left hover:border-orange-500 hover:shadow-xl transition-all group">
                   <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner"><Building2 size={32}/></div>
                   <div className="flex-1">
                     <p className="font-black text-xl text-gray-900">施設ホスト (Facility Host)</p>
                     <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-1">Hotel or Space Owner</p>
                   </div>
                   <ChevronRight className="text-gray-200 group-hover:text-orange-500" />
                </button>
                <button onClick={() => setSelectedRole(Role.THERAPIST_OFFICE)} className="p-8 bg-white border-2 border-gray-100 rounded-[40px] flex items-center gap-8 text-left hover:border-blue-500 hover:shadow-xl transition-all group">
                   <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner"><Briefcase size={32}/></div>
                   <div className="flex-1">
                     <p className="font-black text-xl text-gray-900">事務所・代理店 (Agency)</p>
                     <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-1">Manager for multiple talents</p>
                   </div>
                   <ChevronRight className="text-gray-200 group-hover:text-blue-500" />
                </button>
             </div>
          </div>
        ) : (
          <div className="animate-fade-in text-gray-900">
             <div className="mb-12 mt-6 flex items-center gap-6">
                <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shadow-inner font-black text-2xl">
                   {selectedRole === Role.THERAPIST ? <Award /> : selectedRole === Role.HOST ? <Building2 /> : <Briefcase />}
                </div>
                <div>
                   <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">基本アカウントの作成</h2>
                   <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Registration for {selectedRole}</p>
                </div>
             </div>

             <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest ml-4">氏名 または 法人名 (Name)</label>
                      <input required type="text" placeholder="例: 山田 太郎 / 癒やし株式会社" className="w-full px-8 py-5 bg-gray-50 border border-gray-200 rounded-[28px] font-bold text-gray-900 outline-none focus:bg-white focus:border-teal-500 transition-all shadow-inner" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest ml-4">メールアドレス (Email)</label>
                      <input required type="email" placeholder="partner@example.jp" className="w-full px-8 py-5 bg-gray-50 border border-gray-200 rounded-[28px] font-bold text-gray-900 outline-none focus:bg-white focus:border-teal-500 transition-all shadow-inner" />
                   </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest ml-4">連絡用電話番号 (Phone)</label>
                      <input required type="tel" placeholder="09012345678" className="w-full px-8 py-5 bg-gray-50 border border-gray-200 rounded-[28px] font-bold text-gray-900 outline-none focus:bg-white focus:border-teal-500 transition-all shadow-inner" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest ml-4">パスワード (Password)</label>
                      <input required type="password" placeholder="8文字以上の英数字" className="w-full px-8 py-5 bg-gray-50 border border-gray-200 rounded-[28px] font-bold text-gray-900 outline-none focus:bg-white focus:border-teal-500 transition-all shadow-inner" />
                   </div>
                </div>

                <div className="bg-indigo-50 p-8 rounded-[40px] border border-indigo-100 flex items-start gap-4 shadow-sm">
                   <ShieldCheck className="text-indigo-600 mt-1 flex-shrink-0" />
                   <p className="text-xs font-bold text-indigo-700 leading-relaxed">
                      ※ 資格証や身分証、施設の写真などは、この登録が完了した後にダッシュボードからアップロードいただけます。まずはアカウントを作成してください。
                   </p>
                </div>

                <button type="submit" className="w-full bg-gray-900 text-white py-7 rounded-[32px] font-black text-xl hover:bg-teal-600 transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-4 uppercase tracking-tighter">
                   アカウントを作成して進む <ChevronRight size={24} />
                </button>
             </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPartner;
