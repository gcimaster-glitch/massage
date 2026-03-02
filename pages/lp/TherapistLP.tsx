import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Award, CheckCircle, Calendar, MessageSquare, ShieldCheck, Heart, ArrowRight, Loader2 } from 'lucide-react';

const TherapistLP: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/therapists/${id}`).then(r => r.ok ? r.json() : null),
    ])
      .then(([data]) => {
        if (data) {
          setTherapist(data.therapist || data);
          setReviews(data.reviews || []);
        }
      })
      .catch(() => setTherapist(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-teal-600" size={48} />
    </div>
  );

  if (!therapist) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500 font-bold">
      セラピスト情報が見つかりません
    </div>
  );

  const categories: string[] = (() => {
    const s = therapist.specialties || [];
    if (typeof s === 'string') {
      try { return JSON.parse(s); } catch { return s.split(',').map((x: string) => x.trim()); }
    }
    return s;
  })();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Profile */}
      <header className="bg-white border-b border-gray-100 pt-20 pb-12">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
           <div className="w-48 h-48 rounded-full overflow-hidden shadow-2xl border-4 border-white">
              <img
                src={therapist.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(therapist.name)}&size=200&background=14b8a6&color=fff&bold=true`}
                className="w-full h-full object-cover"
                alt={therapist.name}
                onError={(e) => {
                  const t = e.target as HTMLImageElement;
                  t.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(therapist.name)}&size=200&background=14b8a6&color=fff&bold=true`;
                }}
              />
           </div>
           <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                 {categories.map((c: string) => (
                   <span key={c} className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-bold border border-teal-100 uppercase tracking-tighter">
                     {c === 'LICENSED' ? '国家資格保有' : c === 'RELAXATION' ? 'リラクゼーション' : c}
                   </span>
                 ))}
                 {therapist.kyc_status === 'APPROVED' && (
                   <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100 flex items-center gap-1">
                     <CheckCircle size={12} /> 本人確認済
                   </span>
                 )}
              </div>
              <h1 className="text-4xl font-bold text-gray-900">{therapist.name}</h1>
              <div className="flex items-center justify-center md:justify-start gap-4">
                 <div className="flex items-center gap-1 text-yellow-500 font-bold text-xl">
                    <Star fill="currentColor" /> {therapist.rating || '5.0'}
                    <span className="text-gray-400 font-normal text-sm">({therapist.review_count || 0} reviews)</span>
                 </div>
                 {therapist.area_code && (
                   <>
                     <div className="h-4 w-px bg-gray-300"></div>
                     <p className="text-gray-500 font-medium flex items-center gap-1">
                        <MapPin size={18} /> {therapist.area_code}
                     </p>
                   </>
                 )}
              </div>
           </div>
           <div className="w-full md:w-auto">
              <button
                onClick={() => navigate(`/app/booking/new?therapistId=${therapist.id}`)}
                className="w-full bg-teal-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-teal-700 shadow-xl transition-all"
              >
                予約をリクエストする
              </button>
           </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-12">
           <section>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Award className="text-teal-600" /> 自己紹介・メッセージ</h3>
              <p className="text-gray-600 leading-relaxed text-lg bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                {therapist.bio || `初めまして、${therapist.name}です。プロフェッショナルなセラピストとして、お客様一人ひとりの体調に合わせた最適なアプローチを提供いたします。`}
              </p>
           </section>

           <section>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Calendar className="text-teal-600" /> 施術スタイル</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                    <h4 className="font-bold text-gray-900 mb-2">CARE CUBE (店舗)</h4>
                    <p className="text-xs text-gray-500">完全個室ブースにて対応可能です。</p>
                 </div>
                 <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
                    <h4 className="font-bold text-gray-900 mb-2">Mobile (出張)</h4>
                    <p className="text-xs text-gray-500">ご自宅や滞在先ホテルへ伺います。</p>
                 </div>
              </div>
           </section>

           {reviews.length > 0 && (
             <section>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><MessageSquare className="text-teal-600" /> 最近のレビュー</h3>
                <div className="space-y-4">
                   {reviews.slice(0, 3).map((rev: any, i: number) => (
                     <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                           <div className="flex gap-1 text-yellow-500">
                             {Array.from({ length: Math.min(rev.rating || 5, 5) }).map((_, j) => (
                               <Star key={j} size={14} fill="currentColor" />
                             ))}
                           </div>
                           <span className="text-xs text-gray-400">{rev.created_at ? new Date(rev.created_at).toLocaleDateString('ja-JP') : ''}</span>
                        </div>
                        <p className="text-gray-700 text-sm mb-2">{rev.comment}</p>
                        <p className="text-xs font-bold text-gray-500">— {rev.user_name || '匿名'}</p>
                     </div>
                   ))}
                </div>
             </section>
           )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
           <div className="bg-teal-900 text-white p-8 rounded-3xl shadow-xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><ShieldCheck size={20} /> Trust & Safety</h3>
              <p className="text-xs text-teal-100 leading-relaxed mb-6">
                HOGUSYでは、セラピストの身元確認、GPS監視、SOSボタンなどの安全対策を徹底しています。安心してプロの施術をお楽しみください。
              </p>
              <ul className="text-xs space-y-3">
                 <li className="flex items-center gap-2"><CheckCircle size={14} className="text-teal-400" /> 厳格な面談審査通過</li>
                 <li className="flex items-center gap-2"><CheckCircle size={14} className="text-teal-400" /> 資格証の原本確認済み</li>
                 <li className="flex items-center gap-2"><CheckCircle size={14} className="text-teal-400" /> 常時サポート体制</li>
              </ul>
           </div>

           <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm text-center">
              <Heart className="text-red-400 mx-auto mb-2" size={32} />
              <p className="text-sm font-bold text-gray-900">お気に入り登録</p>
              <p className="text-xs text-gray-500 mb-4">次回から簡単に予約できます</p>
              <button className="text-teal-600 font-bold text-xs hover:underline">お気に入りに追加</button>
           </div>
        </div>
      </main>

      {/* Floating CTA Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-2xl z-50">
         <button
           onClick={() => navigate(`/app/booking/new?therapistId=${therapist.id}`)}
           className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
         >
           今すぐ予約する <ArrowRight size={20} />
         </button>
      </div>
    </div>
  );
};

export default TherapistLP;
