
import React from 'react';
import PortalLayout from './PortalLayout';
import { JapaneseYen, Clock, ShieldCheck, CheckCircle, Info, ArrowRight, Zap, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeeStructure: React.FC = () => {
  const navigate = useNavigate();

  const courses = [
    { name: 'ボディケア', price: '¥6,600〜', desc: '衣服の上から全身をほぐします。', tags: ['肩こり・腰痛', '疲労回復'] },
    { name: 'アロマオイル', price: '¥8,200〜', desc: '精油の香りに包まれリンパを流します。', tags: ['リラックス', 'むくみ解消'] },
    { name: 'タイ古式', price: '¥7,500〜', desc: '「二人でするヨガ」で深層を伸ばします。', tags: ['柔軟性UP', '全身調整'] },
    { name: 'フットケア', price: '¥6,000〜', desc: '足裏の反射区を刺激し器官を整えます。', tags: ['足の疲れ', '内臓ケア'] },
  ];

  return (
    <PortalLayout>
      <div className="bg-[#fdfcfb] pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tighter">
            料金について
          </h1>
          <p className="text-gray-500 font-bold text-lg">
            安心のワンプライス設定。事前決済で当日のやり取りもスムーズ。
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-24">
        {/* 1. Pricing Concept */}
        <section className="space-y-12">
          <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
             <div className="bg-teal-600 p-8 text-white text-center">
                <h2 className="text-2xl font-black">合計料金の仕組み</h2>
             </div>
             <div className="p-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
                <div className="text-center">
                   <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Service</p>
                   <p className="text-2xl font-black text-gray-900">コース料金</p>
                </div>
                <span className="text-3xl text-gray-300 font-light">+</span>
                <div className="text-center">
                   <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Location</p>
                   <p className="text-2xl font-black text-gray-900">出張費 / 施設料</p>
                </div>
                <span className="text-3xl text-gray-300 font-light">+</span>
                <div className="text-center">
                   <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Optional</p>
                   <p className="text-2xl font-black text-gray-900">指名料・オプション</p>
                </div>
             </div>
             <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
                <p className="text-sm text-gray-500 font-bold">※ 全て税込価格。予約確定前に最終金額を必ず提示します。</p>
             </div>
          </div>
        </section>

        {/* 2. Main Courses (Hogugu Style) */}
        <section className="space-y-10">
           <div className="flex items-center gap-3 border-l-8 border-teal-600 pl-6">
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter">主なメニュー</h2>
           </div>
           <div className="grid md:grid-cols-2 gap-6">
              {courses.map((c, i) => (
                <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                   <div className="flex justify-between items-start mb-4">
                      <h4 className="text-2xl font-black text-gray-900 group-hover:text-teal-600 transition-colors">{c.name}</h4>
                      <span className="text-xl font-black text-teal-600 tracking-tighter">{c.price}</span>
                   </div>
                   <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">{c.desc}</p>
                   <div className="flex flex-wrap gap-2">
                      {c.tags.map(t => <span key={t} className="text-[10px] font-black bg-gray-100 text-gray-400 px-3 py-1.5 rounded-full">{t}</span>)}
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* 3. Duration Matrix */}
        <section className="bg-gray-900 rounded-[48px] p-12 text-white overflow-hidden relative">
           <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2"></div>
           <h2 className="text-2xl font-black mb-10 flex items-center gap-3"><Clock className="text-teal-400" /> 選べる施術時間</h2>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[60, 90, 120, 150, 180].map(m => (
                <div key={m} className="bg-white/10 border border-white/10 p-6 rounded-3xl text-center">
                   <p className="text-3xl font-black mb-1 tracking-tighter">{m}</p>
                   <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Minutes</p>
                </div>
              ))}
           </div>
           <p className="mt-8 text-gray-400 text-sm font-bold text-center">
             ※ 60分未満のコースはございません。じっくりと時間をかけた本格的な施術を提供します。
           </p>
        </section>

        {/* 4. Onsite Logic (CARE CUBE) */}
        <section className="space-y-10">
           <div className="flex items-center gap-3 border-l-8 border-orange-500 pl-6">
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter text-orange-600">店舗（CARE CUBE）利用料</h2>
           </div>
           <div className="bg-orange-50 rounded-[40px] p-10 border border-orange-100">
              <div className="flex flex-col md:flex-row gap-10 items-center">
                 <div className="flex-1 space-y-4">
                    <p className="text-lg font-bold text-gray-900 leading-relaxed">
                      CARE CUBE設置店舗をご利用の場合、施設維持費として利用料を申し受けます。
                    </p>
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 text-sm text-gray-700 font-black">
                          <CheckCircle size={18} className="text-orange-500" /> 60分あたり最低 2,000円
                       </div>
                       <div className="flex items-center gap-2 text-sm text-gray-700 font-black">
                          <CheckCircle size={18} className="text-orange-500" /> 提携ホストの特別設定料金
                       </div>
                    </div>
                    <p className="text-xs text-orange-600 font-bold bg-white/50 p-4 rounded-2xl">
                      ※ 上記のいずれか高い方が適用されます。出張訪問の場合はこの費用はかかりません。
                    </p>
                 </div>
                 <div className="w-48 h-48 bg-white rounded-full shadow-2xl flex flex-col items-center justify-center p-6 border-4 border-orange-200">
                    <Zap className="text-orange-500 mb-2" size={40} />
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Base Fee</span>
                    <span className="text-2xl font-black text-gray-900 tracking-tighter">¥2,000〜</span>
                 </div>
              </div>
           </div>
        </section>

        {/* 5. CTA */}
        <section className="text-center py-10">
           <button 
             onClick={() => navigate('/therapists')}
             className="bg-gray-900 text-white px-12 py-6 rounded-full font-black text-xl shadow-2xl hover:bg-teal-600 transition-all flex items-center gap-4 mx-auto active:scale-95"
           >
              まずはセラピストを探す <ArrowRight size={24} />
           </button>
        </section>
      </div>
    </PortalLayout>
  );
};

export default FeeStructure;
