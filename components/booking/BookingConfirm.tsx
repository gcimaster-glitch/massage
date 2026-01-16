/**
 * BookingConfirm: 予約確認コンポーネント
 * - 予約内容の最終確認
 * - 決済・会員登録への誘導
 */

import React from 'react';
import { ArrowLeft, User, MapPin, Calendar, Clock, CreditCard } from 'lucide-react';
import { BookingData } from '../../types/booking';

interface BookingConfirmProps {
  bookingData: BookingData;
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const BookingConfirm: React.FC<BookingConfirmProps> = ({
  bookingData,
  onConfirm,
  onBack,
  isLoading
}) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${month}月${day}日(${dayOfWeek})`;
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          戻る
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-4">予約内容の確認</h2>

        {/* セラピスト情報 */}
        {bookingData.therapist && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <User className="w-4 h-4 mr-2" />
              <span>担当セラピスト</span>
            </div>
            <p className="font-medium text-gray-900">{bookingData.therapist.name}</p>
          </div>
        )}

        {/* 施設情報 */}
        {bookingData.site && bookingData.type === 'ONSITE' && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-2" />
              <span>施設</span>
            </div>
            <p className="font-medium text-gray-900">{bookingData.site.name}</p>
            <p className="text-sm text-gray-600 mt-1">{bookingData.site.address}</p>
          </div>
        )}

        {/* 出張先情報 */}
        {bookingData.type === 'DISPATCH' && bookingData.dispatch_address && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-2" />
              <span>出張先</span>
            </div>
            <p className="font-medium text-gray-900">{bookingData.dispatch_address}</p>
          </div>
        )}

        {/* 日時情報 */}
        {bookingData.scheduled_date && bookingData.scheduled_time && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
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

        {/* メニュー情報 */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">コース・オプション</div>
          {bookingData.courses.map((course) => (
            <div key={course.id} className="flex justify-between mb-1">
              <span className="text-gray-900">{course.name}</span>
              <span className="font-medium text-gray-900">¥{course.base_price.toLocaleString()}</span>
            </div>
          ))}
          {bookingData.options.map((option) => (
            <div key={option.id} className="flex justify-between mb-1">
              <span className="text-gray-700">{option.name}</span>
              <span className="text-gray-700">¥{option.base_price.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* 合計金額 */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900">合計金額</span>
            <span className="text-2xl font-bold text-teal-600">
              ¥{bookingData.total_price.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800 font-medium mb-2">ご確認ください</p>
        <ul className="text-xs text-amber-700 space-y-1">
          <li>• キャンセルは予約時間の24時間前まで無料です</li>
          <li>• 24時間以内のキャンセルは料金の50%が発生します</li>
          <li>• 無断キャンセルは料金の100%が発生します</li>
        </ul>
      </div>

      {/* 予約確定ボタン */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center ${
            isLoading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-teal-600 text-white hover:bg-teal-700'
          }`}
        >
          {isLoading ? (
            <>処理中...</>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              予約を確定する
            </>
          )}
        </button>
        <p className="text-xs text-gray-500 text-center mt-2">
          この後、お支払い画面に進みます
        </p>
      </div>
    </div>
  );
};

export default BookingConfirm;
