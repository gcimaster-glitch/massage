/**
 * BookingFlowV2: シンプルで安定した予約フロー
 * 
 * 設計方針：
 * 1. ゲスト予約を基本とする（ログイン不要）
 * 2. 明確なステップ表示（1/4, 2/4, 3/4, 4/4）
 * 3. 各ステップで完全なバリデーション
 * 4. いつでも戻れる・やり直せる
 * 5. 成功時の明確なフィードバック
 * 
 * フロー：
 * Step 1: メニュー選択
 * Step 2: 日時選択
 * Step 3: お客様情報入力（名前・電話・メール）
 * Step 4: 予約確認＆決済
 * Step 5: 完了画面
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

interface Therapist {
  id: string;
  name: string;
  avatar_url?: string;
}

interface Course {
  id: string;
  name: string;
  duration: number;
  base_price: number;
  description?: string;
}

interface BookingData {
  // セラピスト情報
  therapist: Therapist;
  
  // 予約内容
  course: Course | null;
  options: Course[];
  date: string;
  time: string;
  
  // お客様情報
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  
  // 計算値
  totalPrice: number;
  totalDuration: number;
}

const BookingFlowV2: React.FC = () => {
  const navigate = useNavigate();
  const { therapistId } = useParams<{ therapistId: string }>();
  const [searchParams] = useSearchParams();
  
  // ステップ管理（1-5）
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4; // 完了画面は除く
  
  // ローディング・エラー管理
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // セラピスト情報
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  
  // メニュー情報
  const [courses, setCourses] = useState<Course[]>([]);
  const [options, setOptions] = useState<Course[]>([]);
  
  // 予約データ
  const [bookingData, setBookingData] = useState<BookingData>({
    therapist: { id: '', name: '', avatar_url: '' },
    course: null,
    options: [],
    date: '',
    time: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    totalPrice: 0,
    totalDuration: 0,
  });
  
  // 予約ID（決済後に使用）
  const [bookingId, setBookingId] = useState<string>('');

  // 初期化：セラピスト情報取得
  useEffect(() => {
    const fetchTherapist = async () => {
      if (!therapistId) {
        setError('セラピストIDが指定されていません');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/therapists/${therapistId}`);
        
        if (!response.ok) {
          throw new Error('セラピスト情報の取得に失敗しました');
        }

        const data = await response.json();
        const therapistInfo = data.therapist || data;
        
        const therapist: Therapist = {
          id: therapistInfo.user_id || therapistInfo.id || therapistId,
          name: therapistInfo.name || '担当セラピスト',
          avatar_url: therapistInfo.avatar_url || null,
        };
        
        setTherapist(therapist);
        setBookingData(prev => ({ ...prev, therapist }));
      } catch (err) {
        console.error('セラピスト情報取得エラー:', err);
        setError('セラピスト情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchTherapist();
  }, [therapistId]);

  // メニュー情報取得
  useEffect(() => {
    const fetchMenu = async () => {
      if (!therapist?.id) return;

      try {
        const response = await fetch(`/api/therapists/${therapist.id}/menu`);
        
        if (!response.ok) {
          throw new Error('メニューの取得に失敗しました');
        }

        const data = await response.json();
        
        const coursesData = data.courses?.map((c: any) => ({
          id: c.id,
          name: c.name,
          duration: c.duration,
          base_price: c.base_price,
          description: c.description || '',
        })) || [];
        
        const optionsData = data.options?.map((o: any) => ({
          id: o.id,
          name: o.name,
          duration: o.duration || 0,
          base_price: o.base_price,
          description: o.description || '',
        })) || [];
        
        setCourses(coursesData);
        setOptions(optionsData);
      } catch (err) {
        console.error('メニュー取得エラー:', err);
      }
    };

    fetchMenu();
  }, [therapist]);

  // エラー・成功メッセージの自動クリア
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // ===================================
  // Step 1: メニュー選択
  // ===================================
  const Step1MenuSelection = () => {
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(bookingData.course);
    const [selectedOptions, setSelectedOptions] = useState<Course[]>(bookingData.options);

    const handleCourseSelect = (course: Course) => {
      setSelectedCourse(course);
    };

    const handleOptionToggle = (option: Course) => {
      if (selectedOptions.find(o => o.id === option.id)) {
        setSelectedOptions(selectedOptions.filter(o => o.id !== option.id));
      } else {
        setSelectedOptions([...selectedOptions, option]);
      }
    };

    const handleNext = () => {
      if (!selectedCourse) {
        setError('コースを選択してください');
        return;
      }

      const totalPrice = selectedCourse.base_price + selectedOptions.reduce((sum, opt) => sum + opt.base_price, 0);
      const totalDuration = selectedCourse.duration + selectedOptions.reduce((sum, opt) => sum + opt.duration, 0);

      setBookingData(prev => ({
        ...prev,
        course: selectedCourse,
        options: selectedOptions,
        totalPrice,
        totalDuration,
      }));

      setSuccess('✅ メニューを選択しました');
      setCurrentStep(2);
    };

    return (
      <div className="space-y-6">
        {/* セラピスト情報 */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-6">
          <div className="flex items-center space-x-4">
            {therapist?.avatar_url ? (
              <img
                src={therapist.avatar_url}
                alt={therapist.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-teal-400"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-teal-600 flex items-center justify-center">
                <i className="fas fa-user text-white text-2xl"></i>
              </div>
            )}
            <div>
              <p className="text-xs text-teal-600 font-semibold uppercase tracking-wider">担当セラピスト</p>
              <p className="text-xl font-bold text-teal-900">{therapist?.name}</p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900">メニューを選択</h2>

        {/* コース選択 */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">コース</h3>
          {courses.map(course => (
            <div
              key={course.id}
              onClick={() => handleCourseSelect(course)}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedCourse?.id === course.id
                  ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-600'
                  : 'border-gray-300 hover:border-teal-400'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900">{course.name}</h4>
                    {selectedCourse?.id === course.id && (
                      <span className="text-teal-600">✓</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                  <p className="text-xs text-gray-500 mt-2">{course.duration}分</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-teal-600">¥{course.base_price.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* オプション選択 */}
        {options.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">オプション（任意）</h3>
            {options.map(option => (
              <div
                key={option.id}
                onClick={() => handleOptionToggle(option)}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedOptions.find(o => o.id === option.id)
                    ? 'border-teal-600 bg-teal-50'
                    : 'border-gray-300 hover:border-teal-400'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900">{option.name}</h4>
                      {selectedOptions.find(o => o.id === option.id) && (
                        <span className="text-teal-600">✓</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    <p className="text-xs text-gray-500 mt-2">+{option.duration}分</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-teal-600">+¥{option.base_price.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 合計表示 */}
        {selectedCourse && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">合計時間</p>
                <p className="text-lg font-bold">
                  {selectedCourse.duration + selectedOptions.reduce((sum, opt) => sum + opt.duration, 0)}分
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">合計金額</p>
                <p className="text-2xl font-bold text-teal-600">
                  ¥{(selectedCourse.base_price + selectedOptions.reduce((sum, opt) => sum + opt.base_price, 0)).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 次へボタン */}
        <button
          onClick={handleNext}
          disabled={!selectedCourse}
          className="w-full py-4 bg-teal-600 text-white rounded-lg font-bold text-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
        >
          次へ：日時を選択
        </button>
      </div>
    );
  };

  // ===================================
  // Step 2: 日時選択
  // ===================================
  const Step2DateTimeSelection = () => {
    const [selectedDate, setSelectedDate] = useState(bookingData.date);
    const [selectedTime, setSelectedTime] = useState(bookingData.time);

    // 日付生成（今日から14日後まで）
    const generateDates = () => {
      const dates = [];
      const today = new Date();
      
      for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
      
      return dates;
    };

    // 時間帯生成（10:00-21:00、30分刻み）
    const generateTimes = () => {
      const times = [];
      
      for (let hour = 10; hour <= 20; hour++) {
        times.push(`${hour.toString().padStart(2, '0')}:00`);
        if (hour < 20) {
          times.push(`${hour.toString().padStart(2, '0')}:30`);
        }
      }
      
      return times;
    };

    const dates = generateDates();
    const times = generateTimes();

    const handleNext = () => {
      if (!selectedDate) {
        setError('日付を選択してください');
        return;
      }

      if (!selectedTime) {
        setError('時間を選択してください');
        return;
      }

      // 過去の日時チェック
      const selectedDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      const now = new Date();
      
      if (selectedDateTime < now) {
        setError('過去の日時は選択できません');
        return;
      }

      setBookingData(prev => ({
        ...prev,
        date: selectedDate,
        time: selectedTime,
      }));

      setSuccess('✅ 日時を選択しました');
      setCurrentStep(3);
    };

    const handleBack = () => {
      setCurrentStep(1);
    };

    return (
      <div className="space-y-6">
        <button
          onClick={handleBack}
          className="text-teal-600 font-semibold hover:text-teal-800 flex items-center gap-2"
        >
          <i className="fas fa-arrow-left"></i> 戻る
        </button>

        <h2 className="text-2xl font-bold text-gray-900">日時を選択</h2>

        {/* 選択中のメニュー表示 */}
        <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
          <p className="text-sm text-teal-700 font-semibold">選択中のメニュー</p>
          <p className="text-lg font-bold text-teal-900 mt-1">{bookingData.course?.name}</p>
          <div className="flex justify-between mt-2 text-sm text-teal-700">
            <span>{bookingData.totalDuration}分</span>
            <span>¥{bookingData.totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* 日付選択 */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">日付</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {dates.map(date => {
              const dateObj = new Date(date);
              const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
              const dayName = dayNames[dateObj.getDay()];
              const isSelected = selectedDate === date;

              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-teal-600 bg-teal-600 text-white font-bold'
                      : 'border-gray-300 hover:border-teal-400 bg-white'
                  }`}
                >
                  <div className="text-xs">{dateObj.getMonth() + 1}/{dateObj.getDate()}</div>
                  <div className="text-sm font-bold">({dayName})</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 時間選択 */}
        {selectedDate && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">時間</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {times.map(time => {
                const isSelected = selectedTime === time;

                return (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-600 text-white font-bold'
                        : 'border-gray-300 hover:border-teal-400 bg-white'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 次へボタン */}
        <button
          onClick={handleNext}
          disabled={!selectedDate || !selectedTime}
          className="w-full py-4 bg-teal-600 text-white rounded-lg font-bold text-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
        >
          次へ：お客様情報入力
        </button>
      </div>
    );
  };

  // ===================================
  // Step 3: お客様情報入力
  // ===================================
  const Step3CustomerInfo = () => {
    const [name, setName] = useState(bookingData.customerName);
    const [phone, setPhone] = useState(bookingData.customerPhone);
    const [email, setEmail] = useState(bookingData.customerEmail);

    const handleNext = () => {
      // バリデーション
      if (!name || name.trim().length < 2) {
        setError('お名前を入力してください（2文字以上）');
        return;
      }

      if (!phone || !/^[0-9\-]{10,13}$/.test(phone.replace(/-/g, ''))) {
        setError('電話番号を正しい形式で入力してください（例：090-1234-5678）');
        return;
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('メールアドレスを正しい形式で入力してください');
        return;
      }

      setBookingData(prev => ({
        ...prev,
        customerName: name.trim(),
        customerPhone: phone.replace(/-/g, ''),
        customerEmail: email.trim(),
      }));

      setSuccess('✅ お客様情報を入力しました');
      setCurrentStep(4);
    };

    const handleBack = () => {
      setCurrentStep(2);
    };

    return (
      <div className="space-y-6">
        <button
          onClick={handleBack}
          className="text-teal-600 font-semibold hover:text-teal-800 flex items-center gap-2"
        >
          <i className="fas fa-arrow-left"></i> 戻る
        </button>

        <h2 className="text-2xl font-bold text-gray-900">お客様情報</h2>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <i className="fas fa-info-circle mr-2"></i>
            予約確認メールをお送りします。正確な情報を入力してください。
          </p>
        </div>

        {/* お名前 */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            お名前 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="山田 太郎"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
          />
          <p className="text-xs text-gray-500">例：山田 太郎</p>
        </div>

        {/* 電話番号 */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            電話番号 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="090-1234-5678"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
          />
          <p className="text-xs text-gray-500">例：090-1234-5678（ハイフンあり・なしどちらでも可）</p>
        </div>

        {/* メールアドレス */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
          />
          <p className="text-xs text-gray-500">例：example@email.com</p>
        </div>

        {/* 次へボタン */}
        <button
          onClick={handleNext}
          className="w-full py-4 bg-teal-600 text-white rounded-lg font-bold text-lg hover:bg-teal-700 transition-all"
        >
          次へ：予約内容の確認
        </button>
      </div>
    );
  };

  // ===================================
  // Step 4: 予約確認
  // ===================================
  const Step4Confirmation = () => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfirm = async () => {
      setIsProcessing(true);
      setError('');

      try {
        // 予約作成API呼び出し
        const response = await fetch('/api/bookings/guest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            therapist_id: bookingData.therapist.id,
            therapist_name: bookingData.therapist.name,
            service_name: bookingData.course?.name,
            duration: bookingData.totalDuration,
            price: bookingData.totalPrice,
            scheduled_at: `${bookingData.date}T${bookingData.time}:00`,
            customer_name: bookingData.customerName,
            customer_phone: bookingData.customerPhone,
            customer_email: bookingData.customerEmail,
            items: [
              {
                item_type: 'COURSE',
                item_id: bookingData.course?.id,
                item_name: bookingData.course?.name,
                price: bookingData.course?.base_price,
                duration: bookingData.course?.duration,
              },
              ...bookingData.options.map(opt => ({
                item_type: 'OPTION',
                item_id: opt.id,
                item_name: opt.name,
                price: opt.base_price,
                duration: opt.duration,
              })),
            ],
          }),
        });

        if (!response.ok) {
          throw new Error('予約の作成に失敗しました');
        }

        const { id } = await response.json();
        setBookingId(id);
        setSuccess('✅ 予約が確定しました！');
        setCurrentStep(5);
      } catch (err) {
        console.error('予約作成エラー:', err);
        setError('予約の作成に失敗しました。もう一度お試しください。');
      } finally {
        setIsProcessing(false);
      }
    };

    const handleBack = () => {
      setCurrentStep(3);
    };

    const formatDate = (date: string) => {
      const d = new Date(date);
      const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
      return `${d.getMonth() + 1}月${d.getDate()}日（${dayNames[d.getDay()]}）`;
    };

    return (
      <div className="space-y-6">
        <button
          onClick={handleBack}
          className="text-teal-600 font-semibold hover:text-teal-800 flex items-center gap-2"
        >
          <i className="fas fa-arrow-left"></i> 戻る
        </button>

        <h2 className="text-2xl font-bold text-gray-900">予約内容の確認</h2>

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          {/* セラピスト */}
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">担当セラピスト</p>
            <p className="text-lg font-bold text-gray-900">{bookingData.therapist.name}</p>
          </div>

          <hr />

          {/* メニュー */}
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">メニュー</p>
            <p className="text-lg font-bold text-gray-900">{bookingData.course?.name}</p>
            {bookingData.options.length > 0 && (
              <div className="mt-2 space-y-1">
                {bookingData.options.map(opt => (
                  <p key={opt.id} className="text-sm text-gray-600">+ {opt.name}</p>
                ))}
              </div>
            )}
          </div>

          <hr />

          {/* 日時 */}
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">予約日時</p>
            <p className="text-lg font-bold text-gray-900">
              {formatDate(bookingData.date)} {bookingData.time}
            </p>
          </div>

          <hr />

          {/* お客様情報 */}
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">お客様情報</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">お名前</span>
                <span className="font-bold">{bookingData.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">電話番号</span>
                <span className="font-bold">{bookingData.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">メール</span>
                <span className="font-bold text-sm">{bookingData.customerEmail}</span>
              </div>
            </div>
          </div>

          <hr />

          {/* 合計 */}
          <div className="bg-teal-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">合計時間</p>
                <p className="text-lg font-bold">{bookingData.totalDuration}分</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">合計金額</p>
                <p className="text-3xl font-bold text-teal-600">¥{bookingData.totalPrice.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            「予約を確定する」ボタンを押すと、予約が確定されます。確認メールが送信されます。
          </p>
        </div>

        {/* 予約確定ボタン */}
        <button
          onClick={handleConfirm}
          disabled={isProcessing}
          className="w-full py-4 bg-teal-600 text-white rounded-lg font-bold text-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
        >
          {isProcessing ? '処理中...' : '予約を確定する'}
        </button>
      </div>
    );
  };

  // ===================================
  // Step 5: 完了画面
  // ===================================
  const Step5Complete = () => {
    return (
      <div className="space-y-6 text-center py-8">
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
          <i className="fas fa-check text-teal-600 text-4xl"></i>
        </div>

        <h2 className="text-3xl font-bold text-gray-900">予約が完了しました！</h2>

        <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 text-left">
          <p className="text-sm text-teal-700 mb-2">予約番号</p>
          <p className="text-2xl font-bold text-teal-900 font-mono">{bookingId}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 text-left">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">予約内容</p>
            <p className="text-lg font-bold mt-1">{bookingData.course?.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">日時</p>
            <p className="text-lg font-bold mt-1">
              {new Date(bookingData.date).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })} {bookingData.time}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">担当</p>
            <p className="text-lg font-bold mt-1">{bookingData.therapist.name}</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <i className="fas fa-envelope mr-2"></i>
            確認メールを <strong>{bookingData.customerEmail}</strong> に送信しました。
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full py-4 bg-teal-600 text-white rounded-lg font-bold text-lg hover:bg-teal-700 transition-all"
        >
          トップページへ戻る
        </button>
      </div>
    );
  };

  // ===================================
  // メインレンダリング
  // ===================================
  if (loading && !therapist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error && !therapist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800 font-bold mb-2">エラー</p>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">予約手続き</h1>
          
          {/* プログレスバー */}
          {currentStep <= totalSteps && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-teal-600">ステップ {currentStep} / {totalSteps}</span>
                <span className="text-gray-500">
                  {currentStep === 1 && 'メニュー選択'}
                  {currentStep === 2 && '日時選択'}
                  {currentStep === 3 && 'お客様情報'}
                  {currentStep === 4 && '予約確認'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <i className="fas fa-exclamation-circle text-red-500 text-xl mt-0.5"></i>
            <div className="flex-1">
              <p className="font-bold text-red-800 text-sm">エラー</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {/* 成功メッセージ */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <i className="fas fa-check-circle text-green-500 text-xl"></i>
            <p className="text-green-800 font-semibold text-sm">{success}</p>
          </div>
        )}

        {/* メインコンテンツ */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {currentStep === 1 && <Step1MenuSelection />}
          {currentStep === 2 && <Step2DateTimeSelection />}
          {currentStep === 3 && <Step3CustomerInfo />}
          {currentStep === 4 && <Step4Confirmation />}
          {currentStep === 5 && <Step5Complete />}
        </div>
      </div>
    </div>
  );
};

export default BookingFlowV2;
