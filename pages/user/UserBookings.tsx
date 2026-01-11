
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_BOOKINGS, MOCK_THERAPISTS } from '../../constants';
import StatusBadge from '../../components/StatusBadge';
import { MapPin, Clock, ChevronRight, Calendar, ArrowRight, Zap, Building2, Home, UserPlus, ShieldAlert, Sparkles, Filter, ArrowUpDown, Search, X } from 'lucide-react';
import { Booking, BookingType, BookingStatus } from '../../types';

const BookingCard: React.FC<{ booking: Booking }> = ({ booking }) => {
  const navigate = useNavigate();
  const therapist = MOCK_THERAPISTS.find(t => t.id === booking.therapistId);
  const isPast = new Date(booking.scheduledStart) < new Date();

  return (
    <div 
      onClick={() => navigate(`/app/booking/${booking.id}`)}
      className={`group bg-white rounded-[48px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden relative ${isPast ? 'opacity-70' : ''}`}
    >
      <div className="flex flex-col md:flex-row items-stretch">
        <div className={`w-full md:w-56 p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-dashed border-gray-100 relative ${booking.type === BookingType.MOBILE ? 'bg-orange-50/50' : 'bg-teal-50/50'}`}>
           <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-slate-50 rounded-full"></div>
           <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-slate-50 rounded-full"></div>
           
           <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-inner mb-4 ${booking.type === BookingType.MOBILE ? 'text-orange-600 bg-white' : 'text-teal-600 bg-white'}`}>
              {booking.type === BookingType.ONSITE ? <Building2 size={32} /> : <Home size={32} />}
           </div>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{booking.type === BookingType.ONSITE ? '店舗利用' : '出張訪問'}</p>
           <h4 className="text-2xl font-black text-gray-900 mt-2 tracking-tighter">#{booking.id.slice(-4)}</h4>
        </div>

        <div className="flex-1 p-10 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="space-y-4 flex-1">
              <div className="flex items-center gap-4">
                 <StatusBadge status={booking.status} />
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">{new Date(booking.scheduledStart).toLocaleDateString('ja-JP')}</span>
              </div>
              <h3 className="text-3xl font-black text-gray-900 group-hover:text-teal-600 transition-colors leading-none tracking-tight">{booking.serviceName}</h3>
              <div className="flex flex-wrap gap-6 pt-2">
                 <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                    <Clock size={16} className="text-teal-500" /> 
                    {new Date(booking.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 〜
                 </div>
                 <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                    <MapPin size={16} className="text-teal-500" /> 
                    <span className="truncate max-w-[200px]">{booking.location}</span>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">担当者</p>
                 <p className="font-black text-gray-900">{booking.therapistName}</p>
              </div>
              <img src={therapist?.imageUrl} className="w-16 h-16 rounded-[24px] object-cover shadow-xl border-4 border-white transition-transform group-hover:scale-110" />
              <button className="bg-gray-900 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-teal-600 transition-all active:scale-90">
                 <ArrowRight size={24} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const UserBookings: React.FC = () => {
  const navigate = useNavigate();
  
  // States for Filter & Sort
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'DATE_DESC' | 'DATE_ASC' | 'NAME' | 'STATUS'>('DATE_DESC');
  const [showFilters, setShowFilters] = useState(false);

  // Derived list from search and filters
  const filteredBookings = useMemo(() => {
    let result = [...MOCK_BOOKINGS].filter(b => b.userId === 'u1');

    // Filter by therapist name
    if (searchTerm) {
      result = result.filter(b => 
        b.therapistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by Status
    if (filterStatus !== 'ALL') {
      result = result.filter(b => b.status === filterStatus);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'DATE_DESC':
          return new Date(b.scheduledStart).getTime() - new Date(a.scheduledStart).getTime();
        case 'DATE_ASC':
          return new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime();
        case 'NAME':
          return a.therapistName.localeCompare(b.therapistName);
        case 'STATUS':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return result;
  }, [searchTerm, filterStatus, sortBy]);

  const upcomingBookings = filteredBookings.filter(b => new Date(b.scheduledStart) >= new Date());
  const pastBookings = filteredBookings.filter(b => new Date(b.scheduledStart) < new Date());

  const profileIncomplete = true; 

  const statusOptions = Object.values(BookingStatus);

  return (
    <div className="space-y-12 pb-40 animate-fade-in max-w-5xl mx-auto px-4 md:px-0 pt-10 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
         <div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter">予約履歴</h1>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.5em] mt-3 ml-1">My Booking History</p>
         </div>
         <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest ${showFilters ? 'bg-gray-900 border-gray-900 text-white shadow-xl' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'}`}
            >
               <Filter size={18} /> 検索条件
            </button>
         </div>
      </div>

      {/* Filter Bar Expansion */}
      {showFilters && (
        <section className="bg-white p-10 rounded-[48px] border-2 border-gray-100 shadow-2xl animate-fade-in-up space-y-8">
           <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">フリーワード検索 (セラピスト・メニュー)</label>
                 <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                       type="text" 
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       placeholder="担当者名などで検索..."
                       className="w-full pl-16 pr-6 py-5 bg-gray-50 rounded-[24px] font-bold text-sm outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/5 transition-all border border-transparent focus:border-gray-100"
                    />
                 </div>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">予約ステータス</label>
                 <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-8 py-5 bg-gray-50 rounded-[24px] font-bold text-sm outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/5 transition-all border border-transparent focus:border-gray-100 appearance-none"
                 >
                    <option value="ALL">全てのステータス</option>
                    {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                 </select>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">並び替え</label>
                 <div className="relative">
                    <ArrowUpDown className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <select 
                       value={sortBy}
                       onChange={(e) => setSortBy(e.target.value as any)}
                       className="w-full pl-16 pr-6 py-5 bg-gray-50 rounded-[24px] font-bold text-sm outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/5 transition-all border border-transparent focus:border-gray-100 appearance-none"
                    >
                       <option value="DATE_DESC">日付の新しい順</option>
                       <option value="DATE_ASC">日付の古い順</option>
                       <option value="NAME">セラピスト名順</option>
                       <option value="STATUS">ステータス順</option>
                    </select>
                 </div>
              </div>
           </div>
           
           <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
              <button 
                onClick={() => { setSearchTerm(''); setFilterStatus('ALL'); setSortBy('DATE_DESC'); }}
                className="px-6 py-3 text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest transition-all"
              >
                フィルターをリセット
              </button>
              <button 
                onClick={() => setShowFilters(false)}
                className="bg-gray-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95"
              >
                完了
              </button>
           </div>
        </section>
      )}

      {profileIncomplete && !showFilters && (
         <section className="animate-fade-in-up">
            <div className="bg-indigo-900 text-white p-8 rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border-b-8 border-indigo-500/30">
               <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
               <div className="flex items-center gap-6 relative z-10">
                  <div className="w-16 h-16 bg-white/10 rounded-[24px] flex items-center justify-center shadow-inner text-teal-400">
                     <ShieldAlert size={32} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black tracking-tight flex items-center gap-2">プロフィールの設定を完了しましょう <Sparkles size={16} className="text-teal-400" /></h3>
                     <p className="text-xs text-indigo-200 font-bold mt-1">本人確認（KYC）を完了することで、さらに多くのセラピストとマッチング可能になります。</p>
                  </div>
               </div>
               <button 
                 onClick={() => navigate('/app/account')}
                 className="bg-white text-indigo-900 px-10 py-4 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-teal-400 hover:text-white transition-all shadow-xl active:scale-95 relative z-10"
               >
                  アカウントを完成させる
               </button>
            </div>
         </section>
      )}
      
      <div className="space-y-24">
        <section className="space-y-8">
          <div className="flex items-center gap-4 px-4">
             <div className="w-1.5 h-8 bg-teal-500 rounded-full"></div>
             <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase tracking-widest">予定されている予約</h2>
             <span className="text-xs font-black text-teal-600 bg-teal-50 px-3 py-1 rounded-full">{upcomingBookings.length}</span>
          </div>
          {upcomingBookings.length > 0 ? (
            <div className="grid gap-6">
              {upcomingBookings.map(b => <BookingCard key={b.id} booking={b} />)}
            </div>
          ) : (
            <div className="bg-white p-20 rounded-[56px] border border-gray-100 text-center space-y-6 shadow-sm">
               <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto shadow-inner"><Calendar size={40} /></div>
               <p className="text-gray-400 font-bold">該当する予約はありません</p>
            </div>
          )}
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-4 px-4">
             <div className="w-1.5 h-8 bg-gray-300 rounded-full"></div>
             <h2 className="text-2xl font-black text-gray-400 tracking-tight uppercase tracking-widest">過去の履歴</h2>
             <span className="text-xs font-black text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{pastBookings.length}</span>
          </div>
          {pastBookings.length > 0 ? (
            <div className="grid gap-6">
              {pastBookings.map(b => <BookingCard key={b.id} booking={b} />)}
            </div>
          ) : (
             <p className="text-gray-300 font-bold text-center py-10 italic">履歴はありません</p>
          )}
        </section>
      </div>

      {(searchTerm || filterStatus !== 'ALL') && filteredBookings.length === 0 && (
        <div className="text-center py-20 animate-fade-in">
           <X size={48} className="mx-auto text-gray-200 mb-4" />
           <p className="text-gray-400 font-bold">検索条件に一致する予約が見つかりませんでした。</p>
           <button 
             onClick={() => { setSearchTerm(''); setFilterStatus('ALL'); }}
             className="mt-4 text-teal-600 font-black text-sm uppercase tracking-widest hover:underline"
           >
              条件をクリア
           </button>
        </div>
      )}
    </div>
  );
};

export default UserBookings;
