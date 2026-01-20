/**
 * セラピスト予約詳細ページ
 * 予約の詳細情報と管理機能
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, User, Phone, Mail, Home,
  ArrowLeft, PlayCircle, StopCircle, XCircle, CheckCircle,
  Package, CreditCard
} from 'lucide-react';

interface BookingDetail {
  id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  user_address?: string;
  postal_code?: string;
  site_name?: string;
  site_address?: string;
  service_name: string;
  scheduled_start: string;
  started_at?: string;
  completed_at?: string;
  duration: number;
  price: number;
  status: string;
  payment_status?: string;
  type: string;
  notes?: string;
}

interface BookingItem {
  item_type: 'COURSE' | 'OPTION';
  item_name: string;
  price: number;
  duration?: number;
}

const TherapistBookingDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [items, setItems] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      loadBookingDetail();
    }
  }, [id]);

  const loadBookingDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/auth/login/therapist');
        return;
      }

      const response = await fetch(`/api/bookings/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch booking');
      }

      const data = await response.json();
      setBooking(data.booking);
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to load booking:', error);
      alert('予約の読み込みに失敗しました');
      navigate('/t/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    const confirmMessages: Record<string, string> = {
      IN_PROGRESS: '施術を開始しますか？',
      COMPLETED: '施術を完了しますか？',
      CANCELLED: 'この予約をキャンセルしますか？'
    };

    if (!window.confirm(confirmMessages[newStatus] || 'ステータスを変更しますか？')) {
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/bookings/${id}/status`, {
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
      loadBookingDetail();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('ステータス更新に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string; icon: any }> = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: '保留中', icon: Clock },
      CONFIRMED: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: '確定', icon: CheckCircle },
      IN_PROGRESS: { color: 'bg-green-100 text-green-800 border-green-200', label: '施術中', icon: PlayCircle },
      COMPLETED: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: '完了', icon: CheckCircle },
      CANCELLED: { color: 'bg-red-100 text-red-800 border-red-200', label: 'キャンセル', icon: XCircle }
    };

    const badge = badges[status] || badges.PENDING;
    const Icon = badge.icon;
    
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${badge.color}`}>
        <Icon size={20} />
        <span className="font-bold">{badge.label}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">予約が見つかりません</p>
          <button
            onClick={() => navigate('/t/bookings')}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            予約一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/t/bookings')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            予約一覧に戻る
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">予約詳細</h1>
              <p className="text-sm text-gray-600 mt-1">予約ID: {booking.id}</p>
            </div>
            {getStatusBadge(booking.status)}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">サービス情報</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">サービス名</p>
                  <p className="text-lg font-bold text-gray-900">{booking.service_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">時間</p>
                    <p className="font-bold text-gray-900">{booking.duration}分</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">料金</p>
                    <p className="text-lg font-bold text-teal-600">¥{booking.price.toLocaleString()}</p>
                  </div>
                </div>

                {/* Items */}
                {items.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">サービス内容</p>
                    <div className="space-y-2">
                      {items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Package size={16} className="text-gray-400" />
                            <span className="text-sm font-medium">{item.item_name}</span>
                            {item.item_type === 'OPTION' && (
                              <span className="text-xs px-2 py-1 bg-teal-100 text-teal-800 rounded">オプション</span>
                            )}
                          </div>
                          <span className="text-sm font-bold text-gray-900">¥{item.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">お客様情報</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">お名前</p>
                    <p className="font-bold text-gray-900">{booking.user_name || '未設定'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">電話番号</p>
                    <p className="font-bold text-gray-900">{booking.user_phone || '未登録'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">メールアドレス</p>
                    <p className="font-bold text-gray-900">{booking.user_email || '未登録'}</p>
                  </div>
                </div>
                {booking.type === 'MOBILE' && booking.user_address && (
                  <div className="flex items-start gap-3">
                    <Home size={20} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">訪問先住所</p>
                      <p className="font-bold text-gray-900">
                        〒{booking.postal_code}<br />
                        {booking.user_address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            {booking.site_name && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">施術場所</h2>
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-gray-400 mt-1" />
                  <div>
                    <p className="font-bold text-gray-900">{booking.site_name}</p>
                    {booking.site_address && (
                      <p className="text-sm text-gray-600 mt-1">{booking.site_address}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Schedule */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">スケジュール</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">予約日時</p>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar size={16} />
                    <span className="font-bold">{formatDateTime(booking.scheduled_start)}</span>
                  </div>
                </div>
                {booking.started_at && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">開始時刻</p>
                    <div className="flex items-center gap-2 text-green-600">
                      <PlayCircle size={16} />
                      <span className="font-bold">{formatDateTime(booking.started_at)}</span>
                    </div>
                  </div>
                )}
                {booking.completed_at && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">完了時刻</p>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CheckCircle size={16} />
                      <span className="font-bold">{formatDateTime(booking.completed_at)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">支払い情報</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">支払いステータス</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    booking.payment_status === 'PAID' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.payment_status === 'PAID' ? '支払い済み' : '未払い'}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">合計金額</span>
                    <span className="text-xl font-bold text-teal-600">¥{booking.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">アクション</h2>
              <div className="space-y-3">
                {booking.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleStatusUpdate('IN_PROGRESS')}
                    disabled={updating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                  >
                    <PlayCircle size={20} />
                    施術を開始
                  </button>
                )}
                {booking.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleStatusUpdate('COMPLETED')}
                    disabled={updating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={20} />
                    施術を完了
                  </button>
                )}
                {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                  <button
                    onClick={() => handleStatusUpdate('CANCELLED')}
                    disabled={updating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                  >
                    <XCircle size={20} />
                    キャンセル
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistBookingDetail;
