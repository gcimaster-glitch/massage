
import React, { useState, useRef } from 'react';
import { Camera, CheckCircle, AlertCircle, Loader2, ArrowLeft, ShieldCheck, FileText, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { analyzeIDCard } from '../../services/aiService';

const KYCVerification: React.FC = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Fix: Mandatory API key selection for gemini-3-pro-image-preview
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      alert("本人確認AIを使用するには、有効なAPIキーの選択が必要です（支払い設定済みのGCPプロジェクトが必要です）。");
      await window.aistudio.openSelectKey();
      // Proceed assuming success as per race condition instructions
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setImage(reader.result as string);
      
      setIsAnalyzing(true);
      try {
        const aiResult = await analyzeIDCard(base64, file.type);
        setResult(aiResult);
      } catch (err: any) {
        // Fix: Reset key selection if entity not found error occurs
        if (err.message?.includes("Requested entity was not found.")) {
           alert("APIキーの取得に失敗しました。再度選択してください。");
           await window.aistudio.openSelectKey();
        } else {
           alert("AI解析に失敗しました。画像を明るい場所で撮り直してください。");
        }
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleComplete = () => {
    alert("本人確認申請を受け付けました。運営の最終確認をお待ちください。");
    navigate('/app/account');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100"><ArrowLeft /></button>
        <div>
           <h1 className="text-3xl font-black text-gray-900 tracking-tighter">AI本人確認 (KYC)</h1>
           <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Identity & Trust Verification</p>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 space-y-10">
        {!image ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-[1.6/1] bg-gray-50 border-4 border-dashed border-gray-200 rounded-[40px] flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-teal-50 hover:border-teal-200 transition-all group"
          >
             <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform">
                <Camera size={40} />
             </div>
             <div className="text-center">
                <p className="font-black text-gray-900">身分証（表面）を撮影または選択</p>
                <p className="text-xs text-gray-400 font-bold mt-2">運転免許証, マイナンバーカード, パスポート等</p>
             </div>
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
             <div className="relative aspect-[1.6/1] rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
                <img src={image} className="w-full h-full object-cover" alt="Captured ID" />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-4">
                     <Loader2 className="animate-spin text-teal-400" size={40} />
                     <p className="font-black text-sm uppercase tracking-widest">AI Analyzing Identity...</p>
                  </div>
                )}
             </div>

             {result && (
               <div className="bg-gray-50 p-8 rounded-[36px] border border-gray-100 space-y-6">
                  <div className="flex items-center gap-3 text-teal-600 mb-4">
                     <ShieldCheck size={24} />
                     <h3 className="font-black">AI解析結果</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</p>
                        <p className="text-lg font-black text-gray-900">{result.name || '---'}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Birthdate</p>
                        <p className="text-lg font-black text-gray-900">{result.birthdate || '---'}</p>
                     </div>
                     <div className="col-span-2 space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verification Status</p>
                        <div className={`flex items-center gap-2 p-3 rounded-2xl border font-bold text-xs ${result.is_valid ? 'bg-green-100 border-green-200 text-green-700' : 'bg-red-100 border-red-200 text-red-700'}`}>
                           {result.is_valid ? <CheckCircle size={14}/> : <AlertCircle size={14}/>}
                           {result.is_valid ? 'すべての要件を満たしています' : result.reason || '情報を読み取れません'}
                        </div>
                     </div>
                  </div>

                  {result.is_valid && (
                    <button 
                      onClick={handleComplete}
                      className="w-full mt-6 bg-gray-900 text-white py-5 rounded-[24px] font-black text-sm hover:bg-teal-600 transition-all shadow-xl"
                    >
                       この内容で申請を確定する
                    </button>
                  )}
               </div>
             )}

             <button onClick={() => { setImage(null); setResult(null); }} className="w-full text-gray-400 font-black text-xs hover:underline">
                画像を撮り直す
             </button>
          </div>
        )}
      </div>

      <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[40px] flex items-start gap-6">
         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><FileText /></div>
         <div className="space-y-2">
            <h4 className="font-black text-indigo-900">情報の保護について</h4>
            <p className="text-xs text-indigo-700 leading-relaxed font-bold opacity-80">
               提出された画像データは本人確認の目的以外には使用されず、暗号化された状態で運営本部が厳重に管理します。
               AI解析は安全な専用プロトコルを通じて実行されます。
            </p>
         </div>
      </div>
    </div>
  );
};

export default KYCVerification;
