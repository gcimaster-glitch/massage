/**
 * BookingComplete: 予約完了画面
 */

import React from 'react';
import { CheckCircle, Calendar, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BookingData } from '../../types/booking';

interface BookingCompleteProps {
  bookingData: BookingData;
}

const BookingComplete: React.FC<BookingCompleteProps> = ({ bookingData }) => {
  const navigate = useNavigate();

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${month}月${day}日(${dayOfWeek})`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* 完了アイコン */}
      <div className="text-center mb-6">
        <CheckCircle className="w-20 h-20 text-teal-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">予約が完了しました！</h2>
        <p className="text-gray-600">確認メールを送信しました</p>
      </div>

      {/* 予約詳細 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <h3 className="font-semibold text-gray-900 mb-4">予約詳細</h3>

        {bookingData.therapist && (
          <div className="mb-4 pb-4 border-b">
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Calendar className="w-4 h-4 mr-2" />
              <span>担当セラピスト</span>
            </div>
            <p className="font-medium text-gray-900">{bookingData.therapist.name}</p>
          </div>
        )}

        {bookingData.scheduled_date && bookingData.scheduled_time && (
          <div className="mb-4 pb-4 border-b">
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Calendar className="w-4 h-4 mr-2" />
              <span>予約日時</span>
            </div>
            <p className="font-medium text-gray-900">
              {formatDate(bookingData.scheduled_date)} {bookingData.scheduled_time}〜
            </p>
            <div className="flex items-center text-sm text-gray-600 mt-2">
              <Clock className="w-4 h-4 mr-2" />
              <span>所要時間: 約{bookingData.total_duration}分</span>
            </div>
          </div>
        )}

        {bookingData.site && bookingData.type === 'ONSITE' && (
          <div className="mb-4 pb-4 border-b">
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-2" />
              <span>施設</span>
            </div>
            <p className="font-medium text-gray-900">{bookingData.site.name}</p>
            <p className="text-sm text-gray-600 mt-1">{bookingData.site.address}</p>
          </div>
        )}

        <div className="pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">お支払い金額</span>
            <span className="text-2xl font-bold text-teal-600">
              ¥{bookingData.total_price.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 次のアクション */}
      <div className="space-y-3">
        <button
          onClick={() => navigate('/app/bookings')}
          className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-all"
        >
          予約一覧を見る
        </button>
        <button
          onClick={() => navigate('/app')}
          className="w-full py-3 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-all"
        >
          ホームに戻る
        </button>
      </div>

      {/* 注意事項 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700 font-medium mb-2">当日の流れ</p>
        <ol className="text-sm text-gray-600 space-y-1">
          <li>1. 予約時間の5〜10分前にお越しください</li>
          <li>2. 受付で予約番号をお伝えください</li>
          <li>3. 施術をお楽しみください</li>
        </ol>
      </div>
    </div>
  );
};

export default BookingComplete;
