/**
 * ユーザーダッシュボード（改善版）
 * ヘッダー統一、お知らせ、利用履歴、サポート機能
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Calendar, Heart, TrendingUp, Bell, 
  MessageSquare, CreditCard, User, FileText, Award, Clock
} from 'lucide-react';
import UserHeader from '../../src/components/UserHeader';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  date: string;
  read: boolean;
}

interface Booking {
  id: string;
  therapist_name: string;
  site_name: string;
  date: string;
  time: string;
  status: 'completed' | 'upcoming' | 'cancelled';
  amount: number;
}

const UserDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalSpent: 0,
    favoriteCount: 0,
    points: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('No auth token found');
        return;
      }

      console.log('📊 Loading dashboard data...');

      // 予約履歴を取得
      try {
        const bookingsResponse = await fetch('/api/bookings?limit=10', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (bookingsResponse.ok) {
          const data = await bookingsResponse.json();
          console.log('✅ Bookings loaded:', data);
          
          // APIレスポンスをBooking型に変換
          const bookings = (data.bookings || []).map((b: any) => ({
            id: b.id,
            therapist_name: b.therapist_name || 'セラピスト',
            site_name: b.site_name || '施設名未設定',
            date: b.scheduled_start?.split('T')[0] || b.scheduled_at?.split('T')[0] || '',
            time: b.scheduled_start?.split('T')[1]?.substring(0, 5) || b.scheduled_at?.split('T')[1]?.substring(0, 5) || '',
            status: b.status === 'COMPLETED' ? 'completed' : 
                   b.status === 'CANCELLED' ? 'cancelled' : 'upcoming',
            amount: b.price || 0
          }));

          setRecentBookings(bookings);

          // 統計を計算
          const totalBookings = bookings.length;
          const totalSpent = bookings
            .filter((b: Booking) => b.status === 'completed')
            .reduce((sum: number, b: Booking) => sum + b.amount, 0);

          setStats({
            totalBookings,
            totalSpent,
            favoriteCount: 0, // TODO: お気に入りAPI実装後
            points: 0 // TODO: ポイントAPI実装後
          });
        } else {
          console.error('Failed to fetch bookings:', bookingsResponse.status);
        }
      } catch (bookingError) {
        console.error('Error fetching bookings:', bookingError);
      }

      // 通知を取得（オプション、まだ未実装の場合はスキップ）
      try {
        const notifResponse = await fetch('/api/users/notifications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (notifResponse.ok) {
          const data = await notifResponse.json();
          setNotifications(data.notifications || []);
        }
      } catch (notifError) {
        console.log('Notifications API not available yet');
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            ようこそ、HOGUSYへ
          </h1>
          <p className="text-gray-600">あなたの「ほぐしたい」を叶える</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => navigate('/app/map')}
            className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-teal-600 transition-all hover:shadow-lg group"
          >
            <MapPin className="w-8 h-8 text-teal-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-gray-900 mb-1">施設を探す</h3>
            <p className="text-sm text-gray-600">近くの施設を検索</p>
          </button>

          <button
            onClick={() => navigate('/app/bookings')}
            className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-teal-600 transition-all hover:shadow-lg group"
          >
            <Calendar className="w-8 h-8 text-teal-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-gray-900 mb-1">予約一覧</h3>
            <p className="text-sm text-gray-600">予約履歴を確認</p>
          </button>

          <button
            onClick={() => navigate('/app/favorites')}
            className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-teal-600 transition-all hover:shadow-lg group"
          >
            <Heart className="w-8 h-8 text-teal-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-gray-900 mb-1">お気に入り</h3>
            <p className="text-sm text-gray-600">保存した施設</p>
          </button>

          <button
            onClick={() => navigate('/app/account')}
            className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-teal-600 transition-all hover:shadow-lg group"
          >
            <User className="w-8 h-8 text-teal-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-gray-900 mb-1">アカウント</h3>
            <p className="text-sm text-gray-600">設定・情報</p>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl text-white">
            <Calendar className="w-6 h-6 mb-2 opacity-80" />
            <p className="text-sm opacity-80 mb-1">総予約数</p>
            <p className="text-3xl font-black">{stats.totalBookings}</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl text-white">
            <CreditCard className="w-6 h-6 mb-2 opacity-80" />
            <p className="text-sm opacity-80 mb-1">累計利用額</p>
            <p className="text-3xl font-black">¥{stats.totalSpent.toLocaleString()}</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-pink-600 to-pink-700 rounded-2xl text-white">
            <Heart className="w-6 h-6 mb-2 opacity-80" />
            <p className="text-sm opacity-80 mb-1">お気に入り</p>
            <p className="text-3xl font-black">{stats.favoriteCount}</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl text-white">
            <Award className="w-6 h-6 mb-2 opacity-80" />
            <p className="text-sm opacity-80 mb-1">ポイント</p>
            <p className="text-3xl font-black">{stats.points}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notifications */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-6 h-6 text-teal-600" />
                  <h2 className="text-xl font-black text-gray-900">お知らせ</h2>
                </div>
                <button
                  onClick={() => navigate('/app/notifications')}
                  className="text-sm font-bold text-teal-600 hover:text-teal-700"
                >
                  すべて見る →
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">お知らせはありません</p>
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notif.read ? 'bg-teal-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          !notif.read ? 'bg-teal-600' : 'bg-gray-300'
                        }`}></div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">{notif.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                          <p className="text-xs text-gray-400">{notif.date}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mt-8">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-teal-600" />
                  <h2 className="text-xl font-black text-gray-900">利用履歴</h2>
                </div>
                <button
                  onClick={() => navigate('/app/bookings')}
                  className="text-sm font-bold text-teal-600 hover:text-teal-700"
                >
                  すべて見る →
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {recentBookings.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">予約履歴はありません</p>
                  </div>
                ) : (
                  recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/app/booking/${booking.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">{booking.site_name}</h3>
                          <p className="text-sm text-gray-600">{booking.therapist_name}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {booking.date} {booking.time}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {booking.status === 'completed' ? '完了' :
                             booking.status === 'upcoming' ? '予約中' : 'キャンセル'}
                          </span>
                          <p className="text-sm font-bold text-gray-900 mt-1">
                            ¥{booking.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Support Card */}
            <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 text-white">
              <MessageSquare className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-black mb-2">サポート</h3>
              <p className="text-sm opacity-90 mb-4">
                ご不明な点やお困りのことがあれば、お気軽にお問い合わせください。
              </p>
              <button
                onClick={() => navigate('/app/support')}
                className="w-full bg-white text-teal-600 py-3 rounded-xl font-bold hover:shadow-lg transition-shadow"
              >
                お問い合わせ
              </button>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-black text-gray-900 mb-4">クイックリンク</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/app/account/payment')}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3"
                >
                  <CreditCard size={18} className="text-gray-400" />
                  <span className="font-medium text-gray-700">決済方法</span>
                </button>
                <button
                  onClick={() => navigate('/app/account/kyc')}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3"
                >
                  <FileText size={18} className="text-gray-400" />
                  <span className="font-medium text-gray-700">本人確認</span>
                </button>
                <button
                  onClick={() => navigate('/app/account/wellness')}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3"
                >
                  <TrendingUp size={18} className="text-gray-400" />
                  <span className="font-medium text-gray-700">健康記録</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
