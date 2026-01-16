/**
 * BookingFlowWrapper: URLパラメータからデータを取得してBookingFlowに渡すラッパーコンポーネント
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BookingFlow from './BookingFlow';
import { BookingPattern, Therapist, Site } from '../../types/booking';
import { Loader2 } from 'lucide-react';

interface BookingFlowWrapperProps {
  pattern: BookingPattern;
}

const BookingFlowWrapper: React.FC<BookingFlowWrapperProps> = ({ pattern }) => {
  const { therapistId, siteId } = useParams<{ therapistId?: string; siteId?: string }>();
  
  const [initialTherapist, setInitialTherapist] = useState<Therapist | undefined>(undefined);
  const [initialSite, setInitialSite] = useState<Site | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // セラピスト情報を取得
        if (therapistId && (pattern === 'from-therapist' || pattern === 'direct')) {
          console.log('🔍 Fetching therapist:', therapistId);
          const response = await fetch(`/api/therapists/${therapistId}`);
          if (!response.ok) {
            throw new Error('セラピスト情報の取得に失敗しました');
          }
          const therapist = await response.json();
          setInitialTherapist(therapist);
          console.log('✅ Therapist fetched:', therapist);
        }
        
        // 施設情報を取得
        if (siteId && pattern === 'from-map') {
          console.log('🔍 Fetching site:', siteId);
          const response = await fetch(`/api/sites/${siteId}`);
          if (!response.ok) {
            throw new Error('施設情報の取得に失敗しました');
          }
          const site = await response.json();
          setInitialSite(site);
          console.log('✅ Site fetched:', site);
        }
      } catch (err: any) {
        console.error('❌ Error fetching initial data:', err);
        setError(err.message || 'データの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, [therapistId, siteId, pattern]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 font-medium mb-2">エラーが発生しました</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => window.history.back()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <BookingFlow 
      pattern={pattern} 
      initialTherapist={initialTherapist}
      initialSite={initialSite}
    />
  );
};

export default BookingFlowWrapper;
