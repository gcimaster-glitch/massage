
import React from 'react';
import { CreditCard, ArrowRightLeft, ShieldCheck, AlertCircle, ExternalLink, Download, Search, RefreshCw } from 'lucide-react';

const AdminStripeDashboard: React.FC = () => {
  return (
    <div className="space-y-12 pb-32 animate-fade-in text-gray-900 font-sans px-4">
      <div className="flex flex-col lg:flex-row justify-between items-end gap-10">
        <div>
           <span className="inline-block bg-blue-50 text-blue-600 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.4em] mb-6 border border-blue-100 shadow-sm">決済インフラ監視</span>
           <h1 className="text-5xl font-black tracking-tighter">Stripe Connect 管理</h1>
           <p className="text-gray-400 font-bold uppercase tracking-[0.3em] mt-2 text-xs">Global Treasury & Connected Accounts</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-gray-200 px-8 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
              <Download size={18} /> 月次収支レポート
           </button>
           <button className="bg-blue-600 text-white px-10 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-2xl hover:bg-blue-700 transition-all active:scale-95">
              <ExternalLink size={18} /> Stripe Dashboard
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <MetricCard title="プラットフォーム内保留残高" value="¥4,520,800" sub="送金待ち資金" color="text-blue-600" />
         <MetricCard title="接続済みアカウント数" value="1,240" sub="アクティブなセラピスト・ホスト" color="text-gray-900" />
         <MetricCard title="KYC未完了アラート" value="12" sub="送金制限中のアカウント" color="text-red-500" isAlert />
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
         <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[48px] shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="font-black text-lg flex items-center gap-3"><ArrowRightLeft className="text-blue-600" /> 直近の資金移動ログ</h3>
                  <div className="flex gap-2">
                     <button className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"><RefreshCw size={16}/></button>
                  </div>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                        <tr>
                           <th className="p-8">トランザクションID</th>
                           <th className="p-8">種別</th>
                           <th className="p-8 text-right">金額</th>
                           <th className="p-8">パートナー</th>
                           <th className="p-8 text-center">状況</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50 font-bold text-sm">
                        {[
                          { id: 'txn_123', type: 'Payout', amount: '-¥142,000', partner: '田中 有紀', status: 'COMPLETED' },
                          { id: 'ch_456', type: 'Charge', amount: '+¥12,400', partner: 'CARE CUBE 渋谷', status: 'SUCCESS' },
                          { id: 'txn_789', type: 'Payout', amount: '-¥85,000', partner: '佐藤 健二', status: 'PENDING' },
                        ].map(tx => (
                          <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                             <td className="p-8 font-mono text-xs">{tx.id}</td>
                             <td className="p-8">
                                <span className={`text-[10px] font-black uppercase ${tx.type === 'Payout' ? 'text-orange-600' : 'text-teal-600'}`}>{tx.type}</span>
                             </td>
                             <td className={`p-8 text-right font-black ${tx.amount.startsWith('+') ? 'text-teal-600' : 'text-gray-900'}`}>{tx.amount}</td>
                             <td className="p-8 text-gray-500">{tx.partner}</td>
                             <td className="p-8 text-center">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${tx.status === 'SUCCESS' || tx.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                                   {tx.status}
                                </span>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         <div className="lg:col-span-4 space-y-8">
            <section className="bg-gray-900 text-white p-10 rounded-[56px] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500 rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
               <h3 className="text-xl font-black mb-8 flex items-center gap-3"><ShieldCheck className="text-blue-400" /> セキュリティ・コンプライアンス</h3>
               <div className="space-y-4">
                  <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                     <p className="text-[10px] font-black text-blue-400 uppercase mb-2">AML監視ステータス</p>
                     <p className="text-sm font-bold leading-relaxed italic opacity-80">
                        不審な連続少額決済は検知されていません。全ての送金は3Dセキュア2.0で保護されています。
                     </p>
                  </div>
                  <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all">コンプライアンス設定を開く</button>
               </div>
            </section>
         </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, sub, color, isAlert }: any) => (
  <div className={`bg-white p-10 rounded-[56px] shadow-sm border border-gray-100 relative group overflow-hidden ${isAlert ? 'border-red-100' : ''}`}>
     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{title}</p>
     <h3 className={`text-4xl font-black tracking-tighter ${color}`}>{value}</h3>
     <p className="text-xs text-gray-500 font-bold mt-2">{sub}</p>
     {isAlert && <div className="absolute top-8 right-8 text-red-500 animate-bounce"><AlertCircle /></div>}
  </div>
);

export default AdminStripeDashboard;
