
import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Navigation, Search, Filter, 
  Building2, Star, Clock, ArrowRight, X, 
  Map as MapIcon, Layers, Target, Zap, ShieldCheck, Locate,
  Users, Phone, Wifi, Coffee, Award, Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_SITES } from '../../constants';
import QuickBookingPanel from '../../components/QuickBookingPanel';

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
  const [selectedTherapist, setSelectedTherapist] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'MAP' | 'LIST'>('MAP');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [nearbySites, setNearbySites] = useState<any[]>([]); // 3km以内の施設
  const [therapists, setTherapists] = useState<any[]>([]);
  const [showTherapists, setShowTherapists] = useState(false);
  const [loadingTherapists, setLoadingTherapists] = useState(false);
  const [showQuickBooking, setShowQuickBooking] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // 距離計算関数（Haversine formula）
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // 地球の半径（km）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // 距離（km）
  };

  // Google Maps APIが読み込まれるまで待機
  useEffect(() => {
    // index.htmlで既に読み込まれているGoogle Maps APIを使用
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setMapLoaded(true);
      } else {
        // まだ読み込まれていない場合は100ms後に再チェック
        setTimeout(checkGoogleMaps, 100);
      }
    };
    
    checkGoogleMaps();
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

  // ユーザーの現在地を取得して3km以内の施設を計算
  useEffect(() => {
    if (userLocation && sites.length > 0) {
      const sitesWithDistance = sites.map(site => ({
        ...site,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          site.location.lat,
          site.location.lng
        )
      }));

      // 3km以内の施設のみをフィルタリングして距離順にソート
      const nearby = sitesWithDistance
        .filter(site => site.distance <= 3)
        .sort((a, b) => a.distance - b.distance);

      setNearbySites(nearby);
    }
  }, [userLocation, sites]);

  // セラピスト一覧を取得
  const fetchTherapists = async () => {
    setLoadingTherapists(true);
    try {
      const res = await fetch('/api/therapists');
      const data = await res.json();
      
      // 「今予約できる」セラピストを優先的にソート
      // 実際にはAPIから availability データを取得する想定
      // ここでは仮に id が奇数のセラピストを「予約可能」とする
      const sortedData = data.sort((a: any, b: any) => {
        // 予約可能なセラピストを優先（実際にはAPIからのデータを使用）
        const aAvailable = parseInt(a.id.replace(/\D/g, '')) % 2 === 1;
        const bAvailable = parseInt(b.id.replace(/\D/g, '')) % 2 === 1;
        
        if (aAvailable && !bAvailable) return -1;
        if (!aAvailable && bAvailable) return 1;
        
        // 同じ予約状態の場合は評価順
        return b.rating - a.rating;
      });
      
      setTherapists(sortedData);
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

      {/* フローティング施設リスト（3km以内） */}
      {userLocation && nearbySites.length > 0 && (
        <div className="absolute top-40 right-4 z-30 w-96 max-h-[calc(100vh-180px)] animate-fade-in">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-teal-600 to-indigo-600 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-black text-xl flex items-center gap-2">
                  <MapPin size={24} />
                  近くの施設
                </h3>
                <span className="bg-white/20 backdrop-blur-md text-white text-xs font-black px-3 py-1.5 rounded-full">
                  {nearbySites.length}件
                </span>
              </div>
              <p className="text-white/90 text-sm font-medium">
                現在地から3km以内
              </p>
            </div>

            {/* スクロール可能なリスト */}
            <div className="overflow-y-auto max-h-[calc(100vh-340px)] p-4 space-y-3">
              {nearbySites.map((site) => (
                <div
                  key={site.id}
                  onClick={() => {
                    setSelectedSite(site);
                    // マップを施設の位置に移動
                    if (googleMapRef.current) {
                      googleMapRef.current.panTo(site.location);
                      googleMapRef.current.setZoom(16);
                    }
                  }}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border-2 hover:shadow-lg ${
                    selectedSite?.id === site.id
                      ? 'bg-teal-50 border-teal-500'
                      : 'bg-gray-50 border-gray-200 hover:border-teal-300'
                  }`}
                >
                  <div className="space-y-3">
                    {/* 施設名と距離 */}
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-black text-gray-900 text-base leading-tight flex-1">
                        {site.name}
                      </h4>
                      <div className="flex items-center gap-1 bg-teal-600 text-white text-xs font-black px-2 py-1 rounded-full shrink-0">
                        <Navigation size={10} />
                        {site.distance.toFixed(1)}km
                      </div>
                    </div>

                    {/* 住所 */}
                    <div className="flex items-start gap-2 text-xs text-gray-600">
                      <Building2 size={14} className="mt-0.5 shrink-0" />
                      <p className="leading-relaxed">{site.address}</p>
                    </div>

                    {/* 営業状態とアメニティ */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {site.amenities?.includes('WIFI') && (
                          <div className="bg-white p-1.5 rounded-lg" title="Wi-Fi">
                            <Wifi size={12} className="text-gray-600" />
                          </div>
                        )}
                        {site.amenities?.includes('SHOWER') && (
                          <div className="bg-white p-1.5 rounded-lg" title="シャワー">
                            <Coffee size={12} className="text-gray-600" />
                          </div>
                        )}
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                        <Clock size={10} />
                        営業中
                      </span>
                    </div>

                    {/* 予約ボタン */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSite(site);
                        setShowQuickBooking(true);
                      }}
                      className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white py-2.5 rounded-xl text-sm font-black hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Zap size={16} />
                      今すぐ予約
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* フッター */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => navigate('/app/sites')}
                className="w-full text-gray-600 hover:text-teal-600 text-sm font-bold flex items-center justify-center gap-2 transition-all"
              >
                すべての施設を見る
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

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
                          setShowQuickBooking(true);
                        }}
                        className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 text-white px-6 py-3 rounded-xl font-black text-base hover:from-teal-700 hover:to-blue-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                      >
                         <Zap size={20} />
                         今すぐ予約
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchTherapists();
                        }}
                        disabled={loadingTherapists}
                        className="flex-1 bg-white text-gray-900 px-6 py-3 rounded-xl font-bold text-base hover:bg-gray-50 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 border-2 border-gray-200"
                      >
                         {loadingTherapists ? (
                           <>読み込み中...</>
                         ) : (
                           <>
                             <Users size={20} />
                             セラピスト一覧
                           </>
                         )}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/site/${selectedSite.id}`);
                        }}
                        className="flex-1 sm:flex-none bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold text-base hover:bg-gray-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                         詳細 <ArrowRight size={20} />
                      </button>
                   </div>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* セラピスト一覧モーダル */}
      {showTherapists && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTherapists(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[85vh] overflow-hidden m-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 md:p-8">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black mb-2">
                    {selectedSite?.name}
                  </h3>
                  <p className="text-white/90 font-medium flex items-center gap-2 mb-2">
                    <Users size={20} />
                    {therapists.length}名のセラピストが在籍
                  </p>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 w-fit">
                    <Zap size={16} className="text-yellow-300" />
                    <span className="text-sm font-bold">
                      今予約できる: {therapists.filter((t: any) => parseInt(t.id.replace(/\D/g, '')) % 2 === 1).length}名
                    </span>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTherapists(false);
                  }} 
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all"
                >
                  <X size={24} className="text-white"/>
                </button>
              </div>
            </div>

            {/* セラピストリスト（スクロール可能） */}
            <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(85vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {therapists.map((therapist) => {
                  // 予約可能かどうかを判定（実際にはAPIからのデータを使用）
                  const isAvailable = parseInt(therapist.id.replace(/\D/g, '')) % 2 === 1;
                  
                  return (
                  <div
                    key={therapist.id}
                    className={`bg-white border-2 rounded-2xl p-5 hover:shadow-xl transition-all relative ${
                      isAvailable 
                        ? 'border-teal-300 hover:border-teal-500' 
                        : 'border-gray-200 hover:border-gray-400 opacity-75'
                    }`}
                  >
                    {/* 予約可能バッジ（右上） */}
                    {isAvailable && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-teal-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg animate-pulse">
                        <Zap size={12} fill="currentColor" />
                        予約可
                      </div>
                    )}

                    {/* セラピスト画像とヘッダー */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <img
                          src={therapist.avatar_url || '/default-avatar.png'}
                          alt={therapist.name}
                          className={`w-20 h-20 rounded-xl object-cover border-2 transition-all ${
                            isAvailable 
                              ? 'border-teal-300 group-hover:border-teal-500' 
                              : 'border-gray-300 grayscale'
                          }`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(therapist.name)}&background=14b8a6&color=fff`;
                          }}
                        />
                        {!isAvailable && (
                          <div className="absolute inset-0 bg-gray-900/30 rounded-xl flex items-center justify-center">
                            <Clock size={24} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-black text-lg mb-1 truncate transition-colors ${
                          isAvailable 
                            ? 'text-gray-900' 
                            : 'text-gray-600'
                        }`}>
                          {therapist.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Star size={16} className="text-amber-400 fill-amber-400" />
                          <span className="font-bold text-gray-900">{therapist.rating}</span>
                          <span className="text-gray-500 text-sm">({therapist.review_count}件)</span>
                        </div>
                        {therapist.experience_years && (
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <Award size={12} className="text-teal-500" />
                            経験{therapist.experience_years}年
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* 略歴 */}
                    {therapist.bio && (
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                        {therapist.bio}
                      </p>
                    )}

                    {/* 専門分野タグ */}
                    {therapist.specialties && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {(typeof therapist.specialties === 'string' 
                          ? JSON.parse(therapist.specialties) 
                          : therapist.specialties
                        ).slice(0, 3).map((specialty: string, idx: number) => (
                          <span 
                            key={idx}
                            className="text-xs font-medium px-2 py-1 bg-teal-50 text-teal-700 rounded-lg border border-teal-200"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* アクションボタン */}
                    <div className="flex gap-2">
                      {isAvailable ? (
                        <>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTherapist(therapist);
                              setShowTherapists(false);
                              setShowQuickBooking(true);
                            }}
                            className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 text-white py-3 rounded-xl text-sm font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            <Zap size={16} />
                            今すぐ予約
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/app/therapist/${therapist.id}`);
                            }}
                            className="px-4 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-bold hover:border-gray-300 transition-all flex items-center justify-center"
                          >
                            詳細
                          </button>
                        </>
                      ) : (
                        <button className="w-full bg-gray-300 text-gray-600 py-3 rounded-xl text-sm font-bold cursor-not-allowed flex items-center justify-center gap-2">
                          <Clock size={16} />
                          予約受付終了
                        </button>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>

              {/* 全員を見るボタン */}
              {therapists.length > 9 && (
                <div className="mt-8 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/therapists');
                    }}
                    className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg"
                  >
                    全{therapists.length}名のセラピストを見る
                  </button>
                </div>
              )}
            </div>
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
      
      {/* クイック予約パネル */}
      <QuickBookingPanel
        isOpen={showQuickBooking}
        onClose={() => {
          setShowQuickBooking(false);
          setSelectedTherapist(null);
        }}
        preSelectedSite={selectedSite}
        preSelectedTherapist={selectedTherapist}
      />
    </div>
  );
};

export default SiteMapSearch;
