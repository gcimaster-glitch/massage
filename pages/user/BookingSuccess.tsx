
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CheckCircle, Calendar, MapPin, User, ArrowRight, 
  ShieldCheck, Smartphone, Edit3, Heart, Sparkles, ChevronRight,
  Mail, Building2, UserCheck, Shield
} from 'lucide-react';

const BookingSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('id') || 'B-7772';
  const isNewUser = searchParams.get('new') === 'true';

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-20 animate-fade-in text-gray-900 font-sans">
      <div className="text-center space-y-8 mb-16">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-teal-50 text-teal-600 rounded-[32px] flex items-center justify-center mx-auto shadow-inner ring-8 ring-teal-50/30 animate-bounce">
            <CheckCircle size={56} />
          </div>
          <div className="absolute -top-2 -right-2 text-yellow-500 animate-pulse">
            <Sparkles size={32} />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter">予約を確定しました</h1>
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">Booking & Registration Complete</p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* 1. 予約のサマリー */}
        <section className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 space-y-8">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-2">
            <Calendar size={14} className="text-teal-600" /> 予約内容の確認
          </h3>
          <div className="flex items-center justify-between gap-6 pb-8 border-b border-gray-50">
             <div>
                <p className="text-2xl font-black tracking-tight">深層筋ボディケア (60分)</p>
                <p className="text-sm font-bold text-gray-500 mt-1">2025年5月25日(日) 14:00 〜</p>
             </div>
             <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">予約番号</p>
                <p className="font-mono font-black text-lg text-teal-600">#{bookingId}</p>
             </div>
          </div>

          {/* New Email Notification Display */}
          <div className="bg-gray-50 rounded-[32px] p-8 space-y-6">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm text-teal-600"><Mail size={16}/></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Confirmation Dispatch</p>
             </div>
             <div className="grid grid-cols-3 gap-4">
                <EmailStatus icon={<UserCheck size={18}/>} label="User (あなた)" />
                <EmailStatus icon={<Shield size={18}/>} label="Therapist" />
                <EmailStatus icon={<Building2 size={18}/>} label="Facility Host" />
             </div>
             <p className="text-[10px] text-gray-400 font-bold text-center italic">
                ※ 各関係者へ、予約詳細および安全プロトコルの記載された確定メールを送信しました。
             </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400"><User size={24}/></div>
                <div className="text-left">
                   <p className="text-[10px] font-black text-gray-400 uppercase">担当セラピスト</p>
                   <p className="font-black">田中 有紀</p>
                </div>
             </div>
             <button 
               onClick={() => navigate(`/app/booking/${bookingId}`)}
               className="w-full md:w-auto px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-600 transition-all flex items-center justify-center gap-2 shadow-lg"
             >
                詳細・地図を見る <ArrowRight size={14} />
             </button>
          </div>
        </section>

        {/* 2. 新規ユーザー向け：プロフィール補完への誘導 */}
        {isNewUser && (
          <section className="animate-fade-in-up">
            <div className="bg-indigo-900 rounded-[56px] p-12 text-white relative overflow-hidden shadow-2xl border-b-[12px] border-indigo-950">
              <div className="absolute top-0 right-0 w-80 h-80 bg-teal-50 rounded-full blur-[150px] opacity-20 translate-x-1/3 -translate-y-1/3"></div>
              
              <div className="relative z-10 space-y-10">
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <span className="bg-teal-500 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg">New Member</span>
                      <h2 className="text-3xl font-black tracking-tight">アカウントを完成させてください</h2>
                   </div>
                   <p className="text-indigo-200 font-bold leading-relaxed">
                      Sootheは「信頼」で成り立つコミュニティです。事前に情報を補完することで、より安全でパーソナライズされた体験を提供できます。
                   </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                   <StepCard 
                     icon={<ShieldCheck className="text-teal-400" />} 
                     title="本人確認 (KYC)" 
                     desc="信頼スコアを向上させ、すべてのセラピストとマッチ可能に"
                     onClick={() => navigate('/app/account/kyc')} 
                   />
                   <StepCard 
                     icon={<Edit3 className="text-indigo-400" />} 
                     title="身体のお悩み入力" 
                     desc="事前に入力することで、当日のカウンセリングがスムーズに"
                     onClick={() => navigate('/app/account/wellness')} 
                   />
                </div>

                <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                   <p className="text-xs font-bold text-indigo-300">
                     ※ パスワード設定用のURLをメールでお送りしました。
                   </p>
                   <button 
                     onClick={() => navigate('/app/bookings')}
                     className="text-white/40 hover:text-white font-black text-xs uppercase tracking-widest transition-colors"
                   >
                     今はスキップして履歴へ
                   </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      <div className="mt-20 text-center">
         <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.5em]">Wellness Infrastructure by Soothe Japan</p>
      </div>
    </div>
  );
};

const EmailStatus = ({ icon, label }: any) => (
  <div className="flex flex-col items-center gap-3">
     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-teal-500 shadow-sm border border-gray-100 relative group overflow-hidden">
        {icon}
        <div className="absolute inset-0 bg-teal-500/10 animate-pulse"></div>
        <div className="absolute top-1 right-1 w-2 h-2 bg-teal-500 rounded-full border-2 border-white"></div>
     </div>
     <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter text-center leading-none">{label}<br/>Email Sent</span>
  </div>
);

const StepCard = ({ icon, title, desc, onClick }: any) => (
  <button 
    onClick={onClick}
    className="bg-white/5 border border-white/10 p-6 rounded-[32px] text-left hover:bg-white/10 transition-all group flex flex-col justify-between h-full"
  >
    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">{icon}</div>
    <div>
      <p className="font-black text-sm mb-1">{title}</p>
      <p className="text-[10px] text-indigo-300 font-medium leading-relaxed mb-4">{desc}</p>
      <div className="flex items-center gap-1 text-[9px] font-black text-teal-400 uppercase tracking-widest">
         入力を開始する <ChevronRight size={10} />
      </div>
    </div>
  </button>
);

export default BookingSuccess;
