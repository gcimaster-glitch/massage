
import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Menu, X, LogIn, LayoutDashboard, UserPlus, Building2, Award, Briefcase, Sparkles, Map } from 'lucide-react';
import { Role } from '../../types';
import UserMenu from '../../components/UserMenu';

const PortalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

  // モバイルメニュー開閉時に背景スクロール制御
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const getHomePath = (role: Role) => {
    switch (role) {
      case Role.ADMIN: return '/admin';
      case Role.THERAPIST: return '/t';
      case Role.HOST: return '/h';
      case Role.THERAPIST_OFFICE: return '/o';
      case Role.USER: return '/app';
      default: return '/';
    }
  };

  const navItems = [
    { label: 'サービス案内', path: '/about' }, 
    { label: '事業モデル', path: '/strategy' }, // Updated
    { label: 'マップ検索', path: '/app/map', icon: Map },
    { label: 'セラピスト', path: '/therapists' },
    { label: '料金プラン', path: '/fee' },
    { label: '採用・パートナー', path: '/recruit' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col selection:bg-teal-100">
      {/* モバイルメニューオーバーレイ */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[90] lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="メニューを閉じる"
        />
      )}
      
      <header className="fixed top-0 w-full z-[100] transition-all duration-500 px-3 md:px-6 py-3 md:py-4">
        <div className="max-w-7xl mx-auto h-16 md:h-20 bg-white/90 backdrop-blur-2xl rounded-2xl md:rounded-[32px] border border-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-1.5 md:gap-2 cursor-pointer group" onClick={() => navigate('/')}>
             <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-900 rounded-lg md:rounded-xl flex items-center justify-center text-white font-black text-lg md:text-xl shadow-xl group-hover:bg-teal-600 transition-colors">H</div>
             <div className="flex flex-col">
                <span className="text-base md:text-xl font-black text-gray-900 tracking-tighter leading-none">HOGUSY</span>
                <span className="hidden md:block text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">ほぐす、を、もっと身近に。</span>
             </div>
          </div>

          <nav className="hidden lg:flex items-center gap-4 xl:gap-8">
            {navItems.map(item => (
              <button 
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`text-[9px] xl:text-[10px] font-black transition-all uppercase tracking-[0.15em] xl:tracking-[0.2em] whitespace-nowrap ${location.pathname === item.path ? 'text-teal-600 underline underline-offset-8 decoration-2' : 'text-gray-400 hover:text-gray-900'}`}
              >
                {item.label}
              </button>
            ))}
            <div className="h-4 w-px bg-gray-100"></div>
            {/* デスクトップ用ユーザーメニュー */}
            <UserMenu 
              currentUser={currentUser}
              onLogout={() => {
                localStorage.removeItem('currentUser');
                localStorage.removeItem('token');
                navigate('/auth/login');
              }}
              variant="light"
            />
          </nav>

          <button className="lg:hidden p-2 md:p-3 bg-gray-50 rounded-lg md:rounded-xl text-gray-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="メニューを開く">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-20 md:top-24 bg-white/98 backdrop-blur-3xl z-[95] p-6 md:p-8 animate-fade-in overflow-y-auto">
            <div className="flex flex-col space-y-4 md:space-y-6">
              {navItems.map(item => (
                <button 
                  key={item.label}
                  onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                  className="text-left font-black text-gray-900 text-2xl md:text-3xl tracking-tighter flex items-center gap-3"
                >
                  {item.icon && <item.icon size={24} className="text-teal-600" />}
                  {item.label}
                </button>
              ))}              <hr className="border-gray-100" />
              <div className="flex flex-col gap-3 md:gap-4">
                {currentUser ? (
                  <button 
                    onClick={() => { 
                      navigate(getHomePath(currentUser.role)); 
                      setMobileMenuOpen(false); 
                    }} 
                    className="bg-gray-900 text-white py-5 md:py-6 rounded-2xl md:rounded-[28px] font-black text-lg md:text-xl flex items-center justify-center gap-3"
                  >
                    <LayoutDashboard size={24} /> My Portal
                  </button>
                ) : (
                  <>
                    <button onClick={() => { navigate('/auth/login'); setMobileMenuOpen(false); }} className="bg-gray-100 py-5 md:py-6 rounded-2xl md:rounded-[28px] font-black text-lg md:text-xl">ログイン</button>
                    <button onClick={() => { navigate('/auth/register-select'); setMobileMenuOpen(false); }} className="bg-teal-600 text-white py-5 md:py-6 rounded-2xl md:rounded-[28px] font-black text-lg md:text-xl shadow-xl">パートナー加盟</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-gray-950 text-white py-24 mt-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20">
            <div className="col-span-1 md:col-span-2 space-y-10">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl">H</div>
                 <h2 className="text-3xl font-black tracking-tighter">HOGUSY</h2>
              </div>
              <p className="text-gray-500 text-lg leading-relaxed max-w-md font-medium">
                「ほぐす」をもっと身近に。HOGUSYは、プロのセラピストとあなたを繋ぐ、
                安全で快適なウェルネス体験を提供します。
              </p>
            </div>

            <div className="space-y-8">
               <h3 className="font-black text-[11px] uppercase tracking-[0.4em] text-teal-600">Explore</h3>
               <ul className="space-y-4 text-sm font-black">
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">サービスについて</Link></li>
                <li><Link to="/strategy" className="text-gray-400 hover:text-white transition-colors">事業戦略</Link></li>
                <li><Link to="/recruit" className="text-gray-400 hover:text-white transition-colors">採用・パートナー募集</Link></li>
                <li><Link to="/news" className="text-gray-400 hover:text-white transition-colors">お知らせ</Link></li>
              </ul>
            </div>

            <div className="space-y-8">
              <h3 className="font-black text-[11px] uppercase tracking-[0.4em] text-gray-500">Legal</h3>
              <ul className="space-y-4 text-sm font-black">
                <li><Link to="/legal" className="text-gray-400 hover:text-white transition-colors">利用規約</Link></li>
                <li><Link to="/legal" className="text-gray-400 hover:text-white transition-colors">プライバシーポリシー</Link></li>
                <li><Link to="/commercial-transaction" className="text-gray-400 hover:text-white transition-colors">特定商取引法に基づく表記</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-20 pt-10 border-t border-white/5 text-center">
            <p className="text-[9px] text-gray-600 font-black uppercase tracking-[1em]">
              © 2025 HOGUSY. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PortalLayout;
