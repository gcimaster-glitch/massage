import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, Loader, AlertCircle, CheckCircle } from 'lucide-react';

const UnifiedRegister: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (formData.password.length < 8) {
      setError('パスワードは8文字以上で設定してください');
      return;
    }

    if (!agreedToTerms) {
      setError('利用規約とプライバシーポリシーに同意してください');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: 'USER'
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Show success message and redirect to login
        alert('アカウントが作成されました！ログインしてください。');
        navigate('/auth/login');
      } else {
        setError(data.error || '登録に失敗しました');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('登録処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-2xl w-full grid md:grid-cols-1 gap-8">
        {/* Registration Form */}
        <div className="bg-white rounded-[48px] p-10 shadow-2xl border border-gray-100">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">新規会員登録</h2>
              <p className="text-sm text-gray-500 font-bold">HOGUSYでセラピストを簡単予約</p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-teal-50 rounded-3xl">
              <div className="text-center">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <CheckCircle size={20} className="text-teal-600" />
                </div>
                <p className="text-xs font-black text-gray-900">簡単予約</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <CheckCircle size={20} className="text-teal-600" />
                </div>
                <p className="text-xs font-black text-gray-900">オンライン決済</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <CheckCircle size={20} className="text-teal-600" />
                </div>
                <p className="text-xs font-black text-gray-900">予約管理</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                  <p className="text-sm font-bold text-red-900">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">
                  お名前 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="山田 太郎"
                    required
                    className="w-full pl-16 pr-6 py-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all border border-transparent focus:border-gray-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                    className="w-full pl-16 pr-6 py-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all border border-transparent focus:border-gray-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">
                  電話番号
                </label>
                <div className="relative">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="090-1234-5678"
                    className="w-full pl-16 pr-6 py-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all border border-transparent focus:border-gray-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">
                  パスワード <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="8文字以上"
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

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">
                  パスワード（確認） <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="もう一度入力"
                    required
                    className="w-full pl-16 pr-16 py-5 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/10 transition-all border border-transparent focus:border-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 mt-0.5 flex-shrink-0"
                />
                <label className="text-sm text-gray-600 font-bold">
                  <a href="/legal/terms" target="_blank" className="text-teal-600 hover:underline">利用規約</a>
                  および
                  <a href="/legal/privacy" target="_blank" className="text-teal-600 hover:underline">プライバシーポリシー</a>
                  に同意します
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-teal-600 text-white hover:shadow-xl active:scale-95'
                }`}
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    登録中...
                  </>
                ) : (
                  <>
                    アカウントを作成
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="pt-6 border-t border-gray-100 text-center space-y-3">
              <p className="text-sm text-gray-500 font-bold">
                すでにアカウントをお持ちの方
              </p>
              <button
                onClick={() => navigate('/auth/login')}
                className="text-teal-600 font-bold hover:underline"
              >
                ログインはこちら
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedRegister;
