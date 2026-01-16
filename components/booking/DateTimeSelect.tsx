/**
 * DateTimeSelect: 日時選択コンポーネント
 * - カレンダーで日付選択
 * - 時間帯選択（空き状況確認）
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { BookingData } from '../../types/booking';

interface DateTimeSelectProps {
  bookingData: BookingData;
  onNext: (data: Partial<BookingData>) => void;
  onBack: () => void;
}

const DateTimeSelect: React.FC<DateTimeSelectProps> = ({
  bookingData,
  onNext,
  onBack
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  
  // 営業時間: 10:00〜21:00（最終受付20:00）
  const businessHours = [
    '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  useEffect(() => {
    // 今日から7日分の日付を生成
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    setAvailableDates(dates);
  }, []);

  // 日付が選択されたら、選択可能な時間を計算
  useEffect(() => {
    if (!selectedDate) {
      setAvailableTimes([]);
      return;
    }

    const now = new Date();
    const selectedDateTime = new Date(selectedDate);
    const isToday = selectedDateTime.toDateString() === now.toDateString();

    if (!isToday) {
      // 今日以外は全時間帯が選択可能
      setAvailableTimes(businessHours);
      return;
    }

    // 当日予約の場合、現在時刻の2時間後以降のみ選択可能
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const minHour = twoHoursLater.getHours();
    const minMinute = twoHoursLater.getMinutes();

    const filteredTimes = businessHours.filter(time => {
      const [hour] = time.split(':').map(Number);
      
      // 時間が過ぎている場合は除外
      if (hour < minHour) return false;
      
      // 同じ時間の場合、分も考慮（念のため次の時間帯に）
      if (hour === minHour && minMinute > 0) return false;
      
      return true;
    });

    setAvailableTimes(filteredTimes);
    
    // 選択中の時間が無効になった場合はリセット
    if (selectedTime && !filteredTimes.includes(selectedTime)) {
      setSelectedTime('');
    }
  }, [selectedDate]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${month}/${day}(${dayOfWeek})`;
  };

  const handleNext = () => {
    if (!selectedDate || !selectedTime) {
      alert('日時を選択してください');
      return;
    }

    const scheduled_at = `${selectedDate}T${selectedTime}:00`;

    onNext({
      scheduled_date: selectedDate,
      scheduled_time: selectedTime,
      scheduled_at
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          戻る
        </button>

        {/* 日付選択 */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            日付を選択
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {availableDates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`p-2 rounded-lg text-center transition-all ${
                  selectedDate === date
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-xs">{formatDate(date)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 時間帯選択 */}
        {selectedDate && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              時間を選択
            </h3>
            
            {availableTimes.length === 0 ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-700 font-medium">
                  本日はご予約可能な時間がありません
                </p>
                <p className="text-sm text-red-600 mt-1">
                  予約は2時間前までとなります。別の日付をお選びください。
                </p>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 text-sm text-blue-700">
                  ⏰ ご予約は2時間前までとなります。営業時間: 10:00〜21:00
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 rounded-lg text-center transition-all ${
                        selectedTime === time
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 選択サマリー */}
      {selectedDate && selectedTime && (
        <div className="bg-teal-50 rounded-lg p-4">
          <p className="text-sm text-teal-700 mb-1">選択した日時</p>
          <p className="text-lg font-semibold text-teal-900">
            {formatDate(selectedDate)} {selectedTime}〜
          </p>
          <p className="text-sm text-teal-700 mt-1">
            所要時間: 約{bookingData.total_duration}分
          </p>
        </div>
      )}

      {/* 次へボタン */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <button
          onClick={handleNext}
          disabled={!selectedDate || !selectedTime}
          className={`w-full py-3 rounded-lg font-medium transition-all ${
            selectedDate && selectedTime
              ? 'bg-teal-600 text-white hover:bg-teal-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          予約内容を確認
        </button>
      </div>
    </div>
  );
};

export default DateTimeSelect;
