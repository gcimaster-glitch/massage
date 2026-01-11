
import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Menu, X, LogIn, LayoutDashboard, UserPlus, Building2, Award, Briefcase, Sparkles, Map } from 'lucide-react';
import { Role } from '../../types';

const PortalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

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
      <header className="fixed top-0 w-full z-[100] transition-all duration-500 px-6 py-4">
        <div className="max-w-7xl mx-auto h-20 bg-white/90 backdrop-blur-2xl rounded-[32px] border border-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex items-center justify-between px-8">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
             <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xl group-hover:bg-teal-600 transition-colors">S</div>
             <div className="flex flex-col">
                <span className="text-xl font-black text-gray-900 tracking-tighter leading-none">Soothe</span>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">x CARE CUBE</span>
             </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <button 
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`text-[10px] font-black transition-all uppercase tracking-[0.2em] ${location.pathname === item.path ? 'text-teal-600 underline underline-offset-8 decoration-2' : 'text-gray-400 hover:text-gray-900'}`}
              >
                {item.label}
              </button>
            ))}
            <div className="h-4 w-px bg-gray-100"></div>
            {currentUser ? (
              <button 
                onClick={() => navigate(getHomePath(currentUser.role))}
                className="bg-gray-900 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black hover:bg-teal-600 transition-all flex items-center gap-3 shadow-xl active:scale-95 uppercase tracking-widest"
              >
                <LayoutDashboard size={14} /> My Portal
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/auth/login')}
                  className="text-gray-900 px-6 py-3 text-[10px] font-black hover:bg-gray-50 rounded-xl transition-all uppercase tracking-widest"
                >
                   Login
                </button>
                <button 
                  onClick={() => navigate('/auth/register-select')}
                  className="bg-teal-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black hover:bg-teal-700 transition-all flex items-center gap-2 shadow-xl active:scale-95 uppercase tracking-widest"
                >
                   Sign Up
                </button>
              </div>
            )}
          </nav>

          <button className="md:hidden p-3 bg-gray-50 rounded-xl text-gray-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-24 bg-white/98 backdrop-blur-3xl z-50 p-8 animate-fade-in">
            <div className="flex flex-col space-y-6">
              {navItems.map(item => (
                <button 
                  key={item.label}
                  onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                  className="text-left font-black text-gray-900 text-3xl tracking-tighter"
                >
                  {item.label}
                </button>
              ))}
              <hr className="border-gray-100" />
              <div className="flex flex-col gap-4">
                 <button onClick={() => { navigate('/auth/login'); setMobileMenuOpen(false); }} className="bg-gray-100 py-6 rounded-[28px] font-black text-xl">ログイン</button>
                 <button onClick={() => { navigate('/auth/register-select'); setMobileMenuOpen(false); }} className="bg-teal-600 text-white py-6 rounded-[28px] font-black text-xl shadow-xl">パートナー加盟・登録</button>
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
                 <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl">S</div>
                 <h2 className="text-3xl font-black tracking-tighter">Soothe <span className="text-teal-600 opacity-50">Japan</span></h2>
              </div>
              <p className="text-gray-500 text-lg leading-relaxed max-w-md font-medium">
                高度なセキュリティとIoTを統合した「CARE CUBE」と、
                日本の誇るセラピストの技術。これらを繋ぎ、安全で自由なウェルネス体験を民主化します。
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
              </ul>
            </div>
          </div>
          <div className="mt-20 pt-10 border-t border-white/5 text-center">
            <p className="text-[9px] text-gray-600 font-black uppercase tracking-[1em]">
              © 2025 Soothe x CARE CUBE Japan. Operational Excellence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PortalLayout;
