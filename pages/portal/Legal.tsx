import React from 'react';
import PortalLayout from './PortalLayout';
import { Shield, FileText, Lock, AlertCircle } from 'lucide-react';

const LegalPage: React.FC = () => {
  return (
    <PortalLayout>
      <div className="max-w-5xl mx-auto px-4 pt-32 pb-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gray-100 px-5 py-2 rounded-full mb-6">
            <Shield size={16} className="text-teal-600" />
            <span className="text-xs font-black text-gray-600 uppercase tracking-widest">Legal Documents</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight mb-4">
            法的情報
          </h1>
          <p className="text-gray-500 text-lg font-bold">
            HOGUSY のご利用にあたっての重要事項
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <LegalCard 
            icon={<FileText className="text-teal-600" size={28} />}
            title="利用規約"
            description="サービスのご利用条件、ユーザーの権利と義務について"
            link="#terms"
          />
          <LegalCard 
            icon={<Lock className="text-indigo-600" size={28} />}
            title="プライバシーポリシー"
            description="個人情報の取り扱い、データ保護方針について"
            link="#privacy"
          />
          <LegalCard 
            icon={<Shield className="text-emerald-600" size={28} />}
            title="特定商取引法に基づく表記"
            description="事業者情報、返品・キャンセルポリシーについて"
            link="#commerce"
          />
          <LegalCard 
            icon={<AlertCircle className="text-orange-600" size={28} />}
            title="安全ガイドライン"
            description="セラピスト・利用者の安全確保に関する方針"
            link="#safety"
          />
        </div>

        {/* 利用規約 */}
        <section id="terms" className="mb-20 scroll-mt-32">
          <div className="bg-white rounded-3xl p-10 md:p-12 border border-gray-100 shadow-sm">
            <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <FileText className="text-teal-600" size={32} />
              利用規約
            </h2>
            <div className="space-y-8 text-gray-600 leading-relaxed">
              <Section title="第1条（適用範囲）">
                <p className="font-bold">
                  本規約は、HOGUSY（以下「当社」）が提供するウェルネスマッチングプラットフォーム（以下「本サービス」）の利用条件を定めるものです。
                  ユーザーは、本規約に同意の上、本サービスをご利用いただきます。
                </p>
              </Section>

              <Section title="第2条（ユーザー登録）">
                <ul className="list-disc pl-6 space-y-2 font-bold">
                  <li>ユーザーは正確な情報を登録する義務があります</li>
                  <li>虚偽の情報による登録は禁止されています</li>
                  <li>セラピストとして登録する場合、必要な資格証明書の提出が必要です</li>
                  <li>1人につき1アカウントのみの保有となります</li>
                </ul>
              </Section>

              <Section title="第3条（禁止事項）">
                <ul className="list-disc pl-6 space-y-2 font-bold">
                  <li>法令または公序良俗に違反する行為</li>
                  <li>犯罪行為に関連する行為</li>
                  <li>本サービスの運営を妨害する行為</li>
                  <li>他のユーザーまたは第三者の権利を侵害する行為</li>
                  <li>プラットフォーム外での直接取引を促す行為</li>
                </ul>
              </Section>

              <Section title="第4条（料金と支払い）">
                <p className="font-bold">
                  本サービスの利用料金は、各コース・メニューページに明示されています。
                  お支払いは事前決済となり、キャンセルポリシーに従った返金対応を行います。
                </p>
              </Section>

              <Section title="第5条（免責事項）">
                <p className="font-bold">
                  当社は、本サービスの提供にあたり、安全性の確保に最大限努めますが、セラピストと利用者間で発生した
                  トラブルについては、当事者間での解決を原則とします。ただし、Gemini Sentinel AI による監視システムにより、
                  異常を検知した場合は適切な対応を行います。
                </p>
              </Section>
            </div>
          </div>
        </section>

        {/* プライバシーポリシー */}
        <section id="privacy" className="mb-20 scroll-mt-32">
          <div className="bg-white rounded-3xl p-10 md:p-12 border border-gray-100 shadow-sm">
            <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <Lock className="text-indigo-600" size={32} />
              プライバシーポリシー
            </h2>
            <div className="space-y-8 text-gray-600 leading-relaxed">
              <Section title="1. 収集する情報">
                <ul className="list-disc pl-6 space-y-2 font-bold">
                  <li>氏名、メールアドレス、電話番号などの個人情報</li>
                  <li>決済情報（クレジットカード情報は決済代行会社が管理）</li>
                  <li>位置情報（サービス提供のために必要な範囲）</li>
                  <li>施術中の音声データ（安全監視目的、暗号化して保存）</li>
                </ul>
              </Section>

              <Section title="2. 情報の利用目的">
                <ul className="list-disc pl-6 space-y-2 font-bold">
                  <li>本サービスの提供・運営・改善</li>
                  <li>ユーザーサポート対応</li>
                  <li>安全監視システムの運用</li>
                  <li>マーケティング・キャンペーン情報の配信（同意を得た場合のみ）</li>
                </ul>
              </Section>

              <Section title="3. 第三者提供">
                <p className="font-bold">
                  当社は、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
                  ただし、以下の業務委託先には、必要最小限の情報を提供します：
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2 font-bold">
                  <li>Stripe（決済処理）</li>
                  <li>Resend（メール配信）</li>
                  <li>Google Cloud（Gemini AI 安全監視）</li>
                  <li>Cloudflare（インフラ運用）</li>
                </ul>
              </Section>

              <Section title="4. データ保持期間">
                <p className="font-bold">
                  音声データは30日間保存し、その後自動削除されます。
                  その他の個人情報は、アカウント削除後90日以内に完全に削除します。
                </p>
              </Section>
            </div>
          </div>
        </section>

        {/* 特定商取引法 */}
        <section id="commerce" className="mb-20 scroll-mt-32">
          <div className="bg-white rounded-3xl p-10 md:p-12 border border-gray-100 shadow-sm">
            <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <Shield className="text-emerald-600" size={32} />
              特定商取引法に基づく表記
            </h2>
            <div className="space-y-6">
              <InfoRow label="事業者名" value="株式会社HOGUSY（仮称）" />
              <InfoRow label="代表者" value="代表取締役 山田太郎（仮）" />
              <InfoRow label="所在地" value="〒100-0001 東京都千代田区千代田1-1-1" />
              <InfoRow label="電話番号" value="03-1234-5678" />
              <InfoRow label="メールアドレス" value="support@soothe-jp.com" />
              <InfoRow label="営業時間" value="平日 10:00 - 18:00（土日祝除く）" />
              <InfoRow label="料金" value="各サービスページに記載" />
              <InfoRow label="支払方法" value="クレジットカード（Stripe経由）" />
              <InfoRow label="サービス提供時期" value="予約確定後、指定日時" />
              <InfoRow 
                label="キャンセルポリシー" 
                value="24時間前まで無料、12時間前まで50%、以降100%のキャンセル料が発生します"
              />
            </div>
          </div>
        </section>

        {/* 安全ガイドライン */}
        <section id="safety" className="scroll-mt-32">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-10 md:p-12 border border-orange-100">
            <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <AlertCircle className="text-orange-600" size={32} />
              安全ガイドライン
            </h2>
            <div className="space-y-8 text-gray-700 leading-relaxed">
              <Section title="Gemini Sentinel AI による安全監視">
                <p className="font-bold">
                  全ての施術中、AI音声監視システムが稼働し、異常な会話や緊急事態を検知します。
                  検知された場合、即座に運営チームに通知され、適切な対応を行います。
                </p>
              </Section>

              <Section title="緊急時の対応">
                <ul className="list-disc pl-6 space-y-2 font-bold">
                  <li>アプリ内の緊急ボタンで即座に通報可能</li>
                  <li>24時間365日の監視体制</li>
                  <li>提携警備会社との連携（主要エリア）</li>
                </ul>
              </Section>

              <Section title="セラピストの本人確認">
                <p className="font-bold">
                  全てのセラピストは、身分証明書、資格証明書の提出と、オンライン面談を実施した上で登録されます。
                </p>
              </Section>
            </div>
          </div>
        </section>

        <div className="mt-16 text-center text-sm text-gray-400 font-bold">
          <p>最終更新日: 2025年1月12日</p>
          <p className="mt-2">ご不明な点がございましたら、<a href="mailto:legal@soothe-jp.com" className="text-teal-600 hover:underline">legal@soothe-jp.com</a> までお問い合わせください。</p>
        </div>
      </div>
    </PortalLayout>
  );
};

// サブコンポーネント
const LegalCard: React.FC<{icon: React.ReactNode, title: string, description: string, link: string}> = 
  ({ icon, title, description, link }) => (
  <a 
    href={link}
    className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-all group cursor-pointer"
  >
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
      {title}
    </h3>
    <p className="text-sm text-gray-500 font-bold">{description}</p>
  </a>
);

const Section: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
  <div>
    <h3 className="text-xl font-black text-gray-900 mb-4">{title}</h3>
    <div className="text-gray-600">{children}</div>
  </div>
);

const InfoRow: React.FC<{label: string, value: string}> = ({ label, value }) => (
  <div className="grid md:grid-cols-3 gap-4 py-4 border-b border-gray-100 last:border-0">
    <dt className="font-black text-gray-900">{label}</dt>
    <dd className="md:col-span-2 font-bold text-gray-600">{value}</dd>
  </div>
);

export default LegalPage;
