import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_OFFICES, MOCK_THERAPISTS, MOCK_BOOKINGS } from '../../constants';
import { ArrowLeft, Users, Activity, JapaneseYen, ShieldAlert, MoreVertical, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
// Imported PayoutStatus to fix missing name error
import { PayoutStatus } from '../../types';

const AdminOfficeDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const office = MOCK_OFFICES.find(o => o.id === id) || MOCK_OFFICES[0];
  const therapists = MOCK_THERAPISTS.filter(t => t.officeId === office.id);

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50">
          <ArrowLeft size={24} />
        </button>
        <div>
           <h1 className="text-3xl font-black text-gray-900 tracking-tighter">{office.name} <span className="text-sm font-bold text-gray-400 ml-2 uppercase">Audit Board</span></h1>
           <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Agency Performance & Compliance</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: '所属セラピスト', val: therapists.length, unit: '名', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
           { label: '累計取扱高 (GMV)', val: '¥4.2M', unit: '', icon: JapaneseYen, color: 'text-teal-600', bg: 'bg-teal-50' },
           { label: '平均キャンセル率', val: '1.2', unit: '%', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
           { label: '重大インシデント', val: '0', unit: '件', icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                 <stat.icon size={20} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-gray-900">{stat.val}<span className="text-xs ml-1 font-bold">{stat.unit}</span></h3>
           </div>
         ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
         {/* Left: Contract & Settings */}
         <div className="lg:col-span-1 space-y-8">
            <section className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
               <h3 className="font-black text-gray-900 flex items-center gap-2 text-lg"><TrendingUp size={20} /> 本部契約条件</h3>
               <div className="space-y-6">
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">現在のロイヤリティ率</p>
                     <div className="flex items-center justify-between">
                        <span className="text-3xl font-black text-teal-600">{office.commissionRate}%</span>
                        <button className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">条件変更</button>
                     </div>
                  </div>
                  <div className="pt-6 border-t border-gray-50">
                     <p className="text-[10px] font-black text-gray-400 uppercase mb-3 block">管理者情報</p>
                     <p className="text-sm font-black text-gray-900">{office.managerName}</p>
                     <p className="text-xs text-gray-500 font-bold">{office.contactEmail}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl flex items-start gap-3">
                     <AlertCircle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                     <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                       ※ 住所不定の疑いがある場合や、1ヶ月以上稼働がない場合は、自動的にアカウントが一時停止されます。
                     </p>
                  </div>
               </div>
            </section>
         </div>

         {/* Right: Therapist List & Earnings */}
         <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-black text-gray-900 flex items-center gap-2 text-lg"><Users size={20} /> 所属セラピスト監査</h3>
                  <button className="text-xs font-black text-teal-600 hover:underline">全員の稼働ログを表示</button>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <tr>
                           <th className="p-6">セラピスト</th>
                           <th className="p-6">当月売上</th>
                           <th className="p-6">完了率</th>
                           <th className="p-6">直近評価</th>
                           <th className="p-6 text-right"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {therapists.map(t => (
                          <tr key={t.id} className="hover:bg-gray-50/50 transition-all">
                             <td className="p-6">
                                <div className="flex items-center gap-3">
                                   <img src={t.imageUrl} className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                                   <span className="font-black text-gray-900 text-sm">{t.name}</span>
                                </div>
                             </td>
                             <td className="p-6 font-bold text-gray-500 text-sm">¥{(120000).toLocaleString()}</td>
                             <td className="p-6 font-bold text-green-600 text-sm">98%</td>
                             <td className="p-6">
                                <span className="flex items-center gap-1 font-black text-yellow-500 text-sm italic">★ {t.rating}</span>
                             </td>
                             <td className="p-6 text-right">
                                <button className="text-gray-300 hover:text-gray-900"><MoreVertical size={18} /></button>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </section>

            <section className="bg-gray-900 text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
               <div className="flex justify-between items-end">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Next Settlement</p>
                     <h4 className="text-xl font-black">オフィスへの振込予定額</h4>
                     <p className="text-5xl font-black text-white mt-4 tracking-tighter">¥1,020,000</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-1">Status</p>
                     <StatusBadge status={PayoutStatus.DRAFT as any} />
                  </div>
               </div>
            </section>
         </div>
      </div>
    </div>
  );
};

export default AdminOfficeDetail;
