
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, Cpu, Zap, Shield, BarChart3,
  Lock, Wind, Sparkles, Wifi, Volume2, Smartphone
} from 'lucide-react';
import PortalLayout from '../portal/PortalLayout';

const BusinessCareCube: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PortalLayout>
      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gray-950">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 text-center px-6 max-w-5xl w-full space-y-8">
          <div className="inline-flex items-center gap-2 bg-teal-500/15 backdrop-blur-md text-teal-400 px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] border border-teal-500/30">
            <Sparkles size={12} /> Core Infrastructure Product
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-[-0.03em]">
            CARE CUBE<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">スマート施術ブース</span>
          </h1>
          <p className="text-xl text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
            日本の都市環境に最適化した、設置・撤去が容易なモジュール型施術ブース。<br className="hidden md:block" />
            IoTとAIで、どこでも最高のプライベート施術空間を実現します。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/business/partner')}
              className="bg-teal-500 hover:bg-teal-400 text-white px-10 py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-lg shadow-teal-500/30 active:scale-95 group"
            >
              設置のご相談 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* コンセプト */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <span className="text-[10px] font-black text-teal-600 uppercase tracking-[0.4em] block mb-4">Concept</span>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-tight">
                  空間を変える、<br />体験を変える
                </h2>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed font-medium">
                CARE CUBEは、「どこでも最高の施術体験を」というコンセプトのもと開発された
                モジュール型スマート施術ブースです。
              </p>
              <p className="text-gray-600 text-lg leading-relaxed font-medium">
                従来の施術室は、大規模な内装工事と多額の初期投資が必要でした。
                CARE CUBEは工事不要で設置でき、IoT技術により完全無人運用を実現。
                施設オーナーの手間とコストを最小化しながら、最高の施術環境を提供します。
              </p>
              <ul className="space-y-3">
                {[
                  '工事不要・最短1週間で設置完了',
                  '完全無人運用（スタッフ配置不要）',
                  'HOGUSYプラットフォームと完全連携',
                  'カスタムブランディング対応',
                  '設置・撤去・移設が容易',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-700 font-medium">
                    <CheckCircle size={18} className="text-teal-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="aspect-square rounded-[60px] overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800"
                alt="CARE CUBE"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* IoT機能 */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-black text-teal-600 uppercase tracking-[0.4em] block">IoT Features</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">スマートテクノロジー</h2>
            <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto">
              最先端のIoT技術で、施術空間のすべてをスマートに制御。
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Lock, title: 'スマートロック', desc: '予約確定後、顧客のスマートフォンに解錠コードを自動送信。チェックイン・チェックアウトを完全自動化。' },
              { icon: Wind, title: 'IoT空調制御', desc: '施術開始前に自動で室温を最適化。季節・時間帯に応じた快適な環境を自動維持。' },
              { icon: Sparkles, title: 'アロマ自動制御', desc: '施術メニューに応じて最適なアロマを自動選択・噴霧。五感に訴える施術体験を演出。' },
              { icon: Volume2, title: '環境音・BGM', desc: 'リラクゼーション効果を高める環境音・BGMを自動再生。施術の質を向上させます。' },
              { icon: Wifi, title: 'リアルタイム監視', desc: '稼働状況・環境データをリアルタイムでクラウドに送信。異常検知時は即座にアラート。' },
              { icon: Smartphone, title: 'アプリ連携', desc: 'HOGUSYアプリと完全連携。予約・入室・退室・決済がすべてスマートフォン一台で完結。' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-3xl p-8 space-y-4 border-2 border-gray-100 hover:border-teal-300 hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center">
                  <Icon size={24} className="text-teal-600" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 仕様 */}
      <section className="py-20 px-4 bg-gray-950 text-white">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-black text-teal-400 uppercase tracking-[0.4em] block">Specifications</span>
            <h2 className="text-4xl font-black tracking-tighter">製品仕様</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { label: 'サイズ', value: '約2.0m × 1.5m × 2.2m（H）' },
              { label: '重量', value: '約350kg（設置後）' },
              { label: '電源', value: '100V 15A（一般家庭用コンセント対応）' },
              { label: '設置方法', value: '工事不要・アンカーレス設置' },
              { label: '防音性能', value: '約30dB減衰（会話音が聞こえないレベル）' },
              { label: '空調', value: '独立型エアコン内蔵（冷暖房対応）' },
              { label: '通信', value: 'Wi-Fi / LTE（SIM内蔵）' },
              { label: 'カスタマイズ', value: '外装デザイン・ロゴ・カラー対応' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 shrink-0" />
                <div>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{label}</div>
                  <div className="text-white font-black">{value}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 text-sm font-medium">
            ※ 仕様は予告なく変更される場合があります。詳細はお問い合わせください。
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-teal-600">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
            CARE CUBE設置のご相談
          </h2>
          <p className="text-teal-100 text-lg font-medium leading-relaxed">
            貴施設への設置可否・収益シミュレーションなど、<br />
            まずはお気軽にご相談ください。
          </p>
          <button
            onClick={() => navigate('/business/partner')}
            className="inline-flex items-center gap-3 bg-white text-teal-700 px-12 py-5 rounded-2xl font-black text-base hover:bg-teal-50 transition-all shadow-2xl active:scale-95 group"
          >
            パートナーページへ <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </PortalLayout>
  );
};

export default BusinessCareCube;
