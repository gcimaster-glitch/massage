/**
 * SimpleBookingWrapper: セラピスト情報を取得してSimpleBookingに渡す
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SimpleBooking from './SimpleBooking';

interface Therapist {
  id: string;
  name: string;
  avatar_url?: string;
}

const SimpleBookingWrapper: React.FC = () => {
  const { therapistId } = useParams<{ therapistId: string }>();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTherapist = async () => {
      if (!therapistId) {
        setError('セラピストIDが指定されていません');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/therapists/${therapistId}`);
        if (!response.ok) throw new Error('セラピスト情報の取得に失敗しました');
        
        const data = await response.json();
        setTherapist({
          id: data.user_id || data.id,
          name: data.name,
          avatar_url: data.avatar_url,
        });
      } catch (err) {
        setError('セラピスト情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchTherapist();
  }, [therapistId]);

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

  return <SimpleBooking therapist={therapist} />;
};

export default SimpleBookingWrapper;
