
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Star, ArrowRight, ShieldCheck, Users, 
  CheckCircle, Zap, Search, Calendar, Heart, ChevronRight, Sparkles, 
  Timer, UserCheck, Building2, Navigation, Filter, Clock, Target,
  Map as MapIcon, X
} from 'lucide-react';
import { MOCK_THERAPISTS, MOCK_AREAS } from '../../constants';
import PortalLayout from './PortalLayout';

// Google Maps の型定義
declare global {
  interface Window {
    google: any;
  }
}

// タブの種類
type TabType = 'map' | 'therapist';

// 施設の型カラーマッピング
const SITE_TYPE_COLORS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  CARE_CUBE: { bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500', label: 'CARE CUBE' },
  HOTEL: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500', label: 'ホテル' },
  OFFICE: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', label: 'オフィス' },
  OTHER: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500', label: 'その他' },
};

const PortalHome: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('map');
  const tabContentRef = useRef<HTMLDivElement>(null);
  
  // Map state
  const [sites, setSites] = useState<any[]>([]);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedSiteType, setSelectedSiteType] = useState('ALL');
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Therapist state
  const [therapists, setTherapists] = useState<any[]>([]);
  const [therapistsLoading, setTherapistsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // ============================================
  // データ取得
  // ============================================
  useEffect(() => {
    // 施設データ
    const fetchSites = async () => {
      try {
        const res = await fetch('/api/sites');
        if (res.ok) {
          const data = await res.json();
          setSites(data.sites || []);
        }
      } catch (e) {
        console.error('Failed to fetch sites:', e);
      } finally {
        setSitesLoading(false);
      }
    };

    // セラピストデータ
    const fetchTherapists = async () => {
      try {
        const res = await fetch('/api/therapists?limit=20');
        if (res.ok) {
          const data = await res.json();
          const list = data.therapists || [];
          list.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
          setTherapists(list);
        } else {
          setTherapists(MOCK_THERAPISTS);
        }
      } catch (e) {
        console.error('Failed to fetch therapists:', e);
        setTherapists(MOCK_THERAPISTS);
      } finally {
        setTherapistsLoading(false);
      }
    };

    fetchSites();
    fetchTherapists();
  }, []);

  // ============================================
  // Google Map 初期化
  // ============================================
  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google || googleMapRef.current) return;

    const defaultCenter = userLocation || { lat: 35.6762, lng: 139.6503 }; // 東京

    googleMapRef.current = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 12,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
      ],
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      zoomControl: true,
      zoomControlOptions: { position: window.google.maps.ControlPosition.RIGHT_CENTER },
    });

    setMapReady(true);
  }, [userLocation]);

  // タブ切り替え時にマップ初期化
  useEffect(() => {
    if (activeTab === 'map' && !googleMapRef.current) {
      // Google Maps APIがロード済みかチェック
      if (window.google?.maps) {
        setTimeout(initMap, 100);
      } else {
        // APIロード待ち
        const checkInterval = setInterval(() => {
          if (window.google?.maps) {
            clearInterval(checkInterval);
            setTimeout(initMap, 100);
          }
        }, 200);
        return () => clearInterval(checkInterval);
      }
    }
  }, [activeTab, initMap]);

  // マーカー更新
  useEffect(() => {
    if (!mapReady || !googleMapRef.current || activeTab !== 'map') return;

    // 既存マーカーをクリア
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const filteredSites = selectedSiteType === 'ALL' 
      ? sites 
      : sites.filter(s => s.site_type === selectedSiteType);

    const bounds = new window.google.maps.LatLngBounds();

    filteredSites.forEach(site => {
      if (!site.latitude || !site.longitude) return;
      
      const colorMap: Record<string, string> = {
        CARE_CUBE: '#00C896', HOTEL: '#5B4FFF', OFFICE: '#FF8C00', OTHER: '#6B7280',
      };
      const color = colorMap[site.site_type] || '#6B7280';

      const marker = new window.google.maps.Marker({
        position: { lat: parseFloat(site.latitude), lng: parseFloat(site.longitude) },
        map: googleMapRef.current,
        title: site.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 10,
        },
      });

      marker.addListener('click', () => {
        navigate(`/app/site/${site.id}`);
      });

      markersRef.current.push(marker);
      bounds.extend(marker.getPosition());
    });

    if (filteredSites.length > 0) {
      googleMapRef.current.fitBounds(bounds);
      const listener = window.google.maps.event.addListenerOnce(googleMapRef.current, 'idle', () => {
        if (googleMapRef.current.getZoom() > 15) googleMapRef.current.setZoom(15);
      });
    }
  }, [mapReady, sites, selectedSiteType, activeTab, navigate]);

  // 位置情報取得
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 5000 }
    );
  }, []);

  // ============================================
  // フィルターされたデータ
  // ============================================
  const filteredSites = selectedSiteType === 'ALL' ? sites : sites.filter(s => s.site_type === selectedSiteType);
  
  const filteredTherapists = searchQuery 
    ? therapists.filter(t => 
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.specialties?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : therapists;

  // タブ切り替えハンドラ
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // タブコンテンツまでスクロール
    setTimeout(() => {
      tabContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // サイトタイプ統計
  const siteTypeCounts = sites.reduce((acc: Record<string, number>, s) => {
    acc[s.site_type] = (acc[s.site_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <PortalLayout>
      {/* ===== HERO (コンパクト) ===== */}
      <section className="relative min-h-[50vh] md:min-h-[55vh] flex items-center justify-center overflow-hidden bg-slate-900">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-40">
          <source src="/videos/hero-spa.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/30 to-slate-900/80"></div>
        <div className="relative z-10 text-center px-6 max-w-5xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-teal-500/20 backdrop-blur-md text-teal-400 px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border border-teal-500/30">
            <Sparkles size={14} /> Wellness Infrastructure by HOGUSY
          </div>
          <h1 className="text-5xl md:text-8xl lg:text-[100px] font-black text-white leading-[0.85] tracking-tighter drop-shadow-2xl">
            ほぐす、を、<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-200 to-indigo-300">もっと身近に。</span>
          </h1>
          <p className="text-white/80 font-bold text-base md:text-xl tracking-tight max-w-2xl mx-auto leading-relaxed">
            街のあらゆる場所に、プロの施術空間。探して、選んで、すぐに整う。
          </p>
        </div>
      </section>

      {/* ===== メイン タブ ===== */}
      <div ref={tabContentRef} className="sticky top-[72px] md:top-[88px] z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex">
            {/* マップで探すタブ */}
            <button
              onClick={() => handleTabChange('map')}
              className={`flex-1 py-4 md:py-5 flex items-center justify-center gap-2 md:gap-3 font-black text-sm md:text-lg transition-all relative ${
                activeTab === 'map' 
                  ? 'text-teal-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <MapPin size={20} className={activeTab === 'map' ? 'text-teal-500' : ''} />
              <span>マップで探す</span>
              {!sitesLoading && (
                <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full font-black ${
                  activeTab === 'map' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'
                }`}>{sites.length}</span>
              )}
              {activeTab === 'map' && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-teal-500 rounded-t-full"></div>
              )}
            </button>

            {/* セラピストタブ */}
            <button
              onClick={() => handleTabChange('therapist')}
              className={`flex-1 py-4 md:py-5 flex items-center justify-center gap-2 md:gap-3 font-black text-sm md:text-lg transition-all relative ${
                activeTab === 'therapist' 
                  ? 'text-indigo-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Users size={20} className={activeTab === 'therapist' ? 'text-indigo-500' : ''} />
              <span>セラピストを見る</span>
              {!therapistsLoading && (
                <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full font-black ${
                  activeTab === 'therapist' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'
                }`}>{therapists.length}</span>
              )}
              {activeTab === 'therapist' && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-indigo-500 rounded-t-full"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ===== タブコンテンツ ===== */}
      <div className="min-h-[70vh]">

        {/* ────── マップタブ ────── */}
        {activeTab === 'map' && (
          <div>
            {/* フィルターバー */}
            <div className="bg-gray-50 border-b border-gray-100 py-3 px-4">
              <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  onClick={() => setSelectedSiteType('ALL')}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-black transition-all ${
                    selectedSiteType === 'ALL' ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'
                  }`}
                >
                  すべて ({sites.length})
                </button>
                {Object.entries(SITE_TYPE_COLORS).map(([type, style]) => (
                  <button
                    key={type}
                    onClick={() => setSelectedSiteType(type)}
                    className={`shrink-0 px-4 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
                      selectedSiteType === type 
                        ? `${style.bg} ${style.text} shadow-md ring-2 ring-offset-1 ring-current` 
                        : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
                    {style.label} ({siteTypeCounts[type] || 0})
                  </button>
                ))}
              </div>
            </div>

            {/* マップ + サイドリスト */}
            <div className="flex flex-col lg:flex-row" style={{ height: 'calc(70vh - 52px)' }}>
              {/* Google Map */}
              <div className="flex-1 relative">
                <div ref={mapRef} className="w-full h-[40vh] lg:h-full bg-gray-200"></div>
                {sitesLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                    <div className="text-center space-y-3">
                      <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-teal-600 border-t-transparent"></div>
                      <p className="text-gray-500 font-bold text-sm">施設を読み込み中...</p>
                    </div>
                  </div>
                )}
                {/* 現在地ボタン */}
                {userLocation && googleMapRef.current && (
                  <button
                    onClick={() => {
                      googleMapRef.current?.panTo(userLocation);
                      googleMapRef.current?.setZoom(14);
                    }}
                    className="absolute bottom-4 right-4 bg-white shadow-xl rounded-full p-3 hover:bg-teal-50 transition-all border border-gray-200"
                    title="現在地へ移動"
                  >
                    <Navigation size={20} className="text-teal-600" />
                  </button>
                )}
                {/* マップ全画面リンク */}
                <button
                  onClick={() => navigate('/app/map')}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm shadow-lg rounded-xl px-4 py-2 text-xs font-black text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-all border border-gray-200 flex items-center gap-2"
                >
                  <Target size={14} /> 全画面で見る
                </button>
              </div>

              {/* 施設リスト（サイドパネル） */}
              <div className="lg:w-[380px] xl:w-[420px] overflow-y-auto bg-white border-t lg:border-t-0 lg:border-l border-gray-200">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
                    {filteredSites.length} 件の施設
                  </p>
                </div>
                <div className="divide-y divide-gray-50">
                  {filteredSites.slice(0, 20).map(site => {
                    const style = SITE_TYPE_COLORS[site.site_type] || SITE_TYPE_COLORS.OTHER;
                    return (
                      <div
                        key={site.id}
                        onClick={() => navigate(`/app/site/${site.id}`)}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`shrink-0 w-10 h-10 ${style.bg} rounded-xl flex items-center justify-center`}>
                            <Building2 size={18} className={style.text} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>{style.label}</span>
                            </div>
                            <h4 className="font-black text-sm text-gray-900 truncate group-hover:text-teal-600 transition-colors">{site.name}</h4>
                            {site.address && (
                              <p className="text-[11px] text-gray-400 mt-1 truncate flex items-center gap-1">
                                <MapPin size={10} /> {site.address}
                              </p>
                            )}
                          </div>
                          <ChevronRight size={16} className="text-gray-300 group-hover:text-teal-500 shrink-0 mt-2" />
                        </div>
                      </div>
                    );
                  })}
                  {filteredSites.length > 20 && (
                    <div className="p-4 text-center">
                      <button
                        onClick={() => navigate('/app/map')}
                        className="text-sm font-black text-teal-600 hover:text-teal-800 transition-colors flex items-center gap-2 justify-center w-full"
                      >
                        すべて{filteredSites.length}件を見る <ArrowRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ────── セラピストタブ ────── */}
        {activeTab === 'therapist' && (
          <div>
            {/* 検索バー */}
            <div className="bg-gray-50 border-b border-gray-100 py-3 px-4">
              <div className="max-w-7xl mx-auto flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="名前、得意技術で検索..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <span className="text-xs font-black text-gray-400">
                  {filteredTherapists.length}名
                </span>
              </div>
            </div>

            {/* セラピストグリッド */}
            <div className="max-w-7xl mx-auto px-4 py-8">
              {therapistsLoading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
                  <p className="text-gray-400 font-bold mt-4 text-sm">セラピストを読み込み中...</p>
                </div>
              ) : filteredTherapists.length === 0 ? (
                <div className="text-center py-20">
                  <Users size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-bold">該当するセラピストが見つかりません</p>
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="mt-4 text-indigo-600 font-black text-sm hover:underline">
                      検索をクリア
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTherapists.map(t => (
                    <div
                      key={t.id}
                      onClick={() => navigate(`/app/therapist/${t.id}`)}
                      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                    >
                      <div className="h-52 overflow-hidden relative">
                        <img
                          src={t.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&size=400&background=4338ca&color=fff&bold=true`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&size=400&background=4338ca&color=fff&bold=true`;
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt={t.name}
                        />
                        {t.kyc_status === 'VERIFIED' && (
                          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <ShieldCheck size={10} /> Verified
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-yellow-400 text-gray-900 text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1">
                          <Star size={10} fill="currentColor" /> {(t.rating || 5.0).toFixed(1)}
                        </div>
                      </div>
                      <div className="p-5 space-y-3">
                        <div>
                          <h4 className="font-black text-base text-gray-900 group-hover:text-indigo-600 transition-colors">{t.name}</h4>
                          {t.bio && (
                            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{t.bio}</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                          <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
                            <Star size={12} className="text-yellow-400" fill="currentColor" /> {t.review_count || 0}件のレビュー
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/app/booking/new?therapistId=${t.id}`); }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black px-4 py-1.5 rounded-full transition-all"
                          >
                            予約
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* もっと見るボタン */}
              {filteredTherapists.length > 0 && (
                <div className="text-center pt-10">
                  <button
                    onClick={() => navigate('/therapists')}
                    className="inline-flex items-center gap-3 bg-gray-900 hover:bg-indigo-600 text-white font-black py-4 px-10 rounded-full text-sm transition-all shadow-lg hover:scale-105"
                  >
                    すべてのセラピストを見る <ArrowRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===== 3ステップ ===== */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-black text-teal-600 uppercase tracking-[0.4em] block">How to Use</span>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter">
              3ステップで、<br className="md:hidden"/>すぐに整う
            </h2>
            <p className="text-gray-600 font-bold text-lg max-w-2xl mx-auto">
              面倒な手続きは不要。アプリひとつで、プロの施術があなたの近くに。
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative group">
              <div className="absolute -top-6 -left-6 w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center text-white font-black text-3xl shadow-2xl group-hover:scale-110 transition-all z-10">1</div>
              <div className="bg-white rounded-[40px] p-10 pt-16 shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 group-hover:border-teal-500">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center"><Search size={32} className="text-teal-600" /></div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-3">探す</h3>
                    <p className="text-gray-600 font-medium leading-relaxed">地図から近くの施設を探すか、セラピストのプロフィールを見て選択。空き状況もリアルタイムで確認できます。</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -top-6 -left-6 w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-3xl shadow-2xl group-hover:scale-110 transition-all z-10">2</div>
              <div className="bg-white rounded-[40px] p-10 pt-16 shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 group-hover:border-indigo-500">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center"><Calendar size={32} className="text-indigo-600" /></div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-3">予約する</h3>
                    <p className="text-gray-600 font-medium leading-relaxed">希望の日時とメニューを選択。決済もアプリで完結。面倒な現金のやり取りはありません。</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -top-6 -left-6 w-20 h-20 bg-rose-600 rounded-full flex items-center justify-center text-white font-black text-3xl shadow-2xl group-hover:scale-110 transition-all z-10">3</div>
              <div className="bg-white rounded-[40px] p-10 pt-16 shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 group-hover:border-rose-500">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center"><Heart size={32} className="text-rose-600" /></div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-3">整う</h3>
                    <p className="text-gray-600 font-medium leading-relaxed">予約時間に施設へ。プライベート空間で、プロの技術を心ゆくまでお楽しみください。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== インフラ紹介 ===== */}
      <section className="py-20 px-4">
        <div className="bg-gray-950 rounded-[80px] p-12 md:p-24 overflow-hidden relative text-white max-w-7xl mx-auto">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
            <div className="space-y-10">
              <div className="space-y-4">
                <span className="bg-teal-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-xl">Infrastructure Innovation</span>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                  癒やしを、<br/><span className="text-teal-400 italic">インフラ</span>に。
                </h2>
              </div>
              <div className="space-y-6 text-gray-400 text-lg font-medium leading-relaxed">
                <p>
                  CARE CUBEは、日本の都市環境に最適化したスマート施術ブース。
                  設置の容易な独自設計により、ホテルのロビーやオフィスのデッドスペースを、瞬時に最高のプライベート施術空間へと変貌させます。
                </p>
                <ul className="grid grid-cols-2 gap-6 text-sm font-black uppercase text-teal-400 tracking-widest">
                  <li className="flex items-center gap-3"><CheckCircle size={14}/> 街中のあらゆる場所へ展開</li>
                  <li className="flex items-center gap-3"><CheckCircle size={14}/> スマートロック完全無人運用</li>
                  <li className="flex items-center gap-3"><CheckCircle size={14}/> プライバシー・セキュリティ対応</li>
                  <li className="flex items-center gap-3"><CheckCircle size={14}/> IOT空調・アロマ完備</li>
                </ul>
              </div>
              <button onClick={() => navigate('/about')} className="bg-white text-gray-900 px-12 py-6 rounded-[32px] font-black text-lg hover:bg-teal-400 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center gap-4 group">
                事業モデル・詳細を見る <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="aspect-video rounded-[60px] overflow-hidden shadow-2xl border-8 border-white/5 relative">
              <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="CARE CUBE" />
              <div className="absolute inset-0 bg-teal-500/10 pointer-events-none"></div>
              <div className="absolute bottom-8 left-8 right-8 bg-black/60 backdrop-blur-md p-6 rounded-[32px] border border-white/10">
                <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-2">Service Insight</p>
                <p className="text-sm font-bold leading-relaxed italic">「ホテルの客室に人を呼びたくない」という宿泊客と、「外部スタッフを客室へ誘導したくない」ホテル。CARE CUBEは、館内共用スペースでその双方の課題を解決します。</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PortalLayout>
  );
};

export default PortalHome;
