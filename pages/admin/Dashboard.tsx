import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserCheck, Building2, MapPin, Heart, Calendar, 
  CreditCard, ClipboardCheck, Shield, MessageSquare, FileText 
} from 'lucide-react';
import TopNavLayout from '../../components/TopNavLayout';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const quickMenuItems = [
    {
      title: '一般ユーザー管理',
      description: '一般ユーザーの登録・編集・削除',
      icon: <Users size={32} />,
      path: '/admin/users',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'セラピスト管理',
      description: 'セラピストの審査・管理',
      icon: <UserCheck size={32} />,
      path: '/admin/therapists',
      color: 'from-teal-500 to-teal-600'
    },
    {
      title: 'セラピストオフィス管理',
      description: 'オフィスの登録・管理',
      icon: <Building2 size={32} />,
      path: '/admin/office-management',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      title: '拠点ホスト管理',
      description: '施設ホストの管理',
      icon: <MapPin size={32} />,
      path: '/admin/hosts',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'アフィリエイター管理',
      description: 'アフィリエイターの管理',
      icon: <Heart size={32} />,
      path: '/admin/affiliates',
      color: 'from-pink-500 to-pink-600'
    },
    {
      title: '施設管理（全拠点）',
      description: '全施設の一括管理',
      icon: <Building2 size={32} />,
      path: '/admin/site-management',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: '予約管理',
      description: '予約の確認・管理',
      icon: <Calendar size={32} />,
      path: '/admin/bookings',
      color: 'from-green-500 to-green-600'
    },
    {
      title: '決済管理',
      description: '決済の確認・管理',
      icon: <CreditCard size={32} />,
      path: '/admin/payments',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      title: 'メニュー/価格承認',
      description: 'メニューと価格の承認',
      icon: <ClipboardCheck size={32} />,
      path: '/admin/pricing-approvals',
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'KYC審査',
      description: '本人確認書類の審査',
      icon: <Shield size={32} />,
      path: '/admin/kyc-approvals',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      title: '配信テンプレート',
      description: 'メール配信テンプレート管理',
      icon: <MessageSquare size={32} />,
      path: '/admin/emails',
      color: 'from-lime-500 to-lime-600'
    },
    {
      title: '監査ログ・証跡',
      description: 'システム操作ログの確認',
      icon: <FileText size={32} />,
      path: '/admin/logs',
      color: 'from-gray-500 to-gray-600'
    }
  ];

  return (
    <TopNavLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">管理ダッシュボード</h1>
          <p className="text-gray-600">クイックメニューから各管理画面にアクセスできます</p>
        </div>

        {/* クイックメニュー（ボタン型グリッド） */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {quickMenuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 text-left group"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </button>
          ))}
        </div>
      </div>
    </TopNavLayout>
  );
};

export default AdminDashboard;
