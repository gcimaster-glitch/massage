import React, { useState, useEffect } from 'react';
import { Role } from '../../types';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, User, Award, Building2, Briefcase, Shield, Loader2, Heart, Mail, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: (role: Role) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'social' | 'email'>('social');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handle OAuth callback
  useEffect(() => {
    const token = searchParams.get('token');
    const isNewUser = searchParams.get('isNewUser');
    const error = searchParams.get('error');

    if (error) {
      alert(`ログインエラー: ${error}`);
      return;
    }

    if (token) {
      // Store token and user info
      localStorage.setItem('authToken', token);
      
      // Decode token to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user = {
          role: payload.role as Role,
          displayName: payload.name || 'ユーザー'
        };
        
        localStorage.setItem('currentUser', JSON.stringify(user));
        onLogin(payload.role);
        
        // Navigate based on role
        const paths: Record<string, string> = {
          ADMIN: '/admin',
          THERAPIST: '/t',
          HOST: '/h',
          THERAPIST_OFFICE: '/o',
          USER: '/app',
          AFFILIATE: '/affiliate'
        };
        
        navigate(paths[payload.role] || '/app');
      } catch (e) {
        console.error('Failed to parse token:', e);
      }
    }
  }, [searchParams, onLogin, navigate]);

  const handleQuickLogin = (role: Role) => {
    setIsSubmitting(true);
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

  const handleSocialLogin = (provider: string) => {
    // Redirect to OAuth endpoint
    window.location.href = `/api/auth/oauth/${provider.toLowerCase()}?role=USER`;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // TODO: Implement email/password login
    alert('メール/パスワードログインは準備中です');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 text-gray-900 font-sans">
      <div className="bg-white rounded-[56px] shadow-2xl p-10 md:p-16 max-w-lg w-full relative border border-gray-200">
        <button onClick={() => navigate('/')} className="absolute top-10 left-10 text-gray-400 hover:text-teal-600 transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest">
          <ArrowLeft size={18} /> TOPへ戻る
        </button>

        <div className="text-center mb-12 mt-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">Soothe ログイン</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em]">Welcome Back</p>
        </div>

        {isSubmitting ? (
          <div className="py-20 flex flex-col items-center gap-4">
             <Loader2 className="animate-spin text-teal-600" size={48} />
             <p className="font-black text-gray-400 uppercase text-xs tracking-widest">ログイン中...</p>
          </div>
        ) : (
          <>
            {/* Login Method Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
              <button
                onClick={() => setLoginMethod('social')}
                className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                  loginMethod === 'social' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-400'
                }`}
              >
                ソーシャルログイン
              </button>
              <button
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                  loginMethod === 'email' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-400'
                }`}
              >
                メール/パスワード
              </button>
            </div>

            {loginMethod === 'social' ? (
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 text-center mb-6">
                  お好きなアカウントでログイン
                </p>

                <SocialLoginButton
                  provider="GOOGLE"
                  label="Googleでログイン"
                  icon="https://www.google.com/favicon.ico"
                  bgColor="bg-white"
                  textColor="text-gray-900"
                  onClick={() => handleSocialLogin('google')}
                />

                <SocialLoginButton
                  provider="YAHOO"
                  label="Yahoo! JAPANでログイン"
                  icon="https://www.yahoo.co.jp/favicon.ico"
                  bgColor="bg-[#FF0033]"
                  textColor="text-white"
                  onClick={() => handleSocialLogin('yahoo')}
                />

                <SocialLoginButton
                  provider="LINE"
                  label="LINEでログイン"
                  icon="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%2300B900' d='M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314'/%3E%3C/svg%3E"
                  bgColor="bg-[#00B900]"
                  textColor="text-white"
                  onClick={() => handleSocialLogin('line')}
                />

                <SocialLoginButton
                  provider="X"
                  label="𝕏（Twitter）でログイン"
                  icon="https://abs.twimg.com/favicons/twitter.3.ico"
                  bgColor="bg-black"
                  textColor="text-white"
                  onClick={() => handleSocialLogin('x')}
                />

                <SocialLoginButton
                  provider="FACEBOOK"
                  label="Facebookでログイン"
                  icon="https://www.facebook.com/favicon.ico"
                  bgColor="bg-[#1877F2]"
                  textColor="text-white"
                  onClick={() => handleSocialLogin('facebook')}
                />

                <div className="relative py-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-4 text-gray-400 font-black uppercase tracking-widest">または</span>
                  </div>
                </div>

                <Link
                  to="/auth/register-select"
                  className="block w-full p-4 border-2 border-gray-200 rounded-[24px] text-center font-black text-sm text-gray-600 hover:border-teal-500 hover:text-teal-600 transition-all"
                >
                  新規登録はこちら
                </Link>
              </div>
            ) : (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">
                    メールアドレス
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold outline-none focus:border-teal-500 transition-all"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">
                    パスワード
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold outline-none focus:border-teal-500 transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gray-900 text-white rounded-[24px] font-black text-sm hover:bg-teal-600 transition-all shadow-xl active:scale-[0.98]"
                >
                  ログイン
                </button>

                <div className="text-center">
                  <Link
                    to="/auth/forgot-password"
                    className="text-xs font-bold text-gray-400 hover:text-teal-600 transition-colors"
                  >
                    パスワードを忘れた方
                  </Link>
                </div>
              </form>
            )}

            <div className="mt-10 pt-8 border-t border-gray-100">
              <p className="text-xs font-black text-gray-300 uppercase tracking-widest text-center mb-6">
                デモアクセス（開発用）
              </p>
              <div className="grid gap-2">
                <DemoButton role={Role.USER} icon={<User size={16}/>} label="ユーザー" onClick={handleQuickLogin} />
                <DemoButton role={Role.THERAPIST} icon={<Award size={16}/>} label="セラピスト" onClick={handleQuickLogin} />
                <DemoButton role={Role.ADMIN} icon={<Shield size={16}/>} label="管理者" onClick={handleQuickLogin} />
              </div>
            </div>
          </>
        )}

        <div className="mt-10 text-center pt-6 border-t border-gray-50">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
              Soothe x CARE CUBE Japan
           </p>
        </div>
      </div>
    </div>
  );
};

const SocialLoginButton: React.FC<{
  provider: string;
  label: string;
  icon: string;
  bgColor: string;
  textColor: string;
  onClick: () => void;
}> = ({ provider, label, icon, bgColor, textColor, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full p-4 ${bgColor} ${textColor} border-2 border-transparent rounded-[24px] flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] font-black text-sm shadow-sm`}
  >
    <div className="w-6 h-6 flex items-center justify-center">
      <img src={icon} alt={provider} className="w-full h-full object-contain" />
    </div>
    <span className="flex-1 text-left">{label}</span>
  </button>
);

const DemoButton: React.FC<{
  role: Role;
  icon: React.ReactNode;
  label: string;
  onClick: (r: Role) => void;
}> = ({ role, icon, label, onClick }) => (
  <button
    onClick={() => onClick(role)}
    className="w-full p-3 border border-gray-200 rounded-2xl flex items-center gap-3 transition-all hover:border-teal-500 hover:bg-teal-50 active:scale-[0.98] font-bold text-sm text-gray-600"
  >
    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">{icon}</div>
    <span>{label}</span>
  </button>
);

export default Login;
