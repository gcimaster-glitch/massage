
import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Navigation, Search, Filter, 
  Building2, Star, Clock, ArrowRight, X, 
  Map as MapIcon, Layers, Target, Zap, ShieldCheck, Locate,
  Users, Phone, Wifi, Coffee, Award, Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_SITES } from '../../constants';

// Google Maps の型定義
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const SiteMapSearch: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSite, setSelectedSite] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'MAP' | 'LIST'>('MAP');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [showTherapists, setShowTherapists] = useState(false);
  const [loadingTherapists, setLoadingTherapists] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Google Maps APIをロード
  useEffect(() => {
    // 既にロード済みの場合はスキップ
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    // Google Maps APIキーは環境変数から取得（デモ用にキーなしでも動作）
    script.src = `https://maps.googleapis.com/maps/api/js?key=&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);

    return () => {
      // クリーンアップ
    };
  }, []);

  // Fetch sites from API
  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const res = await fetch('/api/sites');
      const data = await res.json();
      setSites(data);
    } catch (e) {
      console.error('Failed to fetch sites:', e);
    }
  };

  // セラピスト一覧を取得
  const fetchTherapists = async () => {
    setLoadingTherapists(true);
    try {
      const res = await fetch('/api/therapists');
      const data = await res.json();
      setTherapists(data);
      setShowTherapists(true);
    } catch (e) {
      console.error('Failed to fetch therapists:', e);
    } finally {
      setLoadingTherapists(false);
    }
  };

  // マップを初期化
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || googleMapRef.current || sites.length === 0) return;

    // デフォルトの中心位置（東京駅）
    const defaultCenter = { lat: 35.6812, lng: 139.7671 };

    // マップを作成（モノクロベース + 視認性の高いラベル）
    const map = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 13,
      styles: [
        // 背景全体をモノクロに
        {
          featureType: 'all',
          elementType: 'geometry',
          stylers: [{ color: '#f0f0f0' }]
        },
        // 水域を薄いグレーに
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#d8e4e8' }]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#7a9ca5' }]
        },
        // 道路を白に
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#ffffff' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#d9d9d9' }]
        },
        // 道路ラベルを視認しやすく
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#5a5a5a' }]
        },
        {
          featureType: 'road.arterial',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#3a3a3a' }]
        },
        // 区名・地名ラベルを強調
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#2d2d2d' }]
        },
        {
          featureType: 'administrative.neighborhood',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#4a4a4a' }]
        },
        // ポイント・施設名を控えめに
        {
          featureType: 'poi',
          elementType: 'geometry',
          stylers: [{ color: '#e5e5e5' }]
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#8a8a8a' }]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{ color: '#d9ead3' }]
        },
        // 鉄道・交通を薄めに
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{ color: '#e0e0e0' }]
        },
        {
          featureType: 'transit.station',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#6a6a6a' }]
        }
      ],
      disableDefaultUI: true,
      zoomControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    googleMapRef.current = map;

    // サイトのマーカーを追加
    sites.forEach((site) => {
      // 施設タイプに応じた鮮やかなカラー
      const getMarkerColor = (type: string) => {
        if (type === 'CARE_CUBE') return '#FF6B35'; // 鮮やかなオレンジ
        if (type === 'HOTEL') return '#5B4FFF'; // 鮮やかな紫
        if (type === 'PRIVATE_SPACE') return '#00C896'; // 鮮やかなエメラルド
        return '#FF4081'; // デフォルトはピンク
      };

      const marker = new window.google.maps.Marker({
        position: { lat: site.lat, lng: site.lng },
        map: map,
        title: site.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: getMarkerColor(site.type),
          fillOpacity: 0.95,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        animation: window.google.maps.Animation.DROP,
      });

      marker.addListener('click', () => {
        setSelectedSite(site);
        setShowTherapists(false);
        map.panTo({ lat: site.lat, lng: site.lng });
      });

      markersRef.current.push(marker);
    });

  }, [mapLoaded, sites]);

  // 現在地を取得
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(pos);
          
          if (googleMapRef.current) {
            googleMapRef.current.setCenter(pos);
            
            // 現在地マーカーを追加（鮮やかなブルー）
            new window.google.maps.Marker({
              position: pos,
              map: googleMapRef.current,
              title: '現在地',
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: '#2196F3',
                fillOpacity: 0.9,
                strokeColor: '#ffffff',
                strokeWeight: 4,
              },
            });
          }
        },
        () => {
          alert('現在地の取得に失敗しました。位置情報の許可を確認してください。');
        }
      );
    } else {
      alert('お使いのブラウザは位置情報取得に対応していません。');
    }
  };

  // 地図クリックで詳細を閉じる
  useEffect(() => {
    if (!googleMapRef.current) return;
    
    const listener = googleMapRef.current.addListener('click', () => {
      setSelectedSite(null);
      setShowTherapists(false);
    });
    
    return () => {
      if (listener) listener.remove();
    };
  }, [googleMapRef.current]);

  return (
    <div className="h-screen animate-fade-in text-gray-900 font-sans flex flex-col relative overflow-hidden bg-slate-100">
      
      {/* 左上ロゴエリア */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => navigate('/app')}
          className="bg-white/95 backdrop-blur-xl px-6 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-gray-200 flex items-center gap-3 group"
        >
          <Home size={24} className="text-teal-600 group-hover:scale-110 transition-transform" />
          <span className="font-black text-xl text-gray-900">HOGUSY</span>
        </button>
      </div>
      
      {/* 検索バー */}
      <div className="absolute top-20 left-4 right-4 md:left-8 md:right-8 z-30 flex flex-col md:flex-row gap-4">
         <div className="flex-1 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-gray-200 flex items-center gap-4">
            <Search className="ml-2 text-gray-400" size={24} />
            <input 
              type="text" 
              placeholder="エリア、駅名、施設名で検索..." 
              className="flex-1 bg-transparent border-0 font-bold text-lg outline-none text-gray-900 placeholder-gray-400" 
            />
            <button className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-600 transition-all shadow-lg">
              検索
            </button>
         </div>
         
         <div className="flex gap-3">
            <button 
              onClick={getCurrentLocation}
              className="bg-white/95 backdrop-blur-xl p-4 rounded-xl shadow-xl text-gray-900 hover:bg-teal-600 hover:text-white transition-all border border-gray-200"
              title="現在地を表示"
            >
              <Locate size={24}/>
            </button>
            <button className="bg-white/95 backdrop-blur-xl p-4 rounded-xl shadow-xl text-gray-900 hover:bg-teal-600 hover:text-white transition-all border border-gray-200">
              <Filter size={24}/>
            </button>
         </div>
      </div>

      {/* Google Map */}
      <div className="flex-1 relative">
        <div 
          ref={mapRef} 
          className="w-full h-full"
          style={{ minHeight: '400px' }}
        />
        
        {/* ローディング表示 */}
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-200">
            <div className="text-center space-y-4">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent"></div>
              <p className="text-gray-600 font-bold">地図を読み込み中...</p>
            </div>
          </div>
        )}
      </div>

      {/* 選択されたサイトの詳細 */}
      {selectedSite && !showTherapists && (
        <div className="absolute bottom-8 left-4 right-4 md:left-8 md:right-8 z-40 animate-fade-in-up max-h-[70vh] overflow-y-auto">
           <div className="bg-white/95 backdrop-blur-2xl p-6 md:p-8 rounded-3xl shadow-2xl border border-gray-200">
              {/* 閉じるボタン */}
              <div className="flex justify-end mb-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSite(null);
                  }} 
                  className="p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-all"
                >
                  <X size={20}/>
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                {/* 画像 */}
                <div className="w-full md:w-80 h-56 rounded-2xl overflow-hidden shadow-lg border-4 border-white flex-shrink-0">
                   <img 
                     src={`https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600&h=400`} 
                     className="w-full h-full object-cover" 
                     alt={selectedSite.name}
                   />
                </div>
                
                {/* 詳細情報 */}
                <div className="flex-1 space-y-4">
                   <div>
                      <span className="bg-teal-50 text-teal-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-teal-200 mb-2 inline-block">
                        今すぐ予約可能
                      </span>
                      <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">{selectedSite.name}</h2>
                      <p className="text-gray-500 font-bold flex items-center gap-2 text-sm">
                         <MapPin size={16} className="text-teal-500" /> {selectedSite.address}
                      </p>
                   </div>
                   
                   {/* 評価・営業時間 */}
                   <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 text-yellow-500 font-black text-base bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-200">
                         <Star size={16} fill="currentColor" /> 4.9
                      </div>
                      <div className="flex items-center gap-2 font-bold text-gray-600 text-xs bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                         <Clock size={16} className="text-teal-500" /> 24時間営業
                      </div>
                      <div className="flex items-center gap-2 font-bold text-teal-600 text-xs bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
                         <Zap size={16} /> 即時予約対応
                      </div>
                   </div>

                   {/* 施設情報 */}
                   <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Wifi size={16} className="text-teal-500" />
                        <span className="font-medium">Wi-Fi完備</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Coffee size={16} className="text-teal-500" />
                        <span className="font-medium">ドリンク無料</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <ShieldCheck size={16} className="text-teal-500" />
                        <span className="font-medium">完全個室</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Award size={16} className="text-teal-500" />
                        <span className="font-medium">高評価施設</span>
                      </div>
                   </div>

                   {/* アクション */}
                   <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchTherapists();
                        }}
                        disabled={loadingTherapists}
                        className="flex-1 bg-teal-600 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-teal-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                         {loadingTherapists ? (
                           <>読み込み中...</>
                         ) : (
                           <>
                             <Users size={20} />
                             セラピストを見る
                           </>
                         )}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/site/${selectedSite.id}`);
                        }}
                        className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-gray-800 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                      >
                         予約する <ArrowRight size={20} />
                      </button>
                   </div>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* セラピスト一覧パネル */}
      {showTherapists && (
        <div className="absolute bottom-8 left-4 right-4 md:left-8 md:right-8 z-40 animate-fade-in-up max-h-[70vh] overflow-y-auto">
           <div className="bg-white/95 backdrop-blur-2xl p-6 md:p-8 rounded-3xl shadow-2xl border border-gray-200">
              {/* ヘッダー */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">
                    {selectedSite?.name} - セラピスト一覧
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{therapists.length}名のセラピストが対応可能</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTherapists(false);
                  }} 
                  className="p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-all"
                >
                  <X size={20}/>
                </button>
              </div>

              {/* セラピストリスト */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {therapists.slice(0, 6).map((therapist) => (
                  <div
                    key={therapist.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/app/therapist/${therapist.id}`);
                    }}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={therapist.avatar_url || '/default-avatar.png'}
                        alt={therapist.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-gray-900 truncate">{therapist.name}</h4>
                        <div className="flex items-center gap-1 text-sm mt-1">
                          <Star size={14} className="text-amber-400 fill-amber-400" />
                          <span className="font-bold text-gray-900">{therapist.rating}</span>
                          <span className="text-gray-500">({therapist.review_count})</span>
                        </div>
                      </div>
                    </div>
                    
                    {therapist.bio && (
                      <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                        {therapist.bio}
                      </p>
                    )}

                    <button className="w-full bg-teal-50 text-teal-600 py-2 rounded-lg text-sm font-bold group-hover:bg-teal-600 group-hover:text-white transition-all">
                      詳細を見る
                    </button>
                  </div>
                ))}
              </div>

              {/* 全員を見るボタン */}
              {therapists.length > 6 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/therapists');
                    }}
                    className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
                  >
                    全{therapists.length}名のセラピストを見る
                  </button>
                </div>
              )}
           </div>
        </div>
      )}

      {/* ズームコントロール */}
      <div className="absolute right-8 bottom-32 z-30 flex flex-col gap-2">
         <div className="bg-white/95 backdrop-blur-xl p-2 rounded-2xl shadow-xl flex flex-col border border-gray-200">
            <button 
              onClick={() => googleMapRef.current?.setZoom(googleMapRef.current.getZoom() + 1)}
              className="p-4 text-gray-600 hover:text-teal-600 border-b border-gray-200 font-bold text-xl transition-all"
            >
              +
            </button>
            <button 
              onClick={() => googleMapRef.current?.setZoom(googleMapRef.current.getZoom() - 1)}
              className="p-4 text-gray-600 hover:text-teal-600 font-bold text-xl transition-all"
            >
              −
            </button>
         </div>
      </div>
    </div>
  );
};

export default SiteMapSearch;
