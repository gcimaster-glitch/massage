
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Navigation, ShieldAlert, Clock, MapPin, 
  ChevronRight, Phone, MessageSquare, AlertTriangle, 
  CheckCircle, Play, Square, Loader2, Lock, Unlock, Eye, EyeOff
} from 'lucide-react';
import { MOCK_BOOKINGS } from '../../constants';
import { BookingStatus, BookingType } from '../../types';

const ActiveSession: React.FC = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const booking = MOCK_BOOKINGS.find(b => b.id === bookingId);
  
  const [status, setStatus] = useState<BookingStatus>(booking?.status || BookingStatus.CONFIRMED);
  const [isAddressVisible, setIsAddressVisible] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSOSArmed, setIsSOSArmed] = useState(false);
  const [sosSwipeValue, setSosSwipeValue] = useState(0);

  // セッションタイマー
  useEffect(() => {
    let interval: any;
    if (status === BookingStatus.IN_SERVICE) {
      interval = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  if (!booking) return <div className="p-20 text-center">Session Not Found</div>;

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (confirm('施術を開始しますか？位置情報の高頻度送信が開始されます。')) {
      setStatus(BookingStatus.IN_SERVICE);
    }
  };

  const handleEnd = () => {
    navigate(`/t/session-summary/${bookingId}?type=${booking.type}`);
  };

  return (
    <div className="max-w-4xl mx-auto min-h-screen bg-gray-900 text-white flex flex-col font-sans overflow-hidden">
      {/* 1. Header: Status & Connectivity */}
      <header className="p-8 border-b border-white/5 flex justify-between items-center bg-gray-950">
        <div className="flex items-center gap-4">
           <div className={`w-3 h-3 rounded-full ${status === BookingStatus.IN_SERVICE ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></div>
           <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Service Status</p>
              <h2 className="text-sm font-black uppercase tracking-widest">{status === BookingStatus.IN_SERVICE ? 'On-Site Active' : 'Ready to Start'}</h2>
           </div>
        </div>
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
           <Navigation size={14} className="text-teal-400" />
           <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">GPS Sentinel: Live</span>
        </div>
      </header>

      {/* 2. Main Mission Control */}
      <main className="flex-1 p-8 flex flex-col justify-center items-center space-y-12">
        
        {/* Timer UI */}
        <div className="text-center space-y-2">
           <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-[11px]">Elapsed Time</p>
           <div className="text-8xl font-black tracking-tighter tabular-nums font-mono text-teal-500 shadow-teal-500/20">
              {formatTime(elapsedSeconds)}
           </div>
           <p className="text-gray-500 font-bold">Planned: {booking.duration} min session</p>
        </div>

        {/* Location Info (Gradual Disclosure) */}
        <div className={`w-full p-10 rounded-[48px] border-2 transition-all ${isAddressVisible ? 'bg-white text-gray-900 border-transparent shadow-2xl' : 'bg-white/5 border-white/10 text-white'}`}>
           <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                 <p className={`text-[10px] font-black uppercase tracking-widest ${isAddressVisible ? 'text-teal-600' : 'text-gray-500'}`}>Target Location</p>
                 <h3 className="text-2xl font-black tracking-tight">{booking.location.split(' ')[0]}</h3>
              </div>
              <button 
                onClick={() => setIsAddressVisible(!isAddressVisible)}
                className={`p-4 rounded-2xl transition-all ${isAddressVisible ? 'bg-gray-100 text-gray-400' : 'bg-teal-600 text-white shadow-lg'}`}
              >
                 {isAddressVisible ? <EyeOff size={24}/> : <Eye size={24}/>}
              </button>
           </div>
           
           {isAddressVisible ? (
              <div className="animate-fade-in space-y-4">
                 <p className="text-lg font-bold leading-tight">{booking.location}</p>
                 <div className="flex gap-2">
                    <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-orange-100">Room #402</span>
                    <span className="bg-teal-50 text-teal-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-teal-100">Smart Lock Enabled</span>
                 </div>
              </div>
           ) : (
              <p className="text-sm font-bold text-gray-500 italic">セキュリティのため、現場到着時に開示してください。閲覧はログに記録されます。</p>
           )}
        </div>

        {/* Start/Stop Actions */}
        <div className="w-full">
           {status === BookingStatus.CONFIRMED ? (
              <button 
                onClick={handleStart}
                className="w-full py-10 bg-teal-600 text-white rounded-[40px] font-black text-2xl shadow-2xl shadow-teal-500/20 flex items-center justify-center gap-4 hover:bg-teal-500 transition-all active:scale-95"
              >
                 <Play size={40} fill="currentColor"/> 施術を開始する
              </button>
           ) : (
              <button 
                onClick={handleEnd}
                className="w-full py-10 bg-gray-100 text-gray-900 rounded-[40px] font-black text-2xl shadow-2xl flex items-center justify-center gap-4 hover:bg-white transition-all active:scale-95"
              >
                 <Square size={32} fill="currentColor"/> セッションを終了
              </button>
           )}
        </div>
      </main>

      {/* 3. SOS Sentinel System (Bottom Drawer) */}
      <footer className="p-8 bg-black/40 border-t border-white/5 space-y-8">
         <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center"><AlertTriangle size={24}/></div>
            <div>
               <h4 className="font-black text-sm text-red-500 uppercase tracking-widest">Emergency Sentinel</h4>
               <p className="text-[9px] text-gray-500 font-bold">Swipe to send immediate SOS and start recording</p>
            </div>
         </div>

         <div className="relative h-24 bg-red-950/30 rounded-[32px] border-2 border-white/5 flex items-center p-3 overflow-hidden">
            {/* Background Text */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
               <span className="text-xs font-black uppercase tracking-[0.5em] text-red-500">Slide to Trigger SOS</span>
            </div>
            
            {/* The Slider Track Effect */}
            <div className="absolute left-0 h-full bg-red-600 transition-all pointer-events-none" style={{ width: `${sosSwipeValue}%` }}></div>

            <input 
               type="range" 
               className="w-full h-full opacity-0 cursor-pointer absolute inset-0 z-20"
               min="0" max="100" value={sosSwipeValue}
               onChange={(e) => setSosSwipeValue(parseInt(e.target.value))}
               onMouseUp={() => { if(sosSwipeValue < 90) setSosSwipeValue(0); else alert('SOS SENT: Security dispatched.') }}
               onTouchEnd={() => { if(sosSwipeValue < 90) setSosSwipeValue(0); else alert('SOS SENT: Security dispatched.') }}
            />
            
            {/* The Draggable Handle (Visual Only) */}
            <div className="w-18 h-18 bg-red-600 rounded-2xl flex items-center justify-center shadow-2xl z-10 transition-transform" style={{ marginLeft: `calc(${sosSwipeValue}% - ${sosSwipeValue > 0 ? '72px' : '0px'})` }}>
               <ShieldAlert size={32} />
            </div>
         </div>
      </footer>
    </div>
  );
};

export default ActiveSession;
