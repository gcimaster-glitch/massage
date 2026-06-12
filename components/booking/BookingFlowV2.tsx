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

  // 認証ゲート（予約開始前に表示）
  const [showAuthGate, setShowAuthGate] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<{ name: string; phone: string; email: string } | null>(null);

  // 出張コンプライアンスゲート
  const [showOutcallGate, setShowOutcallGate] = useState(false);
  const [isOutcall, setIsOutcall] = useState(false);
  const [outcallTermsAgreed, setOutcallTermsAgreed] = useState(false);
  const [outcallSafetyAgreed, setOutcallSafetyAgreed] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);

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

  // ログイン状態チェック
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) return;
      setIsLoggedIn(true);
      setLoggedInUser({
        name: payload.name || '',
        phone: payload.phone || '',
        email: payload.email || '',
      });
      // KYC状態確認
      fetch('/api/kyc/status', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d?.verified) setKycVerified(true); })
        .catch(() => {});
    } catch { /* トークン解析失敗は無視 */ }
  }, []);

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
  // Auth Gate: ログイン選択
  // ===================================
  const AuthGate = () => {
    const handleLogin = () => {
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      navigate(`/auth/login/user?redirect=${returnUrl}`);
    };
    const handleRegister = () => {
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      navigate(`/auth/register/user?redirect=${returnUrl}`);
    };
    return (
      <div className="space-y-6">
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-calendar-check text-teal-600 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">予約をはじめる</h2>
          <p className="text-gray-500 text-sm mt-2">会員ログインで予約履歴の確認や情報自動入力が使えます</p>
        </div>

        {isLoggedIn && loggedInUser ? (
          <div className="bg-teal-50 border border-teal-300 rounded-xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="fas fa-user-check text-white text-lg"></i>
            </div>
            <div className="flex-1">
              <p className="font-bold text-teal-900">{loggedInUser.name || 'ログイン中'}</p>
              <p className="text-xs text-teal-600">{loggedInUser.email}</p>
            </div>
            <button
              onClick={() => setShowAuthGate(false)}
              className="px-5 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 text-sm"
            >
              この会員で予約する
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleLogin}
              className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold text-base hover:bg-teal-700 transition-all flex items-center justify-center gap-3"
            >
              <i className="fas fa-sign-in-alt"></i>
              会員ログインして予約する
            </button>
            <button
              onClick={handleRegister}
              className="w-full py-4 bg-white border-2 border-teal-600 text-teal-600 rounded-xl font-bold text-base hover:bg-teal-50 transition-all flex items-center justify-center gap-3"
            >
              <i className="fas fa-user-plus"></i>
              新規会員登録して予約する
            </button>
          </div>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-400">または</span></div>
        </div>

        <button
          onClick={() => setShowAuthGate(false)}
          className="w-full py-4 bg-gray-100 text-gray-600 rounded-xl font-bold text-base hover:bg-gray-200 transition-all"
        >
          ゲストとして続ける
        </button>

        <p className="text-center text-xs text-gray-400">
          ゲスト予約では予約履歴の確認に予約番号が必要です
        </p>
      </div>
    );
  };

  // ===================================
  // Outcall Gate: 出張利用必須確認
  // ===================================
  const OutcallComplianceGate = () => {
    const canProceed = outcallTermsAgreed && outcallSafetyAgreed && (kycVerified || !isLoggedIn);

    const handleProceed = () => {
      if (!outcallTermsAgreed || !outcallSafetyAgreed) {
        setError('すべての項目に同意してください');
        return;
      }
      if (isLoggedIn && !kycVerified) {
        setError('出張サービスのご利用には本人確認（KYC）が必要です');
        return;
      }
      setShowOutcallGate(false);
      setCurrentStep(2);
    };

    return (
      <div className="space-y-6">
        <button
          onClick={() => { setShowOutcallGate(false); setCurrentStep(1); }}
          className="text-teal-600 font-semibold hover:text-teal-800 flex items-center gap-2"
        >
          <i className="fas fa-arrow-left"></i> 戻る
        </button>

        <div className="bg-orange-50 border-l-4 border-orange-500 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <i className="fas fa-exclamation-triangle text-orange-500 text-xl mt-0.5"></i>
            <div>
              <h2 className="text-lg font-black text-orange-900">出張サービスご利用前の必須確認</h2>
              <p className="text-sm text-orange-700 mt-1">安全のため、以下をすべてご確認・同意いただく必要があります</p>
            </div>
          </div>
        </div>

        {/* 本人確認 */}
        <div className={`rounded-xl border-2 p-5 ${isLoggedIn ? (kycVerified ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50') : 'border-yellow-300 bg-yellow-50'}`}>
          <div className="flex items-start gap-3">
            <i className={`fas fa-id-card text-xl mt-0.5 ${isLoggedIn ? (kycVerified ? 'text-green-600' : 'text-red-500') : 'text-yellow-600'}`}></i>
            <div className="flex-1">
              <p className="font-bold text-gray-900">① 本人確認（KYC）</p>
              {!isLoggedIn ? (
                <p className="text-sm text-yellow-700 mt-1">会員ログインの上、本人確認書類のご提出が必要です</p>
              ) : kycVerified ? (
                <p className="text-sm text-green-700 mt-1">✅ 本人確認済みです</p>
              ) : (
                <div>
                  <p className="text-sm text-red-700 mt-1">本人確認が完了していません。出張サービスのご利用には必須です。</p>
                  <button
                    onClick={() => navigate('/kyc')}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700"
                  >
                    本人確認を完了する
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 事前決済 */}
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <i className="fas fa-credit-card text-blue-600 text-xl mt-0.5"></i>
            <div>
              <p className="font-bold text-gray-900">② 事前決済について</p>
              <p className="text-sm text-blue-700 mt-1">出張サービスは安全確保のため、予約時にカード決済が完了していることが必須です。現金払いはご利用いただけません。</p>
            </div>
          </div>
        </div>

        {/* 契約約款への同意 */}
        <label className={`flex items-start gap-3 rounded-xl border-2 p-5 cursor-pointer transition-all ${outcallTermsAgreed ? 'border-teal-400 bg-teal-50' : 'border-gray-200 bg-white hover:border-teal-300'}`}>
          <input
            type="checkbox"
            checked={outcallTermsAgreed}
            onChange={e => setOutcallTermsAgreed(e.target.checked)}
            className="w-5 h-5 mt-0.5 accent-teal-600 flex-shrink-0"
          />
          <div>
            <p className="font-bold text-gray-900">③ 契約約款への同意 <span className="text-red-500">*</span></p>
            <p className="text-sm text-gray-600 mt-1">
              <a href="/terms" target="_blank" className="text-teal-600 underline font-semibold">HOGUSY出張サービス利用規約</a>
              および
              <a href="/terms#safety" target="_blank" className="text-teal-600 underline font-semibold">安全プロトコル</a>
              を読み、同意します。
            </p>
          </div>
        </label>

        {/* 予約前注意事項への同意 */}
        <label className={`flex items-start gap-3 rounded-xl border-2 p-5 cursor-pointer transition-all ${outcallSafetyAgreed ? 'border-teal-400 bg-teal-50' : 'border-gray-200 bg-white hover:border-teal-300'}`}>
          <input
            type="checkbox"
            checked={outcallSafetyAgreed}
            onChange={e => setOutcallSafetyAgreed(e.target.checked)}
            className="w-5 h-5 mt-0.5 accent-teal-600 flex-shrink-0"
          />
          <div>
            <p className="font-bold text-gray-900">④ 予約前注意事項への同意 <span className="text-red-500">*</span></p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
              <li>施術場所は安全・清潔な環境を確保してください</li>
              <li>第三者の同席はセラピストの判断で断られる場合があります</li>
              <li>不適切な要求はいかなる場合もお断りします</li>
              <li>緊急時はHOGUSYサポート（緊急連絡先）へ連絡してください</li>
            </ul>
          </div>
        </label>

        <button
          onClick={handleProceed}
          disabled={!canProceed}
          className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold text-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
        >
          同意して日時選択へ進む
        </button>
      </div>
    );
  };

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

      const courseIsOutcall = selectedCourse.name.includes('出張') || (selectedCourse as any).is_outcall;
      setIsOutcall(courseIsOutcall);
      setOutcallTermsAgreed(false);
      setOutcallSafetyAgreed(false);

      setBookingData(prev => ({
        ...prev,
        course: selectedCourse,
        options: selectedOptions,
        totalPrice,
        totalDuration,
      }));

      setSuccess('✅ メニューを選択しました');
      if (courseIsOutcall) {
        setShowOutcallGate(true);
      } else {
        setCurrentStep(2);
      }
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
    const [name, setName] = useState(bookingData.customerName || loggedInUser?.name || '');
    const [phone, setPhone] = useState(bookingData.customerPhone || loggedInUser?.phone || '');
    const [email, setEmail] = useState(bookingData.customerEmail || loggedInUser?.email || '');

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

        {isLoggedIn && loggedInUser ? (
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex items-center gap-3">
            <i className="fas fa-user-check text-teal-600 text-xl"></i>
            <div>
              <p className="text-sm font-bold text-teal-800">会員情報を自動入力しました</p>
              <p className="text-xs text-teal-600">内容を確認・修正してください</p>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <i className="fas fa-info-circle mr-2"></i>
              予約確認メールをお送りします。正確な情報を入力してください。
            </p>
          </div>
        )}

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
        const token = localStorage.getItem('auth_token');
        const endpoint = (isLoggedIn && token) ? '/api/bookings' : '/api/bookings/guest';
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (isLoggedIn && token) headers['Authorization'] = `Bearer ${token}`;

        // 予約作成API呼び出し
        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            therapist_id: bookingData.therapist.id,
            booking_type: isOutcall ? 'OUTCALL' : 'ONSITE',
            site_id: null,
            total_duration: bookingData.totalDuration,
            total_price: bookingData.totalPrice,
            scheduled_at: `${bookingData.date} ${bookingData.time}:00`,
            customer_name: bookingData.customerName,
            customer_phone: bookingData.customerPhone,
            customer_email: bookingData.customerEmail,
            customer_address: null,
            postal_code: null,
            items: [
              {
                type: 'COURSE',
                course_id: bookingData.course?.id,
                name: bookingData.course?.name,
                price: bookingData.course?.base_price,
                duration: bookingData.course?.duration,
              },
              ...bookingData.options.map(opt => ({
                type: 'OPTION',
                option_id: opt.id,
                name: opt.name,
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
          
          {/* 会員バッジ */}
          {isLoggedIn && !showAuthGate && (
            <div className="mb-3 flex items-center gap-2 text-teal-700 bg-teal-50 rounded-lg px-3 py-2">
              <i className="fas fa-user-check text-sm"></i>
              <span className="text-xs font-bold">会員として予約中 — {loggedInUser?.email}</span>
            </div>
          )}

          {/* プログレスバー */}
          {!showAuthGate && !showOutcallGate && currentStep <= totalSteps && (
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
          {showAuthGate && <AuthGate />}
          {!showAuthGate && showOutcallGate && <OutcallComplianceGate />}
          {!showAuthGate && !showOutcallGate && currentStep === 1 && <Step1MenuSelection />}
          {!showAuthGate && !showOutcallGate && currentStep === 2 && <Step2DateTimeSelection />}
          {!showAuthGate && !showOutcallGate && currentStep === 3 && <Step3CustomerInfo />}
          {!showAuthGate && !showOutcallGate && currentStep === 4 && <Step4Confirmation />}
          {!showAuthGate && !showOutcallGate && currentStep === 5 && <Step5Complete />}
        </div>
      </div>
    </div>
  );
};

export default BookingFlowV2;
