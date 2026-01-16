import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import PortalLayout from './PortalLayout';
import { MOCK_AREAS, MASTER_COURSES } from '../../constants';
import { 
  Star, MapPin, Search, Calendar, Clock, Filter, 
  ChevronRight, CheckCircle2, ShieldCheck, Zap, Award, 
  ThumbsUp, Heart, SlidersHorizontal, Info, ChevronLeft,
  ChevronRight as ChevronRightIcon, Map as MapIcon,
  Tag, Timer, UserCheck, Sparkles, Scissors, Users, Home
} from 'lucide-react';

const TherapistListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode'); // 'dispatch' or null
  
  // API State
  const [therapists, setTherapists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [area, setArea] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('RECOMMENDED'); 
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    try {
      const res = await fetch('/api/therapists');
      const data = await res.json();
      // APIレスポンスは {therapists: [...], total: ...} の構造
      const therapistsList = data.therapists || [];
      setTherapists(therapistsList.map((t: any) => ({
        ...t,
        areas: typeof t.approved_areas === 'string' ? JSON.parse(t.approved_areas || '[]') : (t.approved_areas || []),
        categories: typeof t.specialties === 'string' ? JSON.parse(t.specialties || '[]') : (t.specialties || []),
        reviewCount: t.review_count,
        imageUrl: t.avatar_url || t.photo || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
      })));
    } catch (e) {
      console.error('Failed to fetch therapists:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedTherapists = useMemo(() => {
    let result = therapists.filter(t => {
      if (area && !t.areas.includes(area)) return false;
      if (category && !t.categories.includes(category)) return false;
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'RATING') return b.rating - a.rating;
      if (sortBy === 'REVIEW') return b.reviewCount - a.reviewCount;
      if (sortBy === 'PRICE_ASC') {
          const priceA = (a as any).approvedMenu?.courses[0]?.price || 0;
          const priceB = (b as any).approvedMenu?.courses[0]?.price || 0;
          return priceA - priceB;
      }
      return 0;
    });

    return result;
  }, [therapists, area, category, sortBy]);

  const currentAreaName = MOCK_AREAS.find(a => a.id === area)?.name || '東京都';

  return (
    <PortalLayout>
      <div className="bg-[#F8F9FA] min-h-screen pb-32 pt-[72px] font-sans text-gray-900">
        
        {/* モード表示バナー（出張予約の場合） */}
        {mode === 'dispatch' && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-center gap-3">
                <Home size={24} />
                <div className="text-center">
                  <p className="font-black text-lg">出張予約モード</p>
                  <p className="text-sm text-white/90">ご自宅・ホテルへセラピストが訪問します</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 1. 精密検索・パンくずエリア */}
        <section className="bg-white border-b border-gray-200 sticky top-[72px] z-40 shadow-sm">
           <div className="max-w-7xl mx-auto px-4">
              <div className="py-2 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest overflow-hidden">
                 <Link to="/" className="hover:text-teal-600 transition-colors">Soothe</Link>
                 <ChevronRightIcon size={10} />
                 <Link to="/therapists" className="hover:text-teal-600 transition-colors">リラク・マッサージ</Link>
                 <ChevronRightIcon size={10} />
                 <span className="text-teal-600 truncate">{currentAreaName} セラピスト一覧</span>
              </div>

              <div className="py-4 flex flex-col lg:flex-row gap-3 items-center border-t border-gray-50">
                 <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="relative group">
                       <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600" size={16} />
                       <select 
                         value={area}
                         onChange={(e) => setArea(e.target.value)}
                         className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-black outline-none focus:bg-white focus:border-teal-500 transition-all appearance-none"
                       >
                          <option value="">全てのエリア</option>
                          {MOCK_AREAS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                       </select>
                    </div>
                    <div className="relative group">
                       <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600" size={16} />
                       <select className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-black outline-none focus:bg-white focus:border-teal-500 transition-all appearance-none">
                          <option>日付指定なし</option>
                          <option>本日</option>
                          <option>明日</option>
                          <option>今週末</option>
                       </select>
                    </div>
                    <div className="relative group">
                       <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600" size={16} />
                       <select 
                         value={category}
                         onChange={(e) => setCategory(e.target.value)}
                         className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-black outline-none focus:bg-white focus:border-teal-500 transition-all appearance-none"
                       >
                          <option value="">全てのメニュー</option>
                          <option value="LICENSED">国家資格保有</option>
                          <option value="RELAXATION">リラクゼーション</option>
                       </select>
                    </div>
                 </div>
                 <div className="flex w-full lg:w-auto gap-2">
                    <button className="flex-1 lg:w-40 py-3 bg-gray-900 text-white rounded-xl font-black text-sm hover:bg-teal-600 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg">
                       <Search size={16} /> 検索する
                    </button>
                    <button className="lg:hidden p-3 bg-white border border-gray-200 rounded-xl text-gray-400">
                       <SlidersHorizontal size={20} />
                    </button>
                 </div>
              </div>
           </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-12 gap-8">
           
           {/* 2. 左サイドバー: フィルタリング・広告 */}
           <aside className="hidden lg:block lg:col-span-3 space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="bg-gray-900 p-6 text-white">
                    <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                       <Filter size={14} className="text-teal-400" /> 条件を絞り込む
                    </h3>
                 </div>
                 <div className="p-8 space-y-8">
                    <FilterGroup title="スタッフ" items={['女性指名OK', '男性指名OK', '歴10年以上', '指名料無料']} />
                    <FilterGroup title="こだわり条件" items={['個室あり', 'ペア予約OK', 'CARE CUBE限定', '早朝・深夜対応']} />
                    <FilterGroup title="目的別" items={['肩こり・腰痛', '小顔・美肌', 'デトックス', '快眠・不眠解消']} />
                 </div>
                 <div className="p-6 border-t border-gray-50 bg-slate-50 text-center">
                    <button onClick={() => { setArea(''); setCategory(''); }} className="text-[10px] font-black text-teal-600 hover:underline uppercase tracking-widest">全ての条件をリセット</button>
                 </div>
              </div>
              
              {/* Campaign banner */}
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[32px] p-8 text-white relative overflow-hidden group cursor-pointer shadow-xl">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-[80px] opacity-10"></div>
                 <Tag className="text-teal-400 mb-4 group-hover:rotate-12 transition-transform" size={32} />
                 <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">New Member Gift</p>
                 <h4 className="text-lg font-black leading-tight mb-4">初回限定 ¥1,000 OFF<br/>クーポン配布中</h4>
                 <button className="text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 py-2 px-4 rounded-full border border-white/20 transition-all flex items-center gap-2">
                   詳細をチェック <ChevronRight size={12} />
                 </button>
              </div>
           </aside>

           {/* 3. メインコンテンツ: 検索結果 */}
           <main className="lg:col-span-9 space-y-6">
              
              {/* ソート & ヒット件数 */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                 <div className="flex items-baseline gap-2">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">{currentAreaName}</h2>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest"><span className="text-2xl text-teal-600 ml-1">{filteredAndSortedTherapists.length}</span> therapists found</span>
                 </div>
                 <div className="flex bg-gray-100 p-1 rounded-2xl">
                    <SortButton label="おすすめ順" active={sortBy === 'RECOMMENDED'} onClick={() => setSortBy('RECOMMENDED')} />
                    <SortButton label="評価順" active={sortBy === 'RATING'} onClick={() => setSortBy('RATING')} />
                    <SortButton label="安い順" active={sortBy === 'PRICE_ASC'} onClick={() => setSortBy('PRICE_ASC')} />
                 </div>
              </div>

              {/* リスト表示 */}
              {loading ? (
                <div className="text-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">読み込み中...</p>
                </div>
              ) : (
                <div className="grid gap-10">
                  {filteredAndSortedTherapists.map(t => (
                    <TherapistCatalogCard key={t.id} therapist={t} onBook={() => navigate(`/app/therapist/${t.id}`)} />
                  ))}
                </div>
              )}

              {/* Pagination (Mock) */}
              {filteredAndSortedTherapists.length > 0 && (
                <div className="flex items-center justify-center gap-2 pt-10">
                   <button className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50"><ChevronLeft size={20}/></button>
                   <button className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-sm font-black shadow-lg">1</button>
                   <button className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-sm font-black text-gray-600 hover:bg-gray-50">2</button>
                   <button className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50"><ChevronRightIcon size={20}/></button>
                </div>
              )}

              {filteredAndSortedTherapists.length === 0 && (
                <div className="bg-white p-24 rounded-[64px] text-center border-4 border-dashed border-gray-200">
                   <Info size={56} className="mx-auto text-gray-200 mb-6" />
                   <h3 className="text-2xl font-black text-gray-400 uppercase tracking-widest">条件に一致するセラピストが見つかりません</h3>
                   <button onClick={() => { setArea(''); setCategory(''); }} className="mt-8 bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-sm">全てリセットして再表示</button>
                </div>
              )}
           </main>
        </div>
      </div>
    </PortalLayout>
  );
};

// --- サブコンポーネント: 高密度カタログカード ---

const TherapistCatalogCard: React.FC<{ therapist: any, onBook: () => void }> = ({ therapist, onBook }) => {
  // 表示用メニュー（上位2つ）
  const featuredMenus = (therapist as any).approvedMenu?.courses.slice(0, 2).map((c: any) => ({
    ...MASTER_COURSES.find(mc => mc.id === c.masterId),
    price: c.price
  })) || [];

  return (
    <div 
      onClick={onBook}
      className="bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-700 cursor-pointer overflow-hidden group relative"
    >
       <div className="flex flex-col md:flex-row">
          {/* 左: ビジュアルセクション */}
          <div className="w-full md:w-[320px] h-80 md:h-auto relative overflow-hidden flex-shrink-0 bg-gray-100">
             <img src={therapist.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={therapist.name} />
             <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
             
             <div className="absolute top-6 left-6 flex flex-col gap-2">
                <span className="bg-gray-900/90 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-lg border border-white/20 uppercase tracking-widest shadow-xl">
                   {MOCK_AREAS.find(a => a.id === therapist.areas[0])?.name}
                </span>
                {therapist.id === 't1' && (
                  <span className="bg-teal-500 text-white text-[9px] font-black px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-1">
                     <Sparkles size={10} /> 人気店
                  </span>
                )}
             </div>

             <button className="absolute bottom-6 right-6 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors shadow-lg active:scale-90">
                <Heart size={20} />
             </button>
          </div>

          {/* 右: 情報詳細 (Hot Pepper Style Hierarchy) */}
          <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
             <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                   {therapist.categories.includes('LICENSED') && (
                      <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-3 py-1 rounded-full border border-indigo-100 flex items-center gap-1">
                         <ShieldCheck size={12}/> 国家資格
                      </span>
                   )}
                   <span className="bg-teal-50 text-teal-600 text-[9px] font-black px-3 py-1 rounded-full border border-teal-100">本人確認済</span>
                   <span className="bg-orange-50 text-orange-600 text-[9px] font-black px-3 py-1 rounded-full border border-orange-100">深夜OK</span>
                </div>

                <div className="flex justify-between items-start gap-4">
                   <div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tighter group-hover:text-teal-600 transition-colors leading-none">
                        {therapist.name}
                        <span className="text-[10px] font-bold text-gray-300 ml-3 uppercase tracking-widest">田中 有紀</span>
                      </h3>
                      <p className="text-xs font-bold text-gray-400 mt-2 flex items-center gap-2">
                        歴12年 / <span className="text-gray-900 border-b border-teal-500/20">深層筋・骨盤調整・小顔</span>
                      </p>
                   </div>
                   <div className="text-right">
                      <div className="flex items-center gap-1.5 text-yellow-500 font-black text-xl bg-yellow-50 px-3 py-1 rounded-xl border border-yellow-100 shadow-sm">
                         <Star size={16} fill="currentColor" /> {therapist.rating}
                      </div>
                      <p className="text-[9px] font-black text-gray-300 mt-1 uppercase tracking-widest">{therapist.reviewCount} Reviews</p>
                   </div>
                </div>

                <p className="text-gray-500 font-bold leading-relaxed line-clamp-2 italic border-l-4 border-teal-500/10 pl-5 text-base">
                   「{therapist.bio || "インナーマッスルへの的確なアプローチで、翌朝驚くほど身体が軽くなる体験をご提供します。" }」
                </p>

                {/* メニュープレビュー: ここがHot Pepperの大きな特徴 */}
                <div className="space-y-2">
                   {featuredMenus.map((m: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl border border-transparent hover:border-teal-100 hover:bg-white transition-all group/menu">
                         <p className="text-xs font-black text-gray-600 flex items-center gap-2">
                            <span className="w-1 h-3 bg-teal-500 rounded-full opacity-40 group-hover/menu:opacity-100"></span>
                            {m.name} ({m.duration}分)
                         </p>
                         <p className="text-base font-black text-gray-900 tracking-tight">¥{m.price.toLocaleString()}</p>
                      </div>
                   ))}
                </div>
             </div>

             {/* フッター: 予約可能枠 & CTA */}
             <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 pt-6 border-t border-gray-50 mt-8">
                <div className="flex items-center gap-3">
                   <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 flex items-center gap-2 shadow-inner">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <div className="text-left">
                         <p className="text-[9px] font-black text-emerald-800 uppercase tracking-widest leading-none">本日 空きあり</p>
                         <p className="text-[10px] font-black text-emerald-600 mt-1">18:00 / 20:30 / 21:00〜</p>
                      </div>
                   </div>
                </div>

                <button className="bg-gray-900 text-white px-10 py-4 rounded-[22px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-teal-600 transition-all active:scale-95 flex items-center justify-center gap-2 group/btn">
                   空き状況・予約 <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};

const FilterGroup = ({ title, items }: { title: string, items: string[] }) => (
  <div className="space-y-4">
     <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1 border-l-4 border-teal-600 pl-3">{title}</h4>
     <div className="space-y-2">
        {items.map(item => (
           <label key={item} className="flex items-center gap-3 group cursor-pointer">
              <div className="relative w-5 h-5 rounded-lg border-2 border-gray-100 group-hover:border-teal-500 transition-all flex items-center justify-center bg-gray-50 group-hover:bg-white">
                 <div className="w-2 h-2 bg-teal-500 rounded-sm opacity-0 group-hover:opacity-10"></div>
              </div>
              <span className="text-[11px] font-bold text-gray-500 group-hover:text-gray-900 transition-colors">{item}</span>
           </label>
        ))}
     </div>
  </div>
);

const SortButton = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
  >
     {label}
  </button>
);

export default TherapistListPage;
