
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Lock, ChevronRight, CheckCircle, Building2
} from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-gray-900">
        <div className="bg-white rounded-[56px] shadow-2xl p-12 md:p-20 max-w-2xl w-full text-center space-y-10 border border-gray-100">
           <div className="w-24 h-24 bg-teal-50 text-teal-600 rounded-[32px] flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle size={56} />
           </div>
           <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tighter text-gray-900">登録ありがとうございます</h1>
              <p className="text-gray-500 font-bold leading-relaxed text-lg">
                 認証メールを送信しました。メール内のリンクをクリックして登録を完了させてください。
              </p>
           </div>
           <button 
             onClick={() => navigate('/auth/login')}
             className="w-full bg-gray-900 text-white py-6 rounded-[28px] font-black text-lg hover:bg-teal-600 transition-all shadow-xl active:scale-95"
           >
              ログイン画面へ
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-20 text-gray-900">
      <div className="bg-white rounded-[56px] shadow-2xl p-10 md:p-16 max-w-2xl w-full relative border border-gray-100">
        <button 
          onClick={() => navigate('/')}
          className="absolute top-10 left-10 text-gray-400 hover:text-teal-600 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> BACK
        </button>

        <div className="text-center mb-12 mt-6">
          <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tighter">無料会員登録 (Register)</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em]">Wellness for everyone</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
             <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest ml-4">お名前 (Full Name)</label>
             <div className="relative">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input required type="text" placeholder="例: 山田 太郎" className="w-full pl-16 pr-8 py-5 bg-gray-50 border border-gray-200 rounded-[28px] font-bold text-gray-900 outline-none focus:bg-white focus:border-teal-500 transition-all shadow-inner" />
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest ml-4">メールアドレス (Email)</label>
             <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input required type="email" placeholder="example@soothe.jp" className="w-full pl-16 pr-8 py-5 bg-gray-50 border border-gray-200 rounded-[28px] font-bold text-gray-900 outline-none focus:bg-white focus:border-teal-500 transition-all shadow-inner" />
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest ml-4">パスワード (Password)</label>
             <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input required type="password" placeholder="8文字以上の英数字" className="w-full pl-16 pr-8 py-5 bg-gray-50 border border-gray-200 rounded-[28px] font-bold text-gray-900 outline-none focus:bg-white focus:border-teal-500 transition-all shadow-inner" />
             </div>
          </div>

          <button type="submit" className="w-full bg-gray-900 text-white py-6 rounded-[32px] font-black text-xl hover:bg-teal-600 transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-4 mt-4">
             規約に同意して登録する <ChevronRight size={24} />
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-gray-50 flex flex-col items-center gap-4">
           <Link to="/auth/partner-register" className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-6 py-3 rounded-2xl text-[11px] font-black hover:bg-indigo-100 transition-all border border-indigo-100">
              <Building2 size={16} /> セラピスト・施設オーナーの方はこちらから
           </Link>
           <p className="text-sm font-bold text-gray-400">
             すでにアカウントをお持ちですか？ <Link to="/auth/login" className="text-teal-600 font-black hover:underline">ログイン</Link>
           </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
