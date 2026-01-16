/**
 * BookingNewFlow: 旧予約フローのリダイレクト
 * - 新しい予約フローにリダイレクト
 */

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';

const BookingNewFlow: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // URLパラメータから therapistId, siteId を取得
    const therapistId = searchParams.get('therapistId');
    const siteId = searchParams.get('siteId');

    // therapistId がある場合は指名予約
    if (therapistId) {
      console.log('🔄 Redirecting to direct booking:', therapistId);
      navigate(`/app/booking/direct/${therapistId}`, { replace: true });
      return;
    }

    // siteId がある場合はマップから予約
    if (siteId) {
      console.log('🔄 Redirecting to map booking:', siteId);
      navigate(`/app/booking/from-map/${siteId}`, { replace: true });
      return;
    }

    // パラメータがない場合はマップ検索へ
    console.log('🔄 Redirecting to map search');
    navigate('/app/map', { replace: true });
  }, [searchParams, navigate]);

  return <LoadingSpinner text="予約ページへ移動中..." />;
};

export default BookingNewFlow;
