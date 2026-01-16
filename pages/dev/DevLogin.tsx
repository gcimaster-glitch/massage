/**
 * DevLogin: 開発用デモログインページ
 * - ワンクリックでデモログイン
 * - 全ロールのテストアカウントを用意
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Stethoscope, Building, Building2, Shield, TrendingUp, Code } from 'lucide-react';
import { Role } from '../../types';

interface DevLoginProps {
  onLogin: (role: Role, name?: string) => void;
}

const DevLogin: React.FC<DevLoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();

  const demoAccounts = [
    {
      role: Role.USER,
      name: '山田 太郎（一般ユーザー）',
      email: 'user@demo.com',
      icon: <User size={32} />,
      color: 'teal',
      redirect: '/app',
      description: '予約・マップ検索・マイページ',
    },
    {
      role: Role.THERAPIST,
      name: '鈴木 花子（セラピスト）',
      email: 'therapist@demo.com',
      icon: <Stethoscope size={32} />,
      color: 'blue',
      redirect: '/t',
      description: 'スケジュール管理・予約管理・収益確認',
    },
    {
      role: Role.HOST,
      name: '佐藤 健（施設ホスト）',
      email: 'host@demo.com',
      icon: <Building size={32} />,
      color: 'purple',
      redirect: '/h',
      description: '施設管理・予約管理・稼働率分析',
    },
    {
      role: Role.THERAPIST_OFFICE,
      name: '田中 一郎（セラピストオフィス）',
      email: 'office@demo.com',
      icon: <Building2 size={32} />,
      color: 'orange',
      redirect: '/o',
      description: 'セラピスト管理・収益管理・契約管理',
    },
    {
      role: Role.ADMIN,
      name: '管理者（総管理者）',
      email: 'admin@demo.com',
      icon: <Shield size={32} />,
      color: 'red',
      redirect: '/admin',
      description: '全機能アクセス・システム設定・監査',
    },
    {
      role: Role.AFFILIATE,
      name: '吉田 美咲（アフィリエイター）',
      email: 'affiliate@demo.com',
      icon: <TrendingUp size={32} />,
      color: 'green',
      redirect: '/affiliate',
      description: '紹介管理・報酬確認・マーケティング',
    },
  ];

  const handleDemoLogin = (account: typeof demoAccounts[0]) => {
    // Mock JWT token
    const mockToken = btoa(JSON.stringify({
      userId: `${account.role}_demo_001`,
      role: account.role,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    }));

    // Save to localStorage
    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('currentUser', JSON.stringify({
      role: account.role,
      displayName: account.name,
      email: account.email,
    }));

    // Call onLogin callback
    onLogin(account.role, account.name);

    // Redirect to portal
    setTimeout(() => {
      navigate(account.redirect);
    }, 500);
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; hover: string; text: string; border: string }> = {
      teal: { bg: 'bg-teal-50', hover: 'hover:bg-teal-100', text: 'text-teal-600', border: 'border-teal-200' },
      blue: { bg: 'bg-blue-50', hover: 'hover:bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
      purple: { bg: 'bg-purple-50', hover: 'hover:bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
      orange: { bg: 'bg-orange-50', hover: 'hover:bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
      red: { bg: 'bg-red-50', hover: 'hover:bg-red-100', text: 'text-red-600', border: 'border-red-200' },
      green: { bg: 'bg-green-50', hover: 'hover:bg-green-100', text: 'text-green-600', border: 'border-green-200' },
    };
    return colors[color];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-full mb-4">
            <Code size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            🚀 開発用デモログイン
          </h1>
          <p className="text-gray-600 text-lg">
            ワンクリックで各ロールのデモアカウントにログインできます
          </p>
          <div className="mt-4 inline-block bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
            <p className="text-sm text-yellow-800 font-medium">
              ⚠️ このページは開発専用です。本番環境では表示されません。
            </p>
          </div>
        </div>

        {/* Demo Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {demoAccounts.map((account) => {
            const colors = getColorClasses(account.color);
            return (
              <button
                key={account.role}
                onClick={() => handleDemoLogin(account)}
                className={`${colors.bg} ${colors.hover} border-2 ${colors.border} rounded-2xl p-6 text-left transition-all hover:shadow-lg active:scale-95`}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 ${colors.bg} border-2 ${colors.border} rounded-full mb-4 ${colors.text}`}>
                  {account.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {account.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {account.email}
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  {account.description}
                </p>
                <div className={`inline-flex items-center text-sm font-medium ${colors.text}`}>
                  ログイン →
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            📚 開発リソース
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/"
              className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
            >
              <div className="text-sm font-medium text-gray-900 mb-1">
                TOPページ
              </div>
              <div className="text-xs text-gray-500">
                一般ユーザー向けランディング
              </div>
            </a>
            <a
              href="/indexlist"
              className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
            >
              <div className="text-sm font-medium text-gray-900 mb-1">
                全ページ一覧
              </div>
              <div className="text-xs text-gray-500">
                開発用ページインデックス
              </div>
            </a>
            <a
              href="/api/health"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
            >
              <div className="text-sm font-medium text-gray-900 mb-1">
                APIヘルスチェック
              </div>
              <div className="text-xs text-gray-500">
                バックエンドAPI稼働状況
              </div>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            HOGUSY Development Environment v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default DevLogin;
