
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Mail, Lock, User, FileText, ChevronRight, Landmark } from 'lucide-react';

const SignupOffice: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("法人審査を開始します。運営より契約締結のご案内をResend経由で送信します。");
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-20 text-gray-900 font-sans">
      <div className="bg-white rounded-[56px] shadow-2xl p-10 md:p-16 max-w-3xl w-full relative border border-gray-100">
        <button onClick={() => navigate('/auth/register-select')} className="absolute top-10 left-10 text-gray-400 hover:text-blue-600 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest">
          <ArrowLeft size={16} /> 戻る
        </button>

        <div className="text-center mb-12 mt-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
             <Briefcase size={32} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tighter">事務所・エージェンシー登録</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em]">Agency Partner Onboarding</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
           {step === 1 ? (
             <div className="space-y-6 animate-fade-in">
                <div className="grid md:grid-cols-2 gap-6">
                   <InputGroup label="法人名 または 屋号" placeholder="癒やしエージェント株式会社" icon={<Landmark size={18}/>} />
                   <InputGroup label="代表者氏名" placeholder="佐藤 二郎" icon={<User size={18}/>} />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                   <InputGroup label="管理者メールアドレス" placeholder="office@example.jp" icon={<Mail size={18}/>} />
                   <InputGroup label="パスワード" type="password" placeholder="8文字以上" icon={<Lock size={18}/>} />
                </div>
                <button type="button" onClick={() => setStep(2)} className="w-full bg-blue-600 text-white py-6 rounded-[32px] font-black text-xl hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center gap-3">
                  次へ進む <ChevronRight size={24}/>
                </button>
             </div>
           ) : (
             <div className="space-y-6 animate-fade-in">
                <div className="bg-blue-50 p-8 rounded-[40px] border border-blue-100 space-y-6">
                   <h3 className="font-black text-blue-900 flex items-center gap-2"><FileText size={20}/> 契約・インボイス情報</h3>
                   <div className="space-y-4">
                      <InputGroup label="適格請求書発行事業者登録番号" placeholder="T1234567890123" icon={<FileText size={18}/>} />
                      <div className="grid md:grid-cols-2 gap-4">
                         <InputGroup label="管理下のセラピスト数（見込）" placeholder="例: 10" icon={<User size={18}/>} />
                         <label className="block">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-4">主な活動エリア</span>
                            <select className="w-full mt-2 p-5 bg-white border border-blue-100 rounded-2xl font-bold">
                               <option>東京23区</option>
                               <option>大阪・関西</option>
                               <option>福岡・九州</option>
                               <option>全国対応</option>
                            </select>
                         </label>
                      </div>
                   </div>
                </div>
                <div className="flex gap-4">
                   <button type="button" onClick={() => setStep(1)} className="px-8 py-6 bg-gray-100 text-gray-500 rounded-[32px] font-black">戻る</button>
                   <button type="submit" className="flex-1 bg-gray-900 text-white py-6 rounded-[32px] font-black text-xl hover:bg-teal-600 transition-all shadow-xl">
                      登録を申請する
                   </button>
                </div>
             </div>
           )}
        </form>
      </div>
    </div>
  );
};

const InputGroup = ({ label, placeholder, icon, type = "text" }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-4">{label}</label>
    <div className="relative">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
      <input type={type} required placeholder={placeholder} className="w-full pl-16 pr-8 py-5 bg-gray-50 border border-gray-200 rounded-[28px] font-bold text-gray-900 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-inner" />
    </div>
  </div>
);

export default SignupOffice;
