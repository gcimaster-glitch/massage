import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Users, Building2, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">管理ダッシュボード</h1>
          <p className="text-gray-600 mt-2">プラットフォーム全体の状況を確認</p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="総ユーザー数"
            value="1,234"
            icon={<Users size={24} />}
            color="bg-blue-500"
            change="+12%"
          />
          <StatCard
            title="総施設数"
            value="188"
            icon={<Building2 size={24} />}
            color="bg-green-500"
            change="+8%"
          />
          <StatCard
            title="今月の予約"
            value="567"
            icon={<Calendar size={24} />}
            color="bg-purple-500"
            change="+24%"
          />
          <StatCard
            title="売上（今月）"
            value="¥2.4M"
            icon={<TrendingUp size={24} />}
            color="bg-teal-500"
            change="+15%"
          />
        </div>

        {/* クイックアクション */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">クイックアクション</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ActionButton
              title="ユーザー管理"
              onClick={() => navigate('/admin/users')}
              icon={<Users size={20} />}
            />
            <ActionButton
              title="施設管理"
              onClick={() => navigate('/admin/site-management')}
              icon={<Building2 size={20} />}
            />
            <ActionButton
              title="セラピスト管理"
              onClick={() => navigate('/admin/therapists')}
              icon={<Activity size={20} />}
            />
            <ActionButton
              title="予約管理"
              onClick={() => navigate('/admin/bookings')}
              icon={<Calendar size={20} />}
            />
            <ActionButton
              title="拠点ホスト管理"
              onClick={() => navigate('/admin/hosts')}
              icon={<Building2 size={20} />}
            />
            <ActionButton
              title="監査ログ"
              onClick={() => navigate('/admin/logs')}
              icon={<AlertCircle size={20} />}
            />
          </div>
        </div>

        {/* システム状態 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">システム状態</h2>
          <div className="space-y-3">
            <StatusRow label="API サーバー" status="正常" color="green" />
            <StatusRow label="データベース" status="正常" color="green" />
            <StatusRow label="決済システム" status="正常" color="green" />
            <StatusRow label="メール配信" status="正常" color="green" />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// 統計カード
const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  change: string;
}> = ({ title, value, icon, color, change }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex items-center justify-between mb-4">
      <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
      <span className="text-sm font-bold text-green-600">{change}</span>
    </div>
    <h3 className="text-gray-600 text-sm font-bold mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

// アクションボタン
const ActionButton: React.FC<{
  title: string;
  onClick: () => void;
  icon: React.ReactNode;
}> = ({ title, onClick, icon }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
  >
    <div className="text-teal-600">{icon}</div>
    <span className="font-bold text-gray-900">{title}</span>
  </button>
);

// ステータス行
const StatusRow: React.FC<{
  label: string;
  status: string;
  color: string;
}> = ({ label, status, color }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-700 font-bold">{label}</span>
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full bg-${color}-500`}></div>
      <span className="text-sm font-bold text-gray-600">{status}</span>
    </div>
  </div>
);

export default AdminDashboard;
