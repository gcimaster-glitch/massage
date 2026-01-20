/**
 * ユーザー用ヘッダーコンポーネント
 * ログアウト、サポート、TOPへのリンクを含む
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, HelpCircle, LogOut, Menu, X, Bell, User, Search } from 'lucide-react';
import { BRAND } from '../../constants';

interface UserHeaderProps {
  onLogout: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Get user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      try {
        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setUserName(data.user.name || data.user.email);
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    if (window.confirm('ログアウトしますか？')) {
      onLogout();
      navigate('/');
    }
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/app')}>
              <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                {BRAND.NAME.charAt(0)}
              </div>
              <div className="hidden sm:flex flex-col">
                <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none">
                  {BRAND.NAME}
                </h1>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                  {BRAND.SUB_NAME}
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-teal-600 transition-colors"
              >
                <Home size={18} />
                TOP
              </button>
              
              <button
                onClick={() => navigate('/therapists')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-teal-600 transition-colors"
              >
                <Search size={18} />
                セラピストを探す
              </button>
              
              <button
                onClick={() => navigate('/app/support')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-teal-600 transition-colors"
              >
                <HelpCircle size={18} />
                サポート
              </button>

              <button
                onClick={() => navigate('/app/notifications')}
                className="relative flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-teal-600 transition-colors"
              >
                <Bell size={18} />
                お知らせ
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate('/app')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-xl transition-colors"
                title="マイページ・ダッシュボード"
              >
                <User size={18} />
                {userName || 'マイページ'}
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-xl text-sm font-bold transition-colors"
              >
                <LogOut size={18} />
                ログアウト
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 bg-gray-100 rounded-xl"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-16">
          <nav className="flex flex-col p-6 space-y-4">
            <button
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 text-left font-bold text-gray-700 hover:bg-teal-50 rounded-xl transition-colors"
            >
              <Home size={20} />
              TOP
            </button>

            <button
              onClick={() => {
                navigate('/therapists');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 text-left font-bold text-gray-700 hover:bg-teal-50 rounded-xl transition-colors"
            >
              <Search size={20} />
              セラピストを探す
            </button>

            <button
              onClick={() => {
                navigate('/app/support');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 text-left font-bold text-gray-700 hover:bg-teal-50 rounded-xl transition-colors"
            >
              <HelpCircle size={20} />
              サポート
            </button>

            <button
              onClick={() => {
                navigate('/app/notifications');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 text-left font-bold text-gray-700 hover:bg-teal-50 rounded-xl transition-colors relative"
            >
              <Bell size={20} />
              お知らせ
              {unreadCount > 0 && (
                <span className="ml-auto w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                navigate('/app');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 text-left font-bold bg-teal-50 text-teal-700 rounded-xl transition-colors"
            >
              <User size={20} />
              {userName || 'マイページ'}
            </button>

            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-left font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut size={20} />
                ログアウト
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default UserHeader;
