
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, ShieldCheck, CheckCircle, ArrowRight, Building, Clock, Navigation } from 'lucide-react';
import { MOCK_SITES } from '../../constants';

const HostLP: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const site = MOCK_SITES.find(s => s.id === id) || MOCK_SITES[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Dynamic Hero */}
      <header className="relative h-[80vh] flex items-center justify-center text-white overflow-hidden">
        <img 
          src={`https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200`} 
          className="absolute inset-0 w-full h-full object-cover brightness-[0.4]" 
          alt={site.name}
        />
        <div className="relative z-10 max-w-4xl px-4 text-center space-y-6">
           <span className="bg-teal-600 text-white px-4 py-1 rounded-full font-bold text-xs uppercase tracking-widest shadow-lg">CARE CUBE Official Site</span>
           <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight">{site.name}</h1>
           <p className="text-xl md:text-2xl text-gray-200 font-medium">
             都会の喧騒を離れ、<br className="md:hidden"/>一瞬で心整うプライベート空間へ。
           </p>
           <button 
             onClick={() => navigate('/auth/register')}
             className="bg-white text-gray-900 px-10 py-5 rounded-full text-xl font-extrabold hover:bg-teal-500 hover:text-white transition-all shadow-2xl hover:scale-105"
           >
             今すぐ予約する (初回 ¥1,000 OFF)
           </button>
        </div>
      </header>

      {/* Feature Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-12 text-center">
         <div className="space-y-4">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto text-teal-600"><ShieldCheck size={32} /></div>
            <h3 className="text-xl font-bold">完全プライベート</h3>
            <p className="text-gray-500 text-sm">QRコードで入室。誰とも会わずに自分だけの時間を満喫できます。</p>
         </div>
         <div className="space-y-4">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto text-teal-600"><Star size={32} /></div>
            <h3 className="text-xl font-bold">プロによる施術</h3>
            <p className="text-gray-500 text-sm">国家資格保有者を中心とした厳選されたセラピストが担当します。</p>
         </div>
         <div className="space-y-4">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto text-teal-600"><Clock size={32} /></div>
            <h3 className="text-xl font-bold">最短1分で予約</h3>
            <p className="text-gray-500 text-sm">24時間いつでもアプリから即時予約・決済が可能です。</p>
         </div>
      </section>

      {/* site Info */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
           <div className="space-y-8">
              <h2 className="text-4xl font-bold text-gray-900">アクセス・設備</h2>
              <div className="space-y-6">
                 <div className="flex gap-4">
                    <MapPin className="text-teal-600 flex-shrink-0" />
                    <div>
                       <p className="font-bold">所在地</p>
                       <p className="text-gray-600">{site.address}</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <Building className="text-teal-600 flex-shrink-0" />
                    <div>
                       <p className="font-bold">店舗タイプ</p>
                       <p className="text-gray-600">ホテル常設プレミアムブース (24時間営業)</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 pt-4">
                    {['高速Wi-Fi', 'アロマ完備', '空気清浄機', '空調個別調整'].map(item => (
                       <div key={item} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <CheckCircle size={16} className="text-teal-500" /> {item}
                       </div>
                    ))}
                 </div>
              </div>
              <button className="flex items-center gap-2 text-teal-600 font-bold hover:underline">
                 <Navigation size={18} /> Google Maps で開く
              </button>
           </div>
           <div className="h-[400px] rounded-3xl overflow-hidden shadow-xl">
              <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" />
           </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-20 bg-gray-900 text-white text-center">
         <h2 className="text-3xl font-bold mb-8">まずは無料会員登録で特典をゲット</h2>
         <button 
           onClick={() => navigate('/auth/register')}
           className="bg-teal-500 text-white px-12 py-4 rounded-full font-bold text-lg hover:bg-teal-400 transition-all flex items-center gap-2 mx-auto"
         >
            会員登録して予約する <ArrowRight size={20} />
         </button>
      </footer>
    </div>
  );
};

export default HostLP;
