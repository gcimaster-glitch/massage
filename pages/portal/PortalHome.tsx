
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Home, Star, ArrowRight, ShieldCheck, Users, 
  Box, CheckCircle, Zap, Search, Calendar, Sliders, Heart, Clock, ChevronRight, Sparkles, Activity, JapaneseYen, Timer, UserCheck, ShieldAlert, Leaf, Move, Layers
} from 'lucide-react';
import { MOCK_THERAPISTS, MOCK_AREAS } from '../../constants';
import { BookingType } from '../../types';
import PortalLayout from './PortalLayout';

const PortalHome: React.FC = () => {
  const navigate = useNavigate();
  const [bookingType, setBookingType] = useState<BookingType>(BookingType.ONSITE);
  const [area, setArea] = useState('');

  return (
    <PortalLayout>
      {/* 1. Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-slate-900">
        <img 
          src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=2000" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 animate-[slow-zoom_20s_infinite]" 
          alt="Wellness Hero" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90"></div>
        <div className="relative z-10 text-center px-6 max-w-5xl space-y-8">
          <div className="inline-flex items-center gap-2 bg-teal-500/20 backdrop-blur-md text-teal-400 px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border border-teal-500/30">
             <Sparkles size={14} /> Wellness Infrastructure by Soothe
          </div>
          <h1 className="text-6xl md:text-[110px] font-black text-white leading-[0.85] tracking-tighter">
             探して、<br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-indigo-300">整える。</span>
          </h1>
          <p className="text-white/80 font-bold text-lg md:text-2xl tracking-tight max-w-3xl mx-auto leading-relaxed">
             スマート施術ブース「CARE CUBE」と、厳選されたプロの技術。<br className="hidden md:block"/>
             都会のあらゆる場所が、あなただけの最高の施術室に変わります。
          </p>
        </div>
      </section>

      {/* 2. Main Console: CARE CUBE vs Dispatch */}
      <section className="relative z-20 -mt-24 px-4 pb-20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="bg-white rounded-[56px] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.2)] p-10 md:p-14 border border-gray-50 space-y-10">
             
             {/* モード切替 */}
             <div className="bg-gray-100 p-2 rounded-[32px] flex max-w-2xl mx-auto shadow-inner border border-white">
                <button 
                  onClick={() => setBookingType(BookingType.ONSITE)} 
                  className={`flex-1 py-6 px-6 rounded-[28px] font-black text-lg flex items-center justify-center gap-4 transition-all duration-500 ${bookingType === BookingType.ONSITE ? 'bg-white text-teal-700 shadow-2xl scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                   <Box size={24} className={bookingType === BookingType.ONSITE ? 'text-teal-600' : 'opacity-30'} />
                   <div className="text-left leading-tight">
                      <p>CARE CUBEを予約</p>
                      <p className="text-[9px] opacity-40 uppercase tracking-widest mt-0.5">Booth Booking</p>
                   </div>
                </button>
                <button 
                  onClick={() => setBookingType(BookingType.MOBILE)} 
                  className={`flex-1 py-6 px-6 rounded-[28px] font-black text-lg flex items-center justify-center gap-4 transition-all duration-500 ${bookingType === BookingType.MOBILE ? 'bg-white text-orange-700 shadow-2xl scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                   <Home size={24} className={bookingType === BookingType.MOBILE ? 'text-orange-600' : 'opacity-30'} />
                   <div className="text-left leading-tight">
                      <p>出張で呼ぶ</p>
                      <p className="text-[9px] opacity-40 uppercase tracking-widest mt-0.5">Home/Room Dispatch</p>
                   </div>
                </button>
             </div>

             {/* ベネフィット解説 (お客様視点) */}
             <div className="grid md:grid-cols-4 gap-8 px-4 py-8 border-y border-gray-100">
                <div className="flex gap-4">
                   <MapPin className="text-teal-500 shrink-0" size={24} />
                   <div className="space-y-1">
                      <h4 className="font-black text-sm text-gray-900">街中に広がる施術拠点</h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed font-bold">独自の設置技術により、ホテル、商業施設、オフィスビルなど、あなたの生活圏内のあらゆる場所に拠点を展開。</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <ShieldCheck className="text-indigo-500 shrink-0" size={24} />
                   <div className="space-y-1">
                      <h4 className="font-black text-sm text-gray-900">完全な個室・プライベート</h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed font-bold">誰にも邪魔されない、あなただけの空間。スマートロックによるセキュアな入室で、極上のリラックス体験を。</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <ShieldAlert className="text-orange-500 shrink-0" size={24} />
                   <div className="space-y-1">
                      <h4 className="font-black text-sm text-gray-900">「客室外」で受ける安心</h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed font-bold">ホテルの部屋にセラピストを入れずに、館内の専用ブースで施術。セキュリティとプライバシーを高い次元で両立。</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <Zap className="text-rose-500 shrink-0" size={24} />
                   <div className="space-y-1">
                      <h4 className="font-black text-sm text-gray-900">最短1分で即時予約</h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed font-bold">アプリで空き状況を確認し、その場で予約。待ち時間なしでシームレスにセッションを開始できます。</p>
                   </div>
                </div>
             </div>

             {/* 予約アクション */}
             <div className="grid md:grid-cols-2 gap-6">
                <button 
                  onClick={() => navigate(`/app/booking/new?type=${bookingType}&therapistId=auto`)}
                  className={`p-10 rounded-[48px] text-left transition-all relative overflow-hidden group border-4 ${bookingType === BookingType.MOBILE ? 'bg-orange-600 border-orange-400 text-white' : 'bg-teal-600 border-teal-400 text-white'} shadow-2xl hover:scale-[1.02] active:scale-95`}
                >
                   <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Zap size={120} /></div>
                   <div className="relative z-10 space-y-6">
                      <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-md"><Timer size={32} /></div>
                      <div>
                         <h3 className="text-4xl font-black tracking-tighter leading-none mb-3">AIマッチング・スピード予約</h3>
                         <p className="text-white/80 font-bold text-sm leading-relaxed max-w-xs">
                           {bookingType === BookingType.ONSITE ? '最寄りの空いているCARE CUBEと、今すぐ動けるプロを自動マッチング。' : '今いる場所へ、最短で到着可能なプロをマッチング。'}
                         </p>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-black/20 w-fit px-5 py-2 rounded-full">
                         <UserCheck size={14} /> Instant Allocation Protocol
                      </div>
                   </div>
                </button>

                <div className="bg-gray-50 p-10 rounded-[48px] border-2 border-dashed border-gray-200 flex flex-col justify-center space-y-8">
                   <div className="space-y-6">
                      <h4 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                         <Search size={24} className="text-teal-600" /> セラピスト・拠点を探す
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">エリアを選択</label>
                            <select value={area} onChange={e => setArea(e.target.value)} className="w-full p-5 bg-white border border-gray-200 rounded-[24px] font-black text-sm outline-none appearance-none shadow-sm">
                               <option value="">全てのエリア</option>
                               {MOCK_AREAS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">利用方法</label>
                            <select className="w-full p-5 bg-white border border-gray-200 rounded-[24px] font-black text-sm outline-none appearance-none shadow-sm">
                               <option>CARE CUBEを利用</option>
                               <option>自宅/ホテル客室へ呼ぶ</option>
                            </select>
                         </div>
                      </div>
                   </div>
                   <button onClick={() => navigate('/therapists')} className="w-full py-6 bg-gray-900 text-white rounded-[28px] font-black text-sm uppercase tracking-[0.2em] hover:bg-teal-600 transition-all flex items-center justify-center gap-3 shadow-xl">
                      全セラピスト・拠点を一覧表示 <ArrowRight size={20} />
                   </button>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Therapists */}
      <section className="pb-32 max-w-7xl mx-auto px-4 space-y-12">
         <div className="flex items-end justify-between px-6">
            <div>
               <span className="text-[10px] font-black text-teal-600 uppercase tracking-[0.4em] block mb-3">Professional Selection</span>
               <h2 className="text-4xl font-black text-gray-900 tracking-tighter">人気のセラピスト</h2>
            </div>
            <button onClick={() => navigate('/therapists')} className="text-xs font-black text-gray-400 hover:text-teal-600 transition-all uppercase tracking-widest flex items-center gap-2 border-b-2 border-transparent hover:border-teal-600 pb-1">
               すべて表示 <ChevronRight size={16}/>
            </button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {MOCK_THERAPISTS.slice(0, 4).map(t => (
              <div key={t.id} onClick={() => navigate(`/app/site/${t.id}`)} className="bg-white rounded-[40px] border border-gray-100 overflow-hidden hover:shadow-2xl transition-all cursor-pointer group shadow-sm">
                <div className="h-64 overflow-hidden relative">
                  <img src={t.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 bg-black/60 text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/20">Certified</div>
                </div>
                <div className="p-8 space-y-4">
                   <h4 className="font-black text-xl text-gray-900 group-hover:text-teal-600 transition-colors">{t.name}</h4>
                   <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <span className="flex items-center gap-1 text-yellow-500 font-black text-xs"><Star size={14} fill="currentColor"/> {t.rating}</span>
                      <span className="text-lg font-black text-gray-900 tracking-tighter">¥7,480〜</span>
                   </div>
                </div>
              </div>
            ))}
         </div>
      </section>
      
      {/* 4. Infrastructure Showcase (Infrastructure Focus) */}
      <section className="py-20 px-4">
         <div className="bg-gray-950 rounded-[80px] p-12 md:p-24 overflow-hidden relative text-white max-w-7xl mx-auto">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
               <div className="space-y-10">
                  <div className="space-y-4">
                     <span className="bg-teal-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-xl">Infrastructure Innovation</span>
                     <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                       癒やしを、<br/><span className="text-teal-400 italic">インフラ</span>に。
                     </h2>
                  </div>
                  <div className="space-y-6 text-gray-400 text-lg font-medium leading-relaxed">
                    <p>
                      CARE CUBEは、日本の都市環境に最適化したスマート施術ブース。
                      設置の容易な独自設計により、ホテルのロビーやオフィスのデッドスペースを、瞬時に最高のプライベート施術空間へと変貌させます。
                    </p>
                    <ul className="grid grid-cols-2 gap-6 text-sm font-black uppercase text-teal-400 tracking-widest">
                       <li className="flex items-center gap-3"><CheckCircle size={14}/> 街中のあらゆる場所へ展開</li>
                       <li className="flex items-center gap-3"><CheckCircle size={14}/> スマートロック完全無人運用</li>
                       <li className="flex items-center gap-3"><CheckCircle size={14}/> プライバシー・セキュリティ対応</li>
                       <li className="flex items-center gap-3"><CheckCircle size={14}/> IOT空調・アロマ完備</li>
                    </ul>
                  </div>
                  <button onClick={() => navigate('/about')} className="bg-white text-gray-900 px-12 py-6 rounded-[32px] font-black text-lg hover:bg-teal-400 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center gap-4 group">
                     事業モデル・詳細を見る <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
               <div className="aspect-video rounded-[60px] overflow-hidden shadow-2xl border-8 border-white/5 relative">
                  <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-teal-500/10 pointer-events-none"></div>
                  <div className="absolute bottom-8 left-8 right-8 bg-black/60 backdrop-blur-md p-6 rounded-[32px] border border-white/10">
                     <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-2">Service Insight</p>
                     <p className="text-sm font-bold leading-relaxed italic">「ホテルの客室に人を呼びたくない」という宿泊客と、「外部スタッフを客室へ誘導したくない」ホテル。CARE CUBEは、館内共用スペースでその双方の課題を解決します。</p>
                  </div>
               </div>
            </div>
         </div>
      </section>
    </PortalLayout>
  );
};

export default PortalHome;
