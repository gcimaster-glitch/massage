import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Calendar, Clock, User, MapPin, ChevronRight, 
  Zap, Check, Loader, Star, Info, ArrowRight
} from 'lucide-react';

interface QuickBookingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  
  // 初期選択（どちらか一方が設定される）
  preSelectedSite?: {
    id: string;
    name: string;
    address: string;
  } | null;
  preSelectedTherapist?: {
    id: string;
    name: string;
    rating: number;
    avatar_url: string;
  } | null;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const QuickBookingPanel: React.FC<QuickBookingPanelProps> = ({
  isOpen,
  onClose,
  preSelectedSite,
  preSelectedTherapist,
}) => {
  const navigate = useNavigate();
  
  // State
  const [step, setStep] = useState(1); // 1: 選択, 2: 確認
  const [loading, setLoading] = useState(false);
  
  // 選択項目
  const [selectedTherapist, setSelectedTherapist] = useState<any>(preSelectedTherapist || null);
  const [selectedSite, setSelectedSite] = useState<any>(preSelectedSite || null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  
  // データ
  const [therapists, setTherapists] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  
  // 日付の初期化（今日から7日間）
  const [dates, setDates] = useState<string[]>([]);
  
  useEffect(() => {
    const today = new Date();
    const dateList = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dateList.push(date.toISOString().split('T')[0]);
    }
    setDates(dateList);
    setSelectedDate(dateList[0]);
  }, []);
  
  // データ取得
  useEffect(() => {
    if (isOpen && !preSelectedTherapist) {
      fetchTherapists();
    }
    if (isOpen && !preSelectedSite) {
      fetchSites();
    }
  }, [isOpen, preSelectedTherapist, preSelectedSite]);
  
  // 時間枠の生成
  useEffect(() => {
    if (selectedDate) {
      generateTimeSlots();
    }
  }, [selectedDate]);
  
  const fetchTherapists = async () => {
    try {
      const res = await fetch('/api/therapists');
      const data = await res.json();
      setTherapists(data.slice(0, 6)); // 上位6名のみ
    } catch (e) {
      console.error('Failed to fetch therapists:', e);
    }
  };
  
  const fetchSites = async () => {
    try {
      const res = await fetch('/api/sites');
      const data = await res.json();
      setSites(data.slice(0, 10)); // 近くの10施設
    } catch (e) {
      console.error('Failed to fetch sites:', e);
    }
  };
  
  const generateTimeSlots = () => {
    const times = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
    const slots = times.map((time, index) => ({
      time,
      available: index % 3 !== 0, // デモ: 3の倍数は予約済み
    }));
    setAvailableSlots(slots);
  };
  
  const handleConfirm = () => {
    if (!selectedTherapist || !selectedSite || !selectedDate || !selectedTime) {
      alert('すべての項目を選択してください');
      return;
    }
    
    setLoading(true);
    
    // 予約ページへ遷移
    const params = new URLSearchParams({
      therapistId: selectedTherapist.id,
      siteId: selectedSite.id,
      date: selectedDate,
      time: selectedTime,
      type: 'ONSITE',
    });
    
    setTimeout(() => {
      navigate(`/app/booking/new?${params.toString()}`);
    }, 500);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return '今日';
    if (date.toDateString() === tomorrow.toDateString()) return '明日';
    
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${month}/${day}(${weekday})`;
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full md:max-w-2xl md:rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-4 md:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-black">クイック予約</h3>
              <p className="text-xs text-teal-100">必要な情報を選択してください</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* ステップインジケーター */}
        <div className="bg-gray-50 px-4 md:px-6 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 text-xs md:text-sm font-bold">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-teal-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {step > 1 ? <Check size={14} /> : '1'}
              </div>
              <span className="hidden md:inline">選択</span>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-teal-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                2
              </div>
              <span className="hidden md:inline">確認</span>
            </div>
          </div>
        </div>
        
        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {/* セラピスト選択 */}
          {!preSelectedTherapist && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-black text-gray-900">
                <User size={16} className="text-teal-600" />
                セラピスト
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {therapists.map((therapist) => (
                  <button
                    key={therapist.id}
                    onClick={() => setSelectedTherapist(therapist)}
                    className={`p-3 rounded-2xl border-2 transition-all text-left ${
                      selectedTherapist?.id === therapist.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={therapist.avatar_url || `/therapists/${therapist.id}.jpg`}
                        alt={therapist.name}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(therapist.name)}&background=14b8a6&color=fff`;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-gray-900 truncate">{therapist.name}</p>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                          <Star size={10} className="text-yellow-400 fill-yellow-400" />
                          <span>{therapist.rating}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* 施設選択 */}
          {!preSelectedSite && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-black text-gray-900">
                <MapPin size={16} className="text-teal-600" />
                施設
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {sites.map((site) => (
                  <button
                    key={site.id}
                    onClick={() => setSelectedSite(site)}
                    className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                      selectedSite?.id === site.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="text-sm font-black text-gray-900">{site.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{site.address}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* 日付選択 */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-black text-gray-900">
              <Calendar size={16} className="text-teal-600" />
              日付
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dates.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-4 py-2 rounded-xl border-2 whitespace-nowrap transition-all text-sm font-bold ${
                    selectedDate === date
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {formatDate(date)}
                </button>
              ))}
            </div>
          </div>
          
          {/* 時間選択 */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-black text-gray-900">
              <Clock size={16} className="text-teal-600" />
              時間
            </label>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => slot.available && setSelectedTime(slot.time)}
                  disabled={!slot.available}
                  className={`px-3 py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                    selectedTime === slot.time
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : slot.available
                      ? 'border-gray-200 text-gray-700 hover:border-gray-300'
                      : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
          
          {/* 選択サマリー */}
          {selectedTherapist && selectedSite && selectedDate && selectedTime && (
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 p-4 rounded-2xl border-2 border-teal-200">
              <div className="flex items-center gap-2 text-teal-800 font-black text-sm mb-3">
                <Check size={16} />
                選択内容
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <User size={14} />
                  <span className="font-bold">{selectedTherapist.name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin size={14} />
                  <span className="font-bold">{selectedSite.name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar size={14} />
                  <span className="font-bold">{formatDate(selectedDate)} {selectedTime}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* フッター */}
        <div className="p-4 md:p-6 border-t border-gray-100 bg-white shrink-0">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedTherapist || !selectedSite || !selectedDate || !selectedTime || loading}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 text-white font-black hover:from-teal-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  処理中...
                </>
              ) : (
                <>
                  予約へ進む
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickBookingPanel;
