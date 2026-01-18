
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import { BookingStatus, BookingType, Role } from '../../types';
// Added Calendar as CalendarIcon and Info to fix "Cannot find name" errors on line 92 and 137
import { 
  MapPin, Navigation, ShieldAlert, Clock, CheckCircle, 
  AlertTriangle, MessageSquare, Play, CheckSquare, Star, 
  ArrowRight, ShieldCheck, Timer, XCircle, UserCheck, Key, Camera, Droplets, ArrowLeft, Zap, Sparkles, Activity, Loader2, LayoutGrid, Smartphone, ChevronRight,
  Calendar as CalendarIcon, Info
} from 'lucide-react';
import GeminiLiveSafety from '../../components/GeminiLiveSafety';
import CubeController from '../../components/CubeController';

const BookingDetail: React.FC = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [currentUser] = useState<{ role: Role; displayName: string } | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [booking, setBooking] = useState<any>(null);
  const [bookingItems, setBookingItems] = useState<any[]>([]);
  const [therapist, setTherapist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<BookingStatus | undefined>(undefined);
  
  const [isExtensionChecking, setIsExtensionChecking] = useState(false);
  const [extensionResult, setExtensionResult] = useState<'OK' | 'BUSY' | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleDownloadReceipt = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/bookings/${bookingId}/receipt`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch receipt');
      }
      
      const html = await res.text();
      
      // 新しいウィンドウで領収書を開く
      const receiptWindow = window.open('', '_blank');
      if (receiptWindow) {
        receiptWindow.document.write(html);
        receiptWindow.document.close();
      } else {
        alert('❌ ポップアップがブロックされました。ブラウザの設定を確認してください。');
      }
    } catch (error) {
      console.error('Receipt download error:', error);
      alert('❌ 領収書の取得に失敗しました');
    }
  };

  // Fetch booking data from API
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await fetch(`/api/bookings/${bookingId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error('Failed to fetch booking');
        }

        const data = await res.json();
        setBooking(data.booking);
        setBookingItems(data.items || []);
        setStatus(data.booking.status as BookingStatus);

        // Fetch therapist data
        if (data.booking.therapist_id) {
          const therapistRes = await fetch(`/api/therapists/${data.booking.therapist_id}`);
          if (therapistRes.ok) {
            const therapistData = await therapistRes.json();
            setTherapist({
              ...therapistData.therapist,
              imageUrl: therapistData.therapist.avatar_url || `/therapists/${therapistData.therapist.id}.jpg`
            });
          }
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        setBooking(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, navigate]);

  const isLive = status === BookingStatus.IN_SERVICE || status === BookingStatus.CHECKED_IN || status === BookingStatus.WAITING_FOR_USER;

  const handleExtensionRequest = () => {
    setIsExtensionChecking(true);
    setExtensionResult(null);
    setTimeout(() => {
      setIsExtensionChecking(false);
      setExtensionResult(Math.random() > 0.5 ? 'OK' : 'BUSY');
    }, 1500);
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      setErrorMessage('✏️ キャンセル理由を入力してください');
      return;
    }

    try {
      setCancelling(true);
      setErrorMessage(''); // エラーをクリア
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: cancelReason })
      });

      if (res.ok) {
        setStatus(BookingStatus.CANCELLED);
        setShowCancelDialog(false);
        alert('✅ 予約をキャンセルしました');
        // 予約一覧画面に戻る
        setTimeout(() => {
          navigate('/app/bookings');
        }, 1000);
      } else {
        const data = await res.json();
        setErrorMessage(data.error || '❌ キャンセルに失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      setErrorMessage('🌐 ネットワークエラーが発生しました。インターネット接続を確認してください。');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 size={48} className="animate-spin text-teal-600 mx-auto" />
          <p className="text-gray-400 font-bold">予約情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!booking) return <div className="p-20 text-center font-black text-gray-400">予約が見つかりません</div>;

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-40 font-sans text-gray-900 animate-fade-in">
      
      {/* ライブ・セッション時のダイナミック・ヘッダー */}
      <header className={`sticky top-0 z-50 transition-all duration-700 px-3 md:px-12 py-4 md:py-6 border-b ${isLive ? 'bg-gray-900 text-white border-white/5 shadow-2xl' : 'bg-white text-gray-900 border-gray-100'}`}>
         <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-6">
               <button onClick={() => navigate(-1)} className={`p-2 md:p-4 rounded-2xl md:rounded-3xl transition-all ${isLive ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  <ArrowLeft size={20} className="md:w-6 md:h-6" />
               </button>
               <div>
                  <div className="flex items-center gap-2 md:gap-3">
                     <h1 className="text-lg md:text-2xl font-black tracking-tighter leading-none">セッション</h1>
                     <StatusBadge status={status || booking.status} />
                  </div>
                  <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] mt-1 md:mt-2 ${isLive ? 'text-teal-400' : 'text-gray-400'} hidden md:block`}>
                     {isLive ? 'Live Active' : 'Overview'}
                  </p>
               </div>
            </div>
            {isLive && (
              <div className="hidden md:flex items-center gap-8">
                 <div className="text-center">
                    <p className="text-[8px] font-black uppercase text-gray-500 mb-1">Surveillance</p>
                    <div className="flex items-center gap-2 text-teal-400 text-xs font-black"><ShieldCheck size={14}/> SENTINEL ON</div>
                 </div>
                 <div className="h-8 w-px bg-white/10"></div>
                 <div className="text-center">
                    <p className="text-[8px] font-black uppercase text-gray-500 mb-1">Time Remaining</p>
                    <div className="text-xl font-black tabular-nums font-mono">15:42</div>
                 </div>
              </div>
            )}
         </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 md:px-12 pt-8 md:pt-12 grid lg:grid-cols-12 gap-6 md:gap-12">
         
         {/* 左カラム: チケット・情報 (7) */}
         <div className="lg:col-span-7 space-y-6 md:space-y-10">
            
            {/* デジタルチケット・コア */}
            <div className="bg-white rounded-3xl md:rounded-[64px] shadow-sm border border-gray-100 overflow-hidden relative group">
               <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-teal-500 to-indigo-500"></div>
               
               <div className="p-6 md:p-10 lg:p-14 flex flex-col md:flex-row items-center gap-6 md:gap-12">
                  <div className="text-center md:text-left flex-1 space-y-4 md:space-y-8">
                     <div className="space-y-2">
                        <p className="text-[9px] md:text-[10px] font-black text-teal-600 uppercase tracking-wider md:tracking-widest flex items-center justify-center md:justify-start gap-2">
                           <CalendarIcon size={12} className="md:w-[14px] md:h-[14px]"/> Schedule
                        </p>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-gray-900 leading-none">
                           {new Date(booking.scheduled_at).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
                        </h2>
                        <p className="text-2xl md:text-3xl font-black text-gray-300 tracking-tight leading-none tabular-nums">
                           {new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 〜
                        </p>
                     </div>
                     
                     <div className="flex flex-col md:flex-row md:flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8">
                        <div className="flex items-center gap-3 md:gap-4">
                           <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-50 rounded-xl md:rounded-2xl flex items-center justify-center text-gray-400 shadow-inner group-hover:scale-110 transition-transform"><MapPin size={20} className="md:w-7 md:h-7"/></div>
                           <div className="text-left">
                              <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-wider md:tracking-widest">Location</p>
                              <p className="text-base md:text-lg font-black text-gray-900 truncate max-w-[150px] md:max-w-none">{booking.location}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 md:gap-4">
                           <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-50 rounded-xl md:rounded-2xl flex items-center justify-center text-gray-400 shadow-inner group-hover:scale-110 transition-transform"><LayoutGrid size={20} className="md:w-7 md:h-7"/></div>
                           <div className="text-left">
                              <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-wider md:tracking-widest">Booth</p>
                              <p className="text-xl md:text-2xl font-black text-teal-600 font-mono tracking-widest">8294</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="w-full md:w-56 shrink-0 text-center space-y-4 md:space-y-6 md:pl-12 md:border-l border-dashed border-gray-100">
                     <div className="relative inline-block group/avatar">
                        <img src={therapist?.imageUrl} className="w-24 h-24 md:w-32 md:h-32 rounded-3xl md:rounded-[48px] object-cover shadow-2xl border-4 border-white transition-all group-hover/avatar:scale-105" />
                        <div className="absolute -bottom-2 -right-2 bg-teal-500 text-white p-2.5 rounded-2xl shadow-xl border-2 border-white"><Star size={20} fill="currentColor"/></div>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Therapist</p>
                        <h4 className="text-xl font-black text-gray-900">{booking.therapistName}</h4>
                        <button onClick={() => navigate(`/app/booking/${booking.id}/chat`)} className="mt-4 text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 mx-auto hover:underline">
                           <MessageSquare size={14}/> チャットを開く
                        </button>
                     </div>
                  </div>
               </div>

               <div className="bg-gray-50 p-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4 text-sm font-bold text-gray-400 italic">
                     <Info size={18} className="text-teal-500" />
                     当日は予約時間の5分前までに現地へお越しください。
                  </div>
                  <div className="flex gap-3">
                     {booking.payment_status === 'COMPLETED' && (
                       <button 
                         onClick={handleDownloadReceipt}
                         className="px-6 py-3 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-sm flex items-center gap-2"
                       >
                         <FileText size={14} /> 領収書
                       </button>
                     )}
                     {status !== BookingStatus.COMPLETED && status !== BookingStatus.CANCELLED && status !== BookingStatus.IN_SERVICE && (
                       <button 
                         onClick={() => setShowCancelDialog(true)}
                         className="px-6 py-3 bg-white border border-red-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm flex items-center gap-2"
                       >
                         <XCircle size={14} /> 予約キャンセル
                       </button>
                     )}
                  </div>
               </div>
            </div>

            {/* 予約アイテム */}
            {items && items.length > 0 && (
              <section className="bg-white p-12 rounded-[56px] shadow-sm border-2 border-purple-50 space-y-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">予約内容</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Booking Items</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* コース */}
                  {items.filter((item: any) => item.item_type === 'COURSE').map((item: any) => (
                    <div key={item.id} className="bg-purple-50 p-8 rounded-[32px] border-2 border-purple-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg text-xs font-black">
                            COURSE
                          </div>
                          <div>
                            <p className="text-lg font-black text-gray-900">{item.item_name}</p>
                            <p className="text-sm text-gray-600 font-bold mt-1">{item.duration || 60}分</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-purple-600">¥{item.price?.toLocaleString()}</p>
                          <p className="text-xs text-gray-500 font-bold mt-1">税込</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* オプション */}
                  {items.filter((item: any) => item.item_type === 'OPTION').map((item: any) => (
                    <div key={item.id} className="bg-teal-50 p-8 rounded-[32px] border-2 border-teal-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-teal-600 text-white rounded-2xl flex items-center justify-center shadow-lg text-xs font-black">
                            OPTION
                          </div>
                          <div>
                            <p className="text-lg font-black text-gray-900">{item.item_name}</p>
                            <p className="text-sm text-gray-600 font-bold mt-1">+{item.duration || 20}分</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-teal-600">¥{item.price?.toLocaleString()}</p>
                          <p className="text-xs text-gray-500 font-bold mt-1">税込</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 合計 */}
                <div className="bg-gradient-to-r from-purple-600 to-teal-600 p-8 rounded-[32px] text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-black">合計金額</p>
                      <p className="text-sm opacity-90 font-bold mt-1">
                        合計所要時間: {items.reduce((sum: number, item: any) => sum + (item.duration || 60), 0)}分
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-black">¥{booking?.price?.toLocaleString()}</p>
                      <p className="text-sm opacity-90 font-bold mt-1">税込</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 延長リクエスト・モジュール */}
            <section className="bg-white p-12 rounded-[56px] shadow-sm border-2 border-indigo-50 space-y-10 group overflow-hidden relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000"></div>
               <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-inner"><Clock size={32}/></div>
                     <div>
                        <h3 className="text-2xl font-black tracking-tight">セッションの延長</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Extra 30min session request</p>
                     </div>
                  </div>
                  {!extensionResult && !isExtensionChecking && (
                    <button 
                      onClick={handleExtensionRequest}
                      className="bg-indigo-600 text-white px-10 py-4 rounded-[28px] font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl active:scale-95 flex items-center gap-3"
                    >
                       空き状況を確認 <ChevronRight size={18} />
                    </button>
                  )}
               </div>

               {isExtensionChecking && (
                 <div className="p-10 bg-slate-50 rounded-[40px] flex items-center justify-center gap-4 animate-pulse">
                    <Loader2 className="animate-spin text-indigo-600" size={24} />
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Checking Availability...</p>
                 </div>
               )}

               {extensionResult === 'OK' && (
                 <div className="p-10 bg-teal-50 rounded-[40px] border-2 border-teal-100 animate-fade-in-up flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-6 text-center md:text-left">
                       <div className="w-16 h-16 bg-teal-500 text-white rounded-full flex items-center justify-center shadow-xl"><CheckCircle size={32}/></div>
                       <div>
                          <p className="text-xl font-black text-teal-900">延長可能です（+30分）</p>
                          <p className="text-xs font-bold text-teal-600 mt-1 uppercase tracking-widest">Additional: ¥4,000 (Incl. TAX)</p>
                       </div>
                    </div>
                    <button className="w-full md:w-auto bg-teal-600 text-white px-12 py-5 rounded-[28px] font-black text-lg shadow-2xl hover:bg-teal-700 transition-all active:scale-95">
                       延長を確定・決済
                    </button>
                 </div>
               )}

               {extensionResult === 'BUSY' && (
                 <div className="p-10 bg-red-50 rounded-[40px] border-2 border-red-100 animate-fade-in-up space-y-6">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center shadow-xl"><XCircle size={32}/></div>
                       <div>
                          <p className="text-xl font-black text-red-900">このブースは延長できません</p>
                          <p className="text-xs font-bold text-red-500 mt-1">次の予約が 15:30 から入っております</p>
                       </div>
                    </div>
                    <div className="p-6 bg-white/60 rounded-[32px] border border-red-100">
                       <p className="text-[11px] text-gray-500 font-bold leading-relaxed italic">
                          <Sparkles size={14} className="inline mr-2 text-teal-500"/> 近隣の「CARE CUBE 渋谷ANNEX」であれば、現在のセッション終了後30分後から新規予約が可能です。
                       </p>
                    </div>
                 </div>
               )}
            </section>
         </div>

         {/* 右カラム: ライブ・Surveillance (5) */}
         <div className="lg:col-span-5 space-y-8">
            
            {/* 安全監視 Sentinel (Live API連携) */}
            <div className="sticky top-32 space-y-8">
               <GeminiLiveSafety isActive={isLive} onAlert={() => {}} />

               {/* IoT コンソール (CARE CUBE利用時のみ) */}
               {booking.type === BookingType.ONSITE && isLive && (
                 <div className="animate-fade-in-up">
                    <CubeController />
                 </div>
               )}

               {/* 施術終了後の導線 */}
               {status === BookingStatus.COMPLETED && (
                 <div className="bg-indigo-900 text-white p-12 rounded-[64px] shadow-2xl relative overflow-hidden group border-b-[12px] border-indigo-950">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-1000"></div>
                    <div className="relative z-10 space-y-8">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-teal-400 shadow-inner"><Sparkles size={32}/></div>
                          <h3 className="text-2xl font-black tracking-tight">セッションが完了しました</h3>
                       </div>
                       <p className="text-indigo-100 font-bold text-lg leading-relaxed italic">
                         お疲れ様でした。お体はいかがですか？感想をセラピストへ伝えて、改善ロードマップを更新しましょう。
                       </p>
                       <button 
                         onClick={() => navigate(`/app/booking/${booking.id}/review`)}
                         className="w-full bg-white text-indigo-900 py-6 rounded-[32px] font-black text-lg hover:bg-teal-400 hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4 group/btn"
                       >
                          レビューを投稿する <ArrowRight size={24} className="group-hover/btn:translate-x-1 transition-transform" />
                       </button>
                    </div>
                 </div>
               )}

               {/* 安全プロトコル・リマインド */}
               <section className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 space-y-8 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-2 h-full bg-orange-400 opacity-20"></div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <ShieldCheck className="text-teal-600" /> 安全への誓約
                  </h3>
                  <ul className="space-y-6">
                    {[
                      '本サービス外での直接的な金銭受渡し、連絡先交換は厳禁です。',
                      '全てのセッションは匿名化されたGPS動態監視下で行われます。',
                      '非常時は、 sentinel パネルまたはスマホの音量ボタン同時押しでSOS可能です。'
                    ].map((txt, i) => (
                      <li key={i} className="flex gap-4 group">
                         <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
                         <p className="text-xs font-bold text-gray-500 leading-relaxed">{txt}</p>
                      </li>
                    ))}
                  </ul>
               </section>
            </div>
         </div>
      </main>

      {/* キャンセル確認ダイアログ */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[48px] max-w-lg w-full p-10 shadow-2xl animate-scale-in">
            <h3 className="text-3xl font-black text-gray-900 mb-6">予約をキャンセルしますか？</h3>
            <p className="text-gray-600 font-bold mb-8 leading-relaxed">
              キャンセルした予約は元に戻せません。キャンセル理由をご記入ください。
            </p>
            
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="キャンセル理由を入力してください（例：体調不良、予定変更など）"
              className="w-full h-32 p-6 border-2 border-gray-200 rounded-3xl font-bold text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none resize-none mb-6"
            />

            {/* エラーメッセージ表示 */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
                <p className="text-red-600 font-bold text-sm">{errorMessage}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="flex-1 py-5 bg-gray-100 text-gray-900 rounded-3xl font-black hover:bg-gray-200 transition-all"
                disabled={cancelling}
              >
                戻る
              </button>
              <button
                onClick={handleCancelBooking}
                className="flex-1 py-5 bg-red-500 text-white rounded-3xl font-black hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={cancelling}
              >
                {cancelling ? <Loader2 size={20} className="animate-spin" /> : <XCircle size={20} />}
                {cancelling ? 'キャンセル中...' : 'キャンセル確定'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetail;
