import React, { useState, useEffect } from 'react';
import { Role } from '../../types';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Shield, Loader2, Settings, Database } from 'lucide-react';

interface LoginAdminProps {
  onLogin: (role: Role) => void;
}

const LoginAdmin: React.FC<LoginAdminProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      setIsSubmitting(true);
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = Role.ADMIN;
        const userName = payload.userName || payload.email || '総管理者';
        
        localStorage.setItem('auth_token', token);
        onLogin(role, userName);
        
        setTimeout(() => {
          navigate('/admin');
          setIsSubmitting(false);
        }, 500);
      } catch (e) {
        console.error('Failed to parse token:', e);
        setIsSubmitting(false);
      }
    }
  }, [searchParams, onLogin, navigate]);

  const handleQuickLogin = () => {
    setIsSubmitting(true);
    
    // Create a mock JWT token for quick login (development only)
    const mockToken = btoa(JSON.stringify({
      userId: 'admin-demo',
      email: 'admin@hogusy.com',
      userName: '総管理者',
      role: 'ADMIN',
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000
    }));
    
    localStorage.setItem('auth_token', `mock.${mockToken}.demo`);
    onLogin(Role.ADMIN);
    
    setTimeout(() => {
      navigate('/admin');
      setIsSubmitting(false);
    }, 500);
  };

  const handleGoogleLogin = () => {
    window.location.href = `/api/auth/oauth/google?role=${Role.ADMIN}&redirectPath=/admin`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center p-4 text-gray-900 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl p-10 md:p-16 max-w-lg w-full relative border border-gray-800">
        <button 
          onClick={() => navigate('/indexlist')} 
          className="absolute top-10 left-10 text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-2 text-xs font-bold"
        >
          <ArrowLeft size={18} /> 目次へ戻る
        </button>

        <div className="text-center mb-12 mt-10">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">総管理者ログイン</h1>
          <p className="text-gray-500 font-medium text-sm">システム管理・全体統制</p>
        </div>

        {isSubmitting ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-gray-900" size={48} />
            <p className="font-bold text-gray-400 text-sm">管理画面へ移動中...</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <button
                onClick={handleGoogleLogin}
                className="w-full p-5 border-2 border-gray-200 rounded-2xl flex items-center justify-center gap-3 transition-all hover:border-gray-900 hover:shadow-lg active:scale-[0.98] bg-white"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-bold text-gray-900">Google でログイン</span>
              </button>
            </div>

            <div className="py-4 flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs font-medium text-gray-400">または</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <button
              onClick={handleQuickLogin}
              className="w-full p-5 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-2xl font-bold text-lg transition-all hover:shadow-xl active:scale-[0.98]"
            >
              デモログイン（開発用）
            </button>

            <div className="mt-10 grid gap-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Settings size={20} className="text-gray-900" />
                </div>
                <span className="font-medium">全システム管理・設定</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Database size={20} className="text-gray-900" />
                </div>
                <span className="font-medium">データ分析・レポート</span>
              </div>
            </div>
          </>
        )}

        <div className="mt-10 text-center pt-6 border-t border-gray-100 space-y-3">
          <p className="text-sm font-medium text-gray-500">
            HOGUSY 運営本部専用
          </p>
          <p className="text-xs text-gray-400">
            HOGUSY 総管理者ポータル
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;
