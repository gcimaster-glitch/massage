
import React, { useState, useEffect } from 'react';
import { Role } from '../../types';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, User, Award, Building2, Briefcase, Shield, Loader2, Heart } from 'lucide-react';

interface LoginProps {
  onLogin: (role: Role) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if already logged in (but not during OAuth callback)
  useEffect(() => {
    const token = searchParams.get('token');
    // Only check if not in OAuth callback
    if (!token) {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        // Already logged in, redirect to dashboard
        navigate('/app');
      }
    }
  }, [navigate, searchParams]);

  // Check for OAuth callback token
  useEffect(() => {
    const token = searchParams.get('token');
    const isNewUser = searchParams.get('isNewUser') === 'true';
    
    if (token) {
      setIsSubmitting(true);
      
      // Parse JWT token to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role || Role.USER;
        const userName = payload.userName || payload.email || 'Google User';
        
        // Store token
        localStorage.setItem('auth_token', token);
        
        // Auto-login with the role and name from token
        onLogin(role, userName);
        
        const paths: Record<string, string> = {
          [Role.ADMIN]: '/admin',
          [Role.THERAPIST]: '/t',
          [Role.HOST]: '/h',
          [Role.THERAPIST_OFFICE]: '/o',
          [Role.USER]: '/app',
          [Role.AFFILIATE]: '/affiliate'
        };

        // Clean URL (remove token from URL for security)
        window.history.replaceState({}, '', paths[role] || '/app');

        setTimeout(() => {
          navigate(paths[role] || '/app');
          setIsSubmitting(false);
        }, 500);
      } catch (e) {
        console.error('Failed to parse token:', e);
        setIsSubmitting(false);
      }
    }
  }, [searchParams, onLogin, navigate]);

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

  const handleGoogleLogin = (role: Role = Role.USER) => {
    // Redirect to Google OAuth with full URL
    const baseUrl = window.location.origin;
    window.location.href = `${baseUrl}/api/auth/oauth/google?role=${role}&redirectPath=/app`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 text-gray-900 font-sans">
      <div className="bg-white rounded-[56px] shadow-2xl p-10 md:p-16 max-w-lg w-full relative border border-gray-200">
        <button onClick={() => navigate('/')} className="absolute top-10 left-10 text-gray-400 hover:text-teal-600 transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest">
          <ArrowLeft size={18} /> TOPへ戻る
        </button>

        <div className="text-center mb-12 mt-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">HOGUSY ログイン</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em]">Select Login Method</p>
        </div>

        {isSubmitting ? (
          <div className="py-20 flex flex-col items-center gap-4">
             <Loader2 className="animate-spin text-teal-600" size={48} />
             <p className="font-black text-gray-400 uppercase text-xs tracking-widest">Entering Dashboard...</p>
          </div>
        ) : (
          <>
            {/* Google Sign-In */}
            <div className="mb-8">
              <button
                onClick={() => handleGoogleLogin(Role.USER)}
                className="w-full p-4 border-2 border-gray-200 rounded-[24px] flex items-center justify-center gap-3 transition-all hover:border-teal-500 hover:shadow-lg active:scale-[0.98] bg-white"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-black text-gray-900">Google でログイン</span>
              </button>
            </div>

            <div className="py-4 flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-100"></div>
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Demo Access</span>
              <div className="flex-1 h-px bg-gray-100"></div>
            </div>

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
          </>
        )}

        <div className="mt-10 text-center pt-6 border-t border-gray-50 space-y-4">
           <p className="text-sm font-bold text-gray-400">
              アカウントをお持ちでない方は{' '}
              <button 
                onClick={() => navigate('/auth/register-select')} 
                className="text-teal-600 font-black hover:underline transition-colors"
              >
                新規登録
              </button>
           </p>
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
              HOGUSY<br/>
              Wellness Platform v1.0
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
