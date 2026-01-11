
import React, { useState } from 'react';
import { Lock, Unlock, Sun, Thermometer, Music, Wind, Zap, Play, Square } from 'lucide-react';

const CubeController: React.FC = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [temp, setTemp] = useState(24);
  const [scene, setScene] = useState<'IDLE' | 'ZEN' | 'ENERGY'>('IDLE');

  const handleToggleLock = () => {
    const action = isLocked ? '解錠' : '施錠';
    if (confirm(`CARE CUBE を${action}しますか？`)) {
      setIsLocked(!isLocked);
    }
  };

  return (
    <div className="bg-gray-900 rounded-[48px] p-10 text-white space-y-10 shadow-2xl border border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-indigo-500 to-teal-500 animate-[shimmer_2s_linear_infinite]"></div>
      
      <div className="flex justify-between items-center">
         <div>
            <h3 className="font-black text-lg">Cube Smart Controller</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">IoT Environment Link</p>
         </div>
         <button 
           onClick={handleToggleLock}
           className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-500 ${isLocked ? 'bg-white text-gray-900' : 'bg-teal-500 text-white shadow-[0_0_30px_rgba(20,184,166,0.4)]'}`}
         >
            {isLocked ? <Lock size={28} /> : <Unlock size={28} className="animate-bounce" />}
         </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="bg-white/5 p-6 rounded-[32px] border border-white/5">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-4">Temperature</p>
            <div className="flex items-center justify-between">
               <button onClick={() => setTemp(t => t-1)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">-</button>
               <span className="text-2xl font-black">{temp}°C</span>
               <button onClick={() => setTemp(t => t+1)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">+</button>
            </div>
         </div>
         <div className="bg-white/5 p-6 rounded-[32px] border border-white/5">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Lighting Scene</p>
            <div className="flex gap-2">
               <button onClick={() => setScene('ZEN')} className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${scene === 'ZEN' ? 'bg-teal-500 text-white' : 'bg-white/5 text-gray-500'}`}>ZEN</button>
               <button onClick={() => setScene('ENERGY')} className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${scene === 'ENERGY' ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-500'}`}>BIO</button>
            </div>
         </div>
      </div>

      <div className="pt-6 border-t border-white/5">
         <div className="flex items-center gap-4 bg-black/40 p-4 rounded-3xl border border-white/5">
            <div className="w-10 h-10 bg-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center">
               <Music size={20} />
            </div>
            <div className="flex-1 overflow-hidden">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Now Playing</p>
               <p className="text-xs font-bold truncate">Deep Forest - Healing Ambient</p>
            </div>
            <div className="flex gap-2">
               <button className="p-2 text-white/40 hover:text-white"><Square size={16} /></button>
               <button className="p-2 text-white hover:scale-110 transition-transform"><Play size={16} /></button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CubeController;
