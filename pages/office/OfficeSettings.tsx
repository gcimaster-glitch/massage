
import React, { useState } from 'react';
import { Save, Building2, CreditCard, ShieldCheck, Download, Info, Landmark } from 'lucide-react';

const OfficeSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'BANK' | 'CONTRACT'>('PROFILE');

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-black text-gray-900 tracking-tighter">オフィス環境設定</h1>
           <p className="text-gray-400 text-sm font-bold uppercase mt-1 tracking-widest">Agency Configuration & Compliance</p>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-gray-100 rounded-3xl w-fit">
         {[
           { id: 'PROFILE', label: '基本プロフィール', icon: Building2 },
           { id: 'BANK', label: '報酬振込先口座', icon: Landmark },
           { id: 'CONTRACT', label: '本部契約・規約', icon: ShieldCheck },
         ].map(t => (
           <button 
             key={t.id} 
             onClick={() => setActiveTab(t.id as any)}
             className={`flex items-center gap-2 px-8 py-3.5 rounded-[22px] text-xs font-black transition-all ${activeTab === t.id ? 'bg-white text-gray-900 shadow-xl scale-105' : 'text-gray-400 hover:text-gray-600'}`}
           >
              <t.icon size={16} /> {t.label}
           </button>
         ))}
      </div>

      <div className="bg-white p-12 rounded-[56px] shadow-sm border border-gray-100 min-h-[500px]">
         {activeTab === 'PROFILE' && (
           <div className="space-y-10 animate-fade-in">
              <div className="grid md:grid-cols-2 gap-12">
                 <div className="space-y-8">
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block ml-2">事務所ロゴ / 看板画像</label>
                       <div className="w-48 h-48 bg-white border-2 border-dashed border-gray-200 rounded-[40px] flex flex-col items-center justify-center gap-3 text-gray-300 hover:bg-teal-50 hover:border-teal-200 transition-all cursor-pointer group shadow-inner">
                          <Building2 size={40} className="group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Upload Image</span>
                       </div>
                    </div>
                    <InputField label="事務所名称" value="新宿ウェルネス・エージェンシー" />
                 </div>
                 <div className="space-y-8">
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-2">ユーザー向け紹介文</label>
                       <textarea 
                         className="w-full p-6 bg-white border border-gray-200 rounded-[32px] font-bold text-gray-900 h-60 focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all leading-relaxed outline-none shadow-inner" 
                         defaultValue="私たちは新宿エリアを中心に、最高品質のリラクゼーションを提供しています。所属する全セラピストが国家資格を保有し、安全で高度な技術をCARE CUBEからお届けします。" 
                       />
                    </div>
                 </div>
              </div>
              <div className="pt-10 border-t border-gray-50 flex justify-end">
                 <button className="bg-gray-900 text-white px-12 py-5 rounded-[22px] font-black text-sm flex items-center gap-3 hover:bg-teal-600 transition-all shadow-xl active:scale-95">
                    <Save size={18} /> 設定内容を保存
                 </button>
              </div>
           </div>
         )}

         {activeTab === 'BANK' && (
           <div className="space-y-12 animate-fade-in">
              <div className="bg-indigo-50 p-10 rounded-[48px] border border-indigo-100 flex items-start gap-8">
                 <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-xl flex-shrink-0">
                    <Info size={32} />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-xl font-black text-indigo-900">本部からの支払いについて</h3>
                    <p className="text-sm font-bold leading-relaxed text-indigo-700">
                       お客様からお預かりした決済代金は、本部の精算サイクルに基づき、所定の手数料を差し引いた後、以下の口座へ振り込まれます。
                       正確な情報をご登録ください。
                    </p>
                 </div>
              </div>

              <div className="max-w-3xl space-y-8">
                 <div className="grid md:grid-cols-2 gap-6">
                    <InputField label="銀行名" value="三菱UFJ銀行" />
                    <InputField label="支店名" value="新宿中央支店" />
                 </div>
                 <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-2">口座種別</label>
                       <select className="w-full p-5 bg-white border border-gray-200 rounded-2xl font-bold outline-none focus:border-teal-500 shadow-inner appearance-none">
                          <option>普通</option>
                          <option>当座</option>
                       </select>
                    </div>
                    <div className="col-span-2">
                       <InputField label="口座番号" value="1234567" />
                    </div>
                 </div>
                 <InputField label="口座名義 (カタカナ)" value="シンジユクウエルネスエージエンシー" />
                 
                 <div className="pt-6">
                    <button className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-teal-600 transition-all shadow-lg">
                       振込先情報を保存
                    </button>
                 </div>
              </div>
           </div>
         )}

         {activeTab === 'CONTRACT' && (
           <div className="space-y-12 animate-fade-in">
              <div className="bg-gray-50 p-10 rounded-[48px] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-10">
                 <div className="space-y-3">
                    <h4 className="text-2xl font-black text-gray-900">現在の本部ロイヤリティ設定</h4>
                    <p className="text-gray-500 font-bold text-sm leading-relaxed">本部が決済を代行し、売上の15%をシステム利用・集客代行料として申し受けます。</p>
                 </div>
                 <div className="text-center bg-white p-10 rounded-full shadow-2xl border-4 border-teal-500 w-48 h-48 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-gray-900 tracking-tighter">15.0</span>
                    <span className="text-xs font-black text-teal-600 uppercase tracking-widest mt-1">%</span>
                 </div>
              </div>

              <div className="space-y-6">
                 <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">締結済み重要書類</h4>
                 <div className="grid gap-4">
                    {['セラピストオフィス加盟基本契約', '決済代行受託に関する合意書', 'コンプライアンス遵守誓約書'].map(doc => (
                       <div key={doc} className="p-6 bg-white border border-gray-100 rounded-3xl flex justify-between items-center group hover:border-teal-200 transition-all cursor-pointer shadow-sm">
                          <span className="font-bold text-gray-700">{doc}</span>
                          <button className="text-teal-600 group-hover:underline font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                             Download <Download size={14} />
                          </button>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
         )}
      </div>
    </div>
  );
};

const InputField: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-2">{label}</label>
    <input 
      type="text" 
      className="w-full p-5 bg-white border border-gray-200 rounded-2xl font-bold text-gray-900 focus:border-teal-500 outline-none transition-all shadow-inner" 
      defaultValue={value} 
    />
  </div>
);

export default OfficeSettings;
