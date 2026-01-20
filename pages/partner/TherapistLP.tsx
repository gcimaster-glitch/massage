import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, TrendingUp, DollarSign, Clock, Shield, CheckCircle, ArrowRight, Loader, AlertCircle } from 'lucide-react';

const TherapistLP: React.FC = () => {
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        localStorage.setItem('auth_token', data.token);
        if (data.user) {
          localStorage.setItem('currentUser', JSON.stringify(data.user));
        }
        navigate('/t');
      } else {
        setError(data.error || 'ログインに失敗しました');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('ログイン処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 font-sans">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight">
              あなたの技術を<br />最大限に活かす
            </h1>
            <p className="text-xl md:text-2xl font-bold opacity-90">
              HOGUSYセラピストパートナープログラム
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-6">
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl">
                <p className="text-sm font-bold opacity-80">業界最高水準</p>
                <p className="text-2xl font-black">85%</p>
                <p className="text-xs opacity-70">還元率</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl">
                <p className="text-sm font-bold opacity-80">平均月収</p>
                <p className="text-2xl font-black">¥450,000</p>
                <p className="text-xs opacity-70">週4日稼働</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl">
                <p className="text-sm font-bold opacity-80">即日支払い</p>
                <p className="text-2xl font-black">翌日入金</p>
                <p className="text-xs opacity-70">最短24時間</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: Benefits */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-6">HOGUSYを選ぶ理由</h2>
              <p className="text-gray-600 font-bold">業界最高水準の待遇と充実したサポート</p>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <DollarSign size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">業界最高水準の料率</h3>
                    <p className="text-gray-600 font-bold mb-3">施術料金の85%があなたの収入になります</p>
                    <div className="bg-blue-50 p-4 rounded-2xl">
                      <p className="text-sm font-bold text-gray-700">例：施術料金 ¥10,000 の場合</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-600 font-bold">あなたの収入</span>
                        <span className="text-2xl font-black text-blue-600">¥8,500</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-gray-400 text-sm font-bold">プラットフォーム手数料</span>
                        <span className="text-sm text-gray-500 font-bold">¥1,500</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <TrendingUp size={24} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">即日入金</h3>
                    <p className="text-gray-600 font-bold">施術完了後、最短翌日に報酬が振り込まれます</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Clock size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">自由な働き方</h3>
                    <p className="text-gray-600 font-bold">出勤日・時間帯はすべてあなたが決定。副業・フリーランスどちらもOK</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <Shield size={24} className="text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">安心のサポート体制</h3>
                    <p className="text-gray-600 font-bold">24時間サポート・保険完備・トラブル時の対応サポート</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Login/Register Form */}
          <div className="sticky top-8">
            <div className="bg-white rounded-[48px] p-10 shadow-2xl border border-gray-100">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black text-gray-900">
                    {isLoginMode ? 'セラピストログイン' : 'セラピスト登録'}
                  </h2>
                  <p className="text-sm text-gray-500 font-bold">
                    {isLoginMode ? '既存アカウントでログイン' : '無料で今すぐ登録'}
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3">
                      <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                      <p className="text-sm font-bold text-red-900">{error}</p>
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
                        className="w-full pl-16 pr-6 py-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all border border-transparent focus:border-gray-100"
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
                        className="w-full pl-16 pr-16 py-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all border border-transparent focus:border-gray-100"
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

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      loading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:shadow-xl active:scale-95'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        {isLoginMode ? 'ログイン中...' : '登録中...'}
                      </>
                    ) : (
                      <>
                        {isLoginMode ? 'ログイン' : '無料で登録'}
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-6 border-t border-gray-100 text-center">
                  <button
                    onClick={() => setIsLoginMode(!isLoginMode)}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    {isLoginMode ? '新規登録はこちら' : 'ログインはこちら'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
          <h3 className="text-3xl font-black">今すぐHOGUSYセラピストに登録</h3>
          <p className="text-gray-300 font-bold">登録料・年会費は一切かかりません</p>
          <button
            onClick={() => navigate('/auth/signup/therapist')}
            className="bg-white text-gray-900 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-100 transition-all inline-flex items-center gap-2"
          >
            無料で登録する
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TherapistLP;
