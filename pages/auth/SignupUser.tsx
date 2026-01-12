
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Lock, ChevronRight, CheckCircle, Sparkles, Zap, Smartphone, Heart
} from 'lucide-react';

const SignupUser: React.FC = () => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4 text-gray-900">
        <div className="bg-white rounded-[64px] shadow-2xl p-12 md:p-20 max-w-2xl w-full text-center space-y-10 border border-gray-100 animate-fade-in">
           <div className="relative inline-block">
              <div className="w-24 h-24 bg-teal-50 text-teal-600 rounded-[32px] flex items-center justify-center mx-auto shadow-inner ring-8 ring-teal-50/30 animate-bounce">
                <CheckCircle size={56} />
              </div>
              <Sparkles className="absolute -top-4 -right-4 text-yellow-500 animate-pulse" size={32} />
           </div>
           <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tighter text-gray-900">ようこそ HOGUSY へ！</h1>
              <p className="text-gray-500 font-bold leading-relaxed text-lg">
                 仮登録が完了しました。ご登録のメールアドレスに送信された認証リンクをクリックして、サービスを開始してください。
              </p>
           </div>
           <div className="bg-orange-50 p-8 rounded-[40px] border border-orange-100 text-left relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><Heart size={64} className="text-orange-500" /></div>
              <h3 className="font-black text-orange-900 flex items-center gap-2 mb-2"><Zap size={20} className="text-orange-500" /> 新規入会特典をGET</h3>
              <p className="text-sm font-bold text-orange-700 leading-relaxed italic">
                 メール認証完了後、マイページにて「初回1,000円OFFクーポン」が自動的に付与されます。お楽しみに！
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
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4 py-20 text-gray-900 font-sans">
      <div className="bg-white rounded-[64px] shadow-2xl p-10 md:p-16 max-w-3xl w-full relative border border-gray-100 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-50 rounded-full blur-[100px] opacity-30 translate-x-1/2 -translate-y-1/2"></div>
        
        <button 
          onClick={() => navigate('/auth/register-select')}
          className="absolute top-10 left-10 text-gray-400 hover:text-teal-600 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        <div className="text-center mb-12 mt-6">
          <h1 className="text-5xl font-black text-gray-900 mb-3 tracking-tighter">無料会員登録</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.4em]">Become a member and reboot your body</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
             <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest ml-4 flex items-center gap-2"><User size={12}/> お名前</label>
                <input required type="text" placeholder="例: 山田 花子" className="w-full px-8 py-5 bg-gray-50 border border-gray-200 rounded-[28px] font-bold text-gray-900 outline-none focus:bg-white focus:border-teal-500 transition-all shadow-inner" />
             </div>
             <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest ml-4 flex items-center gap-2"><Smartphone size={12}/> 電話番号</label>
                <input required type="tel" placeholder="09012345678" className="w-full px-8 py-5 bg-gray-50 border border-gray-200 rounded-[28px] font-bold text-gray-900 outline-none focus:bg-white focus:border-teal-500 transition-all shadow-inner" />
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest ml-4 flex items-center gap-2"><Mail size={12}/> メールアドレス</label>
             <input required type="email" placeholder="example@soothe.jp" className="w-full px-8 py-5 bg-gray-50 border border-gray-200 rounded-[28px] font-bold text-gray-900 outline-none focus:bg-white focus:border-teal-500 transition-all shadow-inner" />
          </div>

          <div className="space-y-2">
             <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest ml-4 flex items-center gap-2"><Lock size={12}/> パスワード</label>
             <input required type="password" placeholder="8文字以上の英数字" className="w-full px-8 py-5 bg-gray-50 border border-gray-200 rounded-[28px] font-bold text-gray-900 outline-none focus:bg-white focus:border-teal-500 transition-all shadow-inner" />
          </div>

          <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 text-[11px] text-gray-400 font-bold leading-relaxed">
             <p>ご登録により、<Link to="/legal" className="text-teal-600 underline">利用規約</Link>および<Link to="/legal" className="text-teal-600 underline">プライバシーポリシー</Link>に同意したものとみなされます。安全なコミュニティ維持のため、本人確認にご協力をお願いいたします。</p>
          </div>

          <button type="submit" className="w-full bg-gray-900 text-white py-8 rounded-[40px] font-black text-2xl hover:bg-teal-600 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.1)] active:scale-[0.98] flex items-center justify-center gap-4 mt-4 group">
             規約に同意して登録 <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-12 text-center">
           <p className="text-sm font-bold text-gray-400">
             すでにアカウントをお持ちですか？ <Link to="/auth/login" className="text-teal-600 font-black hover:underline">ログイン</Link>
           </p>
        </div>
      </div>
    </div>
  );
};

export default SignupUser;
