
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Mail, Phone, CreditCard, Package, RefreshCw, AlertCircle } from 'lucide-react';

const CommercialTransaction: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 font-sans text-gray-900">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="text-gray-500 hover:text-gray-900 flex items-center gap-2 font-black text-xs md:text-sm uppercase tracking-widest transition-colors"
          >
            <ArrowLeft size={18} className="md:w-5 md:h-5" /> 戻る
          </button>
          <h1 className="text-base md:text-xl font-black text-gray-900 tracking-tighter">特定商取引法に基づく表記</h1>
          <div className="w-12 md:w-20"></div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 pb-24 md:pb-32">
        {/* Introduction */}
        <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[64px] shadow-sm border border-gray-100 mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mb-6">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl md:rounded-3xl flex items-center justify-center text-white shadow-lg">
              <Building2 size={28} className="md:w-8 md:h-8" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight mb-1 md:mb-2">特定商取引法に基づく表記</h2>
              <p className="text-xs md:text-sm text-gray-500 font-bold">Act on Specified Commercial Transactions</p>
            </div>
          </div>
          <p className="text-sm md:text-base text-gray-600 font-medium leading-relaxed">
            本表記は、特定商取引法第11条（通信販売についての広告）に基づき、インターネットを通じて役務を提供する事業者が表示すべき事項を記載しています。
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-4 md:space-y-6">
          {/* 販売事業者 */}
          <InfoSection 
            icon={<Building2 className="text-teal-600" />}
            title="販売事業者の名称"
            content={
              <div className="space-y-2">
                <p className="text-base md:text-lg font-black text-gray-900">HOGUSY株式会社</p>
                <p className="text-xs md:text-sm text-gray-500 font-medium">HOGUSY Inc.</p>
              </div>
            }
          />

          {/* 運営統括責任者 */}
          <InfoSection 
            icon={<Building2 className="text-teal-600" />}
            title="運営統括責任者"
            content={<p className="text-sm md:text-base font-bold text-gray-900">代表取締役 山田 太郎</p>}
          />

          {/* 所在地 */}
          <InfoSection 
            icon={<Building2 className="text-teal-600" />}
            title="所在地"
            content={
              <div className="space-y-2">
                <p className="text-sm md:text-base font-bold text-gray-900">〒150-0001</p>
                <p className="text-sm md:text-base font-bold text-gray-900">東京都渋谷区神宮前6丁目23-4 桑野ビル2階</p>
                <p className="text-xs md:text-sm text-gray-500 font-medium mt-2">※お客様からのお問い合わせは、下記のメールアドレスまたはお問い合わせフォームにて承っております。</p>
              </div>
            }
          />

          {/* 電話番号 */}
          <InfoSection 
            icon={<Phone className="text-teal-600" />}
            title="電話番号"
            content={
              <div className="space-y-2">
                <p className="text-sm md:text-base font-bold text-gray-900">03-XXXX-XXXX</p>
                <p className="text-xs md:text-sm text-gray-500 font-medium">受付時間: 平日 10:00〜18:00（土日祝日を除く）</p>
              </div>
            }
          />

          {/* メールアドレス */}
          <InfoSection 
            icon={<Mail className="text-teal-600" />}
            title="メールアドレス"
            content={
              <div className="space-y-2">
                <p className="text-sm md:text-base font-bold text-gray-900">support@hogusy.com</p>
                <p className="text-xs md:text-sm text-gray-500 font-medium">※お問い合わせへの返信は、営業日2〜3日以内に行います。</p>
              </div>
            }
          />

          {/* サービス内容 */}
          <InfoSection 
            icon={<Package className="text-teal-600" />}
            title="販売価格・サービス内容"
            content={
              <div className="space-y-3">
                <p className="text-sm md:text-base font-bold text-gray-900">マッサージ・リラクゼーション施術サービス</p>
                <div className="bg-gray-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm font-bold text-gray-600">施術料金</span>
                    <span className="text-sm md:text-base font-black text-gray-900">¥5,000〜¥20,000 / 60分〜</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm font-bold text-gray-600">施設利用料(CARE CUBE利用時)</span>
                    <span className="text-sm md:text-base font-black text-gray-900">¥2,000〜 / 60分</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm font-bold text-gray-600">出張料金</span>
                    <span className="text-sm md:text-base font-black text-gray-900">¥1,000〜¥3,000 / エリア別</span>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-gray-500 font-medium">※価格はすべて税込表示です。セラピストや施術内容により異なります。</p>
              </div>
            }
          />

          {/* 支払方法 */}
          <InfoSection 
            icon={<CreditCard className="text-teal-600" />}
            title="代金の支払方法・時期"
            content={
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm md:text-base font-bold text-gray-900">【支払方法】</p>
                  <ul className="list-disc pl-5 md:pl-6 space-y-1 text-xs md:text-sm text-gray-600 font-medium">
                    <li>クレジットカード（VISA、Mastercard、JCB、American Express、Diners Club）</li>
                    <li>デビットカード</li>
                    <li>Apple Pay、Google Pay</li>
                    <li>銀行振込（事前決済のみ）</li>
                  </ul>
                </div>
                <div className="space-y-2 mt-4">
                  <p className="text-sm md:text-base font-bold text-gray-900">【支払時期】</p>
                  <p className="text-xs md:text-sm text-gray-600 font-medium leading-relaxed">
                    予約確定時に決済処理が行われます。実際の請求は施術完了後に確定します。
                  </p>
                </div>
              </div>
            }
          />

          {/* キャンセル・返金 */}
          <InfoSection 
            icon={<RefreshCw className="text-orange-600" />}
            title="キャンセル・返金について"
            content={
              <div className="space-y-4">
                <div className="bg-orange-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-orange-100 space-y-3">
                  <p className="text-sm md:text-base font-black text-orange-900">キャンセルポリシー</p>
                  <div className="space-y-2 text-xs md:text-sm">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-700">24時間前まで</span>
                      <span className="font-black text-teal-600">無料キャンセル</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-700">12〜24時間前</span>
                      <span className="font-black text-orange-600">50%キャンセル料</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-700">12時間以内・無断キャンセル</span>
                      <span className="font-black text-red-600">100%キャンセル料</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed">
                  天災やセラピストの都合により施術が提供できない場合は、全額返金いたします。返金は元の決済方法に5〜10営業日以内に処理されます。
                </p>
              </div>
            }
          />

          {/* 注意事項 */}
          <InfoSection 
            icon={<AlertCircle className="text-red-600" />}
            title="その他の重要事項"
            content={
              <div className="space-y-3">
                <ul className="list-disc pl-5 md:pl-6 space-y-2 text-xs md:text-sm text-gray-600 font-medium">
                  <li>本サービスは、セラピストとお客様をマッチングするプラットフォームサービスです。</li>
                  <li>医療行為・治療を目的とした施術は行っておりません。</li>
                  <li>妊娠中の方、持病をお持ちの方は事前にセラピストへご相談ください。</li>
                  <li>セラピストの指示に従わない場合、施術を中断する場合があります。</li>
                  <li>施術中の事故・怪我について、当社は責任を負いかねます。</li>
                </ul>
              </div>
            }
          />
        </div>

        {/* Footer */}
        <div className="mt-12 md:mt-16 text-center">
          <p className="text-xs md:text-sm text-gray-400 font-bold">最終更新日: 2025年1月14日</p>
          <p className="text-[10px] md:text-xs text-gray-300 font-black uppercase tracking-widest mt-2 md:mt-4">
            © 2025 HOGUSY Inc. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

// Info Section Component
const InfoSection: React.FC<{ icon: React.ReactNode; title: string; content: React.ReactNode }> = ({ 
  icon, 
  title, 
  content 
}) => (
  <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-[48px] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
      <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-50 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
        {icon}
      </div>
      <h3 className="text-sm md:text-base font-black text-gray-900 pt-1 md:pt-2">{title}</h3>
    </div>
    <div className="pl-11 md:pl-14">{content}</div>
  </div>
);

export default CommercialTransaction;
