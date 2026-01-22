import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserCheck, Building2, MapPin, Heart, Calendar, 
  CreditCard, ClipboardCheck, Shield, MessageSquare, FileText,
  TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock,
  DollarSign, Activity, Bell, UserPlus, ArrowRight, RefreshCw
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import SimpleLayout from '../../components/SimpleLayout';

// Chart.js登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month'>('day');
  const [loading, setLoading] = useState(false);

  // 統計データ（モックデータ）
  const stats = {
    day: {
      bookings: { value: 142, change: 12.5, trend: 'up' },
      activeTherapists: { value: 48, change: 8.3, trend: 'up' },
      revenue: { value: '¥842,000', change: 15.2, trend: 'up' },
      completionRate: { value: '94.5%', change: 2.1, trend: 'up' }
    },
    week: {
      bookings: { value: 856, change: 18.7, trend: 'up' },
      activeTherapists: { value: 124, change: 12.4, trend: 'up' },
      revenue: { value: '¥5,240,000', change: 22.3, trend: 'up' },
      completionRate: { value: '95.2%', change: 1.8, trend: 'up' }
    },
    month: {
      bookings: { value: 3420, change: 25.6, trend: 'up' },
      activeTherapists: { value: 234, change: 15.8, trend: 'up' },
      revenue: { value: '¥21,800,000', change: 28.4, trend: 'up' },
      completionRate: { value: '96.1%', change: 3.2, trend: 'up' }
    }
  };

  // グラフデータ
  const chartData = {
    day: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      revenue: [45000, 38000, 52000, 89000, 145000, 178000, 142000],
      bookings: [8, 6, 12, 18, 28, 35, 35]
    },
    week: {
      labels: ['月', '火', '水', '木', '金', '土', '日'],
      revenue: [620000, 680000, 720000, 850000, 920000, 1180000, 1270000],
      bookings: [98, 112, 125, 138, 145, 168, 170]
    },
    month: {
      labels: ['1週', '2週', '3週', '4週'],
      revenue: [4200000, 4800000, 5600000, 7200000],
      bookings: [580, 680, 820, 1340]
    }
  };

  const currentChartData = chartData[activeTab];

  // 売上グラフ設定
  const revenueChartData = {
    labels: currentChartData.labels,
    datasets: [
      {
        label: '売上',
        data: currentChartData.revenue,
        borderColor: 'rgb(20, 184, 166)',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // 予約数グラフ設定
  const bookingsChartData = {
    labels: currentChartData.labels,
    datasets: [
      {
        label: '予約数',
        data: currentChartData.bookings,
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // お知らせ
  const notices = [
    { id: 1, title: '新機能リリース：AI自動マッチング機能', date: '2026-01-22', type: 'info' },
    { id: 2, title: 'システムメンテナンス予定（1/25 02:00-04:00）', date: '2026-01-21', type: 'warning' },
    { id: 3, title: '年末年始の営業時間変更について', date: '2026-01-20', type: 'info' }
  ];

  // 新規申し込み
  const newApplications = [
    { id: 1, type: 'therapist', name: '田中 花子', date: '2026-01-22 14:30', status: 'pending' },
    { id: 2, type: 'host', name: 'ホテル渋谷', date: '2026-01-22 13:15', status: 'pending' },
    { id: 3, type: 'therapist', name: '佐藤 太郎', date: '2026-01-22 11:20', status: 'reviewing' },
    { id: 4, type: 'office', name: '東京整体院', date: '2026-01-22 10:05', status: 'pending' }
  ];

  // インシデント情報
  const incidents = [
    { id: 1, severity: 'high', title: 'SOS発報 - 新宿CUBE-03', time: '15分前', status: 'responding' },
    { id: 2, severity: 'medium', title: '決済エラー報告（複数件）', time: '1時間前', status: 'investigating' },
    { id: 3, severity: 'low', title: 'アプリログイン遅延報告', time: '3時間前', status: 'resolved' }
  ];

  const currentStats = stats[activeTab];

  const quickMenuItems = [
    {
      title: '一般ユーザー管理',
      description: '一般ユーザーの登録・編集・削除',
      icon: <Users size={24} />,
      path: '/admin/users',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'セラピスト管理',
      description: 'セラピストの審査・管理',
      icon: <UserCheck size={24} />,
      path: '/admin/therapists',
      color: 'from-teal-500 to-teal-600'
    },
    {
      title: 'セラピストオフィス管理',
      description: 'オフィスの登録・管理',
      icon: <Building2 size={24} />,
      path: '/admin/office-management',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      title: '拠点ホスト管理',
      description: '施設ホストの管理',
      icon: <MapPin size={24} />,
      path: '/admin/hosts',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'アフィリエイター管理',
      description: 'アフィリエイターの管理',
      icon: <Heart size={24} />,
      path: '/admin/affiliates',
      color: 'from-pink-500 to-pink-600'
    },
    {
      title: '施設管理（全拠点）',
      description: '全施設の一括管理',
      icon: <Building2 size={24} />,
      path: '/admin/site-management',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: '予約管理',
      description: '予約の確認・管理',
      icon: <Calendar size={24} />,
      path: '/admin/bookings',
      color: 'from-green-500 to-green-600'
    },
    {
      title: '決済管理',
      description: '決済の確認・管理',
      icon: <CreditCard size={24} />,
      path: '/admin/payments',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      title: 'メニュー/価格承認',
      description: 'メニューと価格の承認',
      icon: <ClipboardCheck size={24} />,
      path: '/admin/pricing-approvals',
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'KYC審査',
      description: '本人確認書類の審査',
      icon: <Shield size={24} />,
      path: '/admin/kyc-approvals',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      title: '配信テンプレート',
      description: 'メール配信テンプレート管理',
      icon: <MessageSquare size={24} />,
      path: '/admin/emails',
      color: 'from-lime-500 to-lime-600'
    },
    {
      title: '監査ログ・証跡',
      description: 'システム操作ログの確認',
      icon: <FileText size={24} />,
      path: '/admin/logs',
      color: 'from-gray-500 to-gray-600'
    }
  ];

  // データ更新（モック）
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <SimpleLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* ヘッダー */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">管理ダッシュボード</h1>
            <p className="text-gray-600">リアルタイムの運営状況を確認できます</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            データ更新
          </button>
        </div>

        {/* 期間切り替えタブ */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('day')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'day' 
                ? 'bg-teal-600 text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            日次
          </button>
          <button
            onClick={() => setActiveTab('week')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'week' 
                ? 'bg-teal-600 text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            週次
          </button>
          <button
            onClick={() => setActiveTab('month')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'month' 
                ? 'bg-teal-600 text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            月次
          </button>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="予約数"
            value={currentStats.bookings.value}
            change={currentStats.bookings.change}
            trend={currentStats.bookings.trend}
            icon={<Calendar size={24} />}
            color="blue"
          />
          <StatCard
            title="稼働セラピスト"
            value={currentStats.activeTherapists.value}
            change={currentStats.activeTherapists.change}
            trend={currentStats.activeTherapists.trend}
            icon={<Activity size={24} />}
            color="teal"
          />
          <StatCard
            title="売上"
            value={currentStats.revenue.value}
            change={currentStats.revenue.change}
            trend={currentStats.revenue.trend}
            icon={<DollarSign size={24} />}
            color="green"
          />
          <StatCard
            title="完了率"
            value={currentStats.completionRate.value}
            change={currentStats.completionRate.change}
            trend={currentStats.completionRate.trend}
            icon={<CheckCircle size={24} />}
            color="purple"
          />
        </div>

        {/* グラフエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 売上推移グラフ */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">売上推移</h2>
            <div className="h-64">
              <Line data={revenueChartData} options={chartOptions} />
            </div>
          </div>

          {/* 予約数推移グラフ */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">予約数推移</h2>
            <div className="h-64">
              <Bar data={bookingsChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* お知らせ & 新規申し込み */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* お知らせ */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Bell size={20} className="text-teal-600" />
                お知らせ
              </h2>
              <button className="text-sm text-teal-600 hover:text-teal-700 font-bold">
                すべて見る →
              </button>
            </div>
            <div className="space-y-3">
              {notices.map(notice => (
                <div 
                  key={notice.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notice.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">{notice.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{notice.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 新規申し込み */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <UserPlus size={20} className="text-teal-600" />
                新規申し込み
              </h2>
              <button 
                onClick={() => navigate('/admin/kyc-approvals')}
                className="text-sm text-teal-600 hover:text-teal-700 font-bold"
              >
                審査画面へ →
              </button>
            </div>
            <div className="space-y-3">
              {newApplications.map(app => (
                <div 
                  key={app.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                  onClick={() => navigate('/admin/kyc-approvals')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        app.type === 'therapist' ? 'bg-teal-100 text-teal-600' :
                        app.type === 'host' ? 'bg-orange-100 text-orange-600' :
                        'bg-indigo-100 text-indigo-600'
                      }`}>
                        {app.type === 'therapist' ? <UserCheck size={20} /> :
                         app.type === 'host' ? <MapPin size={20} /> :
                         <Building2 size={20} />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{app.name}</p>
                        <p className="text-xs text-gray-500">{app.date}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {app.status === 'pending' ? '審査待ち' : '審査中'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* インシデント情報 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle size={20} className="text-red-600" />
              インシデント情報
            </h2>
            <button 
              onClick={() => navigate('/admin/logs')}
              className="text-sm text-teal-600 hover:text-teal-700 font-bold"
            >
              ログ画面へ →
            </button>
          </div>
          <div className="space-y-3">
            {incidents.map(incident => (
              <div 
                key={incident.id}
                className={`p-4 rounded-lg border-l-4 ${
                  incident.severity === 'high' ? 'bg-red-50 border-red-500' :
                  incident.severity === 'medium' ? 'bg-orange-50 border-orange-500' :
                  'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      incident.severity === 'high' ? 'bg-red-100 text-red-600' :
                      incident.severity === 'medium' ? 'bg-orange-100 text-orange-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <AlertCircle size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{incident.title}</p>
                      <p className="text-xs text-gray-500">{incident.time}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    incident.status === 'responding' ? 'bg-red-100 text-red-700' :
                    incident.status === 'investigating' ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {incident.status === 'responding' ? '対応中' :
                     incident.status === 'investigating' ? '調査中' :
                     '解決済み'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* クイックメニュー */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">クイックメニュー</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {quickMenuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 text-left group"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-600">{item.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </SimpleLayout>
  );
};

// 統計カードコンポーネント
const StatCard: React.FC<{
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, change, trend, icon, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    teal: 'from-teal-500 to-teal-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center text-white`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
          trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {change}%
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default AdminDashboard;
