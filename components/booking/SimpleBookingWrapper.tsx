/**
 * SimpleBookingWrapper: セラピスト情報と施設情報を取得してSimpleBookingに渡す
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import SimpleBooking from './SimpleBooking';

interface Therapist {
  id: string;
  name: string;
  avatar_url?: string;
}

interface Site {
  id: string;
  name: string;
  address?: string;
}

const SimpleBookingWrapper: React.FC = () => {
  const { therapistId } = useParams<{ therapistId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URLパラメータから予約タイプと施設IDを取得
  const bookingType = (searchParams.get('type') as 'ONSITE' | 'MOBILE') || 'ONSITE';
  const siteId = searchParams.get('siteId');

  useEffect(() => {
    const fetchData = async () => {
      if (!therapistId) {
        setError('セラピストIDが指定されていません');
        setLoading(false);
        return;
      }

      try {
        // セラピスト情報を取得
        const therapistResponse = await fetch(`/api/therapists/${therapistId}`);
        if (!therapistResponse.ok) throw new Error('セラピスト情報の取得に失敗しました');
        
        const therapistData = await therapistResponse.json();
        setTherapist({
          id: therapistData.user_id || therapistData.id,
          name: therapistData.name,
          avatar_url: therapistData.avatar_url,
        });

        // 施設IDが指定されている場合は施設情報を取得
        if (siteId) {
          const siteResponse = await fetch(`/api/sites/${siteId}`);
          if (siteResponse.ok) {
            const siteData = await siteResponse.json();
            setSite({
              id: siteData.id,
              name: siteData.name,
              address: siteData.address,
            });
          }
        }
      } catch (err) {
        setError('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [therapistId, siteId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !therapist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 font-medium mb-2">エラー</p>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <SimpleBooking therapist={therapist} bookingType={bookingType} site={site} />;
};

export default SimpleBookingWrapper;
