/**
 * SimpleBooking: シンプルな予約フロー
 * 会員: 4ステップ（メニュー → 日時 → 確認 → 決済 → 完了）
 * 非会員: 6ステップ（メニュー → 日時 → 会員登録 → 確認 → 決済 → 完了）
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Stripe公開可能キー（環境変数から取得）
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_dummy');

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

interface Site {
  id: string;
  name: string;
  address?: string;
}

interface BookingData {
  therapist: Therapist;
  course: Course | null;
  options?: Course[];
  date: string;
  time: string;
  totalPrice: number;
  totalDuration: number;
  bookingType?: 'ONSITE' | 'MOBILE';
  site?: Site | null;
  userAddress?: string;
}

interface SimpleBookingProps {
  therapist: Therapist;
  bookingType?: 'ONSITE' | 'MOBILE';
  site?: Site | null;
}

const SimpleBooking: React.FC<SimpleBookingProps> = ({ therapist, bookingType = 'ONSITE', site = null }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(() => {
    // sessionStorageからステップを復元
    const savedStep = sessionStorage.getItem('bookingStep');
    return savedStep ? parseInt(savedStep, 10) : 1;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('auth_token'));
  const [bookingId, setBookingId] = useState<string | null>(null);
  
  const [bookingData, setBookingData] = useState<BookingData>(() => {
    // sessionStorageからデータを復元
    const savedData = sessionStorage.getItem('bookingData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        return {
          ...parsed,
          therapist, // therapistは常に最新のものを使用
          site, // siteも最新のものを使用
          bookingType, // bookingTypeも最新のものを使用
        };
      } catch (e) {
        console.error('Failed to parse saved booking data:', e);
      }
    }
    return {
      therapist,
      course: null,
      options: [],
      date: '',
      time: '',
      totalPrice: 0,
      totalDuration: 0,
      bookingType,
      site,
      userAddress: '',
    };
  });

  // bookingDataが変更されたらsessionStorageに保存
  useEffect(() => {
    try {
      sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
    } catch (e) {
      console.error('Failed to save booking data:', e);
    }
  }, [bookingData]);

  // stepが変更されたらsessionStorageに保存
  useEffect(() => {
    try {
      sessionStorage.setItem('bookingStep', step.toString());
    } catch (e) {
      console.error('Failed to save booking step:', e);
    }
  }, [step]);

  // 予約完了時にsessionStorageをクリア
  useEffect(() => {
    if (step === getTotalSteps()) {
      sessionStorage.removeItem('bookingData');
      sessionStorage.removeItem('bookingStep');
    }
  }, [step]);

  // Step 1: メニュー選択
  const MenuStep = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [options, setOptions] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOptions, setSelectedOptions] = useState<Course[]>([]);

    // APIからメニューを取得
    useEffect(() => {
      const fetchMenu = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/therapists/${therapist.id}/menu`);
          if (!response.ok) throw new Error('メニューの取得に失敗しました');
          
          const data = await response.json();
          
          // コースを設定（APIからのデータを使用）
          const coursesData = data.courses?.map((c: any) => ({
            id: c.id,
            name: c.name,
            duration: c.duration,
            base_price: c.base_price,
            description: c.description || '',
          })) || [];
          
          // オプションを設定
          const optionsData = data.options?.map((o: any) => ({
            id: o.id,
            name: o.name,
            duration: o.duration || 0,
            base_price: o.base_price,
            description: o.description || '',
          })) || [];
          
          setCourses(coursesData);
          setOptions(optionsData);
        } catch (error) {
          console.error('メニュー取得エラー:', error);
          // フォールバック: ダミーデータ
          setCourses([
            { id: '1', name: '整体コース（60分）', duration: 60, base_price: 8000, description: '全身の歪みを整えます' },
            { id: '2', name: 'リラクゼーション（90分）', duration: 90, base_price: 12000, description: '深いリラックス' },
            { id: '3', name: 'ショートコース（30分）', duration: 30, base_price: 5000, description: '肩・首集中' },
          ]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchMenu();
    }, [therapist.id]);

    const handleSelectCourse = (course: Course) => {
      // コースを選択して価格と時間を計算
      const totalPrice = course.base_price + selectedOptions.reduce((sum, opt) => sum + opt.base_price, 0);
      const totalDuration = course.duration + selectedOptions.reduce((sum, opt) => sum + opt.duration, 0);
      
      setBookingData(prev => ({
        ...prev,
        course,
        options: selectedOptions,
        totalPrice,
        totalDuration,
      }));
      setStep(2);
    };

    const handleToggleOption = (option: Course) => {
      setSelectedOptions(prev => {
        const exists = prev.find(o => o.id === option.id);
        if (exists) {
          return prev.filter(o => o.id !== option.id);
        } else {
          return [...prev, option];
        }
      });
    };

    if (loading) {
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">メニュー選択</h2>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">メニューを読み込み中...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">メニュー選択</h2>
        <div className="bg-teal-50 p-3 rounded-lg mb-4">
          <p className="text-sm font-medium text-teal-900">担当: {therapist.name}</p>
        </div>
        
        {/* ログイン案内 */}
        {!isLoggedIn && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <p className="text-sm text-blue-800 mb-2">
              <strong>会員の方:</strong> ログインすると予約がスムーズです
            </p>
            <button
              onClick={() => {
                // 現在のURLを保存してログイン後に戻る
                const currentUrl = window.location.pathname + window.location.search;
                navigate(`/auth/login/user?returnUrl=${encodeURIComponent(currentUrl)}`);
              }}
              className="text-blue-600 underline text-sm font-bold hover:text-blue-800"
            >
              ログインする →
            </button>
            <p className="text-xs text-blue-600 mt-2">
              会員登録は予約の途中でもできます
            </p>
          </div>
        )}
        
        {/* コース選択 */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">コースを選択</h3>
          {courses.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">現在、予約可能なコースがありません。</p>
            </div>
          ) : (
            courses.map((course) => (
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
            ))
          )}
        </div>

        {/* オプション選択 */}
        {options.length > 0 && (
          <div className="space-y-3 mt-6">
            <h3 className="font-semibold text-gray-900">オプション（任意）</h3>
            <p className="text-xs text-gray-600">複数選択可能です</p>
            {options.map((option) => {
              const isSelected = selectedOptions.some(o => o.id === option.id);
              return (
                <div
                  key={option.id}
                  onClick={() => handleToggleOption(option)}
                  className={`bg-white p-4 rounded-lg border-2 cursor-pointer transition ${
                    isSelected ? 'border-teal-600 bg-teal-50' : 'border-gray-200 hover:border-teal-400'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="w-4 h-4 text-teal-600"
                        />
                        <h3 className="font-bold text-gray-900">{option.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 ml-6">{option.description}</p>
                      <p className="text-sm text-gray-500 mt-1 ml-6">+{option.duration}分</p>
                    </div>
                    <p className="text-lg font-bold text-teal-600">¥{option.base_price.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 合計表示 */}
        {selectedOptions.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">選択中のオプション: {selectedOptions.length}件</p>
                <p className="text-xs text-gray-500 mt-1">
                  +{selectedOptions.reduce((sum, opt) => sum + opt.duration, 0)}分 / 
                  +¥{selectedOptions.reduce((sum, opt) => sum + opt.base_price, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
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
      
      // 過去時刻チェック
      const selectedDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      const now = new Date();
      
      if (selectedDateTime <= now) {
        alert('過去の日時は選択できません。未来の日時を選択してください。');
        return;
      }
      
      // 営業時間チェック（10:00〜21:00）
      const hour = parseInt(selectedTime.split(':')[0]);
      if (hour < 10 || hour > 20) {
        alert('営業時間は10:00〜21:00です。この時間帯で選択してください。');
        return;
      }
      
      setBookingData(prev => ({ ...prev, date: selectedDate, time: selectedTime }));
      
      // 出張予約の場合は住所入力へ
      if (bookingType === 'MOBILE') {
        setStep(isLoggedIn ? 3 : 4); // 会員は住所入力(3)、非会員は会員登録(4)
      } else {
        // 店舗予約の場合
        if (isLoggedIn) {
          setStep(3); // 会員は確認へ
        } else {
          setStep(4); // 非会員は会員登録へ
        }
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

  // Step 2.5: 住所入力（出張予約のみ）
  const AddressStep = () => {
    const [address, setAddress] = useState(bookingData.userAddress || '');
    const [postalCode, setPostalCode] = useState('');
    const [building, setBuilding] = useState('');

    const handleNext = () => {
      // 郵便番号の形式チェック（XXX-XXXX または XXXXXXX）
      const postalCodeRegex = /^[0-9]{3}-?[0-9]{4}$/;
      if (postalCode && !postalCodeRegex.test(postalCode)) {
        alert('郵便番号は「123-4567」または「1234567」の形式で入力してください');
        return;
      }
      
      // 住所の入力チェック
      if (!address || address.trim().length < 10) {
        alert('住所を正確に入力してください（最低10文字以上）');
        return;
      }
      
      // 空白のみの入力をチェック
      if (address.trim() === '') {
        alert('有効な住所を入力してください');
        return;
      }
      
      const fullAddress = `〒${postalCode} ${address}${building ? ' ' + building : ''}`;
      setBookingData(prev => ({ ...prev, userAddress: fullAddress }));
      
      // 非会員は会員登録へ、会員は確認へ
      setStep(isLoggedIn ? 4 : 5);
    };

    return (
      <div className="space-y-4">
        <button onClick={() => setStep(2)} className="text-teal-600 text-sm">← 戻る</button>
        <h2 className="text-xl font-bold text-gray-900 mb-4">訪問先住所の入力</h2>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="text-sm text-yellow-800">
            <strong>出張予約について:</strong> セラピストがご指定の場所へ訪問します。正確な住所をご入力ください。
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">郵便番号</label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="例: 150-0001"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">住所 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="例: 東京都渋谷区神宮前1-2-3"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">建物名・部屋番号</label>
            <input
              type="text"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              placeholder="例: ◯◯マンション 101号室"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <button
          onClick={handleNext}
          className="w-full py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700"
        >
          次へ
        </button>
      </div>
    );
  };

  // Step 3/4: 確認（会員はステップ3、非会員はステップ4）
  const ConfirmStep = () => {
    const handleConfirm = async () => {
      // 非会員の場合は会員登録へ
      if (!isLoggedIn) {
        if (bookingType === 'MOBILE') {
          setStep(5); // 出張予約非会員 → 会員登録
        } else {
          setStep(4); // 店舗予約非会員 → 会員登録
        }
        return;
      }
      
      // 会員の場合は決済へ
      if (bookingType === 'MOBILE') {
        setStep(5); // 出張予約会員 → 決済
      } else {
        setStep(4); // 店舗予約会員 → 決済
      }
    };

    const handleBack = () => {
      // 出張予約は住所入力へ、店舗予約は日時選択へ
      if (bookingType === 'MOBILE') {
        setStep(3);
      } else {
        setStep(2);
      }
    };

    return (
      <div className="space-y-4">
        <button onClick={handleBack} className="text-teal-600 text-sm">← 戻る</button>
        <h2 className="text-xl font-bold text-gray-900 mb-4">予約内容の確認</h2>
        
        {/* 非会員への注意メッセージ */}
        {!isLoggedIn && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>この内容で予約するには会員登録が必要です。</strong><br />
              次のステップで会員登録またはログインをお願いします。
            </p>
          </div>
        )}
        
        <div className="bg-white p-4 rounded-lg border space-y-3">
          <div>
            <p className="text-sm text-gray-600">予約タイプ</p>
            <p className="font-bold">{bookingData.bookingType === 'MOBILE' ? '出張訪問' : '店舗利用'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">担当セラピスト</p>
            <p className="font-bold">{bookingData.therapist.name}</p>
          </div>
          {bookingData.bookingType === 'ONSITE' && bookingData.site && (
            <div>
              <p className="text-sm text-gray-600">施設</p>
              <p className="font-bold">{bookingData.site.name}</p>
            </div>
          )}
          {bookingData.bookingType === 'MOBILE' && bookingData.userAddress && (
            <div>
              <p className="text-sm text-gray-600">訪問先住所</p>
              <p className="font-bold">{bookingData.userAddress}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">コース</p>
            <p className="font-bold">{bookingData.course?.name}</p>
            <p className="text-xs text-gray-500 mt-1">
              {bookingData.course?.duration}分 / ¥{bookingData.course?.base_price.toLocaleString()}
            </p>
          </div>
          {bookingData.options && bookingData.options.length > 0 && (
            <div>
              <p className="text-sm text-gray-600">オプション</p>
              <div className="space-y-1 mt-1">
                {bookingData.options.map((option) => (
                  <div key={option.id} className="text-sm">
                    <p className="font-bold">{option.name}</p>
                    <p className="text-xs text-gray-500">
                      +{option.duration}分 / ¥{option.base_price.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">日時</p>
            <p className="font-bold">{bookingData.date} {bookingData.time}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">所要時間</p>
            <p className="font-bold">{bookingData.totalDuration}分</p>
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
          {isLoggedIn ? '次へ（決済画面）' : '会員登録/ログインへ'}
        </button>

        {/* キャンセルポリシー */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
          <h3 className="text-sm font-bold text-yellow-800 mb-2">キャンセルポリシー</h3>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• 予約日の24時間前まで: キャンセル料無料</li>
            <li>• 予約日の24時間以内: 料金の50%</li>
            <li>• 予約日当日または無断キャンセル: 料金の100%</li>
          </ul>
        </div>

        {/* 編集リンク */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={() => setStep(1)}
            className="text-sm text-teal-600 underline hover:text-teal-800"
          >
            メニューを変更
          </button>
          <button
            onClick={() => setStep(2)}
            className="text-sm text-teal-600 underline hover:text-teal-800"
          >
            日時を変更
          </button>
          {bookingType === 'MOBILE' && (
            <button
              onClick={() => setStep(3)}
              className="text-sm text-teal-600 underline hover:text-teal-800"
            >
              住所を変更
            </button>
          )}
        </div>
      </div>
    );
  };

  // Step 4: 会員登録（非会員）
  const RegisterStep = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showLogin, setShowLogin] = useState(false);

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
          localStorage.setItem('user_email', email);
          
          // 会員登録成功後、isLoggedInを更新
          setIsLoggedIn(true);
          
          // 出張予約はKYC(6)へ、店舗予約は決済(5)へ
          setStep(bookingType === 'MOBILE' ? 6 : 5);
        } else {
          const error = await response.json();
          alert(error.error || '会員登録に失敗しました');
        }
      } catch (error) {
        alert('エラーが発生しました');
      }
    };

    const handleLogin = async () => {
      if (!email || !password) {
        alert('メールアドレスとパスワードを入力してください');
        return;
      }

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user_email', email);
          
          // ログイン成功後、isLoggedInを更新して会員フローに切り替え
          setIsLoggedIn(true);
          
          // 出張予約は決済画面(5)へ、店舗予約も決済画面(4)へ
          setStep(bookingType === 'MOBILE' ? 5 : 4);
        } else {
          alert('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
        }
      } catch (error) {
        alert('エラーが発生しました');
      }
    };

    const handleBack = () => {
      // 確認画面へ戻る
      setStep(bookingType === 'MOBILE' ? 4 : 3);
    };

    return (
      <div className="space-y-4">
        <button onClick={handleBack} className="text-teal-600 text-sm">← 戻る</button>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {showLogin ? 'ログイン' : '会員登録'}
        </h2>
        
        <div className="bg-white p-4 rounded-lg border space-y-3">
          {!showLogin && (
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
          )}
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
          onClick={showLogin ? handleLogin : handleRegister}
          className="w-full py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700"
        >
          {showLogin ? 'ログインして次へ' : '登録して次へ'}
        </button>

        <div className="text-center">
          <button
            onClick={() => setShowLogin(!showLogin)}
            className="text-sm text-teal-600 hover:underline"
          >
            {showLogin ? '新規会員登録はこちら' : 'すでにアカウントをお持ちの方はこちら'}
          </button>
        </div>
      </div>
    );
  };

  // KYCステップ（本人確認）- 出張予約の非会員のみ
  const KYCStep = () => {
    const [idType, setIdType] = useState<'license' | 'passport' | 'myNumber'>('license');
    const [idNumber, setIdNumber] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // ファイルサイズチェック（5MB以下）
      if (file.size > 5 * 1024 * 1024) {
        alert('ファイルサイズは5MB以下にしてください');
        return;
      }

      setUploading(true);
      try {
        // 本番環境ではR2にアップロード
        // 今回は簡易実装としてBase64エンコード
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedFile(reader.result as string);
          setUploading(false);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('アップロードエラー:', error);
        alert('ファイルのアップロードに失敗しました');
        setUploading(false);
      }
    };

    const handleSubmitKYC = async () => {
      if (!uploadedFile) {
        alert('本人確認書類をアップロードしてください');
        return;
      }

      try {
        // KYC情報をサーバーに送信
        const response = await fetch('/api/auth/kyc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({
            id_type: idType,
            id_number: idNumber,
            document_data: uploadedFile, // 本番環境ではR2のURLを送信
          }),
        });

        if (response.ok) {
          // KYC提出成功 → 決済画面へ
          setStep(7);
        } else {
          alert('本人確認情報の送信に失敗しました');
        }
      } catch (error) {
        console.error('KYC送信エラー:', error);
        alert('エラーが発生しました');
      }
    };

    const handleBack = () => {
      // 会員登録画面へ戻る
      setStep(5);
    };

    return (
      <div className="space-y-4">
        <button onClick={handleBack} className="text-teal-600 text-sm">← 戻る</button>
        <h2 className="text-xl font-bold text-gray-900 mb-4">本人確認（KYC）</h2>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="text-sm text-yellow-800">
            <strong>出張サービスのご利用には本人確認が必要です。</strong><br />
            運転免許証、パスポート、マイナンバーカードのいずれかをアップロードしてください。
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">本人確認書類の種類</label>
            <select
              value={idType}
              onChange={(e) => setIdType(e.target.value as any)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="license">運転免許証</option>
              <option value="passport">パスポート</option>
              <option value="myNumber">マイナンバーカード</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">書類番号（任意）</label>
            <input
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="免許証番号など"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              本人確認書類の画像 <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full px-4 py-2 border rounded-lg"
            />
            {uploading && <p className="text-sm text-gray-500 mt-2">アップロード中...</p>}
            {uploadedFile && (
              <div className="mt-2">
                <p className="text-sm text-green-600">✓ アップロード完了</p>
                <img src={uploadedFile} alt="Uploaded document" className="mt-2 max-w-xs rounded-lg border" />
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">
              ・ ファイル形式：JPEG, PNG<br />
              ・ ファイルサイズ：5MB以下<br />
              ・ 書類全体が鮮明に写っていることを確認してください
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmitKYC}
          disabled={!uploadedFile}
          className="w-full py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          提出して次へ
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

  // Step 4: 決済（Stripe）
  const PaymentStepContent = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handlePayment = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!stripe || !elements) {
        return;
      }

      setIsProcessing(true);
      setErrorMessage('');

      try {
        // Step 1: 予約を作成
        const items = [];
        if (bookingData.course) {
          items.push({
            item_type: 'COURSE',
            item_id: bookingData.course.id,
            item_name: bookingData.course.name,
            price: bookingData.course.base_price,
            duration: bookingData.course.duration,
          });
        }
        if (bookingData.options && bookingData.options.length > 0) {
          bookingData.options.forEach(option => {
            items.push({
              item_type: 'OPTION',
              item_id: option.id,
              item_name: option.name,
              price: option.base_price,
              duration: option.duration,
            });
          });
        }

        const scheduledAt = `${bookingData.date}T${bookingData.time}:00`;
        
        const bookingResponse = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({
            therapist_id: bookingData.therapist.id,
            therapist_name: bookingData.therapist.name,
            site_id: bookingData.bookingType === 'ONSITE' ? (bookingData.site?.id || null) : null,
            type: bookingData.bookingType || 'ONSITE',
            service_name: bookingData.course?.name || '施術',
            duration: bookingData.totalDuration,
            price: bookingData.totalPrice,
            location: bookingData.bookingType === 'MOBILE' ? bookingData.userAddress : (bookingData.site?.name || null),
            scheduled_at: scheduledAt,
            items: items,
          }),
        });

        if (!bookingResponse.ok) {
          throw new Error('予約の作成に失敗しました');
        }

        const { id: bookingId } = await bookingResponse.json();
        setBookingId(bookingId);

        // Step 2: Payment Intent を作成
        const intentResponse = await fetch('/api/payment/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: bookingData.totalPrice,
            booking_id: bookingId,
            metadata: {
              therapist_id: bookingData.therapist.id,
              user_email: localStorage.getItem('user_email') || '',
            },
          }),
        });

        if (!intentResponse.ok) {
          // 決済準備失敗 → 予約を削除
          await fetch(`/api/bookings/${bookingId}/cancel-payment`, {
            method: 'DELETE',
          });
          throw new Error('決済の準備に失敗しました');
        }

        const { clientSecret } = await intentResponse.json();

        // Step 3: Stripe で決済を確定
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          // カード情報なし → 予約を削除
          await fetch(`/api/bookings/${bookingId}/cancel-payment`, {
            method: 'DELETE',
          });
          throw new Error('カード情報が見つかりません');
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

        if (error) {
          // 決済失敗 → 予約を削除
          await fetch(`/api/bookings/${bookingId}/cancel-payment`, {
            method: 'DELETE',
          });
          setErrorMessage(error.message || '決済に失敗しました');
          setIsProcessing(false);
          return;
        }

        if (paymentIntent.status === 'succeeded') {
          // Step 4: 予約を確定
          await fetch(`/api/bookings/${bookingId}/confirm-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
            }),
          });

          // 完了画面へ
          // 出張予約会員: ステップ6、出張予約非会員: ステップ7
          // 店舗予約会員: ステップ5、店舗予約非会員: ステップ6
          if (bookingType === 'MOBILE') {
            setStep(isLoggedIn ? 6 : 7);
          } else {
            setStep(isLoggedIn ? 5 : 6);
          }
        }
      } catch (error: any) {
        console.error('決済エラー:', error);
        
        // エラー発生時に予約IDがあれば削除
        if (bookingId) {
          try {
            await fetch(`/api/bookings/${bookingId}/cancel-payment`, {
              method: 'DELETE',
            });
          } catch (deleteError) {
            console.error('予約削除エラー:', deleteError);
          }
        }
        
        // エラーメッセージをより詳細に
        let userMessage = '決済処理中にエラーが発生しました';
        
        if (error.message) {
          if (error.message.includes('予約の作成に失敗')) {
            userMessage = '予約の作成に失敗しました。もう一度お試しください。';
          } else if (error.message.includes('決済の準備に失敗')) {
            userMessage = '決済の準備に失敗しました。しばらく待ってから再度お試しください。';
          } else if (error.message.includes('カード情報')) {
            userMessage = 'カード情報が見つかりません。カード情報を正しく入力してください。';
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            userMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
          } else {
            userMessage = error.message;
          }
        }
        
        setErrorMessage(userMessage);
      } finally {
        setIsProcessing(false);
      }
    };

    return (
      <form onSubmit={handlePayment} className="space-y-4">
        <button type="button" onClick={() => setStep(isLoggedIn ? 3 : 4)} className="text-teal-600 text-sm">← 戻る</button>
        <h2 className="text-xl font-bold text-gray-900 mb-4">お支払い情報</h2>
        
        <div className="bg-white p-6 rounded-lg border space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">コース</span>
              <span className="font-bold">{bookingData.course?.name}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-600">合計金額</span>
              <span className="text-xl font-bold text-teal-600">¥{bookingData.totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">カード情報</label>
            <div className="border rounded-lg p-3 bg-white">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-bold text-red-800">決済エラー</h3>
                  <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                  <button
                    type="button"
                    onClick={() => setErrorMessage('')}
                    className="mt-2 text-xs text-red-600 underline hover:text-red-800"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isProcessing ? '処理中...' : `¥${bookingData.totalPrice.toLocaleString()} を支払う`}
        </button>

        <p className="text-xs text-gray-500 text-center">
          クレジットカード情報は安全に暗号化されます
        </p>
      </form>
    );
  };

  const PaymentStepWrapper = () => (
    <Elements stripe={stripePromise}>
      <PaymentStepContent />
    </Elements>
  );

  // Step 6/7: 完了画面
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

  // 総ステップ数を動的に計算
  const getTotalSteps = () => {
    if (bookingType === 'MOBILE') {
      // 出張予約: メニュー → 日時 → 住所 → 確認 → [登録] → [KYC] → 決済 → 完了
      return isLoggedIn ? 6 : 8;
    } else {
      // 店舗予約: メニュー → 日時 → 確認 → [登録] → 決済 → 完了
      return isLoggedIn ? 5 : 6;
    }
  };

  const getStepLabel = () => {
    const labels: { [key: number]: string } = {};
    
    if (bookingType === 'MOBILE') {
      if (isLoggedIn) {
        // 出張予約（会員）
        labels[1] = 'メニュー選択';
        labels[2] = '日時選択';
        labels[3] = '住所入力';
        labels[4] = '予約確認';
        labels[5] = '決済';
        labels[6] = '完了';
      } else {
        // 出張予約（非会員）
        labels[1] = 'メニュー選択';
        labels[2] = '日時選択';
        labels[3] = '住所入力';
        labels[4] = '予約確認';
        labels[5] = '会員登録';
        labels[6] = '本人確認（KYC）';
        labels[7] = '決済';
        labels[8] = '完了';
      }
    } else {
      if (isLoggedIn) {
        // 店舗予約（会員）
        labels[1] = 'メニュー選択';
        labels[2] = '日時選択';
        labels[3] = '予約確認';
        labels[4] = '決済';
        labels[5] = '完了';
      } else {
        // 店舗予約（非会員）
        labels[1] = 'メニュー選択';
        labels[2] = '日時選択';
        labels[3] = '予約確認';
        labels[4] = '会員登録';
        labels[5] = '決済';
        labels[6] = '完了';
      }
    }
    
    return labels[step] || `ステップ ${step}`;
  };

  const totalSteps = getTotalSteps();
  const progress = (step / totalSteps) * 100;
  const stepLabel = getStepLabel();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* プログレスバー（完了画面では非表示） */}
        {step < totalSteps && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">予約手続き</h1>
                <p className="text-sm text-gray-600 mt-1">{stepLabel}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-teal-600">ステップ {step}</span>
                <span className="text-sm text-gray-400"> / {totalSteps}</span>
              </div>
            </div>
            
            {/* プログレスバー */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* ステップインジケーター */}
            <div className="flex justify-between mt-3">
              {Array.from({ length: totalSteps }).map((_, index) => {
                const stepNumber = index + 1;
                const isCompleted = step > stepNumber;
                const isCurrent = step === stepNumber;
                
                return (
                  <div key={stepNumber} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCompleted
                          ? 'bg-teal-600 text-white'
                          : isCurrent
                          ? 'bg-teal-100 text-teal-600 border-2 border-teal-600'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isCompleted ? '✓' : stepNumber}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ステップ表示 */}
        {step === 1 && <MenuStep />}
        {step === 2 && <DateTimeStep />}
        {step === 3 && (
          // 出張予約の場合は住所入力、店舗予約の場合は確認画面
          bookingType === 'MOBILE' ? <AddressStep /> : <ConfirmStep />
        )}
        {step === 4 && (
          // 出張予約: 確認画面、店舗予約: 会員登録（非会員のみ）または決済（会員）
          bookingType === 'MOBILE' 
            ? <ConfirmStep />
            : (isLoggedIn ? <PaymentStepWrapper /> : <RegisterStep />)
        )}
        {step === 5 && (
          // 出張予約: 会員登録（非会員のみ）または決済（会員）、店舗予約: 決済（非会員）または完了（会員）
          bookingType === 'MOBILE'
            ? (isLoggedIn ? <PaymentStepWrapper /> : <RegisterStep />)
            : (isLoggedIn ? <CompleteStep /> : <PaymentStepWrapper />)
        )}
        {step === 6 && (
          // 出張予約: KYC（非会員のみ）または完了（会員）、店舗予約: 完了（非会員）
          bookingType === 'MOBILE'
            ? (isLoggedIn ? <CompleteStep /> : <KYCStep />)
            : <CompleteStep />
        )}
        {step === 7 && bookingType === 'MOBILE' && !isLoggedIn && <PaymentStepWrapper />}
        {step === 8 && bookingType === 'MOBILE' && !isLoggedIn && <CompleteStep />}
      </div>
    </div>
  );
};

export default SimpleBooking;
