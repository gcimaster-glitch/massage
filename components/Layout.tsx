
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Role } from '../types';
import { BRAND } from '../constants';
import { 
  Home, Calendar, ShieldAlert, User, Briefcase, 
  MapPin, Settings, LogOut, Menu, X, LayoutDashboard, JapaneseYen, PieChart, FileText, History, BarChart3, Building2, UserPlus, List, HelpCircle, ShieldCheck, Search, Activity, ClipboardCheck, ExternalLink, Megaphone, Palette, Map as MapIcon, Gift, Building, LogIn, CreditCard, Radio, Siren, Zap, Users, Heart, MessageSquare, TrendingUp, UserCheck
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: { role: Role; displayName: string } | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentUser, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navGroups = (role?: Role) => {
    if (!role) return [];
    switch (role) {
      case Role.USER:
        return [
          { 
            title: 'サービス', 
            items: [
              { label: 'ホーム', path: '/app', icon: Home },
              { label: 'マップ検索', path: '/app/map', icon: MapIcon },
              { label: '予約一覧', path: '/app/bookings', icon: Calendar },
              { label: 'サブスク', path: '/app/subscriptions', icon: Zap },
            ] 
          },
          { 
            title: '健康管理', 
            items: [
              { label: '身体の記録', path: '/app/account/wellness', icon: Activity },
              { label: 'ギフト', path: '/app/gifting', icon: Gift },
            ] 
          },
          { 
            title: '設定・サポート', 
            items: [
              { label: 'アカウント設定', path: '/app/account', icon: User },
              { label: 'サポート', path: '/app/support', icon: HelpCircle },
            ] 
          }
        ];
      case Role.THERAPIST:
        return [
          { 
            title: '業務管理', 
            items: [
              { label: 'ダッシュボード', path: '/t', icon: LayoutDashboard },
              { label: 'スケジュール', path: '/t/calendar', icon: Calendar },
            ] 
          },
          { 
            title: '報酬・設定', 
            items: [
              { label: '報酬明細', path: '/t/earnings', icon: JapaneseYen },
              { label: 'プロフィール設定', path: '/t/profile', icon: Settings },
              { label: '自己PR編集', path: '/t/bio', icon: Palette },
            ] 
          },
          { 
            title: '安全', 
            items: [
              { label: '安全センター', path: '/t/safety', icon: ShieldAlert },
            ] 
          }
        ];
      case Role.THERAPIST_OFFICE:
        return [
          { 
            title: '事務所運営', 
            items: [
              { label: 'ダッシュボード', path: '/o', icon: LayoutDashboard },
              { label: 'セラピスト管理', path: '/o/therapists', icon: Users },
              { label: '採用管理', path: '/o/recruitment', icon: UserPlus },
            ] 
          },
          { 
            title: '財務・メニュー', 
            items: [
              { label: '収益管理', path: '/o/earnings', icon: JapaneseYen },
              { label: '料金・メニュー', path: '/o/menu', icon: ClipboardCheck },
            ] 
          },
          { 
            title: '安全・サポート', 
            items: [
              { label: '安全監視', path: '/o/safety', icon: Siren },
              { label: 'サポート受信箱', path: '/o/support', icon: MessageSquare },
            ] 
          },
          { 
            title: '設定', 
            items: [
              { label: '事務所設定', path: '/o/settings', icon: Settings },
            ] 
          }
        ];
      case Role.HOST:
        return [
          { 
            title: '施設運営', 
            items: [
              { label: 'ダッシュボード', path: '/h', icon: LayoutDashboard },
              { label: '施設管理', path: '/h/sites', icon: MapPin },
            ] 
          },
          { 
            title: '財務・安全', 
            items: [
              { label: '収益明細', path: '/h/earnings', icon: JapaneseYen },
              { label: 'インシデント報告', path: '/h/incidents', icon: ShieldAlert },
            ] 
          }
        ];
      case Role.ADMIN:
        return [
          { 
            title: 'メイン', 
            items: [
              { label: 'ダッシュボード', path: '/admin', icon: LayoutDashboard },
              { label: 'ユーザー管理', path: '/admin/users', icon: Users },
              { label: '施設管理', path: '/admin/site-management', icon: Building2 },
              { label: '予約管理', path: '/admin/logs', icon: ClipboardCheck },
            ] 
          },
          { 
            title: '財務・売上', 
            items: [
              { label: '売上・支払い', path: '/admin/payouts', icon: JapaneseYen },
              { label: '売上設定', path: '/admin/revenue-config', icon: Settings },
              { label: 'Stripe管理', path: '/admin/stripe', icon: CreditCard },
            ] 
          },
          { 
            title: 'システム', 
            items: [
              { label: 'アナリティクス', path: '/admin/analytics', icon: BarChart3 },
              { label: 'インシデント管理', path: '/admin/incidents', icon: ShieldAlert },
              { label: 'メール設定', path: '/admin/emails', icon: MessageSquare },
              { label: 'アフィリエイト', path: '/admin/affiliates', icon: Megaphone },
            ] 
          },
          { 
            title: 'サポート', 
            items: [
              { label: 'お問い合わせ', path: '/admin/support', icon: HelpCircle },
            ] 
          }
        ];
      case Role.AFFILIATE:
        return [
          { 
            title: 'アフィリエイト', 
            items: [
              { label: 'ダッシュボード', path: '/affiliate', icon: LayoutDashboard },
              { label: '報酬明細', path: '/affiliate/earnings', icon: JapaneseYen },
            ] 
          }
        ];
      default:
        return [];
    }
  };

  const currentNavGroups = navGroups(currentUser?.role);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-gray-900 font-sans overflow-x-hidden">
      <div className={`fixed inset-0 z-[110] bg-white md:static md:w-72 md:border-r border-gray-200 flex flex-col shadow-2xl md:shadow-none transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-8 border-b border-gray-100 flex flex-col gap-2">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xl">{BRAND.NAME.charAt(0)}</div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-gray-900 tracking-tighter leading-none">{BRAND.NAME}</h1>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">{BRAND.SUB_NAME}</span>
              </div>
           </div>
           {currentUser && <span className="text-[10px] font-black bg-teal-50 text-teal-600 px-2 py-0.5 rounded w-fit uppercase tracking-widest mt-2">{currentUser.role} ACCESS</span>}
        </div>
        <nav className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar">
           {currentNavGroups.map((group, idx) => (
             <div key={idx} className="space-y-1">
                <p className="px-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 mt-4">{group.title}</p>
                {group.items.map(item => (
                  <button 
                    key={item.path} 
                    onClick={() => { navigate(item.path); setMobileMenuOpen(false); }} 
                    className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-[11px] font-black transition-all ${location.pathname === item.path ? 'bg-gray-900 text-white shadow-xl scale-[1.02]' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <item.icon size={16} className={location.pathname === item.path ? 'text-teal-400' : 'opacity-60'} /> 
                    {item.label}
                  </button>
                ))}
             </div>
           ))}
        </nav>
        <div className="p-6 border-t border-gray-100">
           <button onClick={onLogout} className="w-full flex items-center gap-4 px-5 py-4 text-red-600 hover:bg-red-50 rounded-[20px] text-xs font-black transition-colors"><LogOut size={18} /> ログアウト</button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto h-screen relative">
         <div className="md:hidden p-4 flex justify-between items-center bg-white border-b sticky top-0 z-50">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-black">{BRAND.NAME.charAt(0)}</div>
               <h1 className="font-black text-gray-900 tracking-tight">{BRAND.NAME}</h1>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-gray-100 rounded-xl"><Menu size={20}/></button>
         </div>
         <div className="max-w-6xl mx-auto p-4 pt-20 md:p-12">
            {children}
         </div>
      </main>
    </div>
  );
};

export default Layout;
