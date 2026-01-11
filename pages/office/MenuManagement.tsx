
import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Save, Users, ChevronRight, Sparkles, 
  Clock, JapaneseYen, Edit3, CheckCircle, ArrowLeft, Info, Search, Filter, ShieldCheck, AlertCircle
} from 'lucide-react';
import { MOCK_THERAPISTS, MASTER_COURSES, MASTER_OPTIONS } from '../../constants';

const OfficeMenuManagement: React.FC = () => {
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'COURSES' | 'OPTIONS'>('COURSES');
  
  const [localMenu, setLocalMenu] = useState<{ masterId: string, price: number, isSelected: boolean }[]>([]);
  const [localOptions, setLocalOptions] = useState<{ masterId: string, price: number, isSelected: boolean }[]>([]);

  const selectedTherapist = MOCK_THERAPISTS.find(t => t.id === selectedTherapistId);

  useEffect(() => {
    if (selectedTherapist) {
      const initialCourses = MASTER_COURSES.map(mc => {
        const approved = (selectedTherapist as any).approvedMenu?.courses.find((c: any) => c.masterId === mc.id);
        return {
          masterId: mc.id,
          price: approved?.price || 7000,
          isSelected: !!approved
        };
      });
      const initialOptions = MASTER_OPTIONS.map(mo => {
        const approved = (selectedTherapist as any).approvedMenu?.options.find((o: any) => o.masterId === mo.id);
        return {
          masterId: mo.id,
          price: approved?.price || 1000,
          isSelected: !!approved
        };
      });
      setLocalMenu(initialCourses);
      setLocalOptions(initialOptions);
    }
  }, [selectedTherapistId]);

  const handleToggle = (type: 'COURSES' | 'OPTIONS', masterId: string) => {
    const setter = type === 'COURSES' ? setLocalMenu : setLocalOptions;
    setter(prev => prev.map(item => item.masterId === masterId ? { ...item, isSelected: !item.isSelected } : item));
  };

  const handlePriceChange = (type: 'COURSES' | 'OPTIONS', masterId: string, price: number) => {
    const setter = type === 'COURSES' ? setLocalMenu : setLocalOptions;
    setter(prev => prev.map(item => item.masterId === masterId ? { ...item, price } : item));
  };

  const handleSave = () => {
    alert(`${selectedTherapist?.name} さんの新規メニュー構成・価格設定を運営本部に承認申請しました。`);
  };

  return (
    <div className="space-y-10 pb-40 animate-fade-in text-gray-900 font-sans">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-black tracking-tighter">メニュー構成・個別価格設定</h1>
           <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Managed Pricing & Talent Menus</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
           <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4 mb-4">管理下のセラピスト</h3>
           <div className="space-y-2">
              {MOCK_THERAPISTS.filter(t => t.officeId === 'off1').map(t => (
                <button 
                  key={t.id}
                  onClick={() => setSelectedTherapistId(t.id)}
                  className={`w-full p-5 rounded-[32px] flex items-center gap-4 transition-all border-4 ${selectedTherapistId === t.id ? 'bg-gray-900 text-white border-gray-900 shadow-xl scale-[1.02]' : 'bg-white text-gray-500 border-transparent hover:border-gray-100'}`}
                >
                  <img src={t.imageUrl} className="w-10 h-10 rounded-2xl object-cover shadow-sm" />
                  <div className="text-left">
                     <p className="font-black text-xs">{t.name}</p>
                     <p className="text-[8px] opacity-40 uppercase">Assigned Talent</p>
                  </div>
                  {selectedTherapistId === t.id && <ChevronRight size={14} className="ml-auto" />}
                </button>
              ))}
           </div>
        </div>

        <div className="lg:col-span-3">
           {!selectedTherapistId ? (
             <div className="bg-gray-100/50 h-[600px] rounded-[56px] border-4 border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-12">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gray-200 shadow-sm mb-6"><Users size={40} /></div>
                <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">セラピストを選択してください</h3>
                <p className="text-gray-400 text-sm font-bold mt-2 leading-relaxed">本部定義のマスターからメニューを選択し、価格を設定します。</p>
             </div>
           ) : (
             <div className="space-y-12 animate-fade-in">
                <div className="flex bg-gray-100 p-1.5 rounded-3xl w-fit shadow-inner">
                   <button onClick={() => setActiveTab('COURSES')} className={`px-8 py-3 rounded-[22px] text-xs font-black transition-all ${activeTab === 'COURSES' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>メインコース ({localMenu.filter(m => m.isSelected).length})</button>
                   <button onClick={() => setActiveTab('OPTIONS')} className={`px-8 py-3 rounded-[22px] text-xs font-black transition-all ${activeTab === 'OPTIONS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>オプション ({localOptions.filter(m => m.isSelected).length})</button>
                </div>

                <div className="bg-white p-10 md:p-12 rounded-[64px] shadow-sm border border-gray-100">
                   <div className="grid gap-4">
                      {(activeTab === 'COURSES' ? MASTER_COURSES : MASTER_OPTIONS).map(master => {
                         const current = (activeTab === 'COURSES' ? localMenu : localOptions).find(l => l.masterId === master.id);
                         return (
                           <div key={master.id} className={`p-6 rounded-[32px] border-4 transition-all flex items-center justify-between gap-6 ${current?.isSelected ? 'bg-white border-teal-500 shadow-lg' : 'bg-gray-50 border-transparent opacity-60'}`}>
                              <div className="flex items-center gap-6 flex-1">
                                 <button 
                                   onClick={() => handleToggle(activeTab, master.id)}
                                   className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${current?.isSelected ? 'bg-teal-500 text-white' : 'bg-white text-gray-200'}`}
                                 >
                                    <CheckCircle size={24} />
                                 </button>
                                 <div>
                                    <h4 className="font-black text-gray-900 text-lg leading-none">{master.name}</h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">{activeTab === 'COURSES' ? `${(master as any).duration}分・${(master as any).category}` : `${(master as any).duration}分追加`}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-4">
                                 <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-300">¥</span>
                                    <input 
                                      type="number" 
                                      disabled={!current?.isSelected}
                                      value={current?.price}
                                      onChange={e => handlePriceChange(activeTab, master.id, Number(e.target.value))}
                                      className="w-32 pl-8 pr-4 py-3 bg-white border border-gray-100 rounded-2xl font-black text-lg text-right outline-none focus:border-teal-500 shadow-inner disabled:bg-transparent"
                                    />
                                 </div>
                              </div>
                           </div>
                         );
                      })}
                   </div>
                </div>

                <div className="bg-gray-900 rounded-[56px] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-teal-400 shadow-inner"><ShieldCheck size={32} /></div>
                      <div className="text-white">
                         <h4 className="text-xl font-black">申請内容を確定する</h4>
                         <p className="text-xs text-gray-500 font-bold uppercase mt-1">本部による審査後に価格が公開されます</p>
                      </div>
                   </div>
                   <button onClick={handleSave} className="bg-teal-600 text-white px-16 py-6 rounded-full font-black text-xl hover:bg-teal-500 transition-all flex items-center gap-4 active:scale-95 shadow-xl">
                      <Save size={24} /> 本部へ承認申請
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default OfficeMenuManagement;
