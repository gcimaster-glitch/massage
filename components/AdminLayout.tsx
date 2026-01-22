import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, UserCheck, MapPin, Heart, Building2, Calendar, 
  CreditCard, ClipboardCheck, Shield, MessageSquare, 
  FileText, LayoutDashboard, LogOut, ChevronRight
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'ダッシュボード',
      icon: <LayoutDashboard size={20} />,
      path: '/admin'
    },
    {
      id: 'users',
      label: '一般ユーザー管理',
      icon: <Users size={20} />,
      path: '/admin/users'
    },
    {
      id: 'therapists',
      label: 'セラピスト管理',
      icon: <UserCheck size={20} />,
      path: '/admin/therapists'
    },
    {
      id: 'offices',
      label: 'セラピストオフィス管理',
      icon: <Building2 size={20} />,
      path: '/admin/office-management'
    },
    {
      id: 'hosts',
      label: '拠点ホスト管理',
      icon: <MapPin size={20} />,
      path: '/admin/hosts'
    },
    {
      id: 'affiliates',
      label: 'アフィリエイター管理',
      icon: <Heart size={20} />,
      path: '/admin/affiliates'
    },
    {
      id: 'sites',
      label: '施設管理（全拠点）',
      icon: <Building2 size={20} />,
      path: '/admin/site-management'
    },
    {
      id: 'bookings',
      label: '予約管理',
      icon: <Calendar size={20} />,
      path: '/admin/bookings'
    },
    {
      id: 'payments',
      label: '決済管理',
      icon: <CreditCard size={20} />,
      path: '/admin/payments'
    },
    {
      id: 'pricing',
      label: 'メニュー/価格承認',
      icon: <ClipboardCheck size={20} />,
      path: '/admin/pricing-approvals'
    },
    {
      id: 'kyc',
      label: 'KYC審査',
      icon: <Shield size={20} />,
      path: '/admin/kyc-approvals'
    },
    {
      id: 'emails',
      label: '配信テンプレート',
      icon: <MessageSquare size={20} />,
      path: '/admin/emails'
    },
    {
      id: 'logs',
      label: '監査ログ・証跡',
      icon: <FileText size={20} />,
      path: '/admin/logs'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左サイドバー */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        {/* ロゴ */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-black tracking-tight">
            HOGUSY
            <span className="text-xs font-normal text-gray-400 ml-2">
              Powered by CHARGE
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-bold uppercase tracking-wider">
            Admin Dashboard
          </p>
        </div>

        {/* メニュー */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                isActive(item.path)
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="text-sm font-bold">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                  {item.badge}
                </span>
              )}
              {isActive(item.path) && (
                <ChevronRight size={16} />
              )}
            </button>
          ))}
        </nav>

        {/* ログアウト */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="text-sm font-bold">ログアウト</span>
          </button>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
