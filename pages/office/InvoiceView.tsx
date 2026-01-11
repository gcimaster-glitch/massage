
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, Download, ArrowLeft, Building, CreditCard, CheckCircle, Info, ShieldCheck, BadgeCheck } from 'lucide-react';
import { MOCK_STATEMENTS } from '../../constants';

const InvoiceView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const isTherapistPayout = id?.startsWith('therapist-');
  const statement = MOCK_STATEMENTS[0];
  
  const PLATFORM_FEE_RATE = 0.15;
  const WITHHOLDING_TAX_RATE = 0.1021; 

  const totalSales = statement.totalSales;
  const platformFee = Math.floor(totalSales * PLATFORM_FEE_RATE);
  const basePayout = totalSales - platformFee;
  
  const withholdingTax = isTherapistPayout ? Math.floor(basePayout * WITHHOLDING_TAX_RATE) : 0;
  const finalPayout = basePayout - withholdingTax;

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gray-100 pb-20 animate-fade-in font-sans">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 print:hidden shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 font-black text-xs uppercase tracking-widest hover:text-gray-900 transition-colors">
            <ArrowLeft size={18} /> Back
          </button>
          <div className="flex gap-3">
             <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-100 px-5 py-2 rounded-xl text-xs font-black text-gray-700 hover:bg-gray-200 transition-all">
                <Printer size={16} /> 印刷 / PDF
             </button>
             <button className="flex items-center gap-2 bg-teal-600 px-6 py-2 rounded-xl text-xs font-black text-white shadow-lg hover:bg-teal-700 transition-all">
                <Download size={16} /> 帳票データを保存
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-[210mm] mx-auto bg-white mt-10 shadow-2xl p-[25mm] print:m-0 print:shadow-none min-h-[297mm] relative overflow-hidden border-t-[16px] border-gray-900">
        
        <div className="flex justify-between items-start mb-20">
           <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center font-black text-2xl shadow-xl">S</div>
                 <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
                   {isTherapistPayout ? '報酬支払明細書' : '適格請求書 / 支払通知書'}
                 </h1>
              </div>
              <div className="flex items-center gap-4">
                 <div className="bg-teal-600 text-white px-3 py-1 rounded text-[9px] font-black tracking-[0.2em] uppercase">Eligible Invoice System</div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                   <BadgeCheck size={14} className="text-teal-600" /> 本部公式発行書類
                 </p>
              </div>
           </div>
           <div className="text-right space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Serial Number</p>
              <p className="text-lg font-black font-mono tracking-tighter">{id}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase mt-4 mb-1">Issue Date</p>
              <p className="text-sm font-black">{new Date().toLocaleDateString('ja-JP', {year:'numeric', month:'2-digit', day:'2-digit'})}</p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-20 mb-20">
           <div className="space-y-8">
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-l-4 border-gray-200 pl-3">Recipient (宛先)</p>
                 <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                   {isTherapistPayout ? '田中 有紀' : statement.userName} <span className="text-sm font-bold ml-1">御中</span>
                 </h2>
              </div>
              <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                 <p className="text-[11px] text-gray-500 font-bold leading-relaxed">
                    毎度格別のお引き立てにあずかり、厚く御礼申し上げます。<br/>
                    下記のとおり、2025年5月度の決済精算金および配分報酬を通知いたします。
                 </p>
              </div>
           </div>
           <div className="text-right space-y-6">
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-r-4 border-teal-600 pr-3">Issuer (発行元)</p>
                 <p className="text-xl font-black text-gray-900">
                    {isTherapistPayout ? '新宿ウェルネス・エージェンシー' : '株式会社Soothe'}
                 </p>
                 <p className="text-xs font-bold text-gray-500 mt-2">東京都渋谷区道玄坂 1-2-3</p>
                 <div className="mt-4 flex flex-col items-end gap-1">
                    <p className="text-[11px] font-black text-gray-900 flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                       <ShieldCheck size={14} className="text-teal-600" /> 
                       適格請求書発行事業者登録番号: <span className="font-mono">T1234567890123</span>
                    </p>
                 </div>
              </div>
              <div className="flex justify-end pt-4">
                 <div className="w-24 h-24 border-2 border-red-200 rounded-2xl flex items-center justify-center text-[10px] font-black text-red-200 uppercase tracking-[0.2em] relative rotate-3">
                    Corporate Seal
                    <div className="absolute inset-2 border border-red-100 rounded-xl"></div>
                 </div>
              </div>
           </div>
        </div>

        <div className="bg-gray-900 text-white rounded-[48px] p-12 mb-16 flex flex-col md:flex-row items-end justify-between shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500 rounded-full blur-[150px] opacity-10 translate-x-1/3 -translate-y-1/3"></div>
           <div className="relative z-10">
              <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-4">Total Net Payment (振込予定合計額)</p>
              <div className="flex items-baseline gap-3">
                 <span className="text-2xl font-black opacity-30 tracking-widest">JPY</span>
                 <span className="text-8xl font-black tracking-tighter">¥{finalPayout.toLocaleString()}</span>
              </div>
           </div>
           <div className="relative z-10 text-right space-y-1">
              <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Expected Date</p>
              <p className="text-2xl font-black border-b-4 border-teal-500 pb-1">2025/06/10</p>
           </div>
        </div>

        <table className="w-full text-left border-collapse mb-16">
           <thead>
              <tr className="border-b-4 border-gray-900">
                 <th className="py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description (内訳)</th>
                 <th className="py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Tax Class</th>
                 <th className="py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount (税込額)</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-gray-100">
              <tr>
                 <td className="py-8">
                    <p className="font-black text-gray-900 text-lg">プラットフォーム受託決済額 (売上総額)</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Gross Sales Collection</p>
                 </td>
                 <td className="py-8 text-right font-black text-gray-900">10.0%</td>
                 <td className="py-8 text-right font-black text-gray-900 text-xl font-mono">¥{totalSales.toLocaleString()}</td>
              </tr>
              <tr>
                 <td className="py-8">
                    <p className="font-black text-red-600">システム利用・ロイヤリティ (本部控除)</p>
                    <p className="text-[9px] text-red-300 font-bold uppercase mt-1 tracking-widest">Platform Service Fee (▲15%)</p>
                 </td>
                 <td className="py-8 text-right font-black text-red-500">10.0%</td>
                 <td className="py-8 text-right font-black text-red-500 text-xl font-mono">▲ ¥{platformFee.toLocaleString()}</td>
              </tr>
              {isTherapistPayout && (
                <tr className="bg-gray-50/50">
                   <td className="py-8">
                      <p className="font-black text-gray-900 italic">源泉所得税額 (復興特別所得税含む)</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Income Tax Withheld (▲10.21%)</p>
                   </td>
                   <td className="py-8 text-right font-black text-gray-400">---</td>
                   <td className="py-8 text-right font-black text-red-600 text-xl font-mono">▲ ¥{withholdingTax.toLocaleString()}</td>
                </tr>
              )}
           </tbody>
           <tfoot>
              <tr className="border-t-2 border-gray-200">
                 <td colSpan={2} className="py-6 text-right font-black text-gray-400 text-[10px] uppercase tracking-widest">Consumption Tax (10%)</td>
                 <td className="py-6 text-right font-black text-gray-900 text-lg font-mono">¥{Math.floor(finalPayout * 10 / 110).toLocaleString()}</td>
              </tr>
              <tr className="border-t-[8px] border-gray-900">
                 <td colSpan={2} className="py-10 text-right font-black text-gray-900 text-2xl uppercase tracking-widest">Payable Total</td>
                 <td className="py-10 text-right font-black text-gray-900 text-5xl tracking-tighter font-mono">¥{finalPayout.toLocaleString()}</td>
              </tr>
           </tfoot>
        </table>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
           <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><CreditCard size={14}/> Bank Account (振込先)</p>
              <div className="space-y-1">
                 <p className="font-black text-gray-900 text-lg">三菱UFJ銀行 新宿中央支店</p>
                 <p className="text-sm font-bold text-gray-500">普通 1234567</p>
                 <p className="text-sm font-black text-gray-900 mt-2 tracking-widest uppercase">タナカ ユキ</p>
              </div>
           </div>
           <div className="bg-teal-50 p-8 rounded-[40px] border border-teal-100 flex items-start gap-4">
              <Info className="text-teal-600 flex-shrink-0" size={24} />
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-teal-800 uppercase tracking-widest">Compliance Note</p>
                 <p className="text-[11px] text-teal-700 leading-relaxed font-bold">
                    本明細書は、適格請求書等保存方式（インボイス制度）の要件を満たす支払通知書です。記載内容に基づき、各税務申告を行ってください。
                 </p>
              </div>
           </div>
        </div>

        <div className="text-center pt-20 border-t border-gray-50">
           <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.6em]">Soothe Financial Governance v2.5</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
