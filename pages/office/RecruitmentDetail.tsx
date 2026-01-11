
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle2, XCircle, MessageSquare, Calendar, ShieldCheck, Award, UserCheck } from 'lucide-react';

const OfficeRecruitmentDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock applicant data
  const [applicant, setApplicant] = useState({
    id: 'app-1',
    name: '佐々木 健太',
    type: '国家資格保有',
    status: 'INTERVIEW',
    email: 'k.sasaki@example.com',
    phone: '090-1111-2222',
    appliedDate: '2025-05-20',
    experience: '都内ホテルスパ 10年 / 整体院 3年',
    internalNote: '実技チェック済み。接客態度良好。5/25よりCARE CUBE研修予定。'
  });

  const handleStatusUpdate = (newStatus: string) => {
    alert(`ステータスを ${newStatus} に更新しました。`);
  };

  const handleHire = () => {
    if (confirm('正式採用（システム本登録）を実行しますか？\nセラピストへログインIDが発行されます。')) {
      handleStatusUpdate('READY');
      navigate('/o/therapists');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50">
          <ArrowLeft size={24} />
        </button>
        <div>
           <h1 className="text-3xl font-black text-gray-900 tracking-tighter">応募者詳細審査</h1>
           <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Application Review Process</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-8">
           <section className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
                 <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-teal-50 text-teal-600 rounded-[32px] flex items-center justify-center text-3xl font-black">
                       {applicant.name.charAt(0)}
                    </div>
                    <div>
                       <h2 className="text-3xl font-black text-gray-900">{applicant.name}</h2>
                       <div className="flex flex-wrap gap-2 mt-2">
                          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-3 py-1 rounded-full uppercase">{applicant.type}</span>
                          <span className="bg-teal-100 text-teal-700 text-[10px] font-black px-3 py-1 rounded-full uppercase">本人確認済</span>
                       </div>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">現在の進捗</p>
                    <span className="bg-orange-50 text-orange-600 px-4 py-2 rounded-2xl font-black text-xs border border-orange-100">
                       {applicant.status}
                    </span>
                 </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                 <div className="space-y-6">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">基本情報</h3>
                    <div className="space-y-4">
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase">メールアドレス</p>
                          <p className="font-bold text-gray-700">{applicant.email}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase">電話番号</p>
                          <p className="font-bold text-gray-700">{applicant.phone}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase">応募日</p>
                          <p className="font-bold text-gray-700">{applicant.appliedDate}</p>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">経歴・レジュメ</h3>
                    <p className="text-sm font-bold text-gray-600 leading-relaxed whitespace-pre-wrap">{applicant.experience}</p>
                    <button className="flex items-center gap-2 text-teal-600 font-black text-xs hover:underline mt-4">
                       <FileText size={16} /> 提出書類（PDF）を表示
                    </button>
                 </div>
              </div>
           </section>

           <section className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-6">社内評価・メモ</h3>
              <textarea 
                className="w-full p-6 bg-gray-50 border-0 rounded-[32px] font-bold text-gray-700 h-40 outline-none focus:ring-4 focus:ring-teal-500/10 transition-all"
                value={applicant.internalNote}
                onChange={(e) => setApplicant({...applicant, internalNote: e.target.value})}
              />
              <div className="mt-6 flex justify-end">
                 <button className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-black text-xs shadow-lg">メモを保存</button>
              </div>
           </section>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-8">
           <div className="bg-gray-900 text-white p-8 rounded-[48px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 rounded-full blur-[80px] opacity-30"></div>
              <h3 className="text-lg font-black mb-8 flex items-center gap-2"><UserCheck className="text-teal-400" /> ステータス操作</h3>
              <div className="space-y-3">
                 <button onClick={() => handleStatusUpdate('INTERVIEW')} className="w-full p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-black text-xs text-left flex items-center justify-between group transition-all">
                    <span>面談・実技審査</span>
                    <Calendar size={16} className="text-gray-500 group-hover:text-teal-400" />
                 </button>
                 <button onClick={() => handleStatusUpdate('TRAINING')} className="w-full p-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-black text-xs text-left flex items-center justify-between group transition-all">
                    <span>研修中 (講習)</span>
                    <ShieldCheck size={16} className="text-gray-500 group-hover:text-teal-400" />
                 </button>
                 <div className="pt-6">
                    <button 
                      onClick={handleHire}
                      className="w-full py-5 bg-teal-500 text-white rounded-3xl font-black text-lg shadow-xl shadow-teal-500/20 hover:bg-teal-400 transition-all flex items-center justify-center gap-3"
                    >
                       <CheckCircle2 size={24} /> 正式採用
                    </button>
                 </div>
                 <button onClick={() => handleStatusUpdate('REJECTED')} className="w-full mt-4 text-red-400 font-black text-xs flex items-center justify-center gap-1 hover:underline">
                    <XCircle size={14} /> 不採用として終了
                 </button>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm text-center">
              <MessageSquare size={32} className="mx-auto text-gray-200 mb-4" />
              <p className="text-xs font-bold text-gray-400 leading-relaxed mb-6">応募者と直接チャットで日程調整を行うことができます。</p>
              <button className="w-full py-4 border-2 border-teal-600 text-teal-600 rounded-2xl font-black text-xs hover:bg-teal-50 transition-colors">
                 チャットルームを開く
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeRecruitmentDetail;
