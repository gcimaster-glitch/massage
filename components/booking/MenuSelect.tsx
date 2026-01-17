/**
 * MenuSelect: メニュー選択コンポーネント
 * - コース（必須1つ）とオプション（複数可）を選択
 * - 合計金額・時間を表示
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Plus, Minus, Check } from 'lucide-react';
import { BookingData, Course, Option } from '../../types/booking';
import LoadingSpinner from '../LoadingSpinner';
import ErrorState from '../ErrorState';

interface MenuSelectProps {
  bookingData: BookingData;
  onNext: (data: Partial<BookingData>) => void;
  onBack: () => void;
}

const MenuSelect: React.FC<MenuSelectProps> = ({
  bookingData,
  onNext,
  onBack
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingData.therapist) {
      fetchMenu();
    }
  }, [bookingData.therapist]);

  const fetchMenu = async () => {
    if (!bookingData.therapist) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/therapists/${bookingData.therapist.id}/menu`);
      if (!response.ok) throw new Error('メニュー情報の取得に失敗しました');
      
      const data = await response.json();
      setCourses(data.courses || []);
      setOptions(data.options || []);
    } catch (err: any) {
      setError(err.message || 'メニュー情報の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOption = (option: Option) => {
    const isSelected = selectedOptions.some(o => o.id === option.id);
    if (isSelected) {
      setSelectedOptions(selectedOptions.filter(o => o.id !== option.id));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const calculateTotal = () => {
    const coursePrice = selectedCourse?.base_price || 0;
    const optionsPrice = selectedOptions.reduce((sum, opt) => sum + opt.base_price, 0);
    const totalPrice = coursePrice + optionsPrice;

    const courseDuration = selectedCourse?.duration || 0;
    const optionsDuration = selectedOptions.reduce((sum, opt) => sum + (opt.duration || 0), 0);
    const totalDuration = courseDuration + optionsDuration;

    return { totalPrice, totalDuration };
  };

  const handleNext = () => {
    console.log('🔵 MenuSelect: handleNext called');
    console.log('🔵 MenuSelect: selectedCourse:', selectedCourse);
    console.log('🔵 MenuSelect: selectedOptions:', selectedOptions);
    
    if (!selectedCourse) {
      alert('コースを選択してください');
      return;
    }

    const { totalPrice, totalDuration } = calculateTotal();
    
    const dataToPass = {
      courses: [selectedCourse],
      options: selectedOptions,
      total_price: totalPrice,
      total_duration: totalDuration
    };
    
    console.log('🔵 MenuSelect: Calling onNext with data:', dataToPass);
    onNext(dataToPass);
    console.log('🔵 MenuSelect: onNext called successfully');
  };

  if (isLoading) {
    return <LoadingSpinner text="メニューを読み込み中..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchMenu} onBack={onBack} />;
  }

  const { totalPrice, totalDuration } = calculateTotal();

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          戻る
        </button>

        {bookingData.therapist && (
          <div className="p-3 bg-teal-50 rounded-lg">
            <p className="text-sm font-medium text-teal-900">{bookingData.therapist.name}</p>
            <p className="text-xs text-teal-700">担当セラピスト</p>
          </div>
        )}
      </div>

      {/* コース選択（必須） */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-gray-900 mb-3">
          コースを選択 <span className="text-red-600 text-sm">（必須）</span>
        </h3>

        {courses.length === 0 ? (
          <p className="text-gray-500 text-sm">利用可能なコースがありません</p>
        ) : (
          <div className="space-y-2">
            {courses.map((course) => {
              const isSelected = selectedCourse?.id === course.id;

              return (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-medium text-gray-900">{course.name}</h4>
                        {isSelected && (
                          <Check className="w-5 h-5 text-teal-600 ml-2" />
                        )}
                      </div>
                      {course.description && (
                        <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                      )}
                      <div className="flex items-center mt-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{course.duration}分</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-gray-900">
                        ¥{course.base_price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* オプション選択（任意） */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-gray-900 mb-3">
          オプション <span className="text-gray-500 text-sm">（任意）</span>
        </h3>

        {options.length === 0 ? (
          <p className="text-gray-500 text-sm">利用可能なオプションがありません</p>
        ) : (
          <div className="space-y-2">
            {options.map((option) => {
              const isSelected = selectedOptions.some(o => o.id === option.id);

              return (
                <div
                  key={option.id}
                  onClick={() => toggleOption(option)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-medium text-gray-900">{option.name}</h4>
                        {isSelected && (
                          <Check className="w-5 h-5 text-teal-600 ml-2" />
                        )}
                      </div>
                      {option.description && (
                        <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                      )}
                      {option.duration && (
                        <div className="flex items-center mt-2 text-sm text-gray-600">
                          <Plus className="w-4 h-4 mr-1" />
                          <span>{option.duration}分追加</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-gray-900">
                        +¥{option.base_price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 合計金額サマリー */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-700">所要時間</span>
          <span className="font-medium text-gray-900">
            {totalDuration}分
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-lg font-semibold text-gray-900">合計金額</span>
          <span className="text-2xl font-bold text-teal-600">
            ¥{totalPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* フッター：次へボタン */}
      <div className="bg-white rounded-lg shadow-sm p-4 sticky bottom-0">
        <button
          onClick={handleNext}
          disabled={!selectedCourse}
          className={`w-full py-3 rounded-lg font-medium transition-all ${
            selectedCourse
              ? 'bg-teal-600 text-white hover:bg-teal-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {selectedCourse ? '次へ進む' : 'コースを選択してください'}
        </button>
      </div>
    </div>
  );
};

export default MenuSelect;
