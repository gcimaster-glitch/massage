
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, CheckCircle, Building2, UserCheck, Users,
  Zap, Shield, TrendingUp, ChevronRight, Sparkles, Star, Globe,
  BarChart3, Lock, Cpu
} from 'lucide-react';
import PortalLayout from '../portal/PortalLayout';

const BusinessIndex: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PortalLayout>
      {/* ===== HERO ===== */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gray-950">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 text-center px-6 max-w-5xl w-full space-y-10">
          <div className="inline-flex items-center gap-2 bg-teal-500/15 backdrop-blur-md text-teal-400 px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] border border-teal-500/30">
            <Sparkles size={12} /> Business Solutions by HOGUSY
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-[-0.03em]">
            ウェルネスを、<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-teal-300 to-cyan-400">ビジネスの力に。</span>
          </h1>
          <p className="text-xl text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
            HOGUSY株式会社は、日本のウェルネス産業をテクノロジーで再定義します。<br className="hidden md:block" />
            施設オーナー・セラピスト・ユーザーの三者が共に成長するプラットフォームです。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/business/partner')}
              className="bg-teal-500 hover:bg-teal-400 text-white px-10 py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-lg shadow-teal-500/30 active:scale-95 group"
            >
              施設・パートナー向け <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/business/therapist')}
              className="border border-white/20 text-white px-10 py-4 rounded-2xl font-black text-base hover:bg-white/10 transition-all flex items-center justify-center gap-3 group"
            >
              セラピスト向け <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ===== 会社概要 ===== */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <span className="text-[10px] font-black text-teal-600 uppercase tracking-[0.4em] block mb-4">About HOGUSY</span>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-tight">
                  日本のウェルネス産業を<br />インフラから変える
                </h2>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed font-medium">
                HOGUSY株式会社は、「癒やしをインフラに」というビジョンのもと、
                マッサージ・整体・スパなどのウェルネスサービスを誰もが気軽に利用できる
                社会インフラとして整備することを目指しています。
              </p>
              <p className="text-gray-600 text-lg leading-relaxed font-medium">
                独自開発のスマート施術ブース「CARE CUBE」と、AIを活用した予約・マッチングプラットフォームを組み合わせることで、
                ユーザー・セラピスト・施設オーナーの三者が共に価値を創出するエコシステムを構築しています。
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: '設立', value: '2023年' },
                  { label: '事業領域', value: 'ウェルネステック' },
                  { label: '提供エリア', value: '東京都心・拡大中' },
                  { label: 'ビジネスモデル', value: 'BtoB / BtoC / BtoBtoC' },
                ].map(({ label, value }) => (
                  <div key={label} className="border-l-2 border-teal-500 pl-4">
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{label}</div>
                    <div className="text-base font-black text-gray-900">{value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[60px] overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&q=80&w=800"
                  alt="HOGUSY ウェルネス空間"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-gray-950 text-white rounded-[32px] p-6 shadow-2xl border border-white/10 max-w-[240px]">
                <div className="text-3xl font-black text-teal-400 mb-1">97%</div>
                <div className="text-sm text-gray-400 font-medium">顧客満足度</div>
              </div>
              <div className="absolute -top-6 -right-6 bg-teal-500 text-white rounded-[32px] p-6 shadow-2xl max-w-[200px]">
                <div className="text-3xl font-black mb-1">500+</div>
                <div className="text-sm text-teal-100 font-medium">登録セラピスト</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ビジネスモデル3軸 ===== */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-black text-teal-600 uppercase tracking-[0.4em] block">Business Model</span>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter">
              3つの事業軸
            </h2>
            <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">
              HOGUSYは単なる予約プラットフォームではありません。インフラ・テクノロジー・コミュニティの三位一体で市場を創造します。
            </p>
          </div>
          <div className="space-y-6">
            {/* BtoC */}
            <div className="bg-white rounded-[40px] p-10 md:p-14 border-2 border-gray-100 hover:border-teal-300 transition-all group">
              <div className="grid md:grid-cols-3 gap-10 items-start">
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-3 py-1.5 rounded-full inline-block">BtoC</span>
                  <h3 className="text-3xl font-black text-gray-900">一般ユーザー向け<br />予約プラットフォーム</h3>
                  <p className="text-gray-500 font-medium leading-relaxed">
                    スマートフォンから数タップで、近くのプロのセラピストと施術空間を予約。
                    ログイン不要のゲスト予約機能で、初めての方でも摩擦なく体験できます。
                  </p>
                  <button
                    onClick={() => navigate('/therapists')}
                    className="inline-flex items-center gap-2 text-teal-600 font-black text-sm hover:gap-3 transition-all"
                  >
                    セラピストを探す <ArrowRight size={16} />
                  </button>
                </div>
                <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: Zap, title: 'ゲスト予約', desc: 'ログイン不要で即座に予約完了。会員登録は後からでもOK。' },
                    { icon: Lock, title: 'タイムロック', desc: '日時選択後10分間の仮押さえで、二重予約を完全防止。' },
                    { icon: BarChart3, title: 'リアルタイム空き確認', desc: 'セラピストの空き状況をリアルタイムで表示。' },
                    { icon: Shield, title: 'セキュア決済', desc: 'Stripe連携による安全なキャッシュレス決済。' },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="bg-gray-50 rounded-2xl p-6 space-y-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                        <Icon size={20} className="text-teal-600" />
                      </div>
                      <div className="font-black text-gray-900">{title}</div>
                      <div className="text-sm text-gray-500 font-medium leading-relaxed">{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BtoB */}
            <div className="bg-gray-950 rounded-[40px] p-10 md:p-14 border-2 border-gray-800 hover:border-teal-800 transition-all group">
              <div className="grid md:grid-cols-3 gap-10 items-start">
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-full inline-block">BtoB</span>
                  <h3 className="text-3xl font-black text-white">施設・パートナー向け<br />CARE CUBEインフラ</h3>
                  <p className="text-gray-400 font-medium leading-relaxed">
                    ホテル・オフィス・商業施設のデッドスペースを、
                    スマート施術ブース「CARE CUBE」で収益化。
                    完全無人運用でオーナーの手間はゼロ。
                  </p>
                  <button
                    onClick={() => navigate('/business/partner')}
                    className="inline-flex items-center gap-2 text-teal-400 font-black text-sm hover:gap-3 transition-all"
                  >
                    パートナー詳細を見る <ArrowRight size={16} />
                  </button>
                </div>
                <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: Building2, title: 'CARE CUBE設置', desc: 'ホテルロビー・オフィス・商業施設に最適化した施術ブース。' },
                    { icon: TrendingUp, title: 'レベニューシェア', desc: '売上の一定割合をパートナーに還元。初期投資不要。' },
                    { icon: Cpu, title: 'IoT完全無人運用', desc: 'スマートロック・空調・アロマをアプリで一元制御。' },
                    { icon: BarChart3, title: 'ダッシュボード', desc: '稼働率・売上・予約状況をリアルタイムで可視化。' },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                      <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center">
                        <Icon size={20} className="text-teal-400" />
                      </div>
                      <div className="font-black text-white">{title}</div>
                      <div className="text-sm text-gray-400 font-medium leading-relaxed">{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* セラピスト */}
            <div className="bg-white rounded-[40px] p-10 md:p-14 border-2 border-gray-100 hover:border-rose-300 transition-all group">
              <div className="grid md:grid-cols-3 gap-10 items-start">
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1.5 rounded-full inline-block">セラピスト</span>
                  <h3 className="text-3xl font-black text-gray-900">セラピスト向け<br />キャリア支援プラットフォーム</h3>
                  <p className="text-gray-500 font-medium leading-relaxed">
                    プロフィール作成から予約管理・報酬受取まで一元管理。
                    自分のペースで稼働し、高単価案件を安定的に獲得できます。
                  </p>
                  <button
                    onClick={() => navigate('/business/therapist')}
                    className="inline-flex items-center gap-2 text-rose-600 font-black text-sm hover:gap-3 transition-all"
                  >
                    セラピスト登録を見る <ArrowRight size={16} />
                  </button>
                </div>
                <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: UserCheck, title: 'KYC認証システム', desc: '本人確認・資格証明で信頼性を担保。ユーザーに安心を提供。' },
                    { icon: Star, title: 'レビュー・ブランディング', desc: '累積レビューがプロフィールの資産になる仕組み。' },
                    { icon: TrendingUp, title: '報酬自動計算', desc: '施術完了後、自動で報酬計算・振込。手数料は業界最低水準。' },
                    { icon: Globe, title: 'スケジュール自由設定', desc: '稼働日・時間・エリアを自分でコントロール。副業にも最適。' },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="bg-gray-50 rounded-2xl p-6 space-y-3">
                      <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                        <Icon size={20} className="text-rose-600" />
                      </div>
                      <div className="font-black text-gray-900">{title}</div>
                      <div className="text-sm text-gray-500 font-medium leading-relaxed">{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CARE CUBE ===== */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-950 rounded-[60px] p-12 md:p-20 overflow-hidden relative text-white">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
              <div className="space-y-8">
                <div>
                  <span className="bg-teal-500/20 text-teal-400 border border-teal-500/30 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-4">Core Product</span>
                  <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight">
                    CARE CUBE<br /><span className="text-teal-400">スマート施術ブース</span>
                  </h2>
                </div>
                <p className="text-gray-400 text-lg font-medium leading-relaxed">
                  日本の都市環境に最適化した、設置・撤去が容易なモジュール型施術ブース。
                  ホテルのロビー、オフィスのデッドスペース、商業施設の空きスペースを
                  即座に最高のプライベート施術空間へと変貌させます。
                </p>
                <ul className="grid grid-cols-2 gap-4">
                  {[
                    'スマートロック完全無人運用',
                    'IoT空調・アロマ制御',
                    'プライバシー・防音設計',
                    '設置工事不要',
                    'リアルタイム稼働監視',
                    'カスタムブランディング対応',
                  ].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                      <CheckCircle size={14} className="text-teal-400 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/business/care-cube')}
                  className="bg-white text-gray-900 px-10 py-5 rounded-[28px] font-black text-base hover:bg-teal-400 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center gap-3 group"
                >
                  CARE CUBE詳細を見る <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="aspect-video rounded-[40px] overflow-hidden shadow-2xl border-4 border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200"
                  alt="CARE CUBE"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 px-4 bg-teal-600">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
            まずはご相談ください
          </h2>
          <p className="text-teal-100 text-xl font-medium leading-relaxed">
            施設オーナー・セラピスト・投資家の方など、<br className="hidden md:block" />
            HOGUSYとのパートナーシップにご興味のある方はお気軽にお問い合わせください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/business/partner')}
              className="bg-white text-teal-700 px-10 py-4 rounded-2xl font-black text-base hover:bg-teal-50 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 group"
            >
              施設・パートナー向け <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/business/therapist')}
              className="border-2 border-white/40 text-white px-10 py-4 rounded-2xl font-black text-base hover:bg-white/10 transition-all flex items-center justify-center gap-3 group"
            >
              セラピスト登録 <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </PortalLayout>
  );
};

export default BusinessIndex;
