import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Briefcase, Building2, Shield, ArrowRight, Loader, AlertCircle } from 'lucide-react';
import { Role } from '../../types';

type UserType = 'USER' | 'THERAPIST' | 'HOST' | 'ADMIN';

interface UserTypeOption {
  type: UserType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const userTypes: UserTypeOption[] = [
  {
    type: 'USER',
    label: 'お客様',
    description: '施術を受けたい方',
    icon: <User size={24} />,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50'
  },
  {
    type: 'ADMIN',
    label: '管理者',
    description: 'システム管理者',
    icon: <Shield size={24} />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  }
];

interface UnifiedLoginProps {
  onLogin?: (role: Role, name?: string) => void;
}

const UnifiedLogin: React.FC<UnifiedLoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [selectedType, setSelectedType] = useState<UserType>('USER');

  // OAuthコールバック後のtokenパラメータを処理する
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
        );
        const payload = JSON.parse(jsonPayload);
        const userRole = (payload.role as Role) || Role.USER;
        const displayName = payload.userName || payload.name || payload.email || 'ユーザー';
        localStorage.setItem('auth_token', token);
        localStorage.setItem('currentUser', JSON.stringify({ role: userRole, displayName }));
        if (onLogin) onLogin(userRole, displayName);
        // ロールに応じたリダイレクト
        if (userRole === Role.USER) navigate('/app');
        else if (userRole === Role.THERAPIST) navigate('/t');
        else if (userRole === Role.HOST || userRole === Role.THERAPIST_OFFICE) navigate('/h');
        else if (userRole === Role.ADMIN) navigate('/admin');
        else navigate('/app');
      } catch (e) {
        console.error('Failed to process OAuth token:', e);
      }
    }
  }, [searchParams, onLogin, navigate]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        // Store token
        localStorage.setItem('auth_token', data.token);
        
        // Store user info
        if (data.user) {
          const user = { role: data.user.role as Role, displayName: data.user.name };
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          // Update app state
          if (onLogin) {
            onLogin(user.role, user.displayName);
          }
        }

        // Redirect based on role
        const userRole = data.user?.role;
        if (userRole === 'USER') {
          navigate('/app');
        } else if (userRole === 'THERAPIST') {
          navigate('/t');
        } else if (userRole === 'HOST' || userRole === 'THERAPIST_OFFICE') {
          navigate('/h');
        } else if (userRole === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError(data.error || 'ログインに失敗しました');
        
        // メール未認証エラーの場合、再送ボタンを表示
        if (res.status === 403 && (data.error?.includes('未認証') || data.error?.includes('not verified'))) {
          setShowResend(true);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('ログイン処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const selectedOption = userTypes.find(t => t.type === selectedType)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden md:block space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-black text-gray-900 tracking-tighter">HOGUSY</h1>
            <p className="text-xl text-gray-600 font-bold">セラピストと顧客をつなぐプラットフォーム</p>
          </div>
          
          <div className="bg-white rounded-[48px] p-10 shadow-xl border border-gray-100">
            <h3 className="text-2xl font-black text-gray-900 mb-6">HOGUSYでできること</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <User size={16} className="text-teal-600" />
                </div>
                <div>
                  <p className="font-black text-gray-900">簡単予約</p>
                  <p className="text-sm text-gray-600">お好みのセラピストをすぐに予約</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <User size={16} className="text-teal-600" />
                </div>
                <div>
                  <p className="font-black text-gray-900">オンライン決済</p>
                  <p className="text-sm text-gray-600">安全・簡単なキャッシュレス決済</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <User size={16} className="text-teal-600" />
                </div>
                <div>
                  <p className="font-black text-gray-900">予約管理</p>
                  <p className="text-sm text-gray-600">マイページで予約を一括管理</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white rounded-[48px] p-10 shadow-2xl border border-gray-100">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">ログイン</h2>
              <p className="text-sm text-gray-500 font-bold">アカウントタイプを選択してください</p>
            </div>

            {/* User Type Selection */}
            <div className="grid grid-cols-2 gap-3">
              {userTypes.map(type => (
                <button
                  key={type.type}
                  type="button"
                  onClick={() => setSelectedType(type.type)}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${
                    selectedType === type.type
                      ? `${type.bgColor} border-current ${type.color} shadow-lg`
                      : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedType === type.type ? type.bgColor : 'bg-gray-50'}`}>
                      {type.icon}
                    </div>
                  </div>
                  <p className="font-black text-sm">{type.label}</p>
                  <p className="text-[10px] font-bold opacity-70 mt-1">{type.description}</p>
                </button>
              ))}
            </div>

            {/* Social Login Buttons (USER only) */}
            {selectedType === 'USER' && (
              <div className="space-y-3 mb-6">
                {/* Google Login */}
                <button
                  type="button"
                  onClick={() => {
                    const baseUrl = window.location.origin;
                    window.location.href = `${baseUrl}/api/auth/oauth/google?role=USER&redirect=/app`;
                  }}
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl flex items-center justify-center gap-3 transition-all hover:border-teal-500 hover:shadow-md active:scale-[0.98] bg-white"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="font-black text-gray-900 text-sm">Google でログイン</span>
                </button>
                {/* LINE Login */}
                <button
                  type="button"
                  onClick={() => {
                    const baseUrl = window.location.origin;
                    window.location.href = `${baseUrl}/api/auth/oauth/line?role=USER&redirect=/app`;
                  }}
                  className="w-full p-4 border-2 border-transparent rounded-2xl flex items-center justify-center gap-3 transition-all hover:opacity-90 hover:shadow-md active:scale-[0.98] bg-[#06C755]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                  <span className="font-black text-white text-sm">LINE でログイン</span>
                </button>
                {/* Divider */}
                <div className="py-2 flex items-center gap-4">
                  <div className="flex-1 h-px bg-gray-100"></div>
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">またはメールで</span>
                  <div className="flex-1 h-px bg-gray-100"></div>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                    <p className="text-sm font-bold text-red-900">{error}</p>
                  </div>
                  
                  {showResend && (
                    <div className="ml-8 pt-2 border-t border-red-200">
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

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">
                  メールアドレス
                </label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full pl-16 pr-6 py-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all border border-transparent focus:border-gray-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">
                  パスワード
                </label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-16 pr-16 py-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all border border-transparent focus:border-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                  <span className="text-gray-600 font-bold">ログイン状態を保持</span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/auth/forgot-password')}
                  className="text-teal-600 font-bold hover:underline"
                >
                  パスワードを忘れた
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : `${selectedOption.bgColor} ${selectedOption.color} hover:shadow-xl active:scale-95`
                }`}
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    ログイン中...
                  </>
                ) : (
                  <>
                    ログイン
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            {/* Registration Links */}
            <div className="pt-6 border-t border-gray-100 space-y-4">
              <p className="text-center text-sm text-gray-500 font-bold">
                アカウントをお持ちでない方
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/auth/register/user')}
                  className="w-full px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-sm transition-all"
                >
                  新規会員登録（お客様）
                </button>
                <div className="text-center">
                  <p className="text-xs text-gray-400 font-bold mb-2">パートナーの方</p>
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => navigate('/therapist-lp')}
                      className="flex-1 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold transition-all"
                    >
                      セラピスト
                    </button>
                    <button
                      onClick={() => navigate('/host-lp')}
                      className="flex-1 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold transition-all"
                    >
                      拠点ホスト
                    </button>
                    <button
                      onClick={() => navigate('/office-lp')}
                      className="flex-1 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold transition-all"
                    >
                      オフィス
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogin;
