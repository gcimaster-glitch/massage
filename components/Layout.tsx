
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Role } from '../types';
import { BRAND } from '../constants';
import { LogOut, Menu } from 'lucide-react';
import { getMenuForRole } from '../src/config/menu-config';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: { role: Role; displayName: string } | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentUser, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Get menu from config file
  const currentNavGroups = getMenuForRole(currentUser?.role);

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
