
import React, { useState } from 'react';
import { MOCK_SITES } from '../../constants';
// Added ChevronRight to fix "Cannot find name 'ChevronRight'" error on line 120
import { Building, MapPin, Settings, Video, Clock, Zap, Droplets, CheckCircle2, AlertCircle, ShoppingCart, ChevronRight } from 'lucide-react';

const HostDashboard: React.FC = () => {
  const totalRevenue = 248000;
  const [activeBooths] = useState(12);
  const [totalBooths] = useState(15);

  const [boothStates] = useState([
    { id: 'CUBE-001', status: '利用可能', cleanliness: '清掃済', towels: 12, oil: '80%' },
    { id: 'CUBE-002', status: '施術中', cleanliness: '使用中', towels: 5, oil: '40%' },
    { id: 'CUBE-003', status: '準備中', cleanliness: '要清掃', towels: 0, oil: '10%' },
    { id: 'CUBE-004', status: '利用可能', cleanliness: '清掃済', towels: 15, oil: '95%' },
  ]);

  return (
    <div className="space-y-10 animate-fade-in pb-20 text-gray-900 font-sans px-4">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-black tracking-tighter">拠点運営統括ボード</h1>
           <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.3em] mt-2">Facility & Inventory Management</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-teal-50 text-teal-700 px-8 py-4 rounded-3xl font-black text-xs shadow-sm border border-teal-100 flex items-center gap-3 transition-all hover:bg-teal-100">
              <Zap size={16} className="text-teal-500" fill="currentColor" /> 
              今月の受取収益(暫定): <span className="text-lg font-black ml-1">¥{totalRevenue.toLocaleString()}</span>
           </div>
        </div>
      </div>

      {/* 状況・在庫オーバービュー */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">現在の平均稼働率</p>
            <h3 className="text-4xl font-black text-gray-900">{(activeBooths/totalBooths*100).toFixed(0)}<span className="text-lg ml-1 opacity-30">%</span></h3>
         </div>
         <div className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1 flex items-center gap-2">
               <AlertCircle size={10}/> 清掃・メンテナンス待ち
            </p>
            <h3 className="text-4xl font-black text-orange-600">3 <span className="text-lg font-black opacity-30">件</span></h3>
         </div>
         <div className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1 flex items-center gap-2">
               <Droplets size={10}/> 消耗品不足アラート
            </p>
            <h3 className="text-4xl font-black text-red-600">1 <span className="text-lg font-black opacity-30">箇所</span></h3>
         </div>
         <div className="bg-gray-900 text-white p-8 rounded-[48px] flex flex-col justify-center items-center gap-3 shadow-xl hover:bg-teal-600 transition-all cursor-pointer active:scale-95 group">
            <ShoppingCart size={24} className="text-teal-400 group-hover:text-white" />
            <span className="text-[11px] font-black uppercase tracking-widest">備品を補充発注する</span>
         </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center px-4 mb-2">
               <h2 className="text-xl font-black flex items-center gap-3 tracking-tight"><Building size={24} className="text-teal-600" /> 各ブース・動態モニタリング</h2>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">最終同期: 2分前</span>
            </div>
            
            <div className="grid gap-4">
               {boothStates.map(booth => (
                 <div key={booth.id} className="bg-white p-10 rounded-[48px] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-10 group hover:shadow-2xl hover:border-teal-500/20 transition-all">
                    <div className="flex items-center gap-8">
                       <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center font-black text-lg ${booth.cleanliness === '清掃済' ? 'bg-teal-50 text-teal-600 shadow-inner' : 'bg-orange-50 text-orange-600 shadow-inner'}`}>
                          {booth.id.split('-')[1]}
                       </div>
                       <div className="space-y-1">
                          <h4 className="font-black text-xl text-gray-900 tracking-tight">{booth.id}</h4>
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${booth.status === '利用可能' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                             {booth.status}
                          </span>
                       </div>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-10 md:px-12">
                       <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest">衛生状態</p>
                          <p className={`text-sm font-black ${booth.cleanliness === '清掃済' ? 'text-teal-600' : 'text-orange-600 animate-pulse'}`}>
                             {booth.cleanliness}
                          </p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest">リネン在庫</p>
                          <p className={`text-sm font-black ${booth.towels < 3 ? 'text-red-600' : 'text-gray-900'}`}>{booth.towels} 枚</p>
                       </div>
                       <div className="hidden md:block">
                          <p className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest">オイル残量</p>
                          <p className="text-sm font-black text-gray-900">{booth.oil}</p>
                       </div>
                    </div>

                    <button className="bg-gray-50 text-gray-400 px-8 py-4 rounded-[24px] text-[10px] font-black hover:bg-gray-900 hover:text-white transition-all uppercase tracking-widest active:scale-95 shadow-sm">
                       履歴
                    </button>
                 </div>
               ))}
            </div>
         </div>

         <div className="space-y-8">
            <section className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 space-y-10">
               <div className="space-y-2">
                  <h3 className="font-black text-gray-900 flex items-center gap-3 text-lg tracking-tight">
                     <Droplets className="text-blue-500" /> メンテナンス指令
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Maintenance Dispatch</p>
               </div>
               
               <div className="space-y-4">
                  <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                     <p className="text-[10px] font-black text-teal-600 uppercase mb-2 tracking-widest">直近のアクション</p>
                     <p className="text-sm font-bold text-gray-700 leading-relaxed">
                        田中 有紀さんが **CUBE-001** の清掃および除菌を完了しました。
                     </p>
                     <p className="text-[10px] text-gray-400 mt-2 font-mono">2025/05/21 14:05</p>
                     <button className="mt-4 text-[10px] font-black text-teal-600 hover:underline flex items-center gap-2">エビデンス写真を確認 <ChevronRight size={12}/></button>
                  </div>
                  <div className="p-6 bg-red-50 rounded-[32px] border border-red-100">
                     <p className="text-[10px] font-black text-red-600 uppercase mb-2 tracking-widest">異常検知</p>
                     <p className="text-sm font-bold text-red-900 leading-relaxed">
                        **CUBE-003**: タオル在庫がゼロになりました。次回の予約開始までに補充が必要です。
                     </p>
                  </div>
               </div>
            </section>

            <button className="w-full py-8 bg-teal-600 text-white rounded-[40px] font-black text-lg shadow-xl shadow-teal-500/20 hover:bg-teal-700 transition-all flex items-center justify-center gap-4 active:scale-95">
               <CheckCircle2 size={24} /> 全拠点の正常性を承認
            </button>
         </div>
      </div>
    </div>
  );
};

export default HostDashboard;
