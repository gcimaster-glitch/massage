
import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MASTER_COURSES, MASTER_OPTIONS } from '../../constants';
import { BookingType, Role } from '../../types';
// Added ArrowRight to fix "Cannot find name" error on line 218
import { 
  Clock, MapPin, Check, ChevronRight, ArrowLeft, 
  Loader2, Sparkles, Calendar as CalendarIcon, Zap,
  CheckCircle, ShieldCheck, User, Mail, Phone, Lock, Info, Star, Timer, CreditCard, ArrowRight
} from 'lucide-react';
import { systemStore } from '../../services/systemState';

interface BookingNewProps {
  onAutoLogin: (role: Role, name: string) => void;
}

interface Site {
  id: string
  name: string
  type: string
  address: string
  area: string
}

interface Therapist {
  id: string
  name: string
  rating: number
  review_count: number
  specialties: string
}

const BookingNew: React.FC<BookingNewProps> = ({ onAutoLogin }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);

  const typeParam = searchParams.get('type') as BookingType;
  const bookingType = typeParam === BookingType.MOBILE ? BookingType.MOBILE : BookingType.ONSITE;
  const therapistId = searchParams.get('therapistId') || 'auto';
  const siteIdParam = searchParams.get('siteId') || '';
  const isAutoMatch = therapistId === 'auto';

  const [sites, setSites] = useState<Site[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState(siteIdParam);
  const [selectedTherapistId, setSelectedTherapistId] = useState(therapistId);

  const [selectedCourseId, setSelectedCourseId] = useState(searchParams.get('service') || 'mc_1');
  const [date, setDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(searchParams.get('time') || '14:00');
  const [safetyAgreed, setSafetyAgreed] = useState(false);

  useEffect(() => {
    fetchSites();
    fetchTherapists();
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

  const fetchTherapists = async () => {
    try {
      const res = await fetch('/api/therapists');
      const data = await res.json();
      setTherapists(data);
    } catch (e) {
      console.error('Failed to fetch therapists:', e);
    }
  };

  const targetTherapist = isAutoMatch ? null : therapists.find(t => t.id === therapistId);
  const selectedSite = sites.find(s => s.id === selectedSiteId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSiteId && bookingType === BookingType.ONSITE) {
      alert('施設を選択してください');
      return;
    }
    
    setIsProcessing(true);

    // プロセスシミュレーション
    setProcessStep(1); // 決済処理
    await new Promise(r => setTimeout(r, 1800));
    setProcessStep(2); // 通知・台帳登録
    await new Promise(r => setTimeout(r, 2200));
    setProcessStep(3); // 完了
    
    const booking = systemStore.createBooking({
      therapistId: selectedTherapistId,
      type: bookingType,
      scheduledStart: `${date}T${time}:00`,
      serviceName: MASTER_COURSES.find(c => c.id === selectedCourseId)?.name || 'ボディケア',
      location: bookingType === BookingType.ONSITE 
        ? (selectedSite?.name || 'CARE CUBE 渋谷ANNEX')
        : '東京都港区六本木 1-2-3'
    });

    setTimeout(() => {
       navigate(`/app/booking/success?id=${booking.id}`);
    }, 800);
  };

  return (
    <div className="max-w-5xl mx-auto pb-40 px-4 pt-10 animate-fade-in text-gray-900 font-sans">
      
      {/* 処理中オーバーレイ（没入型） */}
      {isProcessing && (
        <div className="fixed inset-0 z-[300] bg-white/95 backdrop-blur-3xl flex flex-col items-center justify-center p-10 text-center overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
              <div className="h-full bg-teal-500 transition-all duration-[4000ms] ease-out" style={{ width: processStep === 3 ? '100%' : processStep === 2 ? '70%' : '30%' }}></div>
           </div>
           
           <div className="relative mb-16">
              <div className="w-32 h-32 bg-teal-50 rounded-[48px] flex items-center justify-center shadow-inner">
                 <Loader2 className="animate-spin text-teal-600" size={48} />
              </div>
              <div className="absolute -top-4 -right-4 bg-gray-900 text-white p-4 rounded-3xl shadow-2xl animate-bounce">
                 <Lock size={24} />
              </div>
           </div>

           <div className="space-y-6 max-w-md">
              <h2 className="text-4xl font-black tracking-tighter text-gray-900 leading-tight">
                {processStep === 1 ? 'セキュリティ決済を\n実行しています' : 
                 processStep === 2 ? '予約を台帳に登録し\n通知を配信しています' : 
                 '完了しました'}
              </h2>
              <p className="text-gray-400 font-bold leading-relaxed text-lg italic">
                 {processStep === 1 ? 'Stripe決済ゲートウェイと通信中...' : 'セラピストおよび施設ホストへ確定通知を送信しています。'}
              </p>
           </div>
        </div>
      )}

      <div className="flex items-center gap-6 mb-16">
         <button onClick={() => navigate(-1)} className="p-4 bg-white rounded-3xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all"><ArrowLeft size={24}/></button>
         <div>
            <h1 className="text-4xl font-black tracking-tighter">予約の最終確認</h1>
            <p className="text-gray-400 text-xs font-black uppercase tracking-[0.3em] mt-1">Finalize your wellness session</p>
         </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-10">
           
           {/* セラピスト・パートナー情報 */}
           <div className="bg-white p-12 rounded-[64px] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="w-32 h-32 rounded-[40px] overflow-hidden bg-gray-50 flex items-center justify-center shadow-2xl border-4 border-white relative z-10">
                 {isAutoMatch ? (
                    <Timer size={56} className="text-teal-500 animate-pulse" />
                 ) : (
                    <img src={targetTherapist?.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                 )}
              </div>
              <div className="flex-1 space-y-4 relative z-10">
                 <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-teal-50 text-teal-600 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-teal-100 shadow-sm flex items-center gap-2">
                       <ShieldCheck size={12}/> Soothe Certified
                    </span>
                    {!isAutoMatch && targetTherapist?.categories.includes('LICENSED') && (
                       <span className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm">国家資格保有者</span>
                    )}
                 </div>
                 <h2 className="text-4xl font-black tracking-tighter text-gray-900 leading-none">
                    {isAutoMatch ? 'AI スピードマッチング' : targetTherapist?.name}
                 </h2>
                 <p className="text-gray-400 font-bold text-base leading-relaxed">
                    {isAutoMatch ? '現在地とご希望のメニューに合わせて、周辺で稼働中のトップセラピストを自動的にアサインします。' : '12年の経験を持つベテラン。深層筋への的確なアプローチが最大の特徴です。'}
                 </p>
              </div>
           </div>

           {/* 予約スケジュール */}
           <div className="bg-white p-12 rounded-[64px] shadow-sm border border-gray-100 space-y-10">
              <div className="flex justify-between items-center px-4">
                 <h3 className="font-black text-gray-400 uppercase tracking-[0.4em] text-[10px] flex items-center gap-3"><CalendarIcon size={16} className="text-teal-500" /> Schedule & Service</h3>
                 <button className="text-[10px] font-black text-teal-600 hover:underline uppercase tracking-widest">日時変更</button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="p-8 bg-gray-50/50 rounded-[40px] border border-gray-100 shadow-inner group hover:bg-white hover:shadow-xl transition-all">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-3 tracking-widest">開始予定時刻</p>
                    <div className="flex items-end gap-2">
                       <span className="text-3xl font-black text-gray-900 leading-none">{new Date(date).toLocaleDateString('ja-JP', {month:'long', day:'numeric'})}</span>
                       <span className="text-4xl font-black text-teal-600 leading-none tabular-nums">{time}</span>
                       <span className="text-xs font-bold text-gray-300 uppercase mb-1">JST</span>
                    </div>
                 </div>
                 <div className="p-8 bg-gray-50/50 rounded-[40px] border border-gray-100 shadow-inner group hover:bg-white hover:shadow-xl transition-all">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-3 tracking-widest">メニュー内容</p>
                    <div className="space-y-1">
                       <p className="text-2xl font-black text-gray-900 leading-tight">
                          {MASTER_COURSES.find(c => c.id === selectedCourseId)?.name || '標準ケア'}
                       </p>
                       <p className="text-sm font-bold text-teal-600 flex items-center gap-2 italic">
                          <Clock size={14}/> 60分セッション
                       </p>
                    </div>
                 </div>
              </div>

              <div className="p-8 bg-indigo-50 rounded-[40px] border border-indigo-100 flex items-start gap-6">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm flex-shrink-0"><MapPin size={24}/></div>
                 <div className="flex-1 space-y-3">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">実施場所</p>
                    {bookingType === BookingType.ONSITE ? (
                      <>
                        {selectedSite ? (
                          <>
                            <p className="text-lg font-black text-indigo-900">{selectedSite.name}</p>
                            <p className="text-xs font-bold text-indigo-400">{selectedSite.address}</p>
                            <button 
                              onClick={() => navigate(`/app/sites?type=${selectedSite.type}&area=${selectedSite.area}`)}
                              className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
                            >
                              施設を変更する →
                            </button>
                          </>
                        ) : (
                          <>
                            <p className="text-lg font-black text-indigo-900">施設を選択してください</p>
                            <button 
                              onClick={() => navigate('/app/sites')}
                              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-sm"
                            >
                              施設を選ぶ →
                            </button>
                          </>
                        )}
                        <p className="text-xs font-bold text-indigo-400 leading-relaxed">
                          ブースの解錠コードは、予約確定後のマイページに表示されます。
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-black text-indigo-900">ご指定の住所（自宅・ホテル）</p>
                        <p className="text-xs font-bold text-indigo-400 leading-relaxed">
                          住所の詳細はセラピストのみに安全に開示されます。
                        </p>
                      </>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* サイドバー: 決済モジュール */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-gray-900 text-white p-8 md:p-10 rounded-[72px] shadow-[0_60px_100px_rgba(0,0,0,0.3)] space-y-10 sticky top-24 overflow-hidden border-b-[16px] border-teal-600 group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500 rounded-full blur-[120px] opacity-10 translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-1000"></div>
              
              <div className="relative z-10 space-y-8">
                 <h3 className="text-xl font-black flex items-center gap-3 tracking-tight"><CreditCard size={28} className="text-teal-400" /> お支払い明細</h3>
                 
                 <div className="space-y-5">
                    <div className="flex justify-between items-center text-sm font-bold text-gray-400">
                       <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div> 施術料金 (60min)</span>
                       <span className="text-white font-mono text-lg">¥7,480</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-gray-400">
                       <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> {bookingType === BookingType.ONSITE ? '施設利用料' : '出張基本料'}</span>
                       <span className="text-white font-mono text-lg">¥2,000</span>
                    </div>
                    <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-teal-400 uppercase tracking-[0.3em]">Total Amount</p>
                          <p className="text-xs font-bold text-gray-500 italic">(消費税込)</p>
                       </div>
                       <div className="text-right">
                          <span className="text-5xl md:text-6xl font-black tracking-tighter tabular-nums">¥9,480</span>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <label className="flex items-start gap-4 cursor-pointer group/label">
                       <input type="checkbox" className="hidden" checked={safetyAgreed} onChange={e => setSafetyAgreed(e.target.checked)} />
                       <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all flex-shrink-0 mt-1 ${safetyAgreed ? 'bg-teal-50 border-teal-500 text-white shadow-lg' : 'border-white/20 group-hover/label:border-white/40'}`}>
                          {safetyAgreed && <Check size={18} strokeWidth={4} />}
                       </div>
                       <div className="space-y-1 flex-1">
                          <p className="text-[11px] font-black leading-tight text-white group-hover/label:text-teal-300 transition-colors">利用規約および安全プロトコルに同意する</p>
                          <p className="text-[9px] text-gray-500 font-bold leading-relaxed uppercase tracking-widest break-words">I agree to the HOGUSY Terms</p>
                       </div>
                    </label>

                    <button 
                      onClick={handleSubmit}
                      disabled={!safetyAgreed || isProcessing}
                      className="w-full py-8 bg-teal-500 text-white rounded-[48px] font-black text-xl shadow-[0_20px_50px_rgba(20,184,166,0.3)] hover:bg-teal-400 transition-all disabled:bg-gray-800 disabled:text-gray-600 disabled:shadow-none active:scale-[0.97] group/btn relative overflow-hidden"
                    >
                       <span className="relative z-10 flex items-center justify-center gap-3">
                          予約を確定する <ArrowRight size={28} className="group-hover/btn:translate-x-2 transition-transform" />
                       </span>
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-[1500ms]"></div>
                    </button>
                 </div>
                 
                 <div className="flex items-center justify-center gap-6 opacity-40">
                    <div className="text-center">
                       <p className="text-[9px] font-black uppercase tracking-widest">Security</p>
                       <p className="text-[8px] font-bold">PCI-DSS 準拠</p>
                    </div>
                    <div className="w-px h-6 bg-white/20"></div>
                    <div className="text-center">
                       <p className="text-[9px] font-black uppercase tracking-widest">Support</p>
                       <p className="text-[8px] font-bold">24時間 安全監視</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-10 bg-white border border-gray-100 rounded-[56px] shadow-sm space-y-6">
              <h4 className="text-xs font-black text-gray-900 flex items-center gap-3 uppercase tracking-widest"><Info size={16} className="text-teal-600" /> キャンセル規定</h4>
              <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
                 施術開始の24時間前までのキャンセルは無料です。それ以降のキャンセルについては、セラピストの拘束および拠点の確保に伴うキャンセル料が発生します。
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BookingNew;
