import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, Stethoscope, Building2, Home, TrendingUp, Shield,
  ArrowRight, Lock, CheckCircle
} from 'lucide-react'

interface PortalItem {
  id: string
  name: string
  path: string
  loginPath: string
  icon: React.ReactNode
  description: string
  color: string
  features: string[]
}

const IndexList: React.FC = () => {
  const navigate = useNavigate()

  // ワンクリックログイン関数
  const handleQuickLogin = async (role: string, email: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'demo123' })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.token);
        
        // 役割に応じてリダイレクト
        const redirectPaths: { [key: string]: string } = {
          'USER': '/app',
          'THERAPIST': '/t',
          'THERAPIST_OFFICE': '/o',
          'HOST': '/h',
          'AFFILIATE': '/affiliate',
          'ADMIN': '/admin'
        };
        
        window.location.href = redirectPaths[role] || '/app';
      } else {
        alert('ログインに失敗しました');
      }
    } catch (err) {
      alert('ログインエラーが発生しました');
    }
  };

  const portals: PortalItem[] = [
    {
      id: 'user',
      name: '会員ポータル',
      path: '/app',
      loginPath: '/auth/login/user',
      icon: <Users size={32} />,
      description: '出張マッサージ予約・CARE CUBE予約',
      color: 'from-teal-500 to-blue-500',
      features: ['出張予約（KYC必須）', 'CARE CUBE予約', 'マイページ', '予約履歴']
    },
    {
      id: 'therapist',
      name: 'セラピストポータル',
      path: '/t',
      loginPath: '/auth/login/therapist',
      icon: <Stethoscope size={32} />,
      description: 'セラピスト専用ダッシュボード',
      color: 'from-indigo-500 to-purple-500',
      features: ['スケジュール管理', '予約確認', '売上確認', 'プロフィール編集']
    },
    {
      id: 'office',
      name: 'セラピストオフィスポータル',
      path: '/o',
      loginPath: '/auth/login/office',
      icon: <Building2 size={32} />,
      description: '事務所管理者専用',
      color: 'from-blue-500 to-cyan-500',
      features: ['所属セラピスト管理', '編集承認', '売上管理', '事務所情報編集']
    },
    {
      id: 'host',
      name: '施設ホストポータル',
      path: '/h',
      loginPath: '/auth/login/host',
      icon: <Home size={32} />,
      description: 'CARE CUBE・ホテル等施設管理',
      color: 'from-orange-500 to-amber-500',
      features: ['施設管理', '予約状況確認', '売上確認', '施設情報編集']
    },
    {
      id: 'affiliate',
      name: 'アフィリエイターポータル',
      path: '/affiliate',
      loginPath: '/auth/login/affiliate',
      icon: <TrendingUp size={32} />,
      description: '紹介報酬管理',
      color: 'from-purple-500 to-pink-500',
      features: ['紹介実績確認', '報酬確認', '支払い履歴', 'アフィリエイトリンク']
    },
    {
      id: 'admin',
      name: '総管理者ポータル',
      path: '/admin',
      loginPath: '/auth/login/admin',
      icon: <Shield size={32} />,
      description: 'プラットフォーム完全管理',
      color: 'from-gray-900 to-gray-700',
      features: ['全ユーザー管理', 'KYC承認', '売上管理', 'システム設定']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">HOGUSY</h1>
              <p className="text-sm text-gray-500 font-bold mt-1">総管理インデックス - Portal Directory</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2">
              <p className="text-xs font-black text-red-600 uppercase tracking-wider">🚧 開発中 - Development Only</p>
              <p className="text-xs text-red-500 mt-0.5">本番公開時に削除されます</p>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl shadow-sm">
          <div className="flex items-start gap-4">
            <Lock className="text-yellow-600 flex-shrink-0" size={24} />
            <div>
              <h3 className="text-sm font-black text-yellow-900 mb-2">⚠️ このページについて</h3>
              <p className="text-sm text-yellow-800 leading-relaxed">
                このページは開発・テスト用の総合インデックスです。各ポータルへの直接アクセスを可能にします。
                <strong className="font-black">本番環境公開時には削除</strong>され、各ユーザーは専用のURLからアクセスします。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Portal Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portals.map((portal) => (
            <div
              key={portal.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group"
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${portal.color} p-6 text-white`}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    {portal.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">{portal.name}</h3>
                    <p className="text-xs font-bold text-white/80 mt-1">{portal.description}</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="p-6">
                <ul className="space-y-2 mb-6">
                  {portal.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle size={16} className="text-teal-500 flex-shrink-0" />
                      <span className="font-bold">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleQuickLogin(
                      portal.id === 'user' ? 'USER' :
                      portal.id === 'therapist' ? 'THERAPIST' :
                      portal.id === 'office' ? 'THERAPIST_OFFICE' :
                      portal.id === 'host' ? 'HOST' :
                      portal.id === 'affiliate' ? 'AFFILIATE' :
                      'ADMIN',
                      portal.id === 'admin' ? 'admin@hogusy.com' : `demo-${portal.id}@hogusy.com`
                    )}
                    className={`w-full bg-gradient-to-r ${portal.color} text-white py-3 rounded-xl font-black text-sm hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-[1.02]`}
                  >
                    <CheckCircle size={16} />
                    ワンクリックログイン
                  </button>
                  <button
                    onClick={() => navigate(portal.path)}
                    className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    ポータルTOPへ
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => navigate(portal.loginPath)}
                    className="w-full bg-gray-50 text-gray-600 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Lock size={14} />
                    ログインページへ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-black text-gray-900 mb-4">📋 開発者向けメモ</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p className="font-bold">✅ 実装済み: データベース構造、API層、管理画面基本機能</p>
            <p className="font-bold">🚧 実装中: 各ポータルの分離とログインフロー</p>
            <p className="font-bold">📝 TODO: Google OAuth統合、KYC承認フロー</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IndexList
