
import React, { useState, useMemo, useEffect } from 'react';
import { 
  MapPin, Home, Star, Clock, Search, Filter, 
  Calendar as CalendarIcon, Heart, ChevronRight, Sliders, ArrowRight, Building2, Users, Loader2, Zap, Sparkles, Sunrise, Sun, Moon, Box, Leaf, LayoutGrid, Award, Move, User
} from 'lucide-react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { BookingType } from '../../types';
import SmartAssistant from '../../components/SmartAssistant';
import { MOCK_THERAPISTS, MOCK_SITES } from '../../constants';
import LoadingSpinner from '../../components/LoadingSpinner';
import { SkeletonCard } from '../../components/Skeleton';

const UserHome: React.FC = () => {
  const navigate = useNavigate();
  const [bookingType, setBookingType] = useState<BookingType>(BookingType.ONSITE);
  const [area, setArea] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sites, setSites] = useState<any[]>([]);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Tokyo areas
  const areas = [
    { id: 'shibuya', name: '渋谷区' },
    { id: 'shinjuku', name: '新宿区' },
    { id: 'minato', name: '港区' },
    { id: 'chiyoda', name: '千代田区' },
    { id: 'chuo', name: '中央区' },
    { id: 'shinagawa', name: '品川区' },
    { id: 'setagaya', name: '世田谷区' },
    { id: 'toshima', name: '豊島区' }
  ];

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsLoggedIn(true);
      
      // Fetch user info
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUserName(data.user.name);
          }
        })
        .catch(err => {
          console.error('Failed to load user:', err);
        });
    }
  }, []);

  // Fetch sites and therapists from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        setError(null);
        
        // Fetch sites
        const sitesRes = await fetch('/api/sites?status=APPROVED&limit=8');
        if (!sitesRes.ok) {
          console.warn('⚠️ Sites API returned error:', sitesRes.status);
          throw new Error('Failed to fetch sites');
        }
        const sitesData = await sitesRes.json();
        setSites(sitesData.sites || []);
        console.log('✅ Sites loaded:', sitesData.sites?.length || 0);

        // Fetch therapists
        const therapistsRes = await fetch('/api/therapists?limit=6');
        if (!therapistsRes.ok) {
          console.warn('⚠️ Therapists API returned error:', therapistsRes.status);
          throw new Error('Failed to fetch therapists');
        }
        const therapistsData = await therapistsRes.json();
        setTherapists(therapistsData.therapists || []);
        console.log('✅ Therapists loaded:', therapistsData.therapists?.length || 0);
      } catch (e) {
        console.error('❌ Failed to fetch data:', e);
        const errorMessage = e instanceof Error ? e.message : 'データの読み込みに失敗しました';
        setError(errorMessage);
        
        // Fallback to mock data for better UX
        console.log('📦 Using fallback mock data');
        setSites(MOCK_SITES);
        setTherapists(MOCK_THERAPISTS);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  }, [area, bookingType]);

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-40 font-sans text-gray-900 overflow-x-hidden">
      
      {/* Error Banner - Show if error but data is loaded */}
      {error && (sites.length > 0 || therapists.length > 0) && (
        <div className="fixed top-16 md:top-20 left-4 right-4 md:left-8 md:right-8 z-40 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3 animate-fade-in shadow-lg">
          <div className="text-amber-600 text-sm flex-1">
            ⚠️ データの一部読み込みに失敗しましたが、キャッシュデータを表示しています。
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="text-amber-700 text-xs font-bold hover:underline whitespace-nowrap"
          >
            再読み込み
          </button>
        </div>
      )}
      
      {/* Welcome Banner for Logged-in Users */}
      {isLoggedIn && userName && (
        <div className="fixed top-2 md:top-4 right-2 md:right-4 z-50 bg-white rounded-xl md:rounded-2xl shadow-lg px-3 md:px-6 py-2 md:py-4 flex items-center gap-2 md:gap-3 animate-fade-in border border-teal-100">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-teal-100 rounded-full flex items-center justify-center">
            <User size={16} className="md:w-5 md:h-5 text-teal-600" />
          </div>
          <div className="hidden md:block">
            <p className="text-xs text-gray-500 font-bold">ログイン中</p>
            <p className="font-black text-gray-900">{userName}</p>
          </div>
          <button
            onClick={() => navigate('/app/account')}
            className="ml-2 md:ml-4 text-teal-600 hover:text-teal-700 font-bold text-xs md:text-sm whitespace-nowrap"
          >
            <span className="hidden md:inline">マイページ →</span>
            <span className="md:hidden">→</span>
          </button>
        </div>
      )}
      
      {/* 1. Immersive Hero & Global Search */}
      <section className="relative h-[70vh] md:h-[80vh] min-h-[500px] md:min-h-[600px] flex items-center justify-center overflow-hidden">
         {/* Background Visual - Google Maps Style Grayscale */}
         <div className="absolute inset-0 z-0">
            <div className="w-full h-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 opacity-60"></div>
            {/* Subtle map-like pattern overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Q0ZDRkNCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-[#FDFCFB]"></div>
         </div>

         <div className="relative z-10 w-full max-w-5xl px-4 md:px-6 text-center space-y-8 md:space-y-12">
            <div className="space-y-4 md:space-y-6 animate-fade-in-up">
               <span className="inline-block bg-teal-600/90 backdrop-blur-xl text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full font-black text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] border border-teal-500 shadow-2xl">Premium Wellness</span>
               <h1 className="text-4xl sm:text-6xl md:text-9xl font-black text-gray-900 tracking-tighter leading-[0.85] drop-shadow-[0_10px_25px_rgba(0,0,0,0.15)]">
                  探して、<br/><span className="text-teal-600 drop-shadow-[0_5px_15px_rgba(13,148,136,0.3)]">整える。</span>
               </h1>
            </div>

            {/* Global Search Console */}
            <div className="bg-white rounded-3xl md:rounded-[56px] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.3)] p-3 md:p-6 border border-white/50 backdrop-blur-2xl animate-fade-in-up delay-100">
               <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
                  <div className="flex-1 grid grid-cols-2 gap-2 md:gap-4 w-full">
                     <button 
                       onClick={() => setBookingType(BookingType.ONSITE)}
                       className={`flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 py-4 md:py-8 rounded-2xl md:rounded-[40px] transition-all duration-500 border-2 md:border-4 ${bookingType === BookingType.ONSITE ? 'bg-teal-600 border-teal-400 text-white shadow-xl scale-[1.03]' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-white hover:border-gray-100'}`}
                     >
                        <Box size={20} className="md:w-7 md:h-7" />
                        <div className="text-center md:text-left leading-none">
                           <p className="font-black text-sm md:text-lg">CUBE</p>
                           <p className="text-[8px] md:text-[9px] font-bold uppercase opacity-60 mt-0.5 md:mt-1">Booth</p>
                        </div>
                     </button>
                     <button 
                       onClick={() => setBookingType(BookingType.MOBILE)}
                       className={`flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 py-4 md:py-8 rounded-2xl md:rounded-[40px] transition-all duration-500 border-2 md:border-4 ${bookingType === BookingType.MOBILE ? 'bg-orange-600 border-orange-400 text-white shadow-xl scale-[1.03]' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-white hover:border-gray-100'}`}
                     >
                        <Home size={20} className="md:w-7 md:h-7" />
                        <div className="text-center md:text-left leading-none">
                           <p className="font-black text-sm md:text-lg">出張</p>
                           <p className="text-[8px] md:text-[9px] font-bold uppercase opacity-60 mt-0.5 md:mt-1">Dispatch</p>
                        </div>
                     </button>
                  </div>
                  <div className="w-full md:w-auto h-full flex flex-col md:flex-row gap-3 md:gap-4 items-center">
                     <div className="h-16 w-px bg-gray-100 hidden md:block mx-4"></div>
                     <div className="relative w-full md:w-64 group">
                        <MapPin className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-teal-500" size={18} />
                        <select 
                          value={area}
                          onChange={e => setArea(e.target.value)}
                          className="w-full pl-12 md:pl-14 pr-8 md:pr-10 py-4 md:py-5 bg-gray-50 rounded-2xl md:rounded-[28px] font-black text-xs md:text-sm border-0 outline-none appearance-none group-focus-within:bg-white group-focus-within:ring-4 ring-teal-500/10 transition-all"
                        >
                           <option value="">全エリア</option>
                           {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <ChevronRight className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-gray-300 rotate-90" size={14} />
                     </div>
                     <button className="w-full md:w-20 h-16 md:h-20 bg-gray-900 text-white rounded-2xl md:rounded-full flex items-center justify-center hover:bg-teal-600 transition-all shadow-2xl active:scale-90 group">
                        <Search size={24} className="md:w-8 md:h-8 group-hover:scale-110 transition-transform" />
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 2. Featured Sections */}
      <div className="max-w-7xl mx-auto px-6 space-y-32 -mt-20 relative z-20">
         
         {/* Featured CARE CUBEs */}
         {bookingType === BookingType.ONSITE && (
           <section className="space-y-10 animate-fade-in">
              <div className="flex items-end justify-between px-4">
                 <div>
                    <span className="text-[10px] font-black text-teal-600 uppercase tracking-[0.5em] block mb-4">Location Discovery</span>
                    <h2 className="text-5xl font-black tracking-tighter">人気のCARE CUBE拠点</h2>
                 </div>
                 <button onClick={() => navigate('/app/map')} className="text-xs font-black text-gray-400 hover:text-teal-600 uppercase tracking-widest flex items-center gap-2 border-b-2 border-transparent hover:border-teal-600 pb-1 transition-all">
                    マップで探す <ArrowRight size={14}/>
                 </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {dataLoading ? (
                   // ローディング状態
                   Array.from({ length: 4 }).map((_, index) => (
                     <SkeletonCard key={index} />
                   ))
                 ) : sites.length === 0 ? (
                   // データなしの場合のみエラー表示
                   <div className="col-span-full text-center py-12">
                     <p className="text-gray-400 text-sm">{error || 'データがありません'}</p>
                     <button 
                       onClick={() => window.location.reload()} 
                       className="mt-4 text-teal-600 text-sm font-bold hover:underline"
                     >
                       再読み込み
                     </button>
                   </div>
                 ) : (
                   // データ表示（エラーがあってもデータがあれば表示）
                   sites.slice(0, 8).map(site => (
                    <div key={site.id} className="bg-white rounded-[48px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 group">
                       <div className="h-48 md:h-56 relative overflow-hidden cursor-pointer" onClick={() => navigate(`/app/site/${site.id}`)}>
                          <img src={`https://picsum.photos/300/200?random=${site.id}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={site.name} loading="lazy" />
                          <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-4 py-2 rounded-xl border border-white/20 uppercase tracking-widest">
                             {site.area}
                          </div>
                       </div>
                       <div className="p-8 space-y-4">
                          <h4 className="font-black text-xl text-gray-900 group-hover:text-teal-600 transition-colors tracking-tight truncate cursor-pointer" onClick={() => navigate(`/app/site/${site.id}`)}>{site.name}</h4>
                          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                             <div className="flex items-center gap-1.5 text-yellow-500 font-black text-sm">
                                <Star size={16} fill="currentColor" /> 4.9
                             </div>
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 navigate(`/app/booking/from-map/${site.id}`);
                               }}
                               className="bg-teal-600 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-wider hover:bg-teal-700 transition-all active:scale-90"
                             >
                               予約する
                             </button>
                          </div>
                       </div>
                    </div>
                   ))
                 )}
              </div>
           </section>
         )}

         {/* Elite Therapists Feed */}
         <section className="space-y-12">
            <div className="flex items-end justify-between px-4">
               <div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.5em] block mb-4">Elite Professional Selection</span>
                  <h2 className="text-5xl font-black tracking-tighter">厳選セラピスト</h2>
               </div>
               <button onClick={() => navigate('/therapists')} className="text-xs font-black text-gray-400 hover:text-indigo-600 uppercase tracking-widest flex items-center gap-2 border-b-2 border-transparent hover:border-indigo-600 pb-1 transition-all">
                  すべて見る <ChevronRight size={16}/>
               </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               {dataLoading ? (
                 // ローディング状態
                 Array.from({ length: 4 }).map((_, index) => (
                   <SkeletonCard key={index} />
                 ))
               ) : therapists.length === 0 ? (
                 // データなしの場合のみエラー表示
                 <div className="col-span-full text-center py-12">
                   <p className="text-gray-400 text-sm">{error || 'データがありません'}</p>
                   <button 
                     onClick={() => window.location.reload()} 
                     className="mt-4 text-teal-600 text-sm font-bold hover:underline"
                   >
                     再読み込み
                   </button>
                 </div>
               ) : (
                 // データ表示（エラーがあってもデータがあれば表示）
                 // データ表示
                 therapists.slice(0, 6).map(t => (
                 <div 
                   key={t.id} 
                   onClick={() => navigate(`/app/therapist/${t.id}`)}
                   className="bg-white rounded-[64px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-[0_60px_100px_-20px_rgba(0,0,0,0.12)] transition-all duration-1000 cursor-pointer group flex flex-col md:flex-row relative"
                 >
                    <div className="w-full md:w-64 h-64 md:h-auto overflow-hidden relative flex-shrink-0">
                       <img src={t.avatar_url || `/therapists/${t.id}.jpg`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3000ms]" alt={t.name} loading="lazy" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 flex gap-2">
                          <button className="bg-white text-gray-900 p-3 rounded-full shadow-2xl active:scale-90"><Heart size={18}/></button>
                       </div>
                    </div>
                    
                    <div className="flex-1 p-10 md:p-12 flex flex-col justify-between">
                       <div className="space-y-6">
                          <div className="flex flex-wrap items-center gap-2">
                             <span className="bg-teal-50 text-teal-600 text-[9px] font-black px-3 py-1 rounded-full border border-teal-100">本人確認済</span>
                          </div>
                          <div>
                             <h3 className="text-3xl font-black text-gray-900 group-hover:text-teal-600 transition-colors leading-none tracking-tight">{t.name}</h3>
                             <p className="text-xs font-bold text-gray-400 mt-3 flex items-center gap-3">
                                歴{t.experience_years || t.experience || 0}年 / <span className="text-gray-900 font-black">{(() => {
                                  const specialties = t.specialties;
                                  if (!specialties) return '深層筋リリース';
                                  if (Array.isArray(specialties)) return specialties[0] || '深層筋リリース';
                                  if (typeof specialties === 'string') {
                                    if (specialties.startsWith('[')) {
                                      try {
                                        const parsed = JSON.parse(specialties);
                                        return Array.isArray(parsed) ? (parsed[0] || '深層筋リリース') : '深層筋リリース';
                                      } catch (e) {
                                        return specialties.split(',')[0]?.trim() || '深層筋リリース';
                                      }
                                    }
                                    return specialties.split(',')[0]?.trim() || '深層筋リリース';
                                  }
                                  return '深層筋リリース';
                                })()}</span>
                             </p>
                          </div>
                          <p className="text-gray-500 font-medium leading-relaxed line-clamp-2 italic text-sm border-l-4 border-teal-500/10 pl-4">
                             {t.bio || '確かな技術と丁寧な施術で、お客様一人ひとりに合わせたケアを提供します。'}
                          </p>
                       </div>
                       
                       <div className="flex items-center justify-between mt-10 pt-8 border-t border-gray-50">
                          <div className="flex items-center gap-1 text-yellow-500 font-black">
                             <Star size={18} fill="currentColor" /> {t.rating || 4.8}
                          </div>
                          <div className="flex items-center gap-6">
                             <p className="text-3xl font-black text-gray-900 tracking-tighter">¥7,480<span className="text-xs text-gray-300 ml-1 font-bold">〜</span></p>
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 navigate(`/app/booking/direct/${t.id}`);
                               }}
                               className="bg-gray-900 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl hover:bg-teal-600 transition-all active:scale-90 group-hover:rotate-[-5deg]"
                             >
                                <ArrowRight size={24} />
                             </button>
                          </div>
                       </div>
                    </div>
                 </div>
               ))
               )}
            </div>
         </section>

         {/* 3. Category Icons (Horizontal scroll or Grid) */}
         <section className="bg-gray-900 rounded-[80px] p-16 md:p-24 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 space-y-16">
               <div className="text-center space-y-4">
                  <span className="text-teal-400 font-black text-[10px] uppercase tracking-[0.5em]">Menu Categories</span>
                  <h2 className="text-5xl font-black tracking-tighter">お悩みから探す</h2>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { label: '全身ほぐし', icon: <Users />, desc: '日々の疲れに' },
                    { label: 'アロマオイル', icon: <Leaf />, desc: 'リンパと血行促進' },
                    { label: 'ストレッチ', icon: <Move />, desc: '柔軟性・姿勢改善' },
                    { label: 'ヘッドスパ', icon: <Zap />, desc: '眼精疲労・不眠' },
                  ].map((cat, i) => (
                    <button key={i} className="bg-white/5 border border-white/10 p-10 rounded-[48px] text-center hover:bg-white hover:text-gray-900 hover:shadow-2xl hover:scale-[1.05] transition-all duration-500 group">
                       <div className="w-20 h-20 bg-teal-500/20 text-teal-400 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-teal-50 group-hover:text-white transition-all shadow-inner">
                          {React.cloneElement(cat.icon as React.ReactElement, { size: 36 })}
                       </div>
                       <p className="text-xl font-black tracking-tight">{cat.label}</p>
                       <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-2">{cat.desc}</p>
                    </button>
                  ))}
               </div>
            </div>
         </section>
      </div>

      <SmartAssistant />
    </div>
  );
};

export default UserHome;
