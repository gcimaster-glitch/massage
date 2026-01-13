
import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Navigation, Search, Filter, 
  Building2, Star, Clock, ArrowRight, X, 
  Map as MapIcon, Layers, Target, Zap, ShieldCheck, Locate
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

  return (
    <div className="h-[calc(100vh-100px)] animate-fade-in text-gray-900 font-sans flex flex-col relative overflow-hidden bg-slate-100 rounded-3xl shadow-2xl border border-white">
      
      {/* 検索バー */}
      <div className="absolute top-8 left-8 right-8 z-30 flex flex-col md:flex-row gap-4">
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
      {selectedSite && (
        <div className="absolute bottom-8 left-8 right-8 z-40 animate-fade-in-up">
           <div className="bg-white/95 backdrop-blur-2xl p-8 md:p-10 rounded-3xl shadow-2xl border border-gray-200 flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-64 h-48 rounded-2xl overflow-hidden shadow-lg border-4 border-white flex-shrink-0">
                 <img 
                   src={`https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=400&h=300`} 
                   className="w-full h-full object-cover" 
                   alt={selectedSite.name}
                 />
              </div>
              
              <div className="flex-1 space-y-6">
                 <div className="flex justify-between items-start gap-4">
                    <div>
                       <span className="bg-teal-50 text-teal-600 px-4 py-2 rounded-lg text-xs font-bold border border-teal-200 mb-3 inline-block">
                         今すぐ予約可能
                       </span>
                       <h2 className="text-3xl font-black text-gray-900">{selectedSite.name}</h2>
                       <p className="text-gray-500 font-bold flex items-center gap-2 mt-3 text-base">
                          <MapPin size={18} className="text-teal-500" /> {selectedSite.address}
                       </p>
                    </div>
                    <button 
                      onClick={() => setSelectedSite(null)} 
                      className="p-3 bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-all"
                    >
                      <X size={20}/>
                    </button>
                 </div>
                 
                 <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2 text-yellow-500 font-black text-lg bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-200">
                       <Star size={18} fill="currentColor" /> 4.9
                    </div>
                    <div className="flex items-center gap-3 font-bold text-gray-600 text-sm">
                       <Clock size={18} className="text-teal-500" /> 24時間営業
                    </div>
                    <div className="flex items-center gap-3 font-bold text-teal-600 text-sm">
                       <Zap size={18} className="animate-pulse" /> 即時予約対応
                    </div>
                 </div>
              </div>
              
              <button 
                onClick={() => navigate(`/app/site/${selectedSite.id}`)}
                className="w-full md:w-auto bg-gray-900 text-white px-12 py-5 rounded-2xl font-black text-lg hover:bg-teal-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
              >
                 このブースを選ぶ <ArrowRight size={24} />
              </button>
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
