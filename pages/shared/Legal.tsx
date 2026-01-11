
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShieldCheck, Lock, FileText, ShieldAlert, 
  Scale, Clock, AlertCircle, Eye, Shield, CheckCircle 
} from 'lucide-react';

const Legal: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'TERMS' | 'PRIVACY' | 'SAFETY'>('TERMS');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900 flex items-center gap-2 font-black text-sm uppercase tracking-widest transition-colors">
            <ArrowLeft size={20} /> Back
          </button>
          <h1 className="text-xl font-black text-gray-900 tracking-tighter uppercase">Legal & Compliance</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 pb-32">
        <div className="flex gap-2 mb-12 overflow-x-auto no-scrollbar border-b border-gray-200">
          {[
            { id: 'TERMS', label: '利用規約', icon: <Scale size={16}/> },
            { id: 'PRIVACY', label: 'プライバシーポリシー', icon: <Lock size={16}/> },
            { id: 'SAFETY', label: '安全ガイドライン', icon: <ShieldAlert size={16}/> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 px-8 font-black text-sm transition-all border-b-4 whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white p-10 md:p-16 rounded-[64px] shadow-sm border border-gray-100 leading-relaxed animate-fade-in">
          {activeTab === 'TERMS' && <TermsOfService />}
          {activeTab === 'PRIVACY' && <PrivacyPolicy />}
          {activeTab === 'SAFETY' && <SafetyProtocol />}
        </div>
      </div>
    </div>
  );
};

const TermsOfService = () => (
  <div className="space-y-12 text-gray-800 text-sm md:text-base">
    <div className="border-b border-gray-100 pb-8 text-center md:text-left">
       <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-4">サービス利用規約</h2>
       <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Soothe x CARE CUBE Japan Platform Service Agreement</p>
    </div>

    <section className="space-y-4">
       <h3 className="text-xl font-black flex items-center gap-3"><span className="w-1.5 h-6 bg-teal-600 rounded-full"></span>第1条（目的）</h3>
       <p className="font-medium text-gray-600 leading-relaxed">
          本規約は、株式会社Soothe（以下「当社」）が提供するウェルネスプラットフォーム（以下「本サービス」）において、施術を希望する利用者（以下「ユーザー」）と、施術を提供するパートナー（以下「セラピスト」）との間の権利義務関係を定めるものです。
       </p>
    </section>

    <section className="space-y-6">
       <h3 className="text-xl font-black flex items-center gap-3 text-red-600"><span className="w-1.5 h-6 bg-red-600 rounded-full"></span>第2条（厳格な禁止事項）</h3>
       <div className="bg-red-50 p-6 md:p-8 rounded-[32px] border border-red-100 space-y-4">
          <p className="font-black text-red-800">以下の行為は一切禁止されており、違反が確認された場合は即時のアカウント永久停止、および損害賠償請求（違約金100万円〜）の対象となります。</p>
          <ul className="space-y-4 list-none">
             <li className="flex gap-4">
                <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black">1</div>
                <p><strong>直接取引および連絡先交換の禁止：</strong> 本サービスを介さずにセラピストとユーザーが直接予約を行うこと、またはSNS（LINE等）や電話番号を交換・教示する行為。</p>
             </li>
             <li className="flex gap-4">
                <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black">2</div>
                <p><strong>ハラスメント・公序良俗違反：</strong> セラピストに対する性的な言動、身体的接触の強要、威圧的な態度、暴力行為。</p>
             </li>
             <li className="flex gap-4">
                <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black">3</div>
                <p><strong>虚偽通報：</strong> 正当な理由なくSOSボタン（緊急通報）を作動させ、警察・警備会社・運営を不当に稼働させる行為。</p>
             </li>
             <li className="flex gap-4">
                <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black">4</div>
                <p><strong>評価操作：</strong> 不当な低評価による嫌がらせ、または自己や特定のパートナーの評価を不正に向上させるサクラ行為。</p>
             </li>
          </ul>
       </div>
    </section>

    <section className="space-y-4">
       <h3 className="text-xl font-black flex items-center gap-3"><span className="w-1.5 h-6 bg-teal-600 rounded-full"></span>第3条（段階的情報開示システム）</h3>
       <p className="font-medium text-gray-600 leading-relaxed">
          安全性を確保するため、ユーザーの個人情報は予約ステータスに応じて段階的に開示されます。
       </p>
       <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>予約前：ニックネーム、エリア、評価履歴のみ。</li>
          <li>予約確定後：実名、チャット機能の開放。</li>
          <li>施術開始直前：正確な位置情報および詳細住所（出張時のみ）の開放。</li>
       </ul>
    </section>

    <section className="space-y-4">
       <h3 className="text-xl font-black flex items-center gap-3"><span className="w-1.5 h-6 bg-teal-600 rounded-full"></span>第4条（緊急通報とAI監視）</h3>
       <p className="font-medium text-gray-600 leading-relaxed">
          セッション中の安全確保のため、ユーザーおよびセラピストは以下の事項に同意するものとします。
       </p>
       <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-bold text-gray-500">
             SOSボタン作動時、運営本部・警備会社への自動音声接続、および現場位置情報の自動送信。
          </div>
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-bold text-gray-500">
             AI Sentinelによる音声の解析（セマンティック分析）による異常検知およびフラグ立て。
          </div>
       </div>
    </section>
  </div>
);

const PrivacyPolicy = () => (
  <div className="space-y-12 text-gray-800 text-sm md:text-base">
    <div className="border-b border-gray-100 pb-8 text-center md:text-left">
       <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-4">プライバシーポリシー</h2>
       <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Global Data Privacy Standard</p>
    </div>

    <section className="space-y-4">
       <h3 className="text-xl font-black flex items-center gap-3"><Shield className="text-teal-600" /> 1. 取得する情報</h3>
       <p className="font-medium text-gray-600 leading-relaxed">
          当社は本サービスの提供にあたり、以下の情報を高度な暗号化下で取得します。
       </p>
       <ul className="list-disc pl-6 space-y-3 text-gray-600">
          <li><strong>本人確認情報：</strong> KYCプロセスで提出された身分証画像、氏名、生年月日、住所。</li>
          <li><strong>動態情報：</strong> 施術開始から終了までのリアルタイムGPS位置情報データ。</li>
          <li><strong>対話データ：</strong> 運営・AIによる監視を目的とした、セッション中の音声特徴量およびチャット履歴。</li>
          <li><strong>危険フラグ情報：</strong> 規約違反の疑いやトラブル履歴に基づく、AIが付与した信用スコア。</li>
       </ul>
    </section>

    <section className="space-y-4 bg-teal-900 text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden">
       <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500 rounded-full blur-[100px] opacity-20"></div>
       <div className="relative z-10">
          <h3 className="text-xl font-black flex items-center gap-3 mb-6"><Clock /> 2. 監査ログの保存期間（5年ルール）</h3>
          <p className="font-bold leading-relaxed opacity-90 mb-6">
             当社は、万が一の事件発覚や法的紛争に備え、以下の情報をサービス利用終了後**「最大5年間」**物理的な改ざんが不可能なログ形式で保持します。
          </p>
          <ul className="grid md:grid-cols-2 gap-4 text-xs font-black opacity-80 uppercase tracking-widest">
             <li className="flex items-center gap-2"><CheckCircle size={14}/> 位置情報履歴</li>
             <li className="flex items-center gap-2"><CheckCircle size={14}/> チャットログ</li>
             <li className="flex items-center gap-2"><CheckCircle size={14}/> 決済・精算証跡</li>
             <li className="flex items-center gap-2"><CheckCircle size={14}/> インシデント報告</li>
          </ul>
       </div>
    </section>

    <section className="space-y-4">
       <h3 className="text-xl font-black flex items-center gap-3"><Eye className="text-teal-600" /> 3. 第三者提供と緊急開示</h3>
       <p className="font-medium text-gray-600 leading-relaxed">
          原則として同意なく第三者に提供しませんが、以下の場合に限り開示します。
       </p>
       <div className="p-6 bg-red-50 rounded-3xl border border-red-100">
          <p className="text-sm font-bold text-red-800 leading-relaxed italic">
            「SOS発報時、またはAIが『生命・身体の危険』を検知した場合、当社の判断で即座に管轄警察署、および契約警備会社へ氏名・位置情報・現場音声を共有します。」
          </p>
       </div>
    </section>
  </div>
);

const SafetyProtocol = () => (
  <div className="space-y-12 animate-fade-in">
    <div className="bg-orange-50 p-10 rounded-[48px] border-2 border-orange-100 flex flex-col md:flex-row items-center gap-8 shadow-sm">
       <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center flex-shrink-0 shadow-inner">
          <ShieldAlert size={40} />
       </div>
       <div>
          <h3 className="text-2xl font-black text-orange-900 tracking-tight">出張安全ガイドライン (Safety First)</h3>
          <p className="text-orange-700 font-bold text-sm mt-1 leading-relaxed">
            密室でのトラブルを100%防ぐため、全ユーザーが守るべき行動規範です。
          </p>
       </div>
    </div>

    <div className="grid md:grid-cols-2 gap-8">
       <div className="p-8 bg-white border border-gray-100 rounded-[40px] shadow-sm space-y-6">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shadow-inner"><AlertCircle size={24} /></div>
          <h4 className="font-black text-lg">危険フラグシステム</h4>
          <p className="text-sm text-gray-500 font-bold leading-relaxed">
            AIが過去の予約・キャンセル・チャット内容・評価をリアルタイムでスコアリング。
            <span className="text-orange-600">「危険フラグ」</span>が立ったアカウントは、マッチングが制限され、強制的にビデオ通話確認の対象となります。
          </p>
       </div>
       <div className="p-8 bg-white border border-gray-100 rounded-[40px] shadow-sm space-y-6">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner"><CheckCircle size={24} /></div>
          <h4 className="font-black text-lg">相互KYCの徹底</h4>
          <p className="text-sm text-gray-500 font-bold leading-relaxed">
            セラピストは国家資格または身分証、ユーザーは公的身分証による認証を必須化。
            偽名や代理予約は規約違反となり、現場でのサービス提供を拒否することがあります。
          </p>
       </div>
    </div>

    <section className="bg-slate-900 p-10 rounded-[56px] text-white relative overflow-hidden shadow-2xl">
       <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[120px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
       <h3 className="text-xl font-black mb-8 border-l-4 border-teal-500 pl-4">現場での安全プロトコル</h3>
       <div className="space-y-6">
          {[
            { title: "到着・入室時", desc: "セラピストは入室直前に『到着通知』をアプリで送信。GPSが特定位置に固定されたことを確認後、タイマーが作動します。" },
            { title: "施術中", desc: "スマホを常にセラピストの手が届く範囲に置くこと。緊急時は声、またはボリュームボタンの同時押しでSOS可能です。" },
            { title: "終了時", desc: "セラピストは退室直後に『完了・安全確認』ボタンを押下。ユーザー側も完了を承認することで、相互の安全が担保されます。" }
          ].map((item, i) => (
            <div key={i} className="flex gap-6 items-start group">
               <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-all shadow-inner">{i+1}</div>
               <div>
                  <h4 className="font-black text-base text-teal-400">{item.title}</h4>
                  <p className="text-sm font-bold text-gray-400 mt-1 leading-relaxed">{item.desc}</p>
               </div>
            </div>
          ))}
       </div>
    </section>

    <div className="text-center py-6">
       <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em]">© 2025 Soothe Japan Compliance & Trust</p>
    </div>
  </div>
);

export default Legal;
