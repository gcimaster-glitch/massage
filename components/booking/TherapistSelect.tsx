/**
 * TherapistSelect: セラピスト選択コンポーネント（改善版）
 *
 * 改善ポイント：
 * 1. AIマッチングボタンを最上部に最優先配置（光るアニメーション付き）
 * 2. セラピストカードに「詳細を見る」ボタンを追加
 * 3. TherapistDetailModalと連携してプロフィール・口コミを表示
 * 4. 施設による絞り込み（FROM_MAPパターン時）
 */
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Star, MapPin, User, Zap, ChevronRight, Info } from 'lucide-react';
import { Therapist, Site, BookingData, BookingType } from '../../types/booking';
import LoadingSpinner from '../LoadingSpinner';
import ErrorState from '../ErrorState';
import TherapistDetailModal from './TherapistDetailModal';

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
  selectedSite,
}) => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(initialTherapist || null);
  const [bookingType, setBookingType] = useState<BookingType>('ONSITE');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // セラピスト詳細モーダルの状態
  const [modalTherapistId, setModalTherapistId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTherapists();
  }, [selectedSite]);

  const fetchTherapists = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const area = selectedSite?.area || '';
      const url = area
        ? `/api/therapists?area=${encodeURIComponent(area)}&limit=50`
        : '/api/therapists?limit=50';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`セラピスト情報の取得に失敗しました (${response.status})`);
      }
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
    try { return JSON.parse(str); } catch { return []; }
  };

  const filteredTherapists = therapists.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.bio?.toLowerCase().includes(q) ||
      parseJSON(t.specialties).some(s => s.toLowerCase().includes(q))
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
    onNext({ therapist: selectedTherapist, type: bookingType });
  };

  // AIマッチングで予約（最高評価のセラピストを自動選択）
  const handleAIMatch = () => {
    const topTherapist = therapists.reduce(
      (best, t) => (t.rating || 0) > (best?.rating || 0) ? t : best,
      therapists[0]
    );
    if (topTherapist) {
      onNext({ therapist: topTherapist, type: bookingType, aiMatched: true } as any);
    }
  };

  // 詳細モーダルを開く
  const openModal = (e: React.MouseEvent, therapistId: string) => {
    e.stopPropagation();
    setModalTherapistId(therapistId);
    setIsModalOpen(true);
  };

  // モーダルから予約する
  const handleBookFromModal = (therapistId: string) => {
    const therapist = therapists.find(t => t.id === therapistId);
    if (therapist) {
      onNext({ therapist, type: bookingType });
    }
  };

  if (isLoading) return <LoadingSpinner text="セラピストを読み込み中..." />;
  if (error) return <ErrorState message={error} onRetry={fetchTherapists} onBack={onBack} />;

  return (
    <>
      <div className="space-y-4">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
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
        </div>

        {/* ★ AIマッチングボタン（最優先・最上部） */}
        <button
          onClick={handleAIMatch}
          className="relative w-full text-white font-black py-5 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center gap-3 text-base hover:scale-[1.02] transition-transform"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 50%, #7c3aed 100%)',
            boxShadow: '0 0 25px rgba(13,148,136,0.4)',
            animation: 'aiGlow 2s ease-in-out infinite',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s infinite',
            }}
          />
          <Zap className="w-6 h-6 relative z-10" />
          <div className="text-left relative z-10">
            <div className="font-black text-base">AIにおまかせでマッチング</div>
            <div className="text-xs text-teal-100 font-normal">あなたに最適なセラピストをAIが自動選択</div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/60 relative z-10 ml-auto" />
        </button>

        {/* 区切り */}
        <div className="flex items-center gap-3 px-1">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">または自分で選ぶ</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* 検索バー */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="名前、専門分野で検索..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
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
            filteredTherapists.map(therapist => {
              const specialties = parseJSON(therapist.specialties);
              const isSelected = selectedTherapist?.id === therapist.id;
              return (
                <div
                  key={therapist.id}
                  onClick={() => handleSelectTherapist(therapist)}
                  className={`bg-white rounded-xl shadow-sm p-4 cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-teal-600 bg-teal-50' : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* アバター */}
                    <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {therapist.avatar_url ? (
                        <img src={therapist.avatar_url} alt={therapist.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-teal-100">
                          <User className="w-8 h-8 text-teal-600" />
                        </div>
                      )}
                    </div>

                    {/* 情報 */}
                    <div className="flex-1 min-w-0">
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
                          <div className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-medium flex-shrink-0">
                            選択中
                          </div>
                        )}
                      </div>

                      {therapist.experience_years && (
                        <p className="text-sm text-gray-600 mt-1">経験 {therapist.experience_years}年</p>
                      )}

                      {specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {specialties.slice(0, 3).map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-teal-50 text-teal-700 text-xs rounded-md border border-teal-100">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {therapist.bio && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{therapist.bio}</p>
                      )}

                      {/* 詳細を見るボタン */}
                      <button
                        onClick={e => openModal(e, therapist.id)}
                        className="mt-2 flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors"
                      >
                        <Info className="w-3.5 h-3.5" />
                        詳細・口コミを見る
                      </button>
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
            {selectedTherapist ? `${selectedTherapist.name}で予約する` : 'セラピストを選択してください'}
          </button>
        </div>
      </div>

      {/* セラピスト詳細モーダル */}
      <TherapistDetailModal
        therapistId={modalTherapistId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBook={handleBookFromModal}
      />

      <style>{`
        @keyframes aiGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(13,148,136,0.4); }
          50% { box-shadow: 0 0 40px rgba(13,148,136,0.8); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </>
  );
};

export default TherapistSelect;
