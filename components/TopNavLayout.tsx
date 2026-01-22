import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, UserCheck, MapPin, Heart, Building2, Calendar, 
  CreditCard, ClipboardCheck, Shield, MessageSquare, 
  FileText, LayoutDashboard, LogOut, ChevronDown, Menu, X
} from 'lucide-react';

interface TopNavLayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

interface MenuCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  label: string;
  path: string;
}

const TopNavLayout: React.FC<TopNavLayoutProps> = ({ children, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuCategories: MenuCategory[] = [
    {
      id: 'dashboard',
      label: 'ダッシュボード',
      icon: <LayoutDashboard size={18} />,
      items: []
    },
    {
      id: 'users',
      label: 'ユーザー管理',
      icon: <Users size={18} />,
      items: [
        { id: 'general-users', label: '一般ユーザー', path: '/admin/users' },
        { id: 'therapists', label: 'セラピスト', path: '/admin/therapists' },
        { id: 'hosts', label: '拠点ホスト', path: '/admin/hosts' },
        { id: 'affiliates', label: 'アフィリエイター', path: '/admin/affiliates' },
      ]
    },
    {
      id: 'facilities',
      label: '施設・拠点',
      icon: <Building2 size={18} />,
      items: [
        { id: 'sites', label: '施設管理（全拠点）', path: '/admin/site-management' },
        { id: 'offices', label: 'セラピストオフィス', path: '/admin/office-management' },
      ]
    },
    {
      id: 'operations',
      label: '予約・決済',
      icon: <Calendar size={18} />,
      items: [
        { id: 'bookings', label: '予約管理', path: '/admin/bookings' },
        { id: 'payments', label: '決済管理', path: '/admin/payments' },
      ]
    },
    {
      id: 'approvals',
      label: '承認・審査',
      icon: <ClipboardCheck size={18} />,
      items: [
        { id: 'pricing', label: 'メニュー/価格承認', path: '/admin/pricing-approvals' },
        { id: 'kyc', label: 'KYC審査', path: '/admin/kyc-approvals' },
      ]
    },
    {
      id: 'system',
      label: 'システム',
      icon: <Shield size={18} />,
      items: [
        { id: 'emails', label: '配信テンプレート', path: '/admin/emails' },
        { id: 'logs', label: '監査ログ・証跡', path: '/admin/logs' },
      ]
    }
  ];

  const handleMenuClick = (categoryId: string, path?: string) => {
    if (path) {
      navigate(path);
      setOpenDropdown(null);
      setMobileMenuOpen(false);
    } else if (categoryId === 'dashboard') {
      navigate('/admin');
      setOpenDropdown(null);
      setMobileMenuOpen(false);
    } else {
      setOpenDropdown(openDropdown === categoryId ? null : categoryId);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* トップナビゲーション */}
      <nav className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-full px-6">
          <div className="flex items-center justify-between h-16">
            {/* ロゴ */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center font-black text-xl">
                  H
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight">HOGUSY</h1>
                  <p className="text-xs text-gray-400 font-bold">Admin Dashboard</p>
                </div>
              </button>
            </div>

            {/* デスクトップメニュー */}
            <div className="hidden md:flex items-center gap-2">
              {menuCategories.map((category) => (
                <div key={category.id} className="relative">
                  {category.items.length === 0 ? (
                    <button
                      onClick={() => handleMenuClick(category.id)}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${
                        location.pathname === '/admin'
                          ? 'bg-teal-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      {category.icon}
                      <span>{category.label}</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === category.id ? null : category.id)}
                        className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
                      >
                        {category.icon}
                        <span>{category.label}</span>
                        <ChevronDown size={16} className={`transition-transform ${openDropdown === category.id ? 'rotate-180' : ''}`} />
                      </button>

                      {openDropdown === category.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenDropdown(null)}
                          />
                          <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-20">
                            {category.items.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => handleMenuClick(category.id, item.path)}
                                className={`w-full px-4 py-2 text-left text-sm font-bold transition-all ${
                                  isActive(item.path)
                                    ? 'bg-teal-50 text-teal-600'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              ))}

              {/* ログアウトボタン */}
              <button
                onClick={onLogout}
                className="ml-4 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold text-gray-300 hover:bg-red-600 hover:text-white transition-all"
              >
                <LogOut size={18} />
                <span>ログアウト</span>
              </button>
            </div>

            {/* モバイルメニューボタン */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700">
            <div className="px-4 py-2 space-y-1">
              {menuCategories.map((category) => (
                <div key={category.id}>
                  {category.items.length === 0 ? (
                    <button
                      onClick={() => handleMenuClick(category.id)}
                      className={`w-full px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${
                        location.pathname === '/admin'
                          ? 'bg-teal-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {category.icon}
                      <span>{category.label}</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === category.id ? null : category.id)}
                        className="w-full px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold text-gray-300 hover:bg-gray-700 transition-all"
                      >
                        {category.icon}
                        <span>{category.label}</span>
                        <ChevronDown size={16} className={`ml-auto transition-transform ${openDropdown === category.id ? 'rotate-180' : ''}`} />
                      </button>
                      {openDropdown === category.id && (
                        <div className="ml-4 mt-1 space-y-1">
                          {category.items.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => handleMenuClick(category.id, item.path)}
                              className={`w-full px-4 py-2 rounded-lg text-left text-sm font-bold transition-all ${
                                isActive(item.path)
                                  ? 'bg-teal-600 text-white'
                                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
              <button
                onClick={onLogout}
                className="w-full px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold text-gray-300 hover:bg-red-600 hover:text-white transition-all"
              >
                <LogOut size={18} />
                <span>ログアウト</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* メインコンテンツ */}
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default TopNavLayout;
