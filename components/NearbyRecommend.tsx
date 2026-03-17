/**
 * NearbyRecommend
 * 現在地周辺の空き施設・予約可能なセラピストをリアルタイム表示するコンポーネント
 *
 * 機能：
 * 1. 現在地から近い順に施設を表示
 * 2. 空きセラピストを一覧表示
 * 3. AIおまかせ予約ボタン（最優先配置）
 * 4. セラピスト詳細モーダルとの連携
 */
import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Navigation, Star, Clock, Zap, ChevronRight, RefreshCw, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TherapistDetailModal from './booking/TherapistDetailModal';

interface Site {
  id: string;
  name: string;
  site_type: string;
  address: string;
  area: string;
  lat?: number;
  lng?: number;
  distance?: number;
  available_rooms?: number;
  rating?: number;
  amenities?: string[];
}

interface Therapist {
  id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  specialties?: string;
  rating?: number;
  review_count?: number;
  approved_areas?: string;
  earliest_slot?: string;
}

interface NearbyRecommendProps {
  /** 現在地座標（省略時はGeolocation APIで取得） */
  userLocation?: { lat: number; lng: number } | null;
  /** 施設クリック時のコールバック */
  onSiteSelect?: (site: Site) => void;
  /** AIおまかせ予約ボタンクリック時のコールバック */
  onAIBook?: () => void;
  /** コンパクト表示モード（地図ページ内埋め込み用） */
  compact?: boolean;
}

// 施設タイプのラベル
const SITE_TYPE_LABELS: Record<string, string> = {
  CARE_CUBE: 'CARE CUBE',
  CHARGE: 'CHARGE',
  PAWWOW: 'パウワウ',
  HOTEL: 'ホテル',
  OFFICE: 'オフィス',
  OTHER: 'その他',
};

// 施設タイプのグラデーション
const SITE_TYPE_GRADIENT: Record<string, string> = {
  CARE_CUBE: 'from-cyan-500 to-cyan-700',
  CHARGE: 'from-teal-500 to-teal-700',
  PAWWOW: 'from-emerald-500 to-emerald-700',
  HOTEL: 'from-blue-500 to-blue-700',
  OFFICE: 'from-gray-500 to-gray-700',
  OTHER: 'from-purple-500 to-purple-700',
};

// セラピストのグラデーション（IDに基づく）
const getTherapistGradient = (id: string): string => {
  const gradients = [
    'from-teal-500 to-teal-700',
    'from-blue-500 to-blue-700',
    'from-purple-500 to-purple-700',
    'from-emerald-500 to-emerald-700',
    'from-orange-500 to-red-500',
  ];
  return gradients[id.charCodeAt(0) % gradients.length];
};

// 距離を人間が読みやすい形式に変換
const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
};

// 徒歩時間を計算（80m/分）
const formatWalkTime = (meters: number): string => {
  const minutes = Math.ceil(meters / 80);
  return `徒歩${minutes}分`;
};

