import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import SimpleBookingV2 from './SimpleBookingV2';

interface Therapist {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface Site {
  id: string;
  name: string;
  address: string;
}

const SimpleBookingWrapperV2: React.FC = () => {
  const { therapistId } = useParams<{ therapistId: string }>();
  const [searchParams] = useSearchParams();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const bookingType = (searchParams.get('type') || 'ONSITE') as 'ONSITE' | 'MOBILE';
  const siteId = searchParams.get('siteId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch therapist
        console.log('🔍 セラピスト情報を取得中...', therapistId);
        
        const therapistResponse = await fetch(`/api/therapists/${therapistId}`);
        
        if (!therapistResponse.ok) {
          throw new Error('セラピスト情報の取得に失敗しました');
        }
        
        const therapistData = await therapistResponse.json();
        console.log('✅ セラピストデータ取得:', therapistData);
        
        // レスポンス構造に柔軟に対応
        const therapistInfo: Therapist = {
          id: therapistData.therapist?.user_id || therapistData.user_id || therapistData.id || therapistId!,
          name: therapistData.therapist?.name || therapistData.name || therapistData.therapist_name || therapistData.display_name || '担当セラピスト',
          avatar_url: therapistData.therapist?.avatar_url || therapistData.avatar_url || therapistData.therapist_avatar || therapistData.imageUrl || null
        };
        
        console.log('✅ 正規化されたセラピスト情報:', therapistInfo);
        setTherapist(therapistInfo);

        // Fetch site if siteId is provided
        if (siteId) {
          console.log('🏢 店舗情報を取得中...', siteId);
          
          const siteResponse = await fetch(`/api/sites/${siteId}`);
          
          if (siteResponse.ok) {
            const siteData = await siteResponse.json();
            console.log('✅ 店舗データ取得:', siteData);
            
            const siteInfo: Site = {
              id: siteData.id || site?.id || siteId,
              name: siteData.name || site?.name || '店舗',
              address: siteData.address || site?.address || ''
            };
            
            console.log('✅ 正規化された店舗情報:', siteInfo);
            setSite(siteInfo);
          }
        }
      } catch (err: any) {
        console.error('❌ データ取得エラー:', err);
        setError(err.message || 'データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (therapistId) {
      fetchData();
    }
  }, [therapistId, siteId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !therapist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">エラー</h2>
            <p className="text-gray-600 mb-6">
              {error || 'セラピスト情報の読み込みに失敗しました'}
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all"
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SimpleBookingV2
      therapist={therapist}
      bookingType={bookingType}
      site={site}
    />
  );
};

export default SimpleBookingWrapperV2;
