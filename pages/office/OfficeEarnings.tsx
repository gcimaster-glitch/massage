
import React, { useState } from 'react';
import { JapaneseYen, PieChart, Users, Info, Settings2, ShieldCheck, Zap, FileText, Download, CheckCircle, ArrowRightLeft } from 'lucide-react';
import { MOCK_THERAPISTS } from '../../constants';
import { PayoutStatus } from '../../types';
import { useNavigate } from 'react-router-dom';

const OfficeEarnings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DISTRIBUTION' | 'PAYOUT_EXEC'>('OVERVIEW');
  const [payoutStatus, setPayoutStatus] = useState<PayoutStatus>(PayoutStatus.DRAFT);
  
  const [therapistRates, setTherapistRates] = useState(
    MOCK_THERAPISTS.filter(t => t.officeId === 'off1').map(t => ({
      id: t.id,
      name: t.name,
      img: t.imageUrl,
      rate: t.id === 't1' ? 65 : 60,
      payoutStatus: 'UNPAID' as 'UNPAID' | 'PAID',
      amount: 154000
    }))
  );

  const handleExecutePayout = () => {
    if (confirm('所属セラピスト全員への振込確定データ（全銀CSV）を生成しますか？\n実行後、セラピストには支払通知が送信されます。')) {
       setTherapistRates(prev => prev.map(t => ({ ...t, payoutStatus: 'PAID' })));
       alert('振込用データが生成されました。');
    }
  };

  return (
    <div className="space-y-10 pb-24 animate-fade-in text-gray-900 font-sans">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-black tracking-tighter">収益管理・二次分配設定</h1>
           <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.2em] mt-1">Agency Settlement Engine</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-gray-100 rounded-3xl">
           <button onClick={() => setActiveTab('OVERVIEW')} className={`px-6 py-3 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'OVERVIEW' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>本部実績</button>
           <button onClick={() => setActiveTab('PAYOUT_EXEC')} className={`px-6 py-3 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'PAYOUT_EXEC' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>セラピストへ支払</button>
           <button onClick={() => setActiveTab('DISTRIBUTION')} className={`px-6 py-3 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'DISTRIBUTION' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>配分ルール</button>
        </div>
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <StatCard label="当月本部受託決済総額" val="¥1,245,000" icon={<JapaneseYen/>} color="text-teal-600" />
           <StatCard label="本部ロイヤリティ(15%)" val="- ¥186,750" icon={<ShieldCheck/>} color="text-red-500" />
           <StatCard label="オフィス受取確定額" val="¥1,058,250" icon={<Zap/>} color="text-indigo-600" />
        </div>
      )}

      {activeTab === 'PAYOUT_EXEC' && (
        <section className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black flex items-center gap-3"><Users className="text-teal-600" /> 所属セラピスト別・支払管理</h3>
              <button onClick={handleExecutePayout} className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] flex items-center gap-2 hover:bg-teal-600 transition-all shadow-xl">
                 <ArrowRightLeft size={16}/> 振込実行(全銀データ生成)
              </button>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                   <tr>
                      <th className="p-6">セラピスト</th>
                      <th className="p-6">支払予定額</th>
                      <th className="p-6">銀行情報</th>
                      <th className="p-6 text-center">状況</th>
                      <th className="p-6 text-right"></th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {therapistRates.map(t => (
                     <tr key={t.id} className="hover:bg-gray-50/50 transition-all">
                        <td className="p-6">
                           <div className="flex items-center gap-4">
                              <img src={t.img} className="w-10 h-10 rounded-xl object-cover" />
                              <span className="font-black text-gray-900">{t.name}</span>
                           </div>
                        </td>
                        <td className="p-6 font-black text-gray-900">¥{t.amount.toLocaleString()}</td>
                        <td className="p-6">
                           <p className="text-[10px] font-bold text-gray-500">三菱UFJ / 普通</p>
                           <p className="text-[10px] font-mono text-gray-400">***-1234567</p>
                        </td>
                        <td className="p-6 text-center">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${t.payoutStatus === 'PAID' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600 animate-pulse'}`}>
                              {t.payoutStatus === 'PAID' ? '振込済' : '未振込'}
                           </span>
                        </td>
                        <td className="p-6 text-right">
                           <button className="text-gray-300 hover:text-teal-600 transition-colors"><FileText size={18}/></button>
                        </td>
                     </tr>
                   ))}
                </tbody>
              </table>
           </div>
        </section>
      )}

      {activeTab === 'DISTRIBUTION' && (
        <section className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100">
           <h3 className="text-xl font-black mb-8 flex items-center gap-3"><PieChart className="text-indigo-600" /> 配分ルール設定</h3>
           <div className="space-y-6 max-w-lg">
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex justify-between items-center">
                 <span className="font-bold">標準配分 (全セラピスト適用)</span>
                 <div className="flex items-center gap-2">
                    <input type="number" defaultValue={60} className="w-16 bg-white border border-gray-200 rounded-lg p-2 text-right font-black" />
                    <span className="font-black text-gray-400">%</span>
                 </div>
              </div>
              <button className="w-full py-4 bg-gray-900 text-white rounded-3xl font-black text-sm">設定を保存</button>
           </div>
        </section>
      )}
    </div>
  );
};

const StatCard = ({ label, val, icon, color }: { label: string, val: string, icon: any, color: string }) => (
  <div className="bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-xl transition-all">
     <div className={`w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center ${color} mb-6 group-hover:scale-110 transition-transform`}>
        {icon}
     </div>
     <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className={`text-3xl font-black text-gray-900 tracking-tighter`}>{val}</h3>
     </div>
  </div>
);

export default OfficeEarnings;
