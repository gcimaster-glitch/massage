/**
 * SimpleBooking: シンプルな予約フロー
 * 会員: 3ステップ（メニュー → 日時 → 確認）
 * 非会員: 5ステップ（メニュー → 日時 → 会員登録 → 決済 → 確認）
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  therapist: Therapist;
  course: Course | null;
  date: string;
  time: string;
  totalPrice: number;
  totalDuration: number;
}

interface SimpleBookingProps {
  therapist: Therapist;
}

const SimpleBooking: React.FC<SimpleBookingProps> = ({ therapist }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoggedIn] = useState(() => !!localStorage.getItem('auth_token'));
  const [bookingId, setBookingId] = useState<string | null>(null);
  
  const [bookingData, setBookingData] = useState<BookingData>({
    therapist,
    course: null,
    date: '',
    time: '',
    totalPrice: 0,
    totalDuration: 0,
  });

  // Step 1: メニュー選択
  const MenuStep = () => {
    const [courses] = useState<Course[]>([
      { id: '1', name: '整体コース（60分）', duration: 60, base_price: 8000, description: '全身の歪みを整えます' },
      { id: '2', name: 'リラクゼーション（90分）', duration: 90, base_price: 12000, description: '深いリラックス' },
      { id: '3', name: 'ショートコース（30分）', duration: 30, base_price: 5000, description: '肩・首集中' },
    ]);

    const handleSelectCourse = (course: Course) => {
      setBookingData(prev => ({
        ...prev,
        course,
        totalPrice: course.base_price,
        totalDuration: course.duration,
      }));
      setStep(2);
    };

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">メニュー選択</h2>
        <div className="bg-teal-50 p-3 rounded-lg mb-4">
          <p className="text-sm font-medium text-teal-900">担当: {therapist.name}</p>
        </div>
        <div className="space-y-3">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => handleSelectCourse(course)}
              className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-teal-600 cursor-pointer transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{course.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                  <p className="text-sm text-gray-500 mt-2">{course.duration}分</p>
                </div>
                <p className="text-lg font-bold text-teal-600">¥{course.base_price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Step 2: 日時選択
  const DateTimeStep = () => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });

    const times = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

    const handleNext = () => {
      if (!selectedDate || !selectedTime) {
        alert('日時を選択してください');
        return;
      }
      setBookingData(prev => ({ ...prev, date: selectedDate, time: selectedTime }));
      
      if (isLoggedIn) {
        setStep(3); // 会員は確認へ
      } else {
        setStep(4); // 非会員は会員登録へ
      }
    };

    const formatDate = (dateStr: string) => {
      const d = new Date(dateStr);
      return `${d.getMonth() + 1}/${d.getDate()}(${['日', '月', '火', '水', '木', '金', '土'][d.getDay()]})`;
    };

    return (
      <div className="space-y-4">
        <button onClick={() => setStep(1)} className="text-teal-600 text-sm">← 戻る</button>
        <h2 className="text-xl font-bold text-gray-900 mb-4">日時選択</h2>
        
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold mb-3">日付を選択</h3>
          <div className="grid grid-cols-7 gap-2">
            {dates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`p-2 rounded text-center text-sm ${
                  selectedDate === date ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>
        </div>

        {selectedDate && (
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-3">時間を選択</h3>
            <div className="grid grid-cols-4 gap-2">
              {times.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-2 rounded text-center ${
                    selectedTime === time ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedDate && selectedTime && (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700"
          >
            次へ
          </button>
        )}
      </div>
    );
  };

  // Step 3: 確認（会員）
  const ConfirmStep = () => {
    const handleConfirm = async () => {
      try {
        // 予約アイテムを構築（コース + オプション）
        const items = [];
        
        // コースを追加
        if (bookingData.course) {
          items.push({
            item_type: 'COURSE',
            item_id: bookingData.course.id,
            item_name: bookingData.course.name,
            price: bookingData.course.base_price,
          });
        }
        
        // オプションを追加
        if (bookingData.options && bookingData.options.length > 0) {
          bookingData.options.forEach(option => {
            items.push({
              item_type: 'OPTION',
              item_id: option.id,
              item_name: option.name,
              price: option.base_price,
            });
          });
        }
        
        // scheduled_at を ISO 8601 形式に変換
        const scheduledAt = `${bookingData.date}T${bookingData.time}:00`;
        
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({
            therapist_id: bookingData.therapist.id,
            therapist_name: bookingData.therapist.name,
            site_id: bookingData.site?.id || null,
            type: 'ONSITE', // 施設予約
            service_name: bookingData.course?.name || '施術',
            duration: bookingData.totalDuration,
            price: bookingData.totalPrice,
            location: bookingData.site?.name || null,
            scheduled_at: scheduledAt,
            items: items,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setBookingId(result.booking.id);
          setStep(6); // 完了画面へ
        } else {
          const error = await response.json();
          alert(`予約に失敗しました: ${error.error || '不明なエラー'}`);
        }
      } catch (error) {
        console.error('予約エラー:', error);
        alert('エラーが発生しました');
      }
    };

    return (
      <div className="space-y-4">
        <button onClick={() => setStep(2)} className="text-teal-600 text-sm">← 戻る</button>
        <h2 className="text-xl font-bold text-gray-900 mb-4">予約内容の確認</h2>
        
        <div className="bg-white p-4 rounded-lg border space-y-3">
          <div>
            <p className="text-sm text-gray-600">担当セラピスト</p>
            <p className="font-bold">{bookingData.therapist.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">コース</p>
            <p className="font-bold">{bookingData.course?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">日時</p>
            <p className="font-bold">{bookingData.date} {bookingData.time}</p>
          </div>
          <div className="pt-3 border-t">
            <p className="text-sm text-gray-600">合計金額</p>
            <p className="text-2xl font-bold text-teal-600">¥{bookingData.totalPrice.toLocaleString()}</p>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700"
        >
          予約を確定する
        </button>
      </div>
    );
  };

  // Step 4: 会員登録（非会員）
  const RegisterStep = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleRegister = async () => {
      if (!email || !password || !name) {
        alert('すべての項目を入力してください');
        return;
      }

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, role: 'USER' }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('auth_token', data.token);
          setStep(5); // 決済へ
        } else {
          alert('会員登録に失敗しました');
        }
      } catch (error) {
        alert('エラーが発生しました');
      }
    };

    return (
      <div className="space-y-4">
        <button onClick={() => setStep(2)} className="text-teal-600 text-sm">← 戻る</button>
        <h2 className="text-xl font-bold text-gray-900 mb-4">会員登録</h2>
        
        <div className="bg-white p-4 rounded-lg border space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">お名前</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="山田 太郎"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="8文字以上"
            />
          </div>
        </div>

        <button
          onClick={handleRegister}
          className="w-full py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700"
        >
          登録して次へ
        </button>
      </div>
    );
  };

  // Step 5: 決済情報（非会員）
  const PaymentStep = () => {
    const handlePayment = () => {
      setStep(3); // 確認へ
    };

    return (
      <div className="space-y-4">
        <button onClick={() => setStep(4)} className="text-teal-600 text-sm">← 戻る</button>
        <h2 className="text-xl font-bold text-gray-900 mb-4">決済情報</h2>
        
        <div className="bg-white p-4 rounded-lg border space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">カード番号</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="1234 5678 9012 3456"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">有効期限</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">セキュリティコード</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="123"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handlePayment}
          className="w-full py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700"
        >
          次へ
        </button>
      </div>
    );
  };

  // Step 6: 完了画面
  const CompleteStep = () => {
    return (
      <div className="space-y-6 text-center">
        <div className="bg-white p-8 rounded-lg border">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">予約が完了しました！</h2>
          <p className="text-gray-600 mb-6">
            予約IDは <span className="font-mono font-bold text-teal-600">{bookingId}</span> です
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg text-left space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">担当セラピスト</span>
              <span className="font-bold">{bookingData.therapist.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">コース</span>
              <span className="font-bold">{bookingData.course?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">日時</span>
              <span className="font-bold">{bookingData.date} {bookingData.time}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-600">合計金額</span>
              <span className="text-xl font-bold text-teal-600">¥{bookingData.totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            予約確認メールを送信しました。<br />
            予約の詳細は予約一覧からご確認いただけます。
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/app/user/bookings')}
            className="flex-1 py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700"
          >
            予約一覧を見る
          </button>
          <button
            onClick={() => navigate('/app')}
            className="flex-1 py-3 bg-white text-gray-700 rounded-lg font-bold border hover:bg-gray-50"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  };

  const totalSteps = isLoggedIn ? 3 : 5;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* プログレスバー（完了画面では非表示） */}
        {step !== 6 && (
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <h1 className="text-lg font-bold text-gray-900">予約</h1>
              <span className="text-sm text-gray-600">{step}/{totalSteps}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* ステップ表示 */}
        {step === 1 && <MenuStep />}
        {step === 2 && <DateTimeStep />}
        {step === 3 && <ConfirmStep />}
        {step === 4 && <RegisterStep />}
        {step === 5 && <PaymentStep />}
        {step === 6 && <CompleteStep />}
      </div>
    </div>
  );
};

export default SimpleBooking;
