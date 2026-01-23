import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, Check, X, AlertCircle, DollarSign } from 'lucide-react';
import SimpleLayout from '../../components/SimpleLayout';

interface Booking {
  id: string;
  user_name: string;
  user_phone: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  service: string;
  amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  auto_approval: boolean;
}

const TherapistSessionManagement: React.FC = () => {
  const navigate = useNavigate();
  const [autoApproval, setAutoApproval] = useState<boolean>(false);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);
  const [completedBookings, setCompletedBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'history' | 'incidents' | 'earnings'>('pending');

  // デモデータ
  const MOCK_BOOKINGS: Booking[] = [
    {
      id: 'BK001',
      user_name: '山田 太郎',
      user_phone: '090-1234-5678',
      date: '2026-01-25',
      time: '14:00',
      duration: 60,
      location: '渋谷区道玄坂1-2-3',
      service: 'ボディケア',
      amount: 8000,
      status: 'PENDING',
      auto_approval: false
    },
    {
      id: 'BK002',
      user_name: '佐藤 花子',
      user_phone: '090-2345-6789',
      date: '2026-01-25',
      time: '16:00',
      duration: 90,
      location: '新宿区西新宿2-8-1',
      service: 'リラクゼーション',
      amount: 12000,
      status: 'CONFIRMED',
      auto_approval: false
    },
    {
      id: 'BK003',
      user_name: '鈴木 一郎',
      user_phone: '090-3456-7890',
      date: '2026-01-23',
      time: '18:00',
      duration: 60,
      location: '港区六本木3-2-1',
      service: 'アロマセラピー',
      amount: 9000,
      status: 'COMPLETED',
      auto_approval: false
    }
  ];

  useEffect(() => {
    // 実際はAPIから取得
    setPendingBookings(MOCK_BOOKINGS.filter(b => b.status === 'PENDING'));
    setConfirmedBookings(MOCK_BOOKINGS.filter(b => b.status === 'CONFIRMED'));
    setCompletedBookings(MOCK_BOOKINGS.filter(b => b.status === 'COMPLETED'));
    setLoading(false);
  }, []);

  const handleApprove = (bookingId: string) => {
    setPendingBookings(prev => prev.filter(b => b.id !== bookingId));
    const booking = MOCK_BOOKINGS.find(b => b.id === bookingId);
    if (booking) {
      setConfirmedBookings(prev => [...prev, { ...booking, status: 'CONFIRMED' }]);
    }
    alert(`予約 ${bookingId} を承認しました`);
  };

  const handleReject = (bookingId: string) => {
    const reason = prompt('キャンセル理由を入力してください：');
    if (reason) {
      setPendingBookings(prev => prev.filter(b => b.id !== bookingId));
      alert(`予約 ${bookingId} を却下しました\n理由: ${reason}`);
    }
  };

  const handleAutoApprovalChange = (enabled: boolean) => {
    setAutoApproval(enabled);
    alert(enabled ? '予約の自動承認を有効にしました' : '予約の自動承認を無効にしました');
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    const labels = {
      PENDING: '承認待ち',
      CONFIRMED: '確定',
      COMPLETED: '完了',
      CANCELLED: 'キャンセル'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <SimpleLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-teal-600" />
            施術管理
          </h1>
          <p className="text-sm text-gray-600 mt-1">予約の承認、施術履歴、インシデント通報、報酬明細</p>
        </div>

        {/* 自動承認設定 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">予約の自動承認</h3>
              <p className="text-sm text-gray-600 mt-1">
                有効にすると、予約リクエストが自動的に承認されます
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoApproval}
                onChange={(e) => handleAutoApprovalChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'pending'
                    ? 'border-b-2 border-teal-600 text-teal-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                承認待ち ({pendingBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('confirmed')}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'confirmed'
                    ? 'border-b-2 border-teal-600 text-teal-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                確定済み ({confirmedBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'history'
                    ? 'border-b-2 border-teal-600 text-teal-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                施術履歴
              </button>
              <button
                onClick={() => setActiveTab('incidents')}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'incidents'
                    ? 'border-b-2 border-teal-600 text-teal-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                インシデント通報
              </button>
              <button
                onClick={() => setActiveTab('earnings')}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'earnings'
                    ? 'border-b-2 border-teal-600 text-teal-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                報酬明細
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* 承認待ちタブ */}
            {activeTab === 'pending' && (
              <div className="space-y-4">
                {pendingBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600">承認待ちの予約はありません</p>
                  </div>
                ) : (
                  pendingBookings.map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:border-teal-300 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900">{booking.user_name}</span>
                            {getStatusBadge(booking.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar size={16} />
                              <span>{booking.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock size={16} />
                              <span>{booking.time} ({booking.duration}分)</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin size={16} />
                              <span>{booking.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <DollarSign size={16} />
                              <span>¥{booking.amount.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="text-sm text-gray-600">サービス: </span>
                            <span className="text-sm font-medium text-gray-900">{booking.service}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleApprove(booking.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                        >
                          <Check size={16} />
                          承認
                        </button>
                        <button
                          onClick={() => handleReject(booking.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <X size={16} />
                          却下
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 確定済みタブ */}
            {activeTab === 'confirmed' && (
              <div className="space-y-4">
                {confirmedBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600">確定済みの予約はありません</p>
                  </div>
                ) : (
                  confirmedBookings.map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900">{booking.user_name}</span>
                            {getStatusBadge(booking.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar size={16} />
                              <span>{booking.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock size={16} />
                              <span>{booking.time} ({booking.duration}分)</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin size={16} />
                              <span>{booking.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <DollarSign size={16} />
                              <span>¥{booking.amount.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 施術履歴タブ */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {completedBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600">施術履歴はありません</p>
                  </div>
                ) : (
                  completedBookings.map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900">{booking.user_name}</span>
                            {getStatusBadge(booking.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar size={16} />
                              <span>{booking.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock size={16} />
                              <span>{booking.time} ({booking.duration}分)</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin size={16} />
                              <span>{booking.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <DollarSign size={16} />
                              <span>¥{booking.amount.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* インシデント通報タブ */}
            {activeTab === 'incidents' && (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 mb-4">インシデント通報機能</p>
                <button
                  onClick={() => navigate('/t/safety')}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  SOSボタン / インシデント通報へ
                </button>
              </div>
            )}

            {/* 報酬明細タブ */}
            {activeTab === 'earnings' && (
              <div className="text-center py-12">
                <DollarSign className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 mb-4">報酬明細機能</p>
                <button
                  onClick={() => navigate('/t/earnings')}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  報酬明細ページへ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </SimpleLayout>
  );
};

export default TherapistSessionManagement;
