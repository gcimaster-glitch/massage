
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
      <div className="bg-[#fdfcfb] pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 tracking-tight leading-tight">
            料金について
          </h1>
          <p className="text-gray-600 font-bold text-xl leading-relaxed">
            安心のワンプライス設定。<br />
            事前決済で当日のやり取りもスムーズ。
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-20 space-y-32">
        {/* 1. 料金の仕組み */}
        <section className="space-y-12">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
             <div className="bg-teal-600 p-10 text-white text-center">
                <h2 className="text-3xl font-black">合計料金の仕組み</h2>
             </div>
             <div className="p-12 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16">
                <div className="text-center">
                   <p className="text-sm font-bold text-gray-500 mb-3">サービス</p>
                   <p className="text-3xl font-black text-gray-900">コース料金</p>
                </div>
                <span className="text-4xl text-gray-300 font-light">+</span>
                <div className="text-center">
                   <p className="text-sm font-bold text-gray-500 mb-3">場所</p>
                   <p className="text-3xl font-black text-gray-900">出張費 / 施設料</p>
                </div>
                <span className="text-4xl text-gray-300 font-light">+</span>
                <div className="text-center">
                   <p className="text-sm font-bold text-gray-500 mb-3">オプション</p>
                   <p className="text-3xl font-black text-gray-900">指名料など</p>
                </div>
             </div>
             <div className="bg-gray-50 p-8 text-center border-t border-gray-100">
                <p className="text-base text-gray-600 font-bold">※ 全て税込価格。予約確定前に最終金額を必ず提示します。</p>
             </div>
          </div>
        </section>

        {/* 2. 主なメニュー */}
        <section className="space-y-12">
           <div className="flex items-center gap-4 border-l-8 border-teal-600 pl-8">
              <h2 className="text-4xl font-black text-gray-900">主なメニュー</h2>
           </div>
           <div className="grid md:grid-cols-2 gap-8">
              {courses.map((c, i) => (
                <div key={i} className="bg-white p-10 rounded-3xl border-2 border-gray-100 shadow-lg hover:shadow-2xl hover:border-teal-200 transition-all group">
                   <div className="flex justify-between items-start mb-6">
                      <h4 className="text-3xl font-black text-gray-900 group-hover:text-teal-600 transition-colors">{c.name}</h4>
                      <span className="text-2xl font-black text-teal-600">{c.price}</span>
                   </div>
                   <p className="text-base text-gray-600 font-medium mb-8 leading-relaxed">{c.desc}</p>
                   <div className="flex flex-wrap gap-3">
                      {c.tags.map(t => <span key={t} className="text-sm font-bold bg-gray-100 text-gray-600 px-4 py-2 rounded-full">{t}</span>)}
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* 3. 選べる施術時間 */}
        <section className="bg-gray-900 rounded-3xl p-16 text-white overflow-hidden relative">
           <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2"></div>
           <h2 className="text-3xl font-black mb-12 flex items-center gap-4 relative z-10">
              <Clock className="text-teal-400" size={36} /> 選べる施術時間
           </h2>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-6 relative z-10">
              {[60, 90, 120, 150, 180].map(m => (
                <div key={m} className="bg-white/10 border-2 border-white/20 p-8 rounded-2xl text-center hover:bg-white/20 transition-all">
                   <p className="text-5xl font-black mb-2">{m}</p>
                   <p className="text-sm font-bold text-teal-400">分</p>
                </div>
              ))}
           </div>
           <p className="mt-12 text-gray-300 text-base font-bold text-center relative z-10 leading-relaxed">
             ※ 60分未満のコースはございません。<br />
             じっくりと時間をかけた本格的な施術を提供します。
           </p>
        </section>

        {/* 4. 店舗（CARE CUBE）利用料 */}
        <section className="space-y-12">
           <div className="flex items-center gap-4 border-l-8 border-orange-500 pl-8">
              <h2 className="text-4xl font-black text-orange-600">店舗利用料</h2>
           </div>
           <div className="bg-orange-50 rounded-3xl p-12 border-2 border-orange-200">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                 <div className="flex-1 space-y-6">
                    <p className="text-xl font-bold text-gray-900 leading-relaxed">
                      CARE CUBE設置店舗をご利用の場合、<br />
                      施設維持費として利用料を申し受けます。
                    </p>
                    <div className="space-y-4">
                       <div className="flex items-center gap-3 text-base text-gray-700 font-bold">
                          <CheckCircle size={24} className="text-orange-500 flex-shrink-0" /> 
                          60分あたり最低 2,000円
                       </div>
                       <div className="flex items-center gap-3 text-base text-gray-700 font-bold">
                          <CheckCircle size={24} className="text-orange-500 flex-shrink-0" /> 
                          提携ホストの特別設定料金
                       </div>
                    </div>
                    <p className="text-sm text-orange-700 font-bold bg-white p-6 rounded-2xl leading-relaxed">
                      ※ 上記のいずれか高い方が適用されます。<br />
                      出張訪問の場合はこの費用はかかりません。
                    </p>
                 </div>
                 <div className="w-56 h-56 bg-white rounded-full shadow-2xl flex flex-col items-center justify-center p-8 border-4 border-orange-300">
                    <Zap className="text-orange-500 mb-4" size={48} />
                    <span className="text-sm font-bold text-gray-500 mb-2">基本料金</span>
                    <span className="text-3xl font-black text-gray-900">¥2,000〜</span>
                 </div>
              </div>
           </div>
        </section>

        {/* 5. CTA */}
        <section className="text-center py-12">
           <button 
             onClick={() => navigate('/therapists')}
             className="bg-gray-900 text-white px-16 py-7 rounded-2xl font-black text-2xl shadow-2xl hover:bg-teal-600 transition-all flex items-center gap-4 mx-auto active:scale-95"
           >
              まずはセラピストを探す <ArrowRight size={28} />
           </button>
        </section>
      </div>
    </PortalLayout>
  );
};

export default FeeStructure;
