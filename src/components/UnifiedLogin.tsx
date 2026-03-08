/**
 * 統一ログインコンポーネント
 * 全ロールで使用可能な汎用ログイン画面
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Role } from '../../types';

interface UnifiedLoginProps {
  role: Role;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onLogin: (role: Role, name?: string) => void;
  redirectPath: string;
  features?: { icon: React.ReactNode; label: string }[];
}

const UnifiedLogin: React.FC<UnifiedLoginProps> = ({
  role,
  title,
  subtitle,
  icon,
  onLogin,
  redirectPath,
  features = []
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Handle OAuth callback
  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      setIsSubmitting(true);
      
      try {
        // Decode JWT payload (UTF-8 safe)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        const userName = payload.userName || payload.name || payload.email || 'ユーザー';
        
        localStorage.setItem('auth_token', token);
        onLogin(role, userName);
        
        // Check for returnUrl parameter (for booking flow restoration)
        const returnUrl = searchParams.get('returnUrl');
        const targetPath = returnUrl || redirectPath;
        
        console.log('✅ OAuth認証成功 - リダイレクト先:', targetPath);
        
        setTimeout(() => {
          navigate(targetPath);
          setIsSubmitting(false);
        }, 500);
      } catch (e) {
        console.error('Failed to parse token:', e);
        setError('認証トークンの処理に失敗しました');
        setIsSubmitting(false);
      }
    }
  }, [searchParams, onLogin, navigate, role, redirectPath]);

  // Handle email/password login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Check if user has correct role
        if (data.user.role !== role) {
          setError(`このログイン画面は${title}専用です`);
          setIsSubmitting(false);
          return;
        }

        localStorage.setItem('auth_token', data.token);
        onLogin(role, data.user.name);
        
        // Check for returnUrl parameter (for booking flow restoration)
        const returnUrl = searchParams.get('returnUrl');
        const targetPath = returnUrl || redirectPath;
        
        console.log('✅ ログイン成功 - リダイレクト先:', targetPath);
        
        setTimeout(() => {
          navigate(targetPath);
          setIsSubmitting(false);
        }, 500);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'ログインに失敗しました');
        
        // メール未認証エラーの場合、再送ボタンを表示
        if (response.status === 403 && (errorData.error?.includes('未認証') || errorData.error?.includes('not verified'))) {
          setShowResend(true);
        }
        
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('ログイン処理中にエラーが発生しました');
      setIsSubmitting(false);
    }
  };

  // Handle Resend Verification
  const handleResendVerification = async () => {
    if (!email) {
      setError('メールアドレスを入力してください');
      return;
    }
    
    setResendStatus('sending');
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResendStatus('sent');
        setError('');
      } else {
        setResendStatus('error');
        setError(data.error || 'メール送信に失敗しました');
      }
    } catch (e) {
      setResendStatus('error');
      setError('通信エラーが発生しました');
    }
  };

  // Handle Google OAuth
  const handleGoogleLogin = () => {
    const targetRedirect = redirectPath || '/app';
    window.location.href = `/api/auth/oauth/google?role=${role}&redirect=${encodeURIComponent(targetRedirect)}`;
  };

  const handleLineLogin = () => {
    const targetRedirect = redirectPath || '/app';
    window.location.href = `/api/auth/oauth/line?role=${role}&redirect=${encodeURIComponent(targetRedirect)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center p-4 text-gray-900 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl p-10 md:p-16 max-w-lg w-full relative">
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-10 left-10 text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-2 text-xs font-bold"
        >
          <ArrowLeft size={18} /> トップへ戻る
        </button>

        <div className="text-center mb-12 mt-10">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl flex items-center justify-center shadow-lg">
            {icon}
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-500 font-medium text-sm">{subtitle}</p>
        </div>

        {isSubmitting ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-teal-600" size={48} />
            <p className="font-bold text-gray-400 text-sm">ログイン中...</p>
          </div>
        ) : (
          <>
            {/* Email/Password Login Form */}
            <form onSubmit={handleEmailLogin} className="mb-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-teal-600 focus:outline-none font-medium text-gray-900 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  パスワード
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-teal-600 focus:outline-none font-medium text-gray-900 transition-all"
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
                  <p className="text-sm font-bold text-red-600 mb-2">{error}</p>
                  
                  {showResend && (
                    <div className="mt-2 pt-2 border-t border-red-200">
                      {resendStatus === 'sent' ? (
                        <p className="text-sm text-teal-600 font-bold">
                          ✅ 確認メールを再送しました。メールボックスをご確認ください。
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendVerification}
                          disabled={resendStatus === 'sending'}
                          className="text-sm text-teal-600 font-bold underline hover:text-teal-800 disabled:opacity-50"
                        >
                          {resendStatus === 'sending' ? '送信中...' : '認証メールを再送する'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full p-5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-2xl font-bold text-lg transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? 'ログイン中...' : 'ログイン'}
              </button>
            </form>

            <div className="py-4 flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs font-medium text-gray-400">または</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Social OAuth Login */}
            <div className="mb-8 space-y-3">
              {/* Google Login */}
              <button
                onClick={handleGoogleLogin}
                className="w-full p-5 border-2 border-gray-200 rounded-2xl flex items-center justify-center gap-3 transition-all hover:border-teal-600 hover:shadow-lg active:scale-[0.98] bg-white"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-bold text-gray-900">Google でログイン</span>
              </button>
              {/* LINE Login */}
              <button
                onClick={handleLineLogin}
                className="w-full p-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:shadow-lg active:scale-[0.98] bg-[#06C755] hover:bg-[#05a847]"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
                <span className="font-bold text-white">LINE でログイン</span>
              </button>
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div className="mt-10 grid gap-4">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <span className="font-medium">{feature.label}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="mt-10 text-center pt-6 border-t border-gray-100 space-y-3">
          <p className="text-sm font-medium text-gray-500">
            HOGUSY {title}ポータル
          </p>
          <p className="text-xs text-gray-400">
            安全・安心のウェルネスプラットフォーム
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogin;
