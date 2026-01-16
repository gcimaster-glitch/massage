/**
 * SiteSelect: 施設選択コンポーネント
 * - CARE CUBE施設一覧を表示
 * - マップ表示（簡易版）
 * - エリア・設備でフィルタリング
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Wifi, Coffee, Clock, Users } from 'lucide-react';
import { Site, Therapist, BookingData } from '../../types/booking';
import LoadingSpinner from '../LoadingSpinner';
import ErrorState from '../ErrorState';

interface SiteSelectProps {
  onNext: (data: Partial<BookingData>) => void;
  onBack: () => void;
  initialSite?: Site;
  selectedTherapist?: Therapist;
}

const SiteSelect: React.FC<SiteSelectProps> = ({
  onNext,
  onBack,
  initialSite,
  selectedTherapist
}) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(initialSite || null);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSites();
  }, [selectedTherapist]);

  const fetchSites = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // セラピストが選択されている場合は、その対応エリアで絞り込み
      let url = '/api/sites?limit=50';
      if (selectedTherapist?.approved_areas) {
        const areas = parseJSON(selectedTherapist.approved_areas);
        if (areas.length > 0) {
          url += `&area=${encodeURIComponent(areas[0])}`;
        }
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('施設情報の取得に失敗しました');
      
      const data = await response.json();
      setSites(data.sites || []);
    } catch (err: any) {
      setError(err.message || '施設情報の取得に失敗しました');
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

  const areas = Array.from(new Set(sites.map(s => s.area))).filter(Boolean);

  const filteredSites = sites.filter(site => {
    if (!selectedArea) return true;
    return site.area === selectedArea;
  });

  const handleSelectSite = (site: Site) => {
    setSelectedSite(site);
  };

  const handleNext = () => {
    if (!selectedSite) {
      alert('施設を選択してください');
      return;
    }

    onNext({ site: selectedSite });
  };

  if (isLoading) {
    return <LoadingSpinner text="施設を読み込み中..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchSites} onBack={onBack} />;
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

        {selectedTherapist && (
          <div className="mb-4 p-3 bg-teal-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-teal-200 flex items-center justify-center mr-3">
                <span className="text-teal-700 font-semibold">
                  {selectedTherapist.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-teal-900">{selectedTherapist.name}</p>
                <p className="text-xs text-teal-700">選択済み</p>
              </div>
            </div>
          </div>
        )}

        {/* エリアフィルター */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">エリア</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedArea('')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedArea === ''
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              すべて
            </button>
            {areas.map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedArea === area
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 施設一覧 */}
      <div className="space-y-3">
        {filteredSites.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg">
            <p className="text-gray-500">該当する施設が見つかりませんでした</p>
          </div>
        ) : (
          filteredSites.map((site) => {
            const amenities = parseJSON(site.amenities);
            const isSelected = selectedSite?.id === site.id;

            return (
              <div
                key={site.id}
                onClick={() => handleSelectSite(site)}
                className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'ring-2 ring-teal-600 bg-teal-50'
                    : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{site.name}</h3>
                    <div className="flex items-start mt-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
                      <span>{site.address}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-medium ml-2">
                      選択中
                    </div>
                  )}
                </div>

                {/* 施設情報 */}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{site.room_count}部屋</span>
                  </div>
                  {site.type && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                      {site.type === 'CARE_CUBE' ? 'CARE CUBE' : site.type}
                    </span>
                  )}
                </div>

                {/* アメニティ */}
                {amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {amenities.slice(0, 4).map((amenity, idx) => {
                      const getIcon = (name: string) => {
                        if (name.includes('Wi-Fi')) return <Wifi className="w-3 h-3" />;
                        if (name.includes('ドリンク')) return <Coffee className="w-3 h-3" />;
                        if (name.includes('24時間')) return <Clock className="w-3 h-3" />;
                        return null;
                      };

                      return (
                        <div
                          key={idx}
                          className="flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {getIcon(amenity)}
                          <span className="ml-1">{amenity}</span>
                        </div>
                      );
                    })}
                    {amenities.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{amenities.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* フッター：次へボタン */}
      <div className="bg-white rounded-lg shadow-sm p-4 sticky bottom-0">
        <button
          onClick={handleNext}
          disabled={!selectedSite}
          className={`w-full py-3 rounded-lg font-medium transition-all ${
            selectedSite
              ? 'bg-teal-600 text-white hover:bg-teal-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {selectedSite ? '次へ進む' : '施設を選択してください'}
        </button>
      </div>
    </div>
  );
};

export default SiteSelect;
