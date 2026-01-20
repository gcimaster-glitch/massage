import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader, CheckCircle, AlertCircle } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'パスワードリセットメールの送信に失敗しました');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-[48px] p-10 shadow-2xl border border-gray-100 text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">メールを送信しました</h2>
            <p className="text-gray-600 font-bold">
              {email} にパスワードリセット用のリンクを送信しました。
              <br />
              メールをご確認ください。
            </p>
          </div>
          <button
            onClick={() => navigate('/auth/login')}
            className="w-full py-5 bg-teal-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-teal-700 transition-all"
          >
            ログインページに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[48px] p-10 shadow-2xl border border-gray-100">
        <div className="space-y-8">
          <button
            onClick={() => navigate('/auth/login')}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold transition-all group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            ログインに戻る
          </button>

          <div className="text-center space-y-2">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">パスワードリセット</h2>
            <p className="text-sm text-gray-500 font-bold">
              登録されているメールアドレスを入力してください
            </p>
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
                  送信中...
                </>
              ) : (
                'リセットリンクを送信'
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 font-bold">
              メールが届かない場合は、迷惑メールフォルダをご確認ください
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
