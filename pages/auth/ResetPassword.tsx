import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock, Loader2 } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (!resetToken) {
      setError('無効なリセットリンクです');
    } else {
      setToken(resetToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('すべてのフィールドを入力してください');
      return;
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上で設定してください');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('パスワードをリセットしました。ログイン画面へ移動します...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.error || 'パスワードのリセットに失敗しました');
      }
    } catch (err) {
      console.error('Reset password error:', err);
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
          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">新しいパスワード設定</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em]">Set New Password</p>
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

        {!token ? (
          <div className="py-10 text-center">
            <p className="text-red-600 font-bold">無効なリセットリンクです</p>
            <button
              onClick={() => navigate('/auth/forgot-password')}
              className="mt-4 text-teal-600 font-black hover:underline"
            >
              パスワードリセット申請へ
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">
                新しいパスワード
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-[20px] focus:outline-none focus:border-teal-500 transition-colors font-bold"
                  placeholder="8文字以上"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">
                パスワード確認
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-[20px] focus:outline-none focus:border-teal-500 transition-colors font-bold"
                  placeholder="もう一度入力"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-teal-600 text-white rounded-[24px] font-black hover:bg-teal-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  設定中...
                </>
              ) : (
                'パスワードを設定'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
