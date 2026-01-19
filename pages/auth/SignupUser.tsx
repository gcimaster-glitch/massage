
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Lock, ChevronRight, CheckCircle, Sparkles, Zap, Smartphone, Heart, AlertCircle, Loader2
} from 'lucide-react';

const SignupUser: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });
  const [fromBooking, setFromBooking] = useState(false);
  const [bookingId, setBookingId] = useState('');

  // Check if already logged in and load booking data
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Already logged in, redirect to dashboard
      navigate('/app');
      return;
    }

    // 予約情報からのパラメータを取得
    const nameParam = searchParams.get('name');
    const emailParam = searchParams.get('email');
    const phoneParam = searchParams.get('phone');
    const bookingIdParam = searchParams.get('bookingId');

    if (bookingIdParam) {
      setFromBooking(true);
      setBookingId(bookingIdParam);
    }

    if (nameParam || emailParam || phoneParam) {
      setFormData(prev => ({
        ...prev,
        name: nameParam || prev.name,
        email: emailParam || prev.email,
        phone: phoneParam || prev.phone,
      }));
    }
  }, [navigate, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role: 'USER',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '登録に失敗しました');
      }

      // Success - show success screen
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || '登録中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
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
          
          {fromBooking && (
            <div className="mt-6 p-4 bg-teal-50 border-2 border-teal-200 rounded-[24px] text-left">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-teal-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-teal-900">
                    予約ID: <span className="font-mono text-xs">{bookingId}</span>
                  </p>
                  <p className="text-xs font-bold text-teal-700 mt-1">
                    予約情報を引き継ぎました。会員登録を完了すると予約履歴を管理できます。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Google Sign-Up */}
        <div className="mb-8">
          <button
            onClick={() => {
              const baseUrl = window.location.origin;
              window.location.href = `${baseUrl}/api/auth/oauth/google?role=USER&redirectPath=/app`;
            }}
            type="button"
            className="w-full p-4 border-2 border-gray-200 rounded-[24px] flex items-center justify-center gap-3 transition-all hover:border-teal-500 hover:shadow-lg active:scale-[0.98] bg-white"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-black text-gray-900">Google で登録</span>
          </button>
        </div>

        <div className="py-4 flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gray-100"></div>
          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">または</span>
          <div className="flex-1 h-px bg-gray-100"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* エラーメッセージ */}
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-[24px] flex items-start gap-3 animate-fade-in">
              <AlertCircle size={20} className="text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm font-bold text-red-700">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
             <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest ml-4 flex items-center gap-2"><User size={12}/> お名前 <span className="text-red-500">*</span></label>
                <input 
                  required 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="例: 山田 花子" 
                  className="w-full px-8 py-5 bg-gray-50 border border-gray-200 rounded-[28px] font-bold text-gray-900 outline-none focus:bg-white focus:border-teal-500 transition-all shadow-inner" 
                  disabled={isLoading}
                />
             </div>
             <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest ml-4 flex items-center gap-2"><Smartphone size={12}/> 電話番号</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="09012345678" 
                  className="w-full px-8 py-5 bg-gray-50 border border-gray-200 rounded-[28px] font-bold text-gray-900 outline-none focus:bg-white focus:border-teal-500 transition-all shadow-inner" 
                  disabled={isLoading}
                />
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest ml-4 flex items-center gap-2"><Mail size={12}/> メールアドレス <span className="text-red-500">*</span></label>
             <input 
               required 
               type="email" 
               name="email"
               value={formData.email}
               onChange={handleChange}
               placeholder="example@hogusy.jp" 
               className="w-full px-8 py-5 bg-gray-50 border border-gray-200 rounded-[28px] font-bold text-gray-900 outline-none focus:bg-white focus:border-teal-500 transition-all shadow-inner" 
               disabled={isLoading}
             />
          </div>

          <div className="space-y-2">
             <label className="text-[11px] font-black text-gray-600 uppercase tracking-widest ml-4 flex items-center gap-2"><Lock size={12}/> パスワード <span className="text-red-500">*</span></label>
             <input 
               required 
               type="password" 
               name="password"
               value={formData.password}
               onChange={handleChange}
               minLength={8}
               placeholder="8文字以上の英数字" 
               className="w-full px-8 py-5 bg-gray-50 border border-gray-200 rounded-[28px] font-bold text-gray-900 outline-none focus:bg-white focus:border-teal-500 transition-all shadow-inner" 
               disabled={isLoading}
             />
             <p className="text-xs text-gray-400 ml-4 font-bold">※ 半角英数字を含む8文字以上で入力してください</p>
          </div>

          <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 text-[11px] text-gray-400 font-bold leading-relaxed">
             <p>ご登録により、<Link to="/legal" className="text-teal-600 underline">利用規約</Link>および<Link to="/legal" className="text-teal-600 underline">プライバシーポリシー</Link>に同意したものとみなされます。安全なコミュニティ維持のため、本人確認にご協力をお願いいたします。</p>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gray-900 text-white py-8 rounded-[40px] font-black text-2xl hover:bg-teal-600 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.1)] active:scale-[0.98] flex items-center justify-center gap-4 mt-4 group disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
             {isLoading ? (
               <>
                 <Loader2 size={32} className="animate-spin" />
                 登録中...
               </>
             ) : (
               <>
                 規約に同意して登録 <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
               </>
             )}
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
