
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, ShieldCheck, Mail, Lock, User, FileText, ChevronRight } from 'lucide-react';

const SignupTherapist: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("本番環境ではここでD1データベースに保存され、Resend経由でメールが送信されます。");
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-20 text-gray-900 font-sans">
      <div className="bg-white rounded-[56px] shadow-2xl p-10 md:p-16 max-w-3xl w-full relative border border-gray-100">
        <button onClick={() => navigate('/auth/register-select')} className="absolute top-10 left-10 text-gray-400 hover:text-indigo-600 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest">
          <ArrowLeft size={16} /> 戻る
        </button>

        <div className="text-center mb-12 mt-6">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
             <Award size={32} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tighter">セラピスト・パートナー登録</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em]">Therapist Onboarding Flow</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
           {step === 1 ? (
             <div className="space-y-6 animate-fade-in">
                <div className="grid md:grid-cols-2 gap-6">
                   <InputGroup label="氏名" placeholder="山田 太郎" icon={<User size={18}/>} />
                   <InputGroup label="メールアドレス" placeholder="therapist@example.jp" icon={<Mail size={18}/>} />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                   <InputGroup label="パスワード" type="password" placeholder="8文字以上" icon={<Lock size={18}/>} />
                   <InputGroup label="電話番号" placeholder="09012345678" icon={<User size={18}/>} />
                </div>
                <button type="button" onClick={() => setStep(2)} className="w-full bg-indigo-600 text-white py-6 rounded-[32px] font-black text-xl hover:bg-indigo-700 transition-all shadow-xl flex items-center justify-center gap-3">
                  次へ進む <ChevronRight size={24}/>
                </button>
             </div>
           ) : (
             <div className="space-y-6 animate-fade-in">
                <div className="bg-indigo-50 p-8 rounded-[40px] border border-indigo-100 space-y-6">
                   <h3 className="font-black text-indigo-900 flex items-center gap-2"><Award size={20}/> 資格・経験情報の入力</h3>
                   <div className="space-y-4">
                      <label className="block">
                         <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-4">保有資格種別</span>
                         <select className="w-full mt-2 p-5 bg-white border border-indigo-100 rounded-2xl font-bold">
                            <option>あん摩マッサージ指圧師 (国家資格)</option>
                            <option>柔道整復師 (国家資格)</option>
                            <option>鍼灸師 (国家資格)</option>
                            <option>民間資格・認定</option>
                            <option>資格なし（実務経験のみ）</option>
                         </select>
                      </label>
                      <InputGroup label="実務経験年数" placeholder="例: 5" icon={<FileText size={18}/>} />
                   </div>
                </div>
                <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100">
                   <p className="text-xs text-gray-500 font-bold leading-relaxed">
                     ※ 登録完了後、身分証・資格証の写真をアップロードしていただきます。
                     虚偽の申請があった場合、アカウントは即座に無効となります。
                   </p>
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
      <input type={type} required placeholder={placeholder} className="w-full pl-16 pr-8 py-5 bg-gray-50 border border-gray-200 rounded-[28px] font-bold text-gray-900 outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner" />
    </div>
  </div>
);

export default SignupTherapist;
