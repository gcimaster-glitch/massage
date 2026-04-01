
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, UserCheck, Star, TrendingUp, Globe,
  Calendar, Shield, Zap, BarChart3, Sparkles, Clock, DollarSign
} from 'lucide-react';
import PortalLayout from '../portal/PortalLayout';

const BusinessTherapist: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PortalLayout>
      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gray-950">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 text-center px-6 max-w-5xl w-full space-y-8">
          <div className="inline-flex items-center gap-2 bg-rose-500/15 backdrop-blur-md text-rose-400 px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] border border-rose-500/30">
            <Sparkles size={12} /> For Professional Therapists
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-[-0.03em]">
            あなたの技術を、<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">最高の舞台で。</span>
          </h1>
          <p className="text-xl text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
            HOGUSYに登録すれば、集客・予約管理・決済・報酬受取まで<br className="hidden md:block" />
            すべてがプラットフォームで完結。あなたは施術に集中できます。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/app/signup')}
              className="bg-rose-500 hover:bg-rose-400 text-white px-10 py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-lg shadow-rose-500/30 active:scale-95 group"
            >
              無料でセラピスト登録 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/therapists')}
              className="border border-white/20 text-white px-10 py-4 rounded-2xl font-black text-base hover:bg-white/10 transition-all flex items-center justify-center gap-3"
            >
              登録セラピストを見る
            </button>
          </div>
        </div>
      </section>

      {/* 数字で見るメリット */}
      <section className="bg-rose-600 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-rose-500">
            {[
              { value: '¥0', label: '登録費用', note: '完全無料で始められる' },
              { value: '最短1週間', label: '稼働開始まで', note: 'KYC審査完了後すぐ' },
              { value: '業界最低水準', label: 'プラットフォーム手数料', note: '高い報酬を実現' },
              { value: '自由設定', label: '稼働時間・エリア', note: '副業・本業どちらも対応' },
            ].map(({ value, label, note }) => (
              <div key={label} className="text-center px-6">
                <div className="text-3xl md:text-4xl font-black text-white mb-1">{value}</div>
                <div className="text-sm font-black text-rose-100 mb-1">{label}</div>
                <div className="text-xs text-rose-200">{note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 機能一覧 */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.4em] block">Platform Features</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">セラピストを支える機能</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: UserCheck, color: 'rose', title: 'KYC認証システム', desc: '本人確認・資格証明書のアップロードで、プロとしての信頼性を証明。「VERIFIED」バッジで予約率が大幅向上します。' },
              { icon: Calendar, color: 'rose', title: 'スケジュール管理', desc: '稼働日・時間・対応エリアを自分でコントロール。急な予定変更にも柔軟に対応できます。' },
              { icon: DollarSign, color: 'rose', title: '報酬自動計算・振込', desc: '施術完了後、自動で報酬を計算。指定の口座に定期振込。手数料は業界最低水準。' },
              { icon: Star, color: 'orange', title: 'レビュー累積', desc: '顧客からのレビューがプロフィールの資産に。高評価が積み重なるほど、上位表示・高単価案件の獲得につながります。' },
              { icon: BarChart3, color: 'orange', title: '収益ダッシュボード', desc: '月次・週次の売上、予約数、稼働時間を可視化。自分のビジネスを数字で管理できます。' },
              { icon: Globe, color: 'orange', title: 'プロフィールページ', desc: '専用のプロフィールページで自分をブランディング。得意メニュー・資格・経歴を詳細に掲載できます。' },
              { icon: Zap, color: 'teal', title: 'タイムロック予約', desc: '日時選択後10分間の仮押さえで、ドタキャン・二重予約を防止。確実な稼働計画を立てられます。' },
              { icon: Shield, color: 'teal', title: '安全な決済システム', desc: 'Stripe連携で、現金のやり取りなし。施術後の料金トラブルを完全に防止します。' },
              { icon: Clock, color: 'teal', title: '副業・フリーランス対応', desc: '本業の合間に副業として活用することも可能。週1日からでも登録・稼働できます。' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-gray-50 rounded-3xl p-8 space-y-4 hover:shadow-lg transition-all">
                <div className={`w-12 h-12 bg-${color}-100 rounded-2xl flex items-center justify-center`}>
                  <Icon size={24} className={`text-${color}-600`} />
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

      {/* 登録フロー */}
      <section className="py-20 px-4 bg-gray-950 text-white">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.4em] block">Registration Flow</span>
            <h2 className="text-4xl font-black tracking-tighter">登録から稼働開始まで</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'アカウント作成', desc: 'メールアドレスで無料登録。5分で完了します。' },
              { step: '02', title: 'プロフィール設定', desc: '得意メニュー・資格・経歴・写真を登録。' },
              { step: '03', title: 'KYC審査', desc: '本人確認書類・資格証明書を提出。最短3営業日で審査完了。' },
              { step: '04', title: '稼働開始', desc: 'プラットフォームに掲載され、予約受付開始。' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center space-y-4">
                <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/30 rounded-3xl flex items-center justify-center mx-auto">
                  <span className="text-rose-400 font-black text-lg">{step}</span>
                </div>
                <div>
                  <div className="font-black text-white mb-2">{title}</div>
                  <div className="text-sm text-gray-400 font-medium leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-rose-600">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
            今すぐ無料で登録する
          </h2>
          <p className="text-rose-100 text-lg font-medium leading-relaxed">
            登録費用・月額費用は一切不要。<br />
            あなたの技術を、最高の環境で発揮してください。
          </p>
          <button
            onClick={() => navigate('/app/signup')}
            className="inline-flex items-center gap-3 bg-white text-rose-700 px-12 py-5 rounded-2xl font-black text-base hover:bg-rose-50 transition-all shadow-2xl active:scale-95 group"
          >
            セラピスト登録（無料） <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>
    </PortalLayout>
  );
};

export default BusinessTherapist;
