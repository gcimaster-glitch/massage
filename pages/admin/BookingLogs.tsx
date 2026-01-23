import React, { useState, useEffect } from 'react';
import { 
  Calendar, Search, Download, RefreshCw, CheckCircle, XCircle,
  Clock, AlertCircle, Ban, Edit, Eye, MapPin, User, Phone
} from 'lucide-react';
import SimpleLayout from '../../components/SimpleLayout';

interface Booking {
  id: string;
  user_name: string;
  user_phone: string;
  therapist_name: string;
  site_name: string;
  date: string;
  time: string;
  duration: number;
  amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

const AdminBookingLogs: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchQuery, statusFilter, dateFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/bookings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      } else {
        // モックデータ
        setBookings([
          {
            id: 'BK-12345',
            user_name: '山田 花子',
            user_phone: '090-1234-5678',
            therapist_name: '田中 有紀',
            site_name: 'CARE CUBE 渋谷',
            date: '2026-01-25',
            time: '14:00',
            duration: 60,
            amount: 8000,
            status: 'CONFIRMED',
            payment_status: 'COMPLETED',
            created_at: '2026-01-22 14:30'
          },
          {
            id: 'BK-12346',
            user_name: '佐藤 太郎',
            user_phone: '090-2345-6789',
            therapist_name: '鈴木 美咲',
            site_name: 'CARE CUBE 新宿',
            date: '2026-01-25',
            time: '16:00',
            duration: 90,
            amount: 12000,
            status: 'COMPLETED',
            payment_status: 'COMPLETED',
            created_at: '2026-01-22 13:15'
          },
          {
            id: 'BK-12347',
            user_name: '高橋 次郎',
            user_phone: '090-3456-7890',
            therapist_name: '伊藤 良太',
            site_name: 'CARE CUBE 池袋',
            date: '2026-01-26',
            time: '10:00',
            duration: 60,
            amount: 6000,
            status: 'PENDING_PAYMENT',
            payment_status: 'PENDING',
            created_at: '2026-01-22 12:45'
          },
          {
            id: 'BK-12348',
            user_name: '田中 三郎',
            user_phone: '090-4567-8901',
            therapist_name: '山本 さくら',
            site_name: 'CARE CUBE 品川',
            date: '2026-01-23',
            time: '18:00',
            duration: 60,
            amount: 10000,
            status: 'CANCELLED',
            payment_status: 'REFUNDED',
            created_at: '2026-01-22 11:20'
          },
          {
            id: 'BK-12349',
            user_name: '鈴木 美咲',
            user_phone: '090-5678-9012',
            therapist_name: '田中 有紀',
            site_name: 'CARE CUBE 渋谷',
            date: '2026-01-25',
            time: '11:00',
            duration: 60,
            amount: 8000,
            status: 'IN_PROGRESS',
            payment_status: 'COMPLETED',
            created_at: '2026-01-25 10:45'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // 検索フィルター
    if (searchQuery) {
      filtered = filtered.filter(b =>
        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.therapist_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.site_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // ステータスフィルター
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    // 日付フィルター
    const today = new Date().toISOString().split('T')[0];
    if (dateFilter === 'today') {
      filtered = filtered.filter(b => b.date === today);
    } else if (dateFilter === 'upcoming') {
      filtered = filtered.filter(b => b.date >= today && b.status !== 'COMPLETED' && b.status !== 'CANCELLED');
    } else if (dateFilter === 'past') {
      filtered = filtered.filter(b => b.date < today || b.status === 'COMPLETED');
    }

    setFilteredBookings(filtered);
  };

  const handleSelectAll = () => {
    if (selectedBookings.length === filteredBookings.length) {
      setSelectedBookings([]);
      setShowBulkActions(false);
    } else {
      setSelectedBookings(filteredBookings.map(b => b.id));
      setShowBulkActions(true);
    }
  };

  const handleSelectBooking = (bookingId: string) => {
    if (selectedBookings.includes(bookingId)) {
      const newSelected = selectedBookings.filter(id => id !== bookingId);
      setSelectedBookings(newSelected);
      setShowBulkActions(newSelected.length > 0);
    } else {
      const newSelected = [...selectedBookings, bookingId];
      setSelectedBookings(newSelected);
      setShowBulkActions(true);
    }
  };

  const handleCancel = async (bookingId: string) => {
    const confirmation = window.confirm('この予約をキャンセルしますか？');
    if (!confirmation) return;

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        alert('予約をキャンセルしました');
        fetchBookings();
      } else {
        const error = await response.json();
        alert(`キャンセルに失敗しました: ${error.message || '不明なエラー'}`);
      }
    } catch (error) {
      console.error('Cancel failed:', error);
      alert('キャンセル処理中にエラーが発生しました');
    }
  };

  const handleConfirm = async (bookingId: string) => {
    const confirmation = window.confirm('この予約を確定しますか？');
    if (!confirmation) return;

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        alert('予約を確定しました');
        fetchBookings();
      } else {
        const error = await response.json();
        alert(`確定に失敗しました: ${error.message || '不明なエラー'}`);
      }
    } catch (error) {
      console.error('Confirm failed:', error);
      alert('確定処理中にエラーが発生しました');
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ['予約ID', 'ユーザー', '電話番号', 'セラピスト', '施設', '日付', '時間', '時間（分）', '金額', 'ステータス', '決済状況', '作成日時'].join(','),
      ...filteredBookings.map(b => 
        [b.id, b.user_name, b.user_phone, b.therapist_name, b.site_name, b.date, b.time, b.duration, b.amount, b.status, b.payment_status, b.created_at].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 flex items-center gap-1"><CheckCircle size={12} />確定</span>;
      case 'COMPLETED':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle size={12} />完了</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 flex items-center gap-1"><Clock size={12} />進行中</span>;
      case 'PENDING_PAYMENT':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 flex items-center gap-1"><AlertCircle size={12} />決済待ち</span>;
      case 'CANCELLED':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1"><XCircle size={12} />キャンセル</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="text-xs text-green-600 font-bold">完了</span>;
      case 'PENDING':
        return <span className="text-xs text-yellow-600 font-bold">保留</span>;
      case 'REFUNDED':
        return <span className="text-xs text-orange-600 font-bold">返金済</span>;
      case 'FAILED':
        return <span className="text-xs text-red-600 font-bold">失敗</span>;
      default:
        return <span className="text-xs text-gray-600 font-bold">{status}</span>;
    }
  };

  return (
    <SimpleLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* ヘッダー */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">予約管理</h1>
            <p className="text-gray-600">リアルタイムの予約状況を確認・管理できます</p>
          </div>
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            更新
          </button>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">総予約数</p>
            <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">確定</p>
            <p className="text-3xl font-bold text-blue-600">{bookings.filter(b => b.status === 'CONFIRMED').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">進行中</p>
            <p className="text-3xl font-bold text-purple-600">{bookings.filter(b => b.status === 'IN_PROGRESS').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">完了</p>
            <p className="text-3xl font-bold text-green-600">{bookings.filter(b => b.status === 'COMPLETED').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">決済待ち</p>
            <p className="text-3xl font-bold text-yellow-600">{bookings.filter(b => b.status === 'PENDING_PAYMENT').length}</p>
          </div>
        </div>

        {/* 検索・フィルター */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 検索 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="予約ID、ユーザー名、施設名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* ステータスフィルター */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">すべてのステータス</option>
              <option value="CONFIRMED">確定</option>
              <option value="IN_PROGRESS">進行中</option>
              <option value="COMPLETED">完了</option>
              <option value="PENDING_PAYMENT">決済待ち</option>
              <option value="CANCELLED">キャンセル</option>
            </select>

            {/* 日付フィルター */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">すべて</option>
              <option value="today">本日</option>
              <option value="upcoming">今後の予約</option>
              <option value="past">過去の予約</option>
            </select>

            {/* CSV出力 */}
            <button
              onClick={handleExportCSV}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-2"
            >
              <Download size={20} />
              CSV出力
            </button>
          </div>
        </div>

        {/* 一括操作バー */}
        {showBulkActions && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-bold text-blue-900">{selectedBookings.length}件選択中</span>
              <button
                onClick={() => {
                  setSelectedBookings([]);
                  setShowBulkActions(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-bold"
              >
                選択解除
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">
                一括確定
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700">
                一括キャンセル
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-bold hover:bg-gray-700">
                エクスポート
              </button>
            </div>
          </div>
        )}

        {/* 予約一覧テーブル */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedBookings.length === filteredBookings.length && filteredBookings.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-teal-600 rounded"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">予約ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">ユーザー</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">セラピスト</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">施設</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">日時</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">金額</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">ステータス</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">決済</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedBookings.includes(booking.id)}
                        onChange={() => handleSelectBooking(booking.id)}
                        className="w-4 h-4 text-teal-600 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">{booking.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{booking.user_name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone size={10} />
                          {booking.user_phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{booking.therapist_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin size={14} />
                        {booking.site_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{booking.date}</p>
                        <p className="text-xs text-gray-500">{booking.time} ({booking.duration}分)</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">¥{booking.amount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4">
                      {getPaymentBadge(booking.payment_status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {booking.status === 'PENDING_PAYMENT' && (
                          <button
                            onClick={() => handleConfirm(booking.id)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-bold"
                          >
                            確定
                          </button>
                        )}
                        {(booking.status === 'CONFIRMED' || booking.status === 'PENDING_PAYMENT') && (
                          <button
                            onClick={() => handleCancel(booking.id)}
                            className="text-sm text-red-600 hover:text-red-700 font-bold"
                          >
                            キャンセル
                          </button>
                        )}
                        <button className="text-sm text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1">
                          <Eye size={14} />
                          詳細
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="p-12 text-center">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-bold">予約が見つかりません</p>
            </div>
          )}
        </div>
      </div>
    </SimpleLayout>
  );
};

export default AdminBookingLogs;
