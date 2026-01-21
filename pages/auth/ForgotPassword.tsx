import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('メールアドレスを入力してください');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('パスワードリセットのメールを送信しました。メールをご確認ください。');
        setEmail('');
      } else {
        setError(data.error || 'パスワードリセットの申請に失敗しました');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('サーバーエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 text-gray-900 font-sans">
      <div className="bg-white rounded-[56px] shadow-2xl p-10 md:p-16 max-w-lg w-full relative border border-gray-200">
        <button 
          onClick={() => navigate('/login')} 
          className="absolute top-10 left-10 text-gray-400 hover:text-teal-600 transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest"
        >
          <ArrowLeft size={18} /> ログイン画面へ
        </button>

        <div className="text-center mb-12 mt-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">パスワードリセット</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em]">Reset Password</p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-2xl">
            <p className="text-teal-600 text-sm font-bold">{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-red-600 text-sm font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">
              メールアドレス
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-[20px] focus:outline-none focus:border-teal-500 transition-colors font-bold"
                placeholder="example@hogusy.com"
                disabled={isSubmitting}
              />
            </div>
            <p className="mt-2 text-xs text-gray-400 font-bold">
              登録されたメールアドレスにパスワードリセット用のリンクを送信します。
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-teal-600 text-white rounded-[24px] font-black hover:bg-teal-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                送信中...
              </>
            ) : (
              'リセットメールを送信'
            )}
          </button>
        </form>

        <div className="mt-10 text-center pt-6 border-t border-gray-50">
          <p className="text-sm font-bold text-gray-400">
            アカウントをお持ちでない方は{' '}
            <button 
              onClick={() => navigate('/auth/register-select')} 
              className="text-teal-600 font-black hover:underline transition-colors"
            >
              新規登録
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
