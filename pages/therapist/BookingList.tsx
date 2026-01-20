/**
 * セラピスト予約一覧ページ
 * 自分が担当する予約を管理
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, User, Phone, Mail, 
  ChevronRight, Filter, Search, CheckCircle, XCircle,
  PlayCircle, StopCircle
} from 'lucide-react';

interface Booking {
  id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  user_address?: string;
  site_name?: string;
  site_address?: string;
  service_name: string;
  scheduled_start: string;
  duration: number;
  price: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  payment_status?: string;
}

const TherapistBookingList: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/auth/login/therapist');
        return;
      }

      let url = '/api/bookings?limit=50';
      if (filter !== 'all') {
        url += `&status=${filter}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: '保留中' },
      CONFIRMED: { color: 'bg-blue-100 text-blue-800', label: '確定' },
      IN_PROGRESS: { color: 'bg-green-100 text-green-800', label: '施術中' },
      COMPLETED: { color: 'bg-gray-100 text-gray-800', label: '完了' },
      CANCELLED: { color: 'bg-red-100 text-red-800', label: 'キャンセル' }
    };

    const badge = badges[status] || badges.PENDING;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const filteredBookings = bookings.filter(booking => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      booking.user_name?.toLowerCase().includes(query) ||
      booking.service_name?.toLowerCase().includes(query) ||
      booking.site_name?.toLowerCase().includes(query)
    );
  });

  const todayBookings = filteredBookings.filter(b => {
    const today = new Date().toDateString();
    const bookingDate = new Date(b.scheduled_start).toDateString();
    return today === bookingDate;
  });

  const upcomingBookings = filteredBookings.filter(b => {
    const today = new Date();
    const bookingDate = new Date(b.scheduled_start);
    return bookingDate > today && bookingDate.toDateString() !== today.toDateString();
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">予約管理</h1>
              <p className="text-sm text-gray-600 mt-1">担当する予約を確認・管理できます</p>
            </div>
            <button
              onClick={() => navigate('/t')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors"
            >
              ダッシュボード
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="顧客名・サービス名で検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">すべての予約</option>
                <option value="CONFIRMED">確定のみ</option>
                <option value="IN_PROGRESS">施術中のみ</option>
                <option value="COMPLETED">完了のみ</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <>
            {/* Today's Bookings */}
            {todayBookings.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="text-teal-600" size={24} />
                  本日の予約 ({todayBookings.length}件)
                </h2>
                <div className="space-y-4">
                  {todayBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} onUpdate={loadBookings} />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="text-gray-600" size={24} />
                  今後の予約 ({upcomingBookings.length}件)
                </h2>
                <div className="space-y-4">
                  {upcomingBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} onUpdate={loadBookings} />
                  ))}
                </div>
              </div>
            )}

            {filteredBookings.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">予約がありません</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Booking Card Component
const BookingCard: React.FC<{ booking: Booking; onUpdate: () => void }> = ({ booking, onUpdate }) => {
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!window.confirm(`ステータスを「${getStatusLabel(newStatus)}」に変更しますか？`)) {
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      alert('ステータスを更新しました');
      onUpdate();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('ステータス更新に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      IN_PROGRESS: '施術中',
      COMPLETED: '完了',
      CANCELLED: 'キャンセル'
    };
    return labels[status] || status;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: '保留中' },
      CONFIRMED: { color: 'bg-blue-100 text-blue-800', label: '確定' },
      IN_PROGRESS: { color: 'bg-green-100 text-green-800', label: '施術中' },
      COMPLETED: { color: 'bg-gray-100 text-gray-800', label: '完了' },
      CANCELLED: { color: 'bg-red-100 text-red-800', label: 'キャンセル' }
    };

    const badge = badges[status] || badges.PENDING;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-gray-900">{booking.service_name}</h3>
            {getStatusBadge(booking.status)}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar size={16} />
              {formatDate(booking.scheduled_start)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={16} />
              {formatTime(booking.scheduled_start)} ({booking.duration}分)
            </span>
            <span className="font-bold text-teal-600">
              ¥{booking.price.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <User size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-900">{booking.user_name || '顧客名未設定'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={16} className="text-gray-400" />
          <span className="text-sm text-gray-600">{booking.user_phone || '電話番号未登録'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-gray-400" />
          <span className="text-sm text-gray-600">{booking.user_email || 'メール未登録'}</span>
        </div>
      </div>

      {/* Location */}
      {booking.site_name && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <MapPin size={16} className="text-gray-400" />
          <span>{booking.site_name}</span>
          {booking.site_address && <span className="text-gray-400">- {booking.site_address}</span>}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/t/bookings/${booking.id}`)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors"
        >
          詳細を見る
          <ChevronRight size={16} />
        </button>

        {booking.status === 'CONFIRMED' && (
          <button
            onClick={() => handleStatusUpdate('IN_PROGRESS')}
            disabled={updating}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
          >
            <PlayCircle size={16} />
            入室・開始
          </button>
        )}

        {booking.status === 'IN_PROGRESS' && (
          <button
            onClick={() => handleStatusUpdate('COMPLETED')}
            disabled={updating}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
          >
            <StopCircle size={16} />
            退室・完了
          </button>
        )}
      </div>
    </div>
  );
};

export default TherapistBookingList;
