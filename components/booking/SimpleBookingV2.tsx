import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// =============================================
// TypeScript Interfaces
// =============================================

interface Therapist {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface Course {
  id: string;
  name: string;
  duration: number;
  base_price: number;
  description?: string;
}

interface Option {
  id: string;
  name: string;
  duration: number;
  base_price: number;
  description?: string;
}

interface Site {
  id: string;
  name: string;
  address: string;
}

interface BookingData {
  therapist: Therapist;
  course: Course | null;
  options: Option[];
  date: string;
  time: string;
  totalPrice: number;
  totalDuration: number;
  bookingType: 'ONSITE' | 'MOBILE';
  site: Site | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  userAddress?: string;
  postalCode?: string;
}

interface SimpleBookingV2Props {
  therapist: Therapist;
  bookingType?: 'ONSITE' | 'MOBILE';
  site?: Site | null;
}

// =============================================
// Main Component
// =============================================

const SimpleBookingV2: React.FC<SimpleBookingV2Props> = ({ 
  therapist, 
  bookingType = 'ONSITE', 
  site = null 
}) => {
  const navigate = useNavigate();
  
  // =============================================
  // State Management
  // =============================================
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Menu data
  const [courses, setCourses] = useState<Course[]>([]);
  const [availableOptions, setAvailableOptions] = useState<Option[]>([]);
  
  // Booking data
  const [bookingData, setBookingData] = useState<BookingData>({
    therapist,
    course: null,
    options: [],
    date: '',
    time: '',
    totalPrice: 0,
    totalDuration: 0,
    bookingType,
    site,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    userAddress: '',
    postalCode: ''
  });

  // =============================================
  // Fetch Menu Data
  // =============================================
  
  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/therapists/${therapist.id}/menu`);
        if (!response.ok) {
          throw new Error('メニューの取得に失敗しました');
        }
        
        const data = await response.json();
        
        const fetchedCourses = (data.courses || []).map((c: any) => ({
          id: c.id || c.course_id,
          name: c.name || c.course_name || '',
          duration: c.duration || 0,
          base_price: c.base_price || c.price || 0,
          description: c.description || ''
        }));
        
        const fetchedOptions = (data.options || []).map((o: any) => ({
          id: o.id || o.option_id,
          name: o.name || o.option_name || '',
          duration: o.duration || 0,
          base_price: o.base_price || o.price || 0,
          description: o.description || ''
        }));
        
        setCourses(fetchedCourses);
        setAvailableOptions(fetchedOptions);
        
      } catch (error) {
        console.error('❌ メニュー取得エラー:', error);
        setErrorMessage('メニューの読み込みに失敗しました。ページを再読み込みしてください。');
      } finally {
        setLoading(false);
      }
    };
    
    if (therapist.id) {
      fetchMenu();
    }
  }, [therapist.id]);

  // =============================================
  // Calculate Total Price & Duration
  // =============================================
  
  const calculateTotal = (course: Course | null, options: Option[]) => {
    let totalPrice = course?.base_price || 0;
    let totalDuration = course?.duration || 0;
    
    options.forEach(opt => {
      totalPrice += opt.base_price;
      totalDuration += opt.duration;
    });
    
    return { totalPrice, totalDuration };
  };

  // =============================================
  // Step Navigation
  // =============================================
  
  const goToStep = (step: number) => {
    setErrorMessage('');
    setCurrentStep(step);
  };

  const goBack = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  // =============================================
  // Step 1: Menu Selection
  // =============================================
  
  const handleSelectCourse = (course: Course) => {
    const { totalPrice, totalDuration } = calculateTotal(course, bookingData.options);
    
    setBookingData({
      ...bookingData,
      course,
      totalPrice,
      totalDuration
    });
  };

  const handleToggleOption = (option: Option) => {
    let newOptions = [...bookingData.options];
    const existingIndex = newOptions.findIndex(o => o.id === option.id);
    
    if (existingIndex >= 0) {
      newOptions.splice(existingIndex, 1);
    } else {
      newOptions.push(option);
    }
    
    const { totalPrice, totalDuration } = calculateTotal(bookingData.course, newOptions);
    
    setBookingData({
      ...bookingData,
      options: newOptions,
      totalPrice,
      totalDuration
    });
  };

  const handleNextFromMenu = () => {
    if (!bookingData.course) {
      setErrorMessage('📋 コースを選択してください');
      return;
    }
    goToStep(2);
  };

  // =============================================
  // Step 2: Date & Time Selection
  // =============================================
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBookingData({ ...bookingData, date: e.target.value });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBookingData({ ...bookingData, time: e.target.value });
  };

  const handleNextFromDateTime = () => {
    if (!bookingData.date || !bookingData.time) {
      setErrorMessage('📅 日時を選択してください');
      return;
    }
    
    // Validate future date
    const selectedDateTime = new Date(`${bookingData.date}T${bookingData.time}`);
    const now = new Date();
    
    if (selectedDateTime <= now) {
      setErrorMessage('⏰ 過去の日時は選択できません');
      return;
    }
    
    // Validate business hours (10:00 - 21:00)
    const hour = parseInt(bookingData.time.split(':')[0]);
    if (hour < 10 || hour >= 21) {
      setErrorMessage('🕐 営業時間は10:00〜21:00です');
      return;
    }
    
    goToStep(3);
  };

  // =============================================
  // Step 3: Customer Information
  // =============================================
  
  const handleCustomerInfoChange = (field: string, value: string) => {
    setBookingData({ ...bookingData, [field]: value });
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^[0-9-]{10,13}$/.test(phone);
  };

  const handleNextFromCustomerInfo = () => {
    if (!bookingData.customerName) {
      setErrorMessage('👤 お名前を入力してください');
      return;
    }
    
    if (!bookingData.customerEmail) {
      setErrorMessage('📧 メールアドレスを入力してください');
      return;
    }
    
    if (!validateEmail(bookingData.customerEmail)) {
      setErrorMessage('📧 正しいメールアドレスを入力してください（例: example@hogusy.com）');
      return;
    }
    
    if (!bookingData.customerPhone) {
      setErrorMessage('📱 電話番号を入力してください');
      return;
    }
    
    if (!validatePhone(bookingData.customerPhone)) {
      setErrorMessage('📱 正しい電話番号を入力してください（例: 090-1234-5678）');
      return;
    }
    
    // MOBILE の場合は住所も必須
    if (bookingType === 'MOBILE') {
      if (!bookingData.postalCode) {
        setErrorMessage('📮 郵便番号を入力してください');
        return;
      }
      
      if (!bookingData.userAddress || bookingData.userAddress.length < 10) {
        setErrorMessage('🏠 住所を正確に入力してください（最低10文字以上）');
        return;
      }
    }
    
    goToStep(4);
  };

  // =============================================
  // Step 4: Confirmation & Payment
  // =============================================
  
  const handleConfirmBooking = async () => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      // Check if user is logged in
      const token = localStorage.getItem('auth_token');
      const isLoggedIn = !!token;
      
      // Create booking
      const bookingPayload: any = {
        therapist_id: therapist.id,
        site_id: bookingType === 'ONSITE' ? (site?.id || null) : null,
        type: bookingType,
        scheduled_at: `${bookingData.date}T${bookingData.time}:00`,
        duration: bookingData.totalDuration,
        price: bookingData.totalPrice,
        service_name: bookingData.course?.name || '施術',
      };
      
      // Add customer info for guest bookings
      if (!isLoggedIn) {
        bookingPayload.customer_name = bookingData.customerName;
        bookingPayload.customer_email = bookingData.customerEmail;
        bookingPayload.customer_phone = bookingData.customerPhone;
        bookingPayload.total_price = bookingData.totalPrice;
        bookingPayload.total_duration = bookingData.totalDuration;
        bookingPayload.booking_type = bookingType;
      }
      
      // Add address for mobile bookings
      if (bookingType === 'MOBILE') {
        bookingPayload.customer_address = bookingData.userAddress;
        bookingPayload.postal_code = bookingData.postalCode;
      }
      
      // Add items
      bookingPayload.items = [
        {
          type: 'COURSE',
          item_type: 'COURSE',
          course_id: bookingData.course?.id,
          item_id: bookingData.course?.id,
          name: bookingData.course?.name,
          item_name: bookingData.course?.name,
          price: bookingData.course?.base_price,
          duration: bookingData.course?.duration
        },
        ...bookingData.options.map(opt => ({
          type: 'OPTION',
          item_type: 'OPTION',
          option_id: opt.id,
          item_id: opt.id,
          name: opt.name,
          item_name: opt.name,
          price: opt.base_price,
          duration: opt.duration
        }))
      ];
      
      console.log('📤 予約作成リクエスト:', bookingPayload);
      console.log('🔐 ログイン状態:', isLoggedIn ? 'ログイン済み' : 'ゲスト');
      
      // Use appropriate endpoint based on login status
      const endpoint = isLoggedIn ? '/api/bookings' : '/api/bookings/guest';
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(isLoggedIn ? { 'Authorization': `Bearer ${token}` } : {})
      };
      
      const bookingResponse = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(bookingPayload)
      });
      
      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        console.error('❌ APIエラー:', {
          status: bookingResponse.status,
          statusText: bookingResponse.statusText,
          error: errorData
        });
        throw new Error(errorData.error || `予約の作成に失敗しました (${bookingResponse.status})`);
      }
      
      const bookingResult = await bookingResponse.json();
      console.log('✅ 予約作成成功:', bookingResult);
      
      // Redirect to payment
      const bookingId = bookingResult.bookingId || bookingResult.booking?.id;
      if (bookingId) {
        navigate(`/app/booking/payment/${bookingId}`);
      } else {
        throw new Error('予約IDが取得できませんでした');
      }
      
    } catch (error: any) {
      console.error('❌ 予約作成エラー:', error);
      setErrorMessage(error.message || '予約の作成に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  // =============================================
  // Render Functions
  // =============================================
  
  const renderStepIndicator = () => {
    const steps = [
      { num: 1, label: 'メニュー' },
      { num: 2, label: '日時' },
      { num: 3, label: 'お客様情報' },
      { num: 4, label: '確認' }
    ];
    
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((step, index) => (
            <React.Fragment key={step.num}>
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold
                  ${currentStep >= step.num 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  {currentStep > step.num ? '✓' : step.num}
                </div>
                <span className={`
                  text-xs mt-2 font-medium
                  ${currentStep >= step.num ? 'text-teal-600' : 'text-gray-400'}
                `}>
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-1 mx-2
                  ${currentStep > step.num ? 'bg-teal-600' : 'bg-gray-200'}
                `} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderErrorMessage = () => {
    if (!errorMessage) return null;
    
    return (
      <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 font-medium">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-red-500 hover:text-red-700 font-bold"
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

  const renderStep1Menu = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">メニューを読み込み中...</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {/* Therapist Info */}
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-xl border border-teal-100">
          <div className="flex items-center space-x-4">
            {therapist.avatar_url && (
              <img 
                src={therapist.avatar_url} 
                alt={therapist.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
              />
            )}
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{therapist.name}</h3>
              <p className="text-sm text-gray-600 mt-1">担当セラピスト</p>
            </div>
          </div>
        </div>

        {/* Course Selection */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            <span className="text-teal-600">①</span> コースを選択
          </h3>
          
          {courses.length === 0 ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <p className="text-yellow-700">現在、予約可能なコースがありません。</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {courses.map(course => (
                <div
                  key={course.id}
                  onClick={() => handleSelectCourse(course)}
                  className={`
                    p-5 rounded-xl border-2 cursor-pointer transition-all
                    ${bookingData.course?.id === course.id
                      ? 'border-teal-600 bg-teal-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-teal-300 hover:shadow-md'
                    }
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-800">{course.name}</h4>
                      {course.description && (
                        <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                        <span>⏱️ {course.duration}分</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-teal-600">
                        ¥{course.base_price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Option Selection */}
        {availableOptions.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              <span className="text-teal-600">②</span> オプション（任意）
            </h3>
            
            <div className="grid gap-3">
              {availableOptions.map(option => {
                const isSelected = bookingData.options.some(o => o.id === option.id);
                
                return (
                  <div
                    key={option.id}
                    onClick={() => handleToggleOption(option)}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${isSelected
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-200 bg-white hover:border-teal-300'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`
                          w-6 h-6 rounded border-2 flex items-center justify-center
                          ${isSelected 
                            ? 'bg-teal-600 border-teal-600' 
                            : 'border-gray-300'
                          }
                        `}>
                          {isSelected && <span className="text-white text-sm">✓</span>}
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-800">{option.name}</h5>
                          {option.description && (
                            <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                          )}
                          <span className="text-xs text-gray-500 mt-1 inline-block">
                            ⏱️ +{option.duration}分
                          </span>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-teal-600">
                        +¥{option.base_price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Total & Next Button */}
        {bookingData.course && (
          <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">合計</span>
              <div className="text-right">
                <p className="text-3xl font-bold">¥{bookingData.totalPrice.toLocaleString()}</p>
                <p className="text-sm text-teal-100">所要時間: {bookingData.totalDuration}分</p>
              </div>
            </div>
            
            <button
              onClick={handleNextFromMenu}
              className="w-full bg-white text-teal-600 font-bold py-4 px-6 rounded-lg hover:bg-teal-50 transition-colors"
            >
              次へ（日時選択）
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderStep2DateTime = () => {
    // カレンダー用の日付生成（今日から2ヶ月先まで）
    const generateCalendarDates = () => {
      const dates = [];
      const today = new Date();
      
      for (let i = 0; i < 60; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date);
      }
      
      return dates;
    };
    
    const calendarDates = generateCalendarDates();
    
    // 時間スロット（30分刻み、10:00〜21:00）
    const timeSlots = [
      '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30',
      '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30',
      '18:00', '18:30', '19:00', '19:30',
      '20:00', '20:30', '21:00'
    ];
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const formatDateDisplay = (date: Date) => {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
      const weekday = weekdays[date.getDay()];
      return `${month}/${day}(${weekday})`;
    };
    
    const isToday = (date: Date) => {
      const today = new Date();
      return date.toDateString() === today.toDateString();
    };
    
    return (
      <div className="space-y-6">
        {/* Date Selection */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            📅 予約日を選択
          </h3>
          
          <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
            {calendarDates.slice(0, 14).map((date) => {
              const dateStr = formatDate(date);
              const isSelected = bookingData.date === dateStr;
              
              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateChange({ target: { value: dateStr } } as any)}
                  className={`
                    p-3 rounded-lg text-center transition-all
                    ${isSelected
                      ? 'bg-gradient-to-br from-teal-600 to-blue-600 text-white shadow-lg scale-105'
                      : isToday(date)
                      ? 'bg-teal-50 text-teal-700 border-2 border-teal-300 hover:bg-teal-100'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="text-xs font-medium">
                    {formatDateDisplay(date)}
                  </div>
                  {isToday(date) && (
                    <div className="text-[10px] text-teal-600 font-bold mt-1">
                      今日
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Selection */}
        {bookingData.date && (
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              ⏰ 予約時間を選択
            </h3>
            
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {timeSlots.map((time) => {
                const isSelected = bookingData.time === time;
                
                return (
                  <button
                    key={time}
                    onClick={() => handleTimeChange({ target: { value: time } } as any)}
                    className={`
                      py-3 px-4 rounded-lg text-center font-semibold transition-all
                      ${isSelected
                        ? 'bg-gradient-to-br from-teal-600 to-blue-600 text-white shadow-lg scale-105'
                        : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-teal-50 hover:border-teal-300'
                      }
                    `}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
            
            <p className="text-xs text-gray-500 mt-4 text-center">
              ⏰ 営業時間: 10:00〜21:00（30分刻み）
            </p>
          </div>
        )}

        {/* Summary */}
        {bookingData.date && bookingData.time && (
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-5 rounded-xl border-2 border-teal-200">
            <h4 className="font-bold text-gray-800 mb-3 text-lg">✓ 選択内容</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-teal-200">
                <span className="text-gray-600">日時</span>
                <span className="font-bold text-gray-800">
                  {new Date(bookingData.date).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })} {bookingData.time}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-teal-200">
                <span className="text-gray-600">コース</span>
                <span className="font-bold text-gray-800">{bookingData.course?.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-teal-200">
                <span className="text-gray-600">所要時間</span>
                <span className="font-bold text-gray-800">{bookingData.totalDuration}分</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-white rounded-lg px-3">
                <span className="text-lg font-bold text-gray-800">料金</span>
                <span className="text-2xl font-bold text-teal-600">¥{bookingData.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex space-x-4">
          <button
            onClick={goBack}
            className="flex-1 bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← 戻る
          </button>
          <button
            onClick={handleNextFromDateTime}
            disabled={!bookingData.date || !bookingData.time}
            className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold py-4 px-6 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            次へ（お客様情報） →
          </button>
        </div>
      </div>
    );
  };

  const renderStep3CustomerInfo = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6">お客様情報を入力してください</h3>
          
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                👤 お名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={bookingData.customerName}
                onChange={(e) => handleCustomerInfoChange('customerName', e.target.value)}
                placeholder="山田 太郎"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📧 メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={bookingData.customerEmail}
                onChange={(e) => handleCustomerInfoChange('customerEmail', e.target.value)}
                placeholder="example@hogusy.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                予約確認メールが送信されます
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📱 電話番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={bookingData.customerPhone}
                onChange={(e) => handleCustomerInfoChange('customerPhone', e.target.value)}
                placeholder="090-1234-5678"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none"
              />
            </div>

            {/* Address (MOBILE only) */}
            {bookingType === 'MOBILE' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📮 郵便番号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bookingData.postalCode}
                    onChange={(e) => handleCustomerInfoChange('postalCode', e.target.value)}
                    placeholder="123-4567"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🏠 住所 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={bookingData.userAddress}
                    onChange={(e) => handleCustomerInfoChange('userAddress', e.target.value)}
                    placeholder="東京都渋谷区〇〇1-2-3 〇〇マンション101号室"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    マンション名・部屋番号まで正確にご入力ください
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-4">
          <button
            onClick={goBack}
            className="flex-1 bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-lg hover:bg-gray-300 transition-colors"
          >
            戻る
          </button>
          <button
            onClick={handleNextFromCustomerInfo}
            className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold py-4 px-6 rounded-lg hover:shadow-lg transition-all"
          >
            次へ（確認画面）
          </button>
        </div>
      </div>
    );
  };

  const renderStep4Confirmation = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6">予約内容を確認してください</h3>
          
          <div className="space-y-4 text-sm">
            {/* Therapist */}
            <div className="flex items-center space-x-3 pb-4 border-b">
              {therapist.avatar_url && (
                <img 
                  src={therapist.avatar_url} 
                  alt={therapist.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <p className="text-xs text-gray-500">担当セラピスト</p>
                <p className="font-bold text-gray-800">{therapist.name}</p>
              </div>
            </div>

            {/* Course & Options */}
            <div className="pb-4 border-b">
              <p className="text-xs text-gray-500 mb-2">メニュー</p>
              <p className="font-bold text-gray-800">{bookingData.course?.name}</p>
              {bookingData.options.length > 0 && (
                <div className="mt-2 space-y-1">
                  {bookingData.options.map(opt => (
                    <p key={opt.id} className="text-gray-600 text-xs">
                      + {opt.name} (+¥{opt.base_price.toLocaleString()})
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Date & Time */}
            <div className="pb-4 border-b">
              <p className="text-xs text-gray-500 mb-2">日時</p>
              <p className="font-bold text-gray-800">
                {bookingData.date} {bookingData.time}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                所要時間: {bookingData.totalDuration}分
              </p>
            </div>

            {/* Customer Info */}
            <div className="pb-4 border-b">
              <p className="text-xs text-gray-500 mb-2">お客様情報</p>
              <p className="text-gray-800"><strong>お名前:</strong> {bookingData.customerName}</p>
              <p className="text-gray-800"><strong>メール:</strong> {bookingData.customerEmail}</p>
              <p className="text-gray-800"><strong>電話:</strong> {bookingData.customerPhone}</p>
              {bookingType === 'MOBILE' && bookingData.userAddress && (
                <p className="text-gray-800 mt-1">
                  <strong>住所:</strong> 〒{bookingData.postalCode} {bookingData.userAddress}
                </p>
              )}
            </div>

            {/* Location */}
            {bookingType === 'ONSITE' && site && (
              <div className="pb-4 border-b">
                <p className="text-xs text-gray-500 mb-2">施術場所</p>
                <p className="font-bold text-gray-800">{site.name}</p>
                <p className="text-xs text-gray-600">{site.address}</p>
              </div>
            )}

            {/* Total */}
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">合計金額</span>
                <span className="text-3xl font-bold text-teal-600">
                  ¥{bookingData.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-xs text-gray-700 font-semibold mb-2">キャンセルポリシー</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• 予約日時の24時間前まで: キャンセル料無料</li>
              <li>• 予約日時の24時間以内: 料金の50%</li>
              <li>• 当日キャンセル・無断キャンセル: 料金の100%</li>
            </ul>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-4">
          <button
            onClick={goBack}
            className="flex-1 bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-lg hover:bg-gray-300 transition-colors"
          >
            戻る
          </button>
          <button
            onClick={handleConfirmBooking}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold py-4 px-6 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="inline-block animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent mr-2"></span>
                処理中...
              </span>
            ) : (
              '予約を確定する'
            )}
          </button>
        </div>
      </div>
    );
  };

  // =============================================
  // Main Render
  // =============================================
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          予約フロー
        </h1>
        
        {renderStepIndicator()}
        {renderErrorMessage()}
        
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {currentStep === 1 && renderStep1Menu()}
          {currentStep === 2 && renderStep2DateTime()}
          {currentStep === 3 && renderStep3CustomerInfo()}
          {currentStep === 4 && renderStep4Confirmation()}
        </div>
      </div>
    </div>
  );
};

export default SimpleBookingV2;
