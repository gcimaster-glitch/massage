
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Calendar, Users, Briefcase, Hash, Layers } from 'lucide-react';
import PortalLayout from './PortalLayout';

const Company: React.FC = () => {
  const navigate = useNavigate();

  // noindex設定（検索エンジンにインデックスさせない）
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const companyData = [
    {
      icon: <Building2 className="text-teal-600" size={20} />,
      label: '商号',
      value: 'ホグシー株式会社',
      sub: 'HOGUSY Inc.',
    },
    {
      icon: <Hash className="text-teal-600" size={20} />,
      label: '会社法人等番号',
      value: '0100-01-265011',
      sub: null,
    },
    {
      icon: <Calendar className="text-teal-600" size={20} />,
      label: '設立',
      value: '令和8年4月23日（2026年4月23日）',
      sub: null,
    },
    {
      icon: <MapPin className="text-teal-600" size={20} />,
      label: '本店所在地',
      value: '〒101-0031',
      sub: '東京都千代田区東神田一丁目14番13号 カシムラビル',
    },
    {
      icon: <Users className="text-teal-600" size={20} />,
      label: '代表取締役',
      value: '岩間 哲士',
      sub: null,
    },
    {
      icon: <Briefcase className="text-teal-600" size={20} />,
      label: '資本金',
      value: '950万円',
      sub: null,
    },
    {
      icon: <Layers className="text-teal-600" size={20} />,
      label: '発行済株式総数',
      value: '950株',
      sub: null,
    },
  ];

  const businessPurposes = [
    'インターネットを利用した各種情報提供サービス及びマッチングプラットフォームの企画、開発、運営',
    'リラクゼーションサロンの経営及びセラピスト、整体師等の技術者の派遣',
    'フランチャイズチェーンシステムによる加盟店の募集及び加盟店の指導育成、経営コンサルティング',
    '美容・健康に関するスクール、セミナー、講演会等の企画、運営及び講師の派遣',
    '美容・健康機器、化粧品、日用品雑貨、衣料品等の企画、製造、販売及び輸出入',
    '介護・医療・福祉・健康支援用ロボット及び精密機器の研究、開発、製造、販売、賃貸及び保守管理',
    'ホテル、旅館等の宿泊施設及び温浴施設におけるリラクゼーション部門の業務委託',
    '古物営業法に基づく古物営業',
    '有料職業紹介事業及び労働者派遣事業',
    '上記各号に附帯関連する一切の事業',
  ];

  return (
    <PortalLayout>
      {/* ヒーロー */}
      <div className="bg-gradient-to-b from-teal-50 to-white pt-32 pb-16 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-700 flex items-center gap-2 font-bold text-sm mb-8 transition-colors"
          >
            <ArrowLeft size={16} /> 戻る
          </button>
          <span className="text-teal-600 font-bold text-sm mb-4 block uppercase tracking-widest">Corporate Information</span>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 leading-tight tracking-tighter">
            会社概要
          </h1>
          <p className="text-gray-500 font-medium text-base">
            ホグシー株式会社の基本情報をご案内します。
          </p>
        </div>
      </div>

      {/* 基本情報テーブル */}
      <section className="py-16 max-w-4xl mx-auto px-6 md:px-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-black text-gray-900 tracking-tight">基本情報</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {companyData.map((item, i) => (
              <div key={i} className="flex flex-col md:flex-row md:items-start gap-2 md:gap-0 px-8 py-6">
                <div className="flex items-center gap-3 md:w-48 flex-shrink-0">
                  <div className="w-8 h-8 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-sm font-black text-gray-500">{item.label}</span>
                </div>
                <div className="md:pl-6 flex-1">
                  <p className="text-base font-bold text-gray-900">{item.value}</p>
                  {item.sub && (
                    <p className="text-sm text-gray-500 font-medium mt-1">{item.sub}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 事業目的 */}
      <section className="pb-20 max-w-4xl mx-auto px-6 md:px-8">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-black text-gray-900 tracking-tight">事業目的</h2>
          </div>
          <div className="px-8 py-6">
            <ol className="space-y-4">
              {businessPurposes.map((purpose, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span className="w-7 h-7 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm md:text-base text-gray-700 font-medium leading-relaxed">{purpose}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* お問い合わせ */}
      <section className="pb-24 max-w-4xl mx-auto px-6 md:px-8">
        <div className="bg-teal-600 rounded-3xl p-8 md:p-12 text-white text-center space-y-4">
          <h3 className="text-xl font-black">お問い合わせ</h3>
          <p className="text-teal-100 text-sm font-medium">
            ご質問・ご相談はメールにてお気軽にお問い合わせください。
          </p>
          <a
            href="mailto:business@hogusy.com"
            className="inline-block bg-white text-teal-700 px-8 py-3 rounded-full font-black text-sm hover:bg-teal-50 transition-all shadow-lg"
          >
            business@hogusy.com
          </a>
        </div>
      </section>
    </PortalLayout>
  );
};

export default Company;
