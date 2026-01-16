import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC<{ variant?: 'icon' | 'full' }> = ({ variant = 'icon' }) => {
  const { theme, effectiveTheme, setTheme } = useTheme();

  if (variant === 'icon') {
    return (
      <button
        onClick={() => setTheme(effectiveTheme === 'light' ? 'dark' : 'light')}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="テーマを切り替え"
      >
        {effectiveTheme === 'light' ? (
          <Moon size={20} className="text-gray-700 dark:text-gray-300" />
        ) : (
          <Sun size={20} className="text-gray-700 dark:text-gray-300" />
        )}
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="font-black text-sm text-gray-900 dark:text-white mb-4">テーマ設定</h3>
      
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setTheme('light')}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
            theme === 'light'
              ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <Sun size={24} className={theme === 'light' ? 'text-teal-600' : 'text-gray-400'} />
          <span className={`text-xs font-bold ${theme === 'light' ? 'text-teal-600' : 'text-gray-600 dark:text-gray-400'}`}>
            ライト
          </span>
        </button>

        <button
          onClick={() => setTheme('dark')}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
            theme === 'dark'
              ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <Moon size={24} className={theme === 'dark' ? 'text-teal-600' : 'text-gray-400'} />
          <span className={`text-xs font-bold ${theme === 'dark' ? 'text-teal-600' : 'text-gray-600 dark:text-gray-400'}`}>
            ダーク
          </span>
        </button>

        <button
          onClick={() => setTheme('auto')}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
            theme === 'auto'
              ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <Monitor size={24} className={theme === 'auto' ? 'text-teal-600' : 'text-gray-400'} />
          <span className={`text-xs font-bold ${theme === 'auto' ? 'text-teal-600' : 'text-gray-600 dark:text-gray-400'}`}>
            自動
          </span>
        </button>
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
        {theme === 'auto' && '端末の設定に合わせてテーマが変わります'}
        {theme === 'light' && 'ライトモードで表示中'}
        {theme === 'dark' && 'ダークモードで表示中'}
      </p>
    </div>
  );
};

export default ThemeToggle;