const NearbyRecommend: React.FC<NearbyRecommendProps> = ({
  userLocation: propLocation,
  onSiteSelect,
  onAIBook,
  compact = false,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'sites' | 'therapists'>('sites');
  const [sites, setSites] = useState<Site[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(propLocation || null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 現在地の取得
  useEffect(() => {
    if (propLocation) {
      setUserLocation(propLocation);
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {
          // 取得失敗時は東京駅をデフォルト
          setUserLocation({ lat: 35.6812, lng: 139.7671 });
        }
      );
    }
  }, [propLocation]);

  // データ取得
  const fetchNearbyData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 施設データ取得
      const sitesRes = await fetch('/api/sites?limit=10&status=ACTIVE');
      if (sitesRes.ok) {
        const sitesData = await sitesRes.json();
        const rawSites: Site[] = sitesData.sites || sitesData || [];

        // 距離計算（現在地がある場合）
        if (userLocation) {
          const sitesWithDistance = rawSites.map(site => {
            if (site.lat && site.lng) {
              const dist = calcDistance(userLocation.lat, userLocation.lng, site.lat, site.lng);
              return { ...site, distance: dist };
            }
            // 座標がない場合はランダムな距離（デモ用）
            return { ...site, distance: Math.random() * 800 + 100 };
          });
          sitesWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
          setSites(sitesWithDistance.slice(0, 5));
        } else {
          setSites(rawSites.slice(0, 5));
        }
      }

      // セラピストデータ取得
      const therapistsRes = await fetch('/api/therapists?limit=8');
      if (therapistsRes.ok) {
        const therapistsData = await therapistsRes.json();
        setTherapists(therapistsData.therapists || []);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error('近隣データ取得エラー:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userLocation]);

  useEffect(() => {
    if (userLocation) fetchNearbyData();
  }, [userLocation, fetchNearbyData]);

  // 2点間の距離計算（Haversine公式）
  const calcDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // AIおまかせ予約
  const handleAIBook = () => {
    if (onAIBook) {
      onAIBook();
    } else {
      navigate('/app/booking/auto-assign');
    }
  };

  // セラピスト詳細モーダルを開く
  const openTherapistModal = (therapistId: string) => {
    setSelectedTherapistId(therapistId);
    setIsModalOpen(true);
  };

  // セラピストで予約
  const handleBookTherapist = (therapistId: string) => {
    navigate(`/app/booking/from-map/direct?therapistId=${therapistId}`);
  };

  // 施設で予約
  const handleBookSite = (site: Site) => {
    if (onSiteSelect) {
      onSiteSelect(site);
    } else {
      navigate(`/app/booking/from-map/${site.id}`);
    }
  };

  const availableSitesCount = sites.filter(s => (s.available_rooms || 0) > 0).length;
  const availableTherapistsCount = therapists.length;

  return (
    <>
      <div className={`flex flex-col ${compact ? 'h-full' : ''}`}>

        {/* AIサマリーバナー */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-500 rounded-2xl p-4 text-white mb-4 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <Navigation className="w-4 h-4" />
            <span className="font-bold text-sm">現在地周辺のリアルタイム空き状況</span>
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 ml-auto animate-spin opacity-70" />
            ) : (
              <button onClick={fetchNearbyData} className="ml-auto opacity-70 hover:opacity-100">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/20 rounded-xl p-2">
              <div className="text-xl font-black">{availableSitesCount}</div>
              <div className="text-xs text-teal-100">空き施設</div>
            </div>
            <div className="bg-white/20 rounded-xl p-2">
              <div className="text-xl font-black">{availableTherapistsCount}</div>
              <div className="text-xs text-teal-100">セラピスト</div>
            </div>
            <div className="bg-white/20 rounded-xl p-2">
              <div className="text-xl font-black">最短</div>
              <div className="text-xs text-teal-100">今すぐ〜</div>
            </div>
          </div>
          {lastUpdated && (
            <p className="text-xs text-teal-100 mt-2 text-right">
              最終更新: {lastUpdated.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {/* 施設/セラピストタブ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4 flex-shrink-0">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('sites')}
              className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                activeTab === 'sites'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              🏢 近隣の施設
            </button>
            <button
              onClick={() => setActiveTab('therapists')}
              className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                activeTab === 'therapists'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Users className="w-3.5 h-3.5 inline mr-1" />
              セラピスト
            </button>
          </div>

          {/* 施設リスト */}
          {activeTab === 'sites' && (
            <div className={`divide-y divide-gray-50 ${compact ? 'max-h-72' : 'max-h-96'} overflow-y-auto`}>
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : sites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <MapPin className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">近隣の施設が見つかりません</p>
                </div>
              ) : (
                sites.map(site => {
                  const gradient = SITE_TYPE_GRADIENT[site.site_type] || SITE_TYPE_GRADIENT.OTHER;
                  const label = SITE_TYPE_LABELS[site.site_type] || site.site_type;
                  const hasAvailability = (site.available_rooms || 0) > 0;
                  return (
                    <button
                      key={site.id}
                      onClick={() => handleBookSite(site)}
                      className="w-full p-4 hover:bg-teal-50/30 transition-colors text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <span className="text-white text-xs font-black">{label.substring(0, 3)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-sm text-gray-900 truncate">{site.name}</span>
                            {hasAvailability ? (
                              <span className="flex-shrink-0 text-xs bg-teal-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">
                                空き{site.available_rooms}
                              </span>
                            ) : (
                              <span className="flex-shrink-0 text-xs bg-gray-400 text-white px-1.5 py-0.5 rounded-full">
                                満員
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mb-1.5 truncate">{site.address}</p>
                          <div className="flex items-center gap-3">
                            {site.distance && (
                              <>
                                <span className="text-xs bg-teal-50 text-teal-600 border border-teal-100 px-2 py-0.5 rounded-full font-medium">
                                  📍 {formatDistance(site.distance)}
                                </span>
                                <span className="text-xs text-gray-400">{formatWalkTime(site.distance)}</span>
                              </>
                            )}
                            {site.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span className="text-xs text-gray-500">{site.rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* セラピストリスト */}
          {activeTab === 'therapists' && (
            <div className={`divide-y divide-gray-50 ${compact ? 'max-h-72' : 'max-h-96'} overflow-y-auto`}>
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : therapists.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <Users className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">セラピストが見つかりません</p>
                </div>
              ) : (
                therapists.map(therapist => {
                  const gradient = getTherapistGradient(therapist.id);
                  const specialties = therapist.specialties
                    ? therapist.specialties.split(',').slice(0, 2).map(s => s.trim())
                    : [];
                  return (
                    <div key={therapist.id} className="p-4 hover:bg-teal-50/30 transition-colors">
                      <div className="flex items-start gap-3">
                        {/* アバター */}
                        <div className="relative flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                            {therapist.avatar_url ? (
                              <img src={therapist.avatar_url} alt={therapist.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <span className="text-white font-black text-lg">{therapist.name.charAt(0)}</span>
                            )}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-teal-500 rounded-full border-2 border-white animate-pulse" />
                        </div>

                        {/* 情報 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-sm text-gray-900">{therapist.name}</span>
                            <span className="text-xs bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded-full">今すぐ対応可</span>
                          </div>
                          {therapist.approved_areas && (
                            <p className="text-xs text-gray-500 mb-1">{therapist.approved_areas.split(',')[0]}在籍</p>
                          )}
                          {therapist.rating && (
                            <div className="flex items-center gap-1 mb-1.5">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span className="text-xs font-semibold text-gray-700">{therapist.rating.toFixed(1)}</span>
                              <span className="text-xs text-gray-400">({therapist.review_count || 0}件)</span>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1.5">
                            {specialties.map(s => (
                              <span key={s} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md">{s}</span>
                            ))}
                            {/* 詳細ボタン */}
                            <button
                              onClick={() => openTherapistModal(therapist.id)}
                              className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md hover:bg-teal-50 hover:text-teal-600 transition-colors"
                            >
                              詳細を見る ›
                            </button>
                          </div>
                        </div>

                        {/* 最短時間 + 予約ボタン */}
                        <div className="flex-shrink-0 text-right">
                          <div className="text-xs text-gray-400">最短</div>
                          <div className="text-sm font-bold text-teal-600 mb-1">今すぐ〜</div>
                          <button
                            onClick={() => handleBookTherapist(therapist.id)}
                            className="text-xs bg-teal-600 text-white px-2.5 py-1.5 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                          >
                            予約
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* AIおまかせ予約ボタン（最優先・大きく） */}
        <button
          onClick={handleAIBook}
          className="relative w-full text-white font-black py-5 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center gap-3 text-base hover:scale-[1.02] transition-transform flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 50%, #7c3aed 100%)',
            boxShadow: '0 0 25px rgba(13,148,136,0.4)',
            animation: 'aiGlow 2s ease-in-out infinite',
          }}
        >
          {/* シマーエフェクト */}
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
            <div className="font-black text-base">AIにおまかせで今すぐ予約</div>
            <div className="text-xs text-teal-100 font-normal">最適な施設・セラピスト・時間をAIが自動選択</div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/60 relative z-10 ml-auto" />
        </button>

      </div>

      {/* セラピスト詳細モーダル */}
      <TherapistDetailModal
        therapistId={selectedTherapistId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBook={handleBookTherapist}
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

export default NearbyRecommend;
