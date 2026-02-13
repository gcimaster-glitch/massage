import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  
  const [selectedType, setSelectedType] = useState<UserType>('USER');
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
