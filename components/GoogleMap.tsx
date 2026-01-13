import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Search, Navigation, Loader2 } from 'lucide-react';

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
  const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    const checkGoogleMaps = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(checkGoogleMaps);
        
        const mapInstance = new window.google.maps.Map(mapRef.current!, {
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

        // Initialize search box if enabled
        if (showSearch && searchInputRef.current) {
          const searchBoxInstance = new window.google.maps.places.SearchBox(searchInputRef.current);
          setSearchBox(searchBoxInstance);

          // Bias search results towards current map viewport
          mapInstance.addListener('bounds_changed', () => {
            searchBoxInstance.setBounds(mapInstance.getBounds()!);
          });

          // Listen for place selection
          searchBoxInstance.addListener('places_changed', () => {
            const places = searchBoxInstance.getPlaces();
            if (places && places.length > 0) {
              const place = places[0];
              
              if (place.geometry && place.geometry.location) {
                mapInstance.panTo(place.geometry.location);
                mapInstance.setZoom(16);

                // Add marker
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
      }
    }, 100);

    return () => clearInterval(checkGoogleMaps);
  }, [center, zoom, showSearch, onPlaceSelected]);

  // Add markers
  useEffect(() => {
    if (!map) return;

    markers.forEach((marker) => {
      const mapMarker = new window.google.maps.Marker({
        map,
        position: { lat: marker.lat, lng: marker.lng },
        title: marker.title,
        animation: window.google.maps.Animation.DROP,
      });

      if (marker.info) {
        const infoWindow = new window.google.maps.InfoWindow({
          content: marker.info,
        });

        mapMarker.addListener('click', () => {
          infoWindow.open(map, mapMarker);
        });
      }
    });
  }, [map, markers]);

  // Get current location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          setCurrentLocation(pos);

          if (map) {
            map.panTo(pos);
            map.setZoom(15);

            new window.google.maps.Marker({
              map,
              position: pos,
              title: '現在地',
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#14b8a6',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              },
            });

            // Search for nearby massage places
            searchNearby(pos);
          }
        },
        () => {
          alert('現在地の取得に失敗しました');
        }
      );
    } else {
      alert('このブラウザは位置情報に対応していません');
    }
  };

  // Search nearby places
  const searchNearby = (location: { lat: number; lng: number }) => {
    if (!map) return;

    const service = new window.google.maps.places.PlacesService(map);
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
              map,
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
              infoWindow.open(map, marker);
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
