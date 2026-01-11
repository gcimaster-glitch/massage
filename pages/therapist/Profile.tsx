
import React, { useState } from 'react';
import { JapaneseYen, Clock, Save, ShieldCheck, AlertCircle, CheckCircle, Info, ArrowUpRight } from 'lucide-react';
import { MOCK_THERAPISTS } from '../../constants';

const TherapistProfile: React.FC = () => {
  const therapist = MOCK_THERAPISTS[0];

  // --- Pricing State ---
  const [base60, setBase60] = useState(7000); // 60m base
  const [add30, setAdd30] = useState(3000);  // extension per 30m
  const [status, setStatus] = useState<'IDLE' | 'PENDING' | 'APPROVED'>('APPROVED');

  const handleApply = () => {
    setStatus('PENDING');
    alert('料金改定の承認申請を運営に送信しました。反映まで通常1〜2営業日かかります。');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      <div className="flex justify-between items-end px-2">
         <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">価格・報酬設定</h1>
            <p className="text-gray-400 font-bold uppercase tracking-[0.3em] mt-2 text-xs">Pricing & Reward Editor</p>
         </div>
         {status === 'PENDING' && (
           <div className="bg-orange-50 text-orange-600 px-6 py-2 rounded-2xl font-black text-xs flex items-center gap-2 border border-orange-100 shadow-sm animate-pulse">
             <AlertCircle size={14} /> 現在、承認待ちの申請があります
           </div>
         )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left: Guidelines */}
        <div className="md:col-span-1 space-y-6">
           <div className="bg-gray-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 rounded-full blur-3xl opacity-20"></div>
              <h3 className="font-black text-lg mb-6 flex items-center gap-2"><ShieldCheck className="text-teal-400" /> 設定ルール</h3>
              <ul className="text-xs space-y-4 font-bold text-gray-400 leading-relaxed">
                 <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-1.5 flex-shrink-0" /> 60分単価の推奨範囲は ¥6,000〜¥12,000 です。</li>
                 <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-1.5 flex-shrink-0" /> コース料金（売上）の65%〜75%がセラピストの報酬となります。</li>
                 <li className="flex gap-3"><div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-1.5 flex-shrink-0" /> 価格改定は週1回まで申請可能です。</li>
              </ul>
           </div>
           
           <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Info size={14} /> 施設利用料について
              </h4>
              <p className="text-[11px] text-gray-500 leading-relaxed font-bold">
                店舗利用時、お客様が負担する施設料（¥2,000〜）はセラピスト報酬には含まれません。セラピストは設定した施術料に対して配分を受け取ります。
              </p>
           </div>
        </div>

        {/* Right: Pricing Form */}
        <div className="md:col-span-2 space-y-6">
           <div className="bg-white p-12 rounded-[56px] shadow-sm border border-gray-100">
              <div className="space-y-10">
                 <div>
                    <label className="block text-[10px] font-black text-teal-600 uppercase tracking-widest mb-4 ml-2">主コース基本単価 (60分)</label>
                    <div className="relative group">
                       <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-teal-50 text-teal-600 w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-transform group-focus-within:scale-110">¥</div>
                       <input 
                         type="number" 
                         className="w-full pl-24 pr-8 py-7 bg-white border border-gray-200 rounded-[32px] text-3xl font-black text-gray-900 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all placeholder:text-gray-200 shadow-inner" 
                         value={base60}
                         onChange={e => setBase60(Number(e.target.value))}
                       />
                       <span className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-300 font-black">円 / 60分</span>
                    </div>
                 </div>

                 <div>
                    <label className="block text-[10px] font-black text-teal-600 uppercase tracking-widest mb-4 ml-2">延長加算単価 (30分ごと)</label>
                    <div className="relative group">
                       <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-orange-50 text-orange-600 w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-transform group-focus-within:scale-110"><Clock size={20} /></div>
                       <input 
                         type="number" 
                         className="w-full pl-24 pr-8 py-7 bg-white border border-gray-200 rounded-[32px] text-3xl font-black text-gray-900 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all placeholder:text-gray-200 shadow-inner" 
                         value={add30}
                         onChange={e => setAdd30(Number(e.target.value))}
                       />
                       <span className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-300 font-black">+ 円 / 30分</span>
                    </div>
                 </div>
              </div>

              {/* Simulation Result */}
              <div className="mt-12 pt-10 border-t border-gray-50">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 text-center">Preview: Customer Prices</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-teal-50 rounded-[32px] text-center border border-teal-100">
                       <p className="text-[10px] font-black text-teal-700 uppercase mb-2">90分コース表示</p>
                       <p className="text-2xl font-black text-teal-900 tracking-tighter">¥{(base60 + add30).toLocaleString()}</p>
                    </div>
                    <div className="p-6 bg-teal-50 rounded-[32px] text-center border border-teal-100">
                       <p className="text-[10px] font-black text-teal-700 uppercase mb-2">120分コース表示</p>
                       <p className="text-2xl font-black text-teal-900 tracking-tighter">¥{(base60 + add30 * 2).toLocaleString()}</p>
                    </div>
                 </div>
              </div>

              <button 
                onClick={handleApply}
                disabled={status === 'PENDING'}
                className="w-full mt-12 bg-gray-900 text-white py-6 rounded-[32px] font-black text-lg shadow-2xl hover:bg-teal-600 transition-all flex items-center justify-center gap-3 disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none active:scale-95"
              >
                <Save /> 設定を保存して承認申請
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-6 font-bold">
                 ※ 申請内容は運営スタッフが24時間以内にチェックします。
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistProfile;
