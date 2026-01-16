/**
 * TherapistSelect: セラピスト選択コンポーネント
 * - セラピスト一覧を表示
 * - 検索・フィルタリング機能
 * - 施設による絞り込み（FROM_MAPパターン時）
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Star, MapPin, Heart, User } from 'lucide-react';
import { Therapist, Site, BookingData, BookingType } from '../../types/booking';
import LoadingSpinner from '../LoadingSpinner';
import ErrorState from '../ErrorState';

interface TherapistSelectProps {
  onNext: (data: Partial<BookingData>) => void;
  onBack: () => void;
  initialTherapist?: Therapist;
  selectedSite?: Site;
}

const TherapistSelect: React.FC<TherapistSelectProps> = ({
  onNext,
  onBack,
  initialTherapist,
  selectedSite
}) => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(initialTherapist || null);
  const [bookingType, setBookingType] = useState<BookingType>('ONSITE');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTherapists();
  }, [selectedSite]);

  const fetchTherapists = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 施設が選択されている場合は、その施設のエリアで絞り込み
      const area = selectedSite?.area || '';
      const url = area ? `/api/therapists?area=${encodeURIComponent(area)}&limit=50` : '/api/therapists?limit=50';
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('セラピスト情報の取得に失敗しました');
      
      const data = await response.json();
      setTherapists(data.therapists || []);
    } catch (err: any) {
      setError(err.message || 'セラピスト情報の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const parseJSON = (str: string | string[] | undefined): string[] => {
    if (Array.isArray(str)) return str;
    if (!str) return [];
    try {
      return JSON.parse(str);
    } catch {
      return [];
    }
  };

  const filteredTherapists = therapists.filter(t => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(query) ||
      t.bio?.toLowerCase().includes(query) ||
      parseJSON(t.specialties).some(s => s.toLowerCase().includes(query))
    );
  });

  const handleSelectTherapist = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
  };

  const handleNext = () => {
    if (!selectedTherapist) {
      alert('セラピストを選択してください');
      return;
    }

    onNext({
      therapist: selectedTherapist,
      type: bookingType
    });
  };

  if (isLoading) {
    return <LoadingSpinner text="セラピストを読み込み中..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchTherapists} onBack={onBack} />;
  }

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          戻る
        </button>

        {selectedSite && (
          <div className="mb-4 p-3 bg-teal-50 rounded-lg">
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-teal-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-teal-900">{selectedSite.name}</p>
                <p className="text-xs text-teal-700">{selectedSite.address}</p>
              </div>
            </div>
          </div>
        )}

        {/* 予約タイプ選択 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">予約タイプ</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setBookingType('ONSITE')}
              className={`p-3 rounded-lg border-2 transition-all ${
                bookingType === 'ONSITE'
                  ? 'border-teal-600 bg-teal-50 text-teal-900'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">施設で受ける</div>
              <div className="text-xs mt-1">CARE CUBEなど</div>
            </button>
            <button
              onClick={() => setBookingType('DISPATCH')}
              className={`p-3 rounded-lg border-2 transition-all ${
                bookingType === 'DISPATCH'
                  ? 'border-teal-600 bg-teal-50 text-teal-900'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">出張で受ける</div>
              <div className="text-xs mt-1">ご自宅・ホテルなど</div>
            </button>
          </div>
          {bookingType === 'DISPATCH' && (
            <p className="mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded">
              ⚠️ 出張予約には本人確認（KYC）が必要です
            </p>
          )}
        </div>

        {/* 検索バー */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="名前、専門分野で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* セラピスト一覧 */}
      <div className="space-y-3">
        {filteredTherapists.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg">
            <p className="text-gray-500">該当するセラピストが見つかりませんでした</p>
          </div>
        ) : (
          filteredTherapists.map((therapist) => {
            const specialties = parseJSON(therapist.specialties);
            const isSelected = selectedTherapist?.id === therapist.id;

            return (
              <div
                key={therapist.id}
                onClick={() => handleSelectTherapist(therapist)}
                className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'ring-2 ring-teal-600 bg-teal-50'
                    : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-start">
                  {/* アバター */}
                  <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    {therapist.avatar_url ? (
                      <img
                        src={therapist.avatar_url}
                        alt={therapist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-teal-100">
                        <User className="w-8 h-8 text-teal-600" />
                      </div>
                    )}
                  </div>

                  {/* 情報 */}
                  <div className="ml-4 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{therapist.name}</h3>
                        <div className="flex items-center mt-1">
                          <Star className="w-4 h-4 text-amber-400 fill-current" />
                          <span className="text-sm text-gray-700 ml-1">
                            {therapist.rating?.toFixed(1) || '4.8'}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({therapist.review_count || 0}件)
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                          選択中
                        </div>
                      )}
                    </div>

                    {/* 経験年数 */}
                    {therapist.experience_years && (
                      <p className="text-sm text-gray-600 mt-1">
                        経験 {therapist.experience_years}年
                      </p>
                    )}

                    {/* 専門分野 */}
                    {specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {specialties.slice(0, 3).map((specialty, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 自己紹介 */}
                    {therapist.bio && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {therapist.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* フッター：次へボタン */}
      <div className="bg-white rounded-lg shadow-sm p-4 sticky bottom-0">
        <button
          onClick={handleNext}
          disabled={!selectedTherapist}
          className={`w-full py-3 rounded-lg font-medium transition-all ${
            selectedTherapist
              ? 'bg-teal-600 text-white hover:bg-teal-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {selectedTherapist ? '次へ進む' : 'セラピストを選択してください'}
        </button>
      </div>
    </div>
  );
};

export default TherapistSelect;
