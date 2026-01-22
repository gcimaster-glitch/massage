import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

interface SimpleLayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

const SimpleLayout: React.FC<SimpleLayoutProps> = ({ children, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* シンプルなヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-full px-8 py-4 flex items-center justify-between">
          {/* ロゴ */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center font-black text-xl text-white">
              H
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">HOGUSY</h1>
              <p className="text-xs text-gray-500 font-bold">Admin Dashboard</p>
            </div>
          </button>

          {/* ログアウトボタン */}
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all"
          >
            <LogOut size={18} />
            <span>ログアウト</span>
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main>
        {children}
      </main>
    </div>
  );
};

export default SimpleLayout;
