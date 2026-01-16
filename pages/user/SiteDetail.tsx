
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_SITES } from '../../constants';
import { 
  MapPin, Star, Wifi, Droplets, Lock, Wind, ArrowLeft, 
  CheckCircle, Navigation, Info, ShieldCheck, Zap, 
  Clock, Thermometer, Music, Maximize2, Share2, Heart, 
  Loader, AlertCircle, User, ChevronRight
} from 'lucide-react';

const SiteDetail: React.FC = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  
  const [site, setSite] = useState<any>(null);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTherapists, setLoadingTherapists] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<any>(null);
  const [showTherapistModal, setShowTherapistModal] = useState(false);

  // Fetch site data from API
  useEffect(() => {
    const fetchSite = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/sites/${siteId}`);
        const data = await res.json();
        
        // APIレスポンスから site オブジェクトを取得
        setSite(data.site || null);
      } catch (e) {
        console.error('Failed to fetch site:', e);
        setSite(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSite();
  }, [siteId]);

  // Fetch therapists available at this site
  const fetchTherapists = async () => {
    try {
      setLoadingTherapists(true);
      const res = await fetch(`/api/sites/${siteId}/therapists`);
      const data = await res.json();
      
      // APIレスポンスから therapists 配列を取得
      setTherapists(data.therapists || []);
      setShowTherapistModal(true);
    } catch (e) {
      console.error('Failed to fetch therapists:', e);
    } finally {
      setLoadingTherapists(false);
    }
  };

  const handleBookWithTherapist = (therapist?: any) => {
    const params = new URLSearchParams({
      type: 'ONSITE',
      siteId: site.id
    });
    if (therapist) {
      params.append('therapistId', therapist.id);
    }
    navigate(`/app/booking/new?${params.toString()}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader size={48} className="animate-spin text-teal-600 mx-auto" />
          <p className="text-gray-400 font-bold">施設情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle size={48} className="text-red-400 mx-auto" />
          <p className="text-gray-600 font-bold">施設が見つかりませんでした</p>
          <button onClick={() => navigate(-1)} className="text-teal-600 hover:underline">
            戻る
          </button>
        </div>
      </div>
    );
  }

  const handleBook = () => {
    setShowTherapistModal(true);
    fetchTherapists();
  };

  return (
    <div className="pb-40 animate-fade-in font-sans text-gray-900 max-w-6xl mx-auto">
      {/* 1. Header & Actions */}
      <div className="flex items-center justify-between py-6 px-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all">
          <ArrowLeft size={20} />
        </button>
        <div className="flex gap-3">
           <button className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all"><Share2 size={18} /></button>
           <button className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all text-red-500"><Heart size={18} /></button>
        </div>
      </div>

      {/* 2. Visual Experience Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-12 px-4 h-[500px]">
         <div className="md:col-span-8 rounded-[48px] overflow-hidden shadow-2xl relative group h-full">
            <img 
              src={`https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200`} 
              alt={site.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-10 left-10 text-white">
               <span className="bg-teal-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-3 inline-block">Premium Site</span>
               <h1 className="text-4xl font-black tracking-tighter">{site.name}</h1>
            </div>
         </div>
         <div className="hidden md:grid md:col-span-4 grid-rows-2 gap-4 h-full">
            <div className="rounded-[32px] overflow-hidden shadow-xl h-full">
               <img src="https://picsum.photos/400/400?random=1" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-[32px] overflow-hidden shadow-xl relative h-full">
               <img src="https://picsum.photos/400/400?random=2" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-white text-xs font-black uppercase flex items-center gap-2"><Maximize2 size={16}/> 写真をすべて見る</span>
               </div>
            </div>
         </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12 px-4">
        {/* 3. Detailed Info (Left 2) */}
        <div className="lg:col-span-2 space-y-12">
           <section>
              <div className="flex items-center gap-3 mb-6">
                 <div className="flex items-center gap-1 text-yellow-500 font-black text-xl bg-yellow-50 px-4 py-1.5 rounded-full border border-yellow-100">
                    <Star fill="currentColor" size={20} /> 4.8
                 </div>
                 <span className="text-gray-400 font-bold text-sm">120件のゲストレビュー</span>
              </div>
              <p className="text-xl font-bold text-gray-600 leading-relaxed italic">
                 都会の喧騒を離れ、最先端のIOT空調と厳選されたアロマ、そしてプロの技術が融合する「CARE CUBE」。
                 ここは、心身を再起動（Reboot）するための完全個室プライベート空間です。
              </p>
           </section>

           <hr className="border-gray-100" />

           <section>
              <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">CARE CUBE 標準アメニティ</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 <AmenityItem icon={<Wifi />} label="高速Wi-Fi" desc="施術前後の作業に" />
                 <AmenityItem icon={<Droplets />} label="アロマ" desc="季節の香り" />
                 <AmenityItem icon={<Wind />} label="空気清浄" desc="HEPAフィルター" />
                 <AmenityItem icon={<Lock />} label="スマートキー" desc="暗証番号入室" />
                 <AmenityItem icon={<Thermometer />} label="個別空調" desc="好みの室温に" />
                 <AmenityItem icon={<Music />} label="BGM" desc="ヒーリング音源" />
                 <AmenityItem icon={<Clock />} label="24時間" desc="深夜早朝も利用可" />
                 <AmenityItem icon={<ShieldCheck />} label="警備" desc="ALSOK連携" />
              </div>
           </section>

           <hr className="border-gray-100" />

           <section>
              <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">アクセス & 地図</h2>
              <div className="space-y-6">
                 <div className="flex items-start gap-4 p-8 bg-gray-50 rounded-[40px] border border-gray-100">
                    <MapPin className="text-teal-600 flex-shrink-0 mt-1" />
                    <div>
                       <p className="font-black text-gray-900 text-lg">{site.address}</p>
                       <p className="text-gray-400 text-sm font-bold mt-2 leading-relaxed">
                          ホテルグランド東京 3F ウェルネスフロア内。<br/>
                          フロントを通らず、エレベーターから直接アクセス可能です。
                       </p>
                       <button className="mt-6 flex items-center gap-2 text-sm font-black text-teal-600 hover:underline">
                          <Navigation size={16} /> Google Maps でルートを確認
                       </button>
                    </div>
                 </div>
              </div>
           </section>
        </div>

        {/* 4. Booking Sidebar (Sticky) */}
        <div className="lg:col-span-1">
           <div className="bg-white p-10 rounded-[56px] shadow-2xl border border-gray-100 sticky top-24 space-y-8 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-teal-500"></div>
              <div>
                 <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-2">Facility Fee</p>
                 <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-gray-900 tracking-tighter">¥2,000</span>
                    <span className="text-gray-400 font-bold text-sm">/ 60min〜</span>
                 </div>
              </div>

              <div className="p-6 bg-teal-50 rounded-[32px] border border-teal-100 flex items-start gap-4">
                 <Zap className="text-teal-600 mt-1" size={20} />
                 <p className="text-xs text-teal-800 font-bold leading-relaxed">
                    この施設は現在**「即時予約」**が可能です。セラピストの承認を待たずにブースを確保できます。
                 </p>
              </div>

              <div className="space-y-4 pt-4">
                 <button 
                   onClick={handleBook}
                   className="w-full bg-gray-900 text-white py-6 rounded-[32px] font-black text-xl hover:bg-teal-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                 >
                    予約へ進む <Clock size={24} />
                 </button>
                 <p className="text-[10px] text-gray-400 text-center font-bold">まだお支払いは発生しません</p>
              </div>

              <div className="pt-8 border-t border-gray-100 space-y-4">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Info size={14}/> 安心への取り組み</h4>
                 <ul className="text-[11px] text-gray-500 font-bold space-y-2">
                    <li className="flex items-center gap-2"><CheckCircle size={12} className="text-teal-500"/> 24時間監視カメラ完備（ブース外）</li>
                    <li className="flex items-center gap-2"><CheckCircle size={12} className="text-teal-500"/> 専門業者による毎日の除菌清掃</li>
                 </ul>
              </div>
           </div>
        </div>
      </div>

      {/* Therapist Selection Modal */}
      {showTherapistModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowTherapistModal(false);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 md:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black mb-2">セラピストを選択</h3>
                  <p className="text-teal-100 text-sm">
                    {site.name} で施術を担当するセラピストをお選びください
                  </p>
                </div>
                <button 
                  onClick={() => setShowTherapistModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <ArrowLeft size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {loadingTherapists ? (
                <div className="flex items-center justify-center py-20">
                  <Loader size={48} className="animate-spin text-teal-600" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Auto-assign option */}
                  <div 
                    onClick={() => handleBookWithTherapist()}
                    className="border-2 border-teal-500 bg-teal-50 rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center text-white">
                        <Zap size={32} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-black text-gray-900 mb-1">おまかせ自動割当</h4>
                        <p className="text-sm text-gray-600 font-medium">
                          システムが最適なセラピストを自動で割り当てます(推奨)
                        </p>
                      </div>
                      <ChevronRight size={28} className="text-teal-600 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>

                  {/* Therapist list */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {therapists.map((therapist) => {
                      const isAvailable = parseInt(therapist.id.replace(/\D/g, '')) % 2 === 1;
                      return (
                        <div
                          key={therapist.id}
                          onClick={() => isAvailable && handleBookWithTherapist(therapist)}
                          className={`border-2 rounded-2xl p-4 transition-all ${
                            isAvailable
                              ? 'border-teal-300 hover:shadow-xl cursor-pointer hover:-translate-y-1'
                              : 'border-gray-200 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex gap-4 items-start relative">
                            {isAvailable && (
                              <div className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-teal-500 text-white px-3 py-1 rounded-full text-[10px] font-black animate-pulse">
                                ⚡予約可
                              </div>
                            )}
                            
                            <div className="relative">
                              <img
                                src={therapist.avatar_url || `/therapists/${therapist.id}.jpg`}
                                alt={therapist.name}
                                className={`w-20 h-20 rounded-2xl object-cover ${
                                  isAvailable ? '' : 'grayscale'
                                }`}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(therapist.name)}&background=14b8a6&color=fff&size=200`;
                                }}
                              />
                              {!isAvailable && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/40 rounded-2xl">
                                  <Clock size={24} className="text-white" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1">
                              <h4 className="text-lg font-black text-gray-900 mb-1">
                                {therapist.name}
                              </h4>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex text-yellow-400">
                                  {[1, 2, 3, 4, 5].map((i) => (
                                    <Star
                                      key={i}
                                      size={14}
                                      fill={i <= Math.floor(therapist.rating) ? 'currentColor' : 'none'}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm font-bold text-gray-600">
                                  {therapist.rating.toFixed(1)}
                                </span>
                                <span className="text-xs text-gray-400">
                                  ({therapist.review_count}件)
                                </span>
                              </div>
                              {!isAvailable && (
                                <p className="text-xs text-gray-500 font-medium">
                                  現在予約受付不可
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AmenityItem = ({ icon, label, desc }: any) => (
  <div className="space-y-2">
     <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-teal-600 shadow-inner group-hover:scale-110 transition-transform">
        {icon}
     </div>
     <div>
        <p className="text-xs font-black text-gray-900">{label}</p>
        <p className="text-[10px] text-gray-400 font-bold leading-tight">{desc}</p>
     </div>
  </div>
);

export default SiteDetail;
