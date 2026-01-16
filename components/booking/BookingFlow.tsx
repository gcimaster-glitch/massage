/**
 * BookingFlow: 予約フロー全体を管理するメインコンポーネント
 * 4つの予約パターンに対応：
 * 1. FROM_MAP: マップから予約（3ステップ）
 * 2. FROM_THERAPIST: セラピストから予約（3ステップ）
 * 3. DIRECT: 指名予約（2ステップ）
 * 4. AI_RECOMMEND: おまかせAI予約（3ステップ）
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BookingPattern, 
  BookingType, 
  BookingData, 
  Therapist, 
  Site 
} from '../../types/booking';

// ステップコンポーネント（後で実装）
import TherapistSelect from './TherapistSelect';
import SiteSelect from './SiteSelect';
import MenuSelect from './MenuSelect';
import DateTimeSelect from './DateTimeSelect';
import BookingConfirm from './BookingConfirm';
import BookingComplete from './BookingComplete';
import KYCForm from './KYCForm';
import PaymentForm from './PaymentForm';

interface BookingFlowProps {
  pattern: BookingPattern;
  initialTherapist?: Therapist;
  initialSite?: Site;
}

const BookingFlow: React.FC<BookingFlowProps> = ({ 
  pattern, 
  initialTherapist, 
  initialSite 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 現在のステップ
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // 予約データ
  const [bookingData, setBookingData] = useState<BookingData>({
    pattern,
    type: 'ONSITE',
    courses: [],
    options: [],
    total_duration: 0,
    total_price: 0,
  });
  
  // ユーザー認証状態
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [needsKYC, setNeedsKYC] = useState<boolean>(false);
  
  // ローディング・エラー
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // 初期化
  useEffect(() => {
    // 認証状態をチェック
    const token = localStorage.getItem('auth_token');
    setIsAuthenticated(!!token);
    
    // 初期データをセット
    if (initialTherapist) {
      setBookingData(prev => ({ ...prev, therapist: initialTherapist }));
    }
    if (initialSite) {
      setBookingData(prev => ({ ...prev, site: initialSite }));
    }
  }, [initialTherapist, initialSite]);
  
  // ステップごとの総数を計算
  const getTotalSteps = (): number => {
    switch (pattern) {
      case 'DIRECT': return 2; // 指名予約
      case 'FROM_MAP':
      case 'FROM_THERAPIST':
      case 'AI_RECOMMEND':
      default:
        return 3;
    }
  };
  
  // 次のステップへ
  const handleNext = (updatedData: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...updatedData }));
    
    // 出張予約の場合、KYCチェック
    if (updatedData.type === 'DISPATCH' && !isAuthenticated) {
      setNeedsKYC(true);
    }
    
    setCurrentStep(prev => prev + 1);
  };
  
  // 前のステップへ
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate(-1);
    }
  };
  
  // 予約確定
  const handleConfirmBooking = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 予約作成APIを呼び出し
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          therapist_id: bookingData.therapist?.id,
          site_id: bookingData.site?.id,
          type: bookingData.type,
          duration: bookingData.total_duration,
          price: bookingData.total_price,
          scheduled_at: bookingData.scheduled_at,
          location: bookingData.type === 'DISPATCH' ? bookingData.dispatch_address : bookingData.site?.address,
          items: [
            ...bookingData.courses.map(c => ({
              item_type: 'COURSE',
              item_id: c.id,
              item_name: c.name,
              price: c.base_price
            })),
            ...bookingData.options.map(o => ({
              item_type: 'OPTION',
              item_id: o.id,
              item_name: o.name,
              price: o.base_price
            }))
          ],
          notes: bookingData.notes,
          dispatch_address: bookingData.dispatch_address,
          dispatch_lat: bookingData.dispatch_lat,
          dispatch_lng: bookingData.dispatch_lng,
        })
      });
      
      if (!response.ok) {
        throw new Error('予約の作成に失敗しました');
      }
      
      const result = await response.json();
      
      // 完了画面へ
      setCurrentStep(getTotalSteps() + 1);
    } catch (err: any) {
      setError(err.message || '予約の作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };
  
  // ステップタイトルを取得
  const getStepTitle = (): string => {
    switch (pattern) {
      case 'FROM_MAP':
        if (currentStep === 1) return '施設を選択';
        if (currentStep === 2) return 'セラピストとメニューを選択';
        if (currentStep === 3) return '日時を選択';
        break;
      case 'FROM_THERAPIST':
        if (currentStep === 1) return 'セラピストを選択';
        if (currentStep === 2) return '施設とメニューを選択';
        if (currentStep === 3) return '日時を選択';
        break;
      case 'DIRECT':
        if (currentStep === 1) return 'メニューと施設を選択';
        if (currentStep === 2) return '日時を選択';
        break;
      case 'AI_RECOMMEND':
        if (currentStep === 1) return 'お悩みを教えてください';
        if (currentStep === 2) return 'AIのおすすめ';
        if (currentStep === 3) return '日時を選択';
        break;
    }
    return '予約内容の確認';
  };
  
  // ステップコンポーネントをレンダリング
  const renderStep = () => {
    // KYCが必要な場合
    if (needsKYC && !isAuthenticated) {
      return (
        <KYCForm
          onComplete={() => {
            setNeedsKYC(false);
            setIsAuthenticated(true);
          }}
          onBack={handleBack}
        />
      );
    }
    
    // パターンごとのステップ
    switch (pattern) {
      case 'FROM_MAP':
        if (currentStep === 1) {
          return <SiteSelect onNext={handleNext} onBack={handleBack} initialSite={initialSite} />;
        }
        if (currentStep === 2) {
          return <TherapistSelect onNext={handleNext} onBack={handleBack} selectedSite={bookingData.site} />;
        }
        if (currentStep === 3) {
          return <DateTimeSelect bookingData={bookingData} onNext={handleNext} onBack={handleBack} />;
        }
        if (currentStep === 4) {
          return <BookingConfirm bookingData={bookingData} onConfirm={handleConfirmBooking} onBack={handleBack} isLoading={isLoading} />;
        }
        if (currentStep === 5) {
          return <BookingComplete bookingData={bookingData} />;
        }
        break;
        
      case 'FROM_THERAPIST':
        if (currentStep === 1) {
          return <TherapistSelect onNext={handleNext} onBack={handleBack} initialTherapist={initialTherapist} />;
        }
        if (currentStep === 2) {
          return <SiteSelect onNext={handleNext} onBack={handleBack} selectedTherapist={bookingData.therapist} />;
        }
        if (currentStep === 3) {
          return <DateTimeSelect bookingData={bookingData} onNext={handleNext} onBack={handleBack} />;
        }
        if (currentStep === 4) {
          return <BookingConfirm bookingData={bookingData} onConfirm={handleConfirmBooking} onBack={handleBack} isLoading={isLoading} />;
        }
        if (currentStep === 5) {
          return <BookingComplete bookingData={bookingData} />;
        }
        break;
        
      case 'DIRECT':
        if (currentStep === 1) {
          return <MenuSelect bookingData={bookingData} onNext={handleNext} onBack={handleBack} />;
        }
        if (currentStep === 2) {
          return <DateTimeSelect bookingData={bookingData} onNext={handleNext} onBack={handleBack} />;
        }
        if (currentStep === 3) {
          return <BookingConfirm bookingData={bookingData} onConfirm={handleConfirmBooking} onBack={handleBack} isLoading={isLoading} />;
        }
        if (currentStep === 4) {
          return <BookingComplete bookingData={bookingData} />;
        }
        break;
        
      case 'AI_RECOMMEND':
        // AI予約は後で実装
        return <div className="text-center py-8">AI予約は準備中です</div>;
    }
    
    return null;
  };
  
  const totalSteps = getTotalSteps();
  const progressPercentage = (currentStep / (totalSteps + 1)) * 100;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* プログレスバー */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-800">{getStepTitle()}</h2>
            <span className="text-sm text-gray-600">
              {currentStep <= totalSteps ? `${currentStep}/${totalSteps}` : '完了'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* メインコンテンツ */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {renderStep()}
      </div>
    </div>
  );
};

export default BookingFlow;
