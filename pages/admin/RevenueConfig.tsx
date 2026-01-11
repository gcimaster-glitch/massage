
import React, { useState } from 'react';
import { PieChart, Save, Info, UserPlus, Trash2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { MOCK_REVENUE_CONFIG } from '../../constants';

const AdminRevenueConfig: React.FC = () => {
  const [config, setConfig] = useState(MOCK_REVENUE_CONFIG);
  
  const [specialRates, setSpecialRates] = useState([
    { id: 't1', name: '田中 有紀', rate: 75, reason: '特別講師契約' },
    { id: 't4', name: '高橋 誠', rate: 70, reason: '国家資格加算' },
  ]);

  const total = config.therapistPercentage + config.hostPercentage + config.affiliatePercentage + config.platformPercentage;
  const isValid = total === 100;

  const handleSave = () => {
    alert('配分ルールおよび個別特別レートを保存しました。');
  };

  return (
    <div className="space-y-10 pb-20 animate-fade-in text-gray-900 font-sans">
      <div>
        <h1 className="text-3xl font-black tracking-tighter">グローバル売上配分・特別契約管理</h1>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.3em] mt-1">Revenue Hierarchy & Overrides</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* 1. Standard Splits */}
        <section className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 space-y-8">
           <div className="flex items-center gap-3">
              <PieChart className="text-teal-600" />
              <h2 className="text-xl font-black">本部標準配分 (Global Standard)</h2>
           </div>

           <div className="space-y-6">
              <RateInput label="直属セラピスト (Standard)" value={config.therapistPercentage} onChange={v => setConfig({...config, therapistPercentage: v})} />
              <RateInput label="施設ホスト" value={config.hostPercentage} onChange={v => setConfig({...config, hostPercentage: v})} />
              <RateInput label="アフィリエイター" value={config.affiliatePercentage} onChange={v => setConfig({...config, affiliatePercentage: v})} />
              <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                 <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-black text-gray-400">プラットフォーム純益</span>
                    <span className="text-2xl font-black text-teal-600">{config.platformPercentage}%</span>
                 </div>
                 <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex shadow-inner">
                    <div className="bg-blue-500 h-full" style={{width: `${config.therapistPercentage}%`}}></div>
                    <div className="bg-orange-500 h-full" style={{width: `${config.hostPercentage}%`}}></div>
                    <div className="bg-purple-500 h-full" style={{width: `${config.affiliatePercentage}%`}}></div>
                    <div className="bg-teal-500 h-full" style={{width: `${config.platformPercentage}%`}}></div>
                 </div>
              </div>
           </div>

           <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Integrity: {isValid ? 'OK (100%)' : 'ERROR'}</p>
              <button onClick={handleSave} disabled={!isValid} className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-black text-xs hover:bg-teal-600 disabled:bg-gray-100 transition-all">
                 標準設定を保存
              </button>
           </div>
        </section>

        {/* 2. Therapist Overrides */}
        <section className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 space-y-8">
           <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <ShieldCheck className="text-indigo-600" />
                 <h2 className="text-xl font-black">セラピスト個別配分 (Overrides)</h2>
              </div>
              <button className="p-3 bg-gray-50 rounded-2xl text-indigo-600 hover:bg-indigo-50 transition-all"><UserPlus size={20}/></button>
           </div>

           <div className="space-y-4">
              {specialRates.map(sr => (
                <div key={sr.id} className="p-6 bg-gray-50 rounded-[32px] border border-transparent hover:border-indigo-100 transition-all flex items-center justify-between group">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-indigo-600 shadow-sm">{sr.name.charAt(0)}</div>
                      <div>
                         <p className="font-black text-gray-900">{sr.name}</p>
                         <p className="text-[10px] text-gray-400 font-bold">{sr.reason}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="text-right">
                         <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Override Rate</p>
                         <input type="number" value={sr.rate} className="w-16 bg-white border-0 rounded-lg text-center font-black text-lg focus:ring-2 ring-indigo-500/20" />
                         <span className="font-black ml-1 text-gray-400">%</span>
                      </div>
                      <button onClick={() => setSpecialRates(specialRates.filter(r => r.id !== sr.id))} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={18}/></button>
                   </div>
                </div>
              ))}
              <p className="text-[10px] text-gray-400 font-bold px-6 leading-relaxed">
                 ※ ここに登録されていない直属セラピストには、左記の「標準配分」が自動適用されます。
                 提携事務所所属者の配分は事務所側で管理されます。
              </p>
           </div>
        </section>
      </div>

      {/* Simulator */}
      <section className="bg-gray-900 text-white p-12 rounded-[64px] shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500 rounded-full blur-[120px] opacity-10"></div>
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="space-y-4 max-w-md">
               <h3 className="text-3xl font-black tracking-tighter flex items-center gap-3"><Zap className="text-teal-400" /> Revenue Flow Simulator</h3>
               <p className="text-sm font-bold text-gray-400 leading-relaxed">設定が正しく反映されているか確認しましょう。<br/>売上10,000円（店舗予約）の場合の試算です。</p>
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
               <SimCard label="セラピスト" val={`¥${(10000 * config.therapistPercentage/100).toLocaleString()}`} />
               <SimCard label="施設ホスト" val={`¥${(10000 * config.hostPercentage/100).toLocaleString()}`} />
               <SimCard label="アフィリエイト" val={`¥${(10000 * config.affiliatePercentage/100).toLocaleString()}`} />
               <SimCard label="本部収益" val={`¥${(10000 * config.platformPercentage/100).toLocaleString()}`} color="text-teal-400" />
            </div>
         </div>
      </section>
    </div>
  );
};

const RateInput = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[32px] border border-transparent focus-within:border-teal-500/20 focus-within:bg-white transition-all shadow-inner">
    <span className="font-black text-sm text-gray-600">{label}</span>
    <div className="flex items-center gap-3">
       <input 
         type="number" 
         className="w-20 bg-white border-2 border-gray-100 rounded-xl px-4 py-2 font-black text-right text-lg outline-none focus:border-teal-500" 
         value={value} 
         onChange={e => onChange(Number(e.target.value))}
       />
       <span className="font-black text-gray-300">%</span>
    </div>
  </div>
);

const SimCard = ({ label, val, color = "text-white" }: { label: string, val: string, color?: string }) => (
  <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] text-center">
     <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">{label}</p>
     <p className={`text-xl font-black ${color}`}>{val}</p>
  </div>
);

export default AdminRevenueConfig;
