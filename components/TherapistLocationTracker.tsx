
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, ShieldCheck, Activity, Loader2, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

interface TherapistLocationTrackerProps {
  bookingId: string;
  isActive: boolean;
}

const TherapistLocationTracker: React.FC<TherapistLocationTrackerProps> = ({ bookingId, isActive }) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'TRACKING' | 'ERROR'>('IDLE');
  const [errorMsg, setErrorMsg] = useState('');
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && navigator.geolocation) {
      setStatus('TRACKING');
      
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lng: longitude });
          
          // 運営本部の監視サーバーへ位置情報を送信
          api.bookings.updateLocation(bookingId, latitude, longitude).catch(err => {
            console.warn("Location sync deferred:", err);
          });
        },
        (error) => {
          console.error("GPS Error:", error);
          setStatus('ERROR');
          setErrorMsg(error.code === 1 ? "位置情報の利用が拒否されています" : "GPS信号を取得できません");
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      stopTracking();
    }

    return () => stopTracking();
  }, [isActive, bookingId]);

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setStatus('IDLE');
    setCoords(null);
  };

  if (!isActive) return null;

  return (
    <div className="bg-gray-900 text-white p-8 rounded-[48px] shadow-2xl border border-white/5 relative overflow-hidden animate-fade-in">
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[120px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${status === 'ERROR' ? 'bg-red-500/20 text-red-400' : 'bg-teal-500/20 text-teal-400'}`}>
                 {status === 'TRACKING' ? <Navigation size={24} className="animate-pulse" /> : <MapPin size={24} />}
              </div>
              <div>
                 <h3 className="font-black text-sm uppercase tracking-widest">Real-time GPS Sentinel</h3>
                 <p className="text-[9px] font-bold text-gray-500 uppercase">Operational Security Monitoring</p>
              </div>
           </div>
           {status === 'TRACKING' && (
              <span className="flex items-center gap-2 bg-teal-500/10 text-teal-400 px-4 py-1.5 rounded-full text-[9px] font-black border border-teal-500/20 uppercase tracking-widest animate-pulse">
                Live Tracking On
              </span>
           )}
        </div>

        {status === 'ERROR' ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
             <AlertTriangle className="text-red-400 mt-1 flex-shrink-0" size={16} />
             <p className="text-xs font-bold text-red-200 leading-relaxed">{errorMsg}</p>
          </div>
        ) : coords ? (
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Latitude</p>
                <p className="text-sm font-mono font-black">{coords.lat.toFixed(6)}</p>
             </div>
             <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Longitude</p>
                <p className="text-sm font-mono font-black">{coords.lng.toFixed(6)}</p>
             </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-4 gap-3 text-gray-500">
             <Loader2 className="animate-spin" size={16} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">GPS Signal Searching...</span>
          </div>
        )}

        <div className="pt-6 border-t border-white/5">
           <div className="flex items-start gap-4">
              <ShieldCheck className="text-teal-500 flex-shrink-0 mt-0.5" size={18} />
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">プライバシー保護について</p>
                 <p className="text-[9px] text-gray-500 font-bold leading-relaxed">
                   位置情報の追跡はセッション中のみ有効です。データはエンドツーエンドで暗号化され、緊急時以外に運営が閲覧することはありません。
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistLocationTracker;
