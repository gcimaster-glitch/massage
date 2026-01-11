
import React, { useState } from 'react';
import { 
  MapPin, Navigation, Search, Filter, 
  Building2, Star, Clock, ArrowRight, X, 
  Map as MapIcon, Layers, Target, Zap, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_SITES } from '../../constants';

const SiteMapSearch: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSite, setSelectedSite] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'MAP' | 'LIST'>('MAP');

  return (
    <div className="h-[calc(100vh-100px)] animate-fade-in text-gray-900 font-sans flex flex-col relative overflow-hidden bg-slate-100 rounded-[48px] shadow-2xl border border-white">
      
      {/* Search Overlay */}
      <div className="absolute top-8 left-8 right-8 z-30 flex flex-col md:flex-row gap-4">
         <div className="flex-1 bg-white/90 backdrop-blur-xl rounded-[32px] p-3 shadow-2xl border border-white flex items-center gap-4">
            <Search className="ml-4 text-gray-400" size={24} />
            <input type="text" placeholder="エリア、駅名、施設名で検索..." className="flex-1 bg-transparent border-0 font-black text-lg outline-none" />
            <button className="bg-gray-900 text-white px-8 py-4 rounded-[22px] font-black text-xs uppercase tracking-widest hover:bg-teal-600 transition-all shadow-lg">検索</button>
         </div>
         <div className="flex gap-2">
            <button className="bg-white/90 backdrop-blur-xl p-6 rounded-[28px] shadow-2xl text-gray-900 hover:bg-teal-600 hover:text-white transition-all"><Filter size={24}/></button>
            <button className="bg-white/90 backdrop-blur-xl p-6 rounded-[28px] shadow-2xl text-teal-600 hover:bg-teal-600 hover:text-white transition-all"><Target size={24}/></button>
         </div>
      </div>

      {/* Map Area (Mock Visual) */}
      <div className="flex-1 relative bg-slate-200">
         <img src="https://picsum.photos/1600/1000?grayscale&blur=2" className="w-full h-full object-cover opacity-60 contrast-125" />
         
         {/* Map Pins */}
         {MOCK_SITES.map((site, i) => (
           <button 
             key={site.id}
             onClick={() => setSelectedSite(site)}
             className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 hover:scale-125 ${selectedSite?.id === site.id ? 'z-20' : 'z-10'}`}
             style={{ top: `${20 + i * 15}%`, left: `${30 + i * 12}%` }}
           >
              <div className={`p-4 rounded-3xl border-4 border-white shadow-2xl flex items-center justify-center transition-all ${selectedSite?.id === site.id ? 'bg-teal-600 text-white scale-125' : 'bg-white text-teal-600'}`}>
                 <Building2 size={24} />
              </div>
              <div className="mt-2 bg-black/90 text-white text-[9px] font-black px-3 py-1.5 rounded-lg whitespace-nowrap shadow-2xl">
                 {site.name}
              </div>
           </button>
         ))}

         {/* Scanning Effect */}
         <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.1),transparent_50%)] animate-pulse"></div>
      </div>

      {/* Selected Site Drawer (Bottom) */}
      {selectedSite && (
        <div className="absolute bottom-8 left-8 right-8 z-40 animate-fade-in-up">
           <div className="bg-white/95 backdrop-blur-2xl p-10 rounded-[56px] shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-white flex flex-col md:flex-row items-center gap-10">
              <div className="w-full md:w-64 h-48 rounded-[40px] overflow-hidden shadow-xl border-4 border-white flex-shrink-0">
                 <img src={`https://picsum.photos/400/300?random=${selectedSite.id}`} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-6">
                 <div className="flex justify-between items-start">
                    <div>
                       <span className="bg-teal-50 text-teal-600 px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-teal-100 mb-3 inline-block">Instant Booking Available</span>
                       <h2 className="text-3xl font-black tracking-tighter text-gray-900">{selectedSite.name}</h2>
                       <p className="text-gray-400 font-bold flex items-center gap-2 mt-2 text-sm">
                          <MapPin size={18} className="text-teal-500" /> {selectedSite.address}
                       </p>
                    </div>
                    <button onClick={() => setSelectedSite(null)} className="p-3 bg-gray-100 rounded-full text-gray-400 hover:text-gray-900"><X size={20}/></button>
                 </div>
                 
                 <div className="flex gap-8">
                    <div className="flex items-center gap-2 text-yellow-500 font-black text-xl bg-yellow-50 px-4 py-1.5 rounded-2xl">
                       <Star size={18} fill="currentColor" /> 4.9
                    </div>
                    <div className="flex items-center gap-3 font-black text-gray-400 uppercase tracking-widest text-[11px]">
                       <Clock size={18} className="text-teal-500" /> 24時間営業
                    </div>
                    <div className="flex items-center gap-3 font-black text-teal-600 uppercase tracking-widest text-[11px]">
                       <Zap size={18} className="animate-pulse" /> 今すぐ予約可能
                    </div>
                 </div>
              </div>
              <button 
                onClick={() => navigate(`/app/site/${selectedSite.id}`)}
                className="w-full md:w-auto bg-gray-900 text-white px-16 py-7 rounded-[32px] font-black text-xl hover:bg-teal-600 transition-all shadow-2xl active:scale-95 flex items-center gap-4"
              >
                 このブースを選ぶ <ArrowRight size={28} />
              </button>
           </div>
        </div>
      )}

      {/* Floating View Controls */}
      <div className="absolute right-8 bottom-32 z-30 flex flex-col gap-3">
         <div className="bg-white/90 backdrop-blur-xl p-2 rounded-3xl shadow-2xl flex flex-col border border-white">
            <button className="p-4 text-gray-400 hover:text-teal-600 border-b border-gray-100"><Layers size={24}/></button>
            <button className="p-4 text-gray-900"><MapIcon size={24}/></button>
         </div>
      </div>
    </div>
  );
};

export default SiteMapSearch;
