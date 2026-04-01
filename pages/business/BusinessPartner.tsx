
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, CheckCircle, Building2,
  TrendingUp, Cpu, BarChart3, Shield, Zap, ChevronRight,
  Hotel, Briefcase, ShoppingBag, Sparkles
} from 'lucide-react';
import PortalLayout from '../portal/PortalLayout';

const BusinessPartner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PortalLayout>
      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gray-950">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 text-center px-6 max-w-5xl w-full space-y-8">
          <div className="inline-flex items-center gap-2 bg-indigo-500/15 backdrop-blur-md text-indigo-400 px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] border border-indigo-500/30">
            <Sparkles size={12} /> For Facility Partners
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-[-0.03em]">
            空きスペースを、<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400">収益源に変える。</span>
          </h1>
          <p className="text-xl text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
            ホテル・オフィス・商業施設のデッドスペースに「CARE CUBE」を設置するだけ。<br className="hidden md:block" />
            初期投資ゼロ、完全無人運用で新たな収益を生み出します。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:partner@hogusy.com"
              className="bg-indigo-500 hover:bg-indigo-400 text-white px-10 py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-500/30 active:scale-95 group"
            >
              パートナー申請する <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <button
              onClick={() => navigate('/business/care-cube')}
              className="border border-white/20 text-white px-10 py-4 rounded-2xl font-black text-base hover:bg-white/10 transition-all flex items-center justify-center gap-3 group"
            >
              CARE CUBE詳細 <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* 対象施設 */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] block">Target Partners</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">こんな施設に最適です</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Hotel,
                color: 'indigo',
                title: 'ホテル・旅館',
                desc: 'ロビー・共用スペースの空きエリアを活用。宿泊客への付加価値サービスとして提供。「外部スタッフを客室に入れたくない」という課題を解決します。',
                points: ['ロビー・廊下スペース活用', '宿泊客の満足度向上', '館内サービスの充実', '無人運用でスタッフ負担ゼロ'],
              },
              {
                icon: Briefcase,
                color: 'teal',
                title: 'オフィス・企業',
                desc: '社員の健康経営・福利厚生として。会議室の空き時間や未使用スペースを活用。従業員の生産性向上と採用競争力の強化に貢献します。',
                points: ['福利厚生・健康経営', '会議室の空き時間活用', '採用競争力の向上', '社員のストレス軽減'],
              },
              {
                icon: ShoppingBag,
                color: 'rose',
                title: '商業施設・SC',
                desc: '館内の集客力向上と滞在時間の延長に。フロア内の空きテナントや通路スペースを活用。新しい体験型コンテンツとして差別化を図れます。',
                points: ['集客力・滞在時間向上', '空きテナント活用', '体験型コンテンツ', 'リピーター獲得'],
              },
            ].map(({ icon: Icon, color, title, desc, points }) => (
              <div key={title} className={`bg-${color}-50 rounded-[40px] p-10 border-2 border-${color}-100 hover:border-${color}-400 transition-all hover:shadow-xl group`}>
                <div className="space-y-6">
                  <div className={`w-14 h-14 bg-${color}-500 rounded-2xl flex items-center justify-center shadow-lg`}>
                    <Icon size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-3">{title}</h3>
                    <p className="text-gray-600 font-medium leading-relaxed text-sm">{desc}</p>
                  </div>
                  <ul className="space-y-2">
                    {points.map(p => (
                      <li key={p} className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                        <CheckCircle size={14} className={`text-${color}-500 shrink-0`} /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 収益モデル */}
      <section className="py-20 px-4 bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-black text-teal-400 uppercase tracking-[0.4em] block">Revenue Model</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">収益モデルと導入フロー</h2>
            <p className="text-gray-400 font-medium text-lg max-w-2xl mx-auto">
              初期費用・月額固定費ゼロ。売上が発生した分だけのレベニューシェアモデルで、リスクなく始められます。
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4">
                <div className="text-teal-400 font-black text-sm uppercase tracking-widest">レベニューシェアモデル</div>
                <div className="text-5xl font-black text-white">売上の<span className="text-teal-400">XX%</span></div>
                <p className="text-gray-400 font-medium text-sm leading-relaxed">
                  施術が完了するたびに、売上の一定割合がパートナー様に自動で分配されます。
                  初期投資・月額固定費は一切不要。CARE CUBEの設置・撤去もHOGUSYが対応します。
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: '初期費用', value: '¥0', note: 'HOGUSY負担' },
                  { label: '月額固定費', value: '¥0', note: '完全成果報酬' },
                  { label: '設置工事', value: '不要', note: 'HOGUSYが対応' },
                  { label: '運用管理', value: '完全無人', note: 'IoT自動制御' },
                ].map(({ label, value, note }) => (
                  <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                    <div className="text-2xl font-black text-teal-400 mb-1">{value}</div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</div>
                    <div className="text-[10px] text-gray-500 mt-1">{note}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="font-black text-gray-400 text-sm uppercase tracking-widest mb-6">導入フロー</div>
              {[
                { step: '01', title: 'お問い合わせ', desc: 'メールまたはフォームからご連絡ください。担当者が48時間以内にご返信します。' },
                { step: '02', title: '現地調査・提案', desc: '施設の空きスペースを確認し、最適なCARECUBE設置プランをご提案します。' },
                { step: '03', title: '契約・設置', desc: 'レベニューシェア契約締結後、CARE CUBEを設置。工事不要で最短1週間で稼働開始。' },
                { step: '04', title: '運用開始・収益化', desc: 'HOGUSYプラットフォームに施設情報が掲載され、予約受付・収益分配が自動で開始。' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-teal-500/20 border border-teal-500/30 rounded-2xl flex items-center justify-center shrink-0">
                    <span className="text-teal-400 font-black text-sm">{step}</span>
                  </div>
                  <div>
                    <div className="font-black text-white mb-1">{title}</div>
                    <div className="text-sm text-gray-400 font-medium leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-indigo-600">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
            パートナーシップのご相談
          </h2>
          <p className="text-indigo-100 text-lg font-medium leading-relaxed">
            まずはお気軽にご連絡ください。<br />
            担当者が貴施設に最適なプランをご提案いたします。
          </p>
          <a
            href="mailto:partner@hogusy.com"
            className="inline-flex items-center gap-3 bg-white text-indigo-700 px-12 py-5 rounded-2xl font-black text-base hover:bg-indigo-50 transition-all shadow-2xl active:scale-95 group"
          >
            partner@hogusy.com にメールする <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </section>
    </PortalLayout>
  );
};

export default BusinessPartner;
