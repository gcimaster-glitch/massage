import React, { useEffect, useRef, useState } from 'react';
import { Search, Navigation, Loader2, AlertCircle } from 'lucide-react';

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  onPlaceSelected?: (place: google.maps.places.PlaceResult) => void;
  showSearch?: boolean;
  showCurrentLocation?: boolean;
  markers?: Array<{ lat: number; lng: number; title?: string; info?: string }>;
}

declare global {
  interface Window {
    google: typeof google;
  }
}

// Google Maps APIスクリプトを動的に読み込む関数
// APIキーはビルド時埋め込みではなく、ランタイムに /api/maps/config から取得する。
// これにより、Cloudflare PagesのSecret（GOOGLE_MAPS_API_KEY）をそのまま使用でき、
// デプロイのたびにAPIキーを設定・確認する必要がなくなる。
let loadPromise: Promise<void> | null = null;

function loadGoogleMapsScript(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    // すでに読み込み済みの場合はすぐに解決
    if (window.google && window.google.maps) {
      return;
    }

    // バックエンドAPIからAPIキーをランタイムで取得
    // GOOGLE_MAPS_API_KEY は Cloudflare Pages の Secret として設定済み
    let apiKey: string;
    try {
      const res = await fetch('/api/maps/config');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { apiKey?: string };
      if (!data.apiKey) throw new Error('APIキーが返されませんでした');
      apiKey = data.apiKey;
    } catch (err) {
      loadPromise = null; // 失敗時はリセットして再試行可能にする
      throw new Error('Google Maps APIキーの取得に失敗しました: ' + String(err));
    }

    // スクリプトを動的に読み込む
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&language=ja&region=JP`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        loadPromise = null; // 失敗時はリセットして再試行可能にする
        reject(new Error('Google Maps APIの読み込みに失敗しました'));
      };
      document.head.appendChild(script);
    });
  })();

  return loadPromise;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  center = { lat: 35.6762, lng: 139.6503 }, // Tokyo default
  zoom = 14,
  onPlaceSelected,
  showSearch = true,
  showCurrentLocation = true,
  markers = [],
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Google Maps APIを読み込んでマップを初期化
  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;

    loadGoogleMapsScript()
      .then(() => {
        if (cancelled || !mapRef.current) return;

        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        });

        setMap(mapInstance);
        setIsLoading(false);

        // 検索ボックスの初期化
        if (showSearch && searchInputRef.current) {
          const searchBoxInstance = new window.google.maps.places.SearchBox(searchInputRef.current);

          mapInstance.addListener('bounds_changed', () => {
            searchBoxInstance.setBounds(mapInstance.getBounds()!);
          });

          searchBoxInstance.addListener('places_changed', () => {
            const places = searchBoxInstance.getPlaces();
            if (places && places.length > 0) {
              const place = places[0];
              if (place.geometry && place.geometry.location) {
                mapInstance.panTo(place.geometry.location);
                mapInstance.setZoom(16);

                new window.google.maps.Marker({
                  map: mapInstance,
                  position: place.geometry.location,
                  title: place.name,
                  animation: window.google.maps.Animation.DROP,
                });

                if (onPlaceSelected) {
                  onPlaceSelected(place);
                }
              }
            }
          });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Google Maps初期化エラー:', err);
        setError(err.message || 'マップの読み込みに失敗しました');
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // マーカーの追加
  useEffect(() => {
    if (!map) return;

    const mapMarkers: google.maps.Marker[] = [];

    markers.forEach((marker) => {
      const mapMarker = new window.google.maps.Marker({
        map,
        position: { lat: marker.lat, lng: marker.lng },
        title: marker.title,
        animation: window.google.maps.Animation.DROP,
      });

      mapMarkers.push(mapMarker);

      if (marker.info) {
        const infoWindow = new window.google.maps.InfoWindow({
          content: marker.info,
        });

        mapMarker.addListener('click', () => {
          infoWindow.open(map, mapMarker);
        });
      }
    });

    return () => {
      mapMarkers.forEach((m) => m.setMap(null));
    };
  }, [map, markers]);

  // 現在地を取得
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('このブラウザは位置情報に対応していません');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (map) {
          map.panTo(pos);
          map.setZoom(15);

          // 現在地マーカー（人型アイコン - SVGデータウリ使用）
          const svgPerson = [
            '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">',
            '<ellipse cx="18" cy="42" rx="8" ry="2.5" fill="rgba(0,0,0,0.2)"/>',
            '<path d="M18 2 C10 2 4 8 4 16 C4 26 18 40 18 40 C18 40 32 26 32 16 C32 8 26 2 18 2Z" fill="#1565C0" stroke="white" stroke-width="2"/>',
            '<circle cx="18" cy="13" r="5" fill="white"/>',
            '<path d="M11 22 Q11 18 18 18 Q25 18 25 22 L24 27 L18 25 L12 27 Z" fill="white"/>',
            '</svg>',
          ].join('');
          const svgUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgPerson);
          new window.google.maps.Marker({
            map,
            position: pos,
            title: '現在地',
            icon: {
              url: svgUrl,
              scaledSize: new window.google.maps.Size(36, 44),
              anchor: new window.google.maps.Point(18, 40),
            },
          });

          // 周辺のマッサージ店を検索
          searchNearby(pos, map);
        }
      },
      () => {
        alert('現在地の取得に失敗しました');
      }
    );
  };

  // 周辺検索
  const searchNearby = (location: { lat: number; lng: number }, mapInstance: google.maps.Map) => {
    const service = new window.google.maps.places.PlacesService(mapInstance);
    const request = {
      location: new window.google.maps.LatLng(location.lat, location.lng),
      radius: 3000,
      type: 'spa',
      keyword: 'マッサージ',
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        results.slice(0, 10).forEach((place) => {
          if (place.geometry && place.geometry.location) {
            const marker = new window.google.maps.Marker({
              map: mapInstance,
              position: place.geometry.location,
              title: place.name,
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              },
            });

            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 8px;">
                  <h3 style="font-weight: bold; margin-bottom: 4px;">${place.name}</h3>
                  <p style="font-size: 12px; color: #666;">${place.vicinity || ''}</p>
                  ${place.rating ? `<p style="font-size: 12px; color: #f59e0b;">★ ${place.rating}</p>` : ''}
                </div>
              `,
            });

            marker.addListener('click', () => {
              infoWindow.open(mapInstance, marker);
            });
          }
        });
      }
    });
  };

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-2xl z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-teal-600" size={32} />
            <p className="text-sm font-bold text-gray-400">マップを読み込み中...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-2xl z-10">
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <AlertCircle className="text-red-400" size={32} />
            <p className="text-sm font-bold text-gray-500">{error}</p>
          </div>
        </div>
      )}

      {showSearch && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="場所を検索..."
              className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>
        </div>
      )}

      {showCurrentLocation && (
        <button
          onClick={handleGetCurrentLocation}
          className="absolute bottom-4 right-4 z-10 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 border border-gray-200"
          title="現在地を取得"
        >
          <Navigation className="text-teal-600" size={24} />
        </button>
      )}

      <div ref={mapRef} className="w-full h-full rounded-2xl shadow-lg" />
    </div>
  );
};

export default GoogleMap;
