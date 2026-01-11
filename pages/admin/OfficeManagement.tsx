
import React, { useState } from 'react';
import { Building2, Users, ArrowRightLeft, Plus, Search, MapPin, MoreVertical, JapaneseYen, Check, X, ShieldCheck } from 'lucide-react';
import { MOCK_OFFICES, MOCK_THERAPISTS } from '../../constants';

const AdminOffices: React.FC = () => {
  const [offices, setOffices] = useState(MOCK_OFFICES);
  const [therapists, setTherapists] = useState(MOCK_THERAPISTS);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedTherapistId, setSelectedTherapistId] = useState('');
  const [targetOfficeId, setTargetOfficeId] = useState('');

  const handleTransfer = () => {
    if (!selectedTherapistId || !targetOfficeId) return;
    
    setTherapists(therapists.map(t => 
      t.id === selectedTherapistId ? { ...t, officeId: targetOfficeId === 'NULL' ? null : targetOfficeId } : t
    ));
    
    const therapistName = therapists.find(t => t.id === selectedTherapistId)?.name;
    const officeName = targetOfficeId === 'NULL' ? '本部直属' : offices.find(o => o.id === targetOfficeId)?.name;
    
    alert(`${therapistName} さんを ${officeName} へ移籍処理しました。`);
    setShowTransferModal(false);
    setSelectedTherapistId('');
    setTargetOfficeId('');
  };

  return (
    <div className="space-y-10 pb-20 text-gray-900 font-sans">
      <div className="flex justify-between items-end px-4">
        <div>
           <h1 className="text-4xl font-black text-gray-900 tracking-tighter">提携エージェンシー管理</h1>
           <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Agency & Branch Governance</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => setShowTransferModal(true)}
             className="bg-white border-4 border-indigo-50 text-indigo-600 px-10 py-4 rounded-[28px] font-black text-xs flex items-center gap-3 hover:bg-indigo-50 transition-all shadow-sm active:scale-95"
           >
              <ArrowRightLeft size={18} /> セラピスト所属変更
           </button>
           <button className="bg-gray-900 text-white px-10 py-4 rounded-[28px] font-black text-xs flex items-center gap-3 hover:bg-teal-600 transition-all shadow-2xl">
              <Plus size={18} /> 新規オフィス加盟
           </button>
        </div>
      </div>

      {/* 移籍モーダル（高度なUI） */}
      {showTransferModal && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto">
           <div className="bg-white rounded-[64px] w-full max-w-4xl p-12 shadow-2xl space-y-12 animate-fade-in-up border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="flex justify-between items-start relative z-10">
                 <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-5"><ArrowRightLeft className="text-indigo-600" size={40} /> 所属変更手続き</h2>
                    <p className="text-gray-400 text-sm font-bold mt-2">移籍を実行すると、報酬配分と運営権限が即座に切り替わります</p>
                 </div>
                 <button onClick={() => setShowTransferModal(false)} className="p-4 bg-gray-100 rounded-[24px] hover:bg-gray-200 transition-colors shadow-inner"><X/></button>
              </div>

              <div className="grid md:grid-cols-2 gap-12 relative z-10">
                 {/* 左：セラピスト選択 */}
                 <div className="space-y-6">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-4">1. 対象セラピストを選択</p>
                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                       {therapists.map(t => (
                         <button 
                           key={t.id}
                           onClick={() => setSelectedTherapistId(t.id)}
                           className={`w-full p-6 rounded-[32px] border-4 flex items-center gap-5 transition-all text-left ${selectedTherapistId === t.id ? 'bg-gray-900 text-white border-gray-900 shadow-xl' : 'bg-gray-50 border-transparent hover:border-indigo-100'}`}
                         >
                            <img src={t.imageUrl} className="w-12 h-12 rounded-2xl object-cover shadow-md" />
                            <div className="flex-1 min-w-0">
                               <p className="font-black text-sm truncate">{t.name}</p>
                               <p className="text-[9px] opacity-40 font-bold uppercase tracking-tighter mt-1">{t.officeId ? '移籍可能' : '本部直属'}</p>
                            </div>
                            {selectedTherapistId === t.id && <Check size={20} className="text-teal-400" />}
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* 右：移籍先選択 */}
                 <div className="space-y-6">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-4">2. 移籍先の組織を指定</p>
                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                       <button 
                         onClick={() => setTargetOfficeId('NULL')}
                         className={`w-full p-6 rounded-[32px] border-4 flex items-center gap-5 transition-all text-left ${targetOfficeId === 'NULL' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-gray-50 border-transparent hover:border-indigo-100'}`}
                       >
                          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black">S</div>
                          <div className="flex-1">
                             <p className="font-black text-sm uppercase tracking-widest">Soothe Japan (本部直属)</p>
                          </div>
                          {targetOfficeId === 'NULL' && <Check size={20} />}
                       </button>
                       {offices.map(o => (
                         <button 
                           key={o.id}
                           onClick={() => setTargetOfficeId(o.id)}
                           className={`w-full p-6 rounded-[32px] border-4 flex items-center gap-5 transition-all text-left ${targetOfficeId === o.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-gray-50 border-transparent hover:border-indigo-100'}`}
                         >
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center"><Building2 size={24}/></div>
                            <div className="flex-1">
                               <p className="font-black text-sm">{o.name}</p>
                            </div>
                            {targetOfficeId === o.id && <Check size={20} />}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-10">
                 <div className="bg-teal-50 p-8 rounded-[40px] border border-teal-100 flex items-start gap-4 flex-1">
                    <ShieldCheck className="text-teal-600 mt-1 flex-shrink-0" />
                    <p className="text-xs text-teal-800 font-bold leading-relaxed">
                       移籍完了後、セラピストには「所属変更の通知」がメール配信されます。
                       当月分までの売上精算は移籍前の所属、翌月以降は移籍後の所属として計算されます。
                    </p>
                 </div>
                 <button 
                   disabled={!selectedTherapistId || !targetOfficeId}
                   onClick={handleTransfer} 
                   className="w-full md:w-auto bg-gray-900 text-white px-16 py-7 rounded-[32px] font-black text-xl shadow-2xl hover:bg-teal-600 transition-all active:scale-95 disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none"
                 >
                    所属変更を実行
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* エージェンシー一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        {offices.map(office => (
          <div key={office.id} className="bg-white p-10 rounded-[56px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
             <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500 opacity-20"></div>
             <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-5">
                   <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[24px] flex items-center justify-center font-black text-2xl border border-indigo-100 shadow-inner group-hover:scale-110 transition-transform">
                      <Building2 />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tight">{office.name}</h3>
                      <p className="text-[11px] font-black text-gray-400 flex items-center gap-2 mt-1 uppercase tracking-widest"><MapPin size={12} className="text-indigo-500" /> {office.area} Base</p>
                   </div>
                </div>
                <button className="p-3 text-gray-200 group-hover:text-gray-500 transition-colors"><MoreVertical /></button>
             </div>

             <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="bg-gray-50 p-6 rounded-[32px] shadow-inner">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">専属契約数</p>
                   <p className="text-3xl font-black text-gray-900 flex items-center gap-3 leading-none">{office.therapistCount} <span className="text-xs font-bold text-gray-300">名</span></p>
                </div>
                <div className="bg-gray-50 p-6 rounded-[32px] shadow-inner">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">ロイヤリティ</p>
                   <p className="text-3xl font-black text-teal-600 flex items-center gap-1 leading-none">{office.commissionRate}<span className="text-xs font-bold text-gray-300">%</span></p>
                </div>
             </div>

             <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                <div>
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">公式責任者</p>
                   <p className="text-base font-black text-gray-700">{office.managerName}</p>
                </div>
                <button className="bg-gray-900 text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-teal-600 transition-all shadow-xl active:scale-95">
                   詳細・監査ボードを開く
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOffices;
