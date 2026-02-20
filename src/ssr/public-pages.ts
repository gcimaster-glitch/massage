/**
 * SSR公開ページルート
 * 
 * SEOが重要な公開ページをサーバーサイドで完全なHTMLとして返す。
 * LAMP環境でいう「各.phpファイル」に相当。
 * 
 * 管理画面やログイン後のページはSPAのまま維持。
 */
import { Hono } from 'hono'
import { renderPage } from './html-template'

const app = new Hono()

// ============================================
// トップページ (/) - React SPAに委譲
// SSRではなくReact SPAのPortalHomeで検索・予約機能を提供
// ============================================

// ============================================
// 募集ページ (/recruit)
// ============================================
app.get('/recruit', (c) => {
  const html = renderPage({
    title: 'パートナー募集 - HOGUSY',
    description: 'HOGUSYのパートナープログラム。セラピストオフィス、施設ホスト、エリアパートナーを募集中。業界最高水準の還元率と、AIによる安全監視で安心の運営を。',
    url: 'https://hogusy.com/recruit',
    body: `
    <!-- Hero -->
    <section class="bg-slate-900 text-white pt-32 pb-24 relative overflow-hidden">
      <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      <div class="max-w-7xl mx-auto px-4 relative z-10 text-center space-y-10">
        <div class="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-2 rounded-full backdrop-blur-md">
          <span class="text-[10px] font-black uppercase tracking-[0.4em]">Partner Program 2025</span>
        </div>
        <h1 class="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9]">
          日本の「癒やし」を、<br/>
          <span class="text-teal-400">アップグレードする。</span>
        </h1>
        <p class="text-gray-400 text-lg md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed">
          HOGUSY は、技術、空間、安全を統合した次世代のインフラです。<br class="hidden md:block"/>
          あなたの専門性や資産を、新しいウェルネスの形へ。
        </p>
        <div class="flex flex-wrap justify-center gap-4 pt-10">
          <a href="#office" class="bg-white text-slate-900 px-10 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-teal-400 hover:text-white transition-all shadow-2xl inline-flex items-center gap-3">
            セラピストオフィス募集
          </a>
          <a href="#host" class="bg-white/10 text-white border border-white/20 px-10 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all backdrop-blur-sm inline-flex items-center gap-3">
            施設ホスト募集
          </a>
        </div>
      </div>
    </section>

    <!-- Statistics -->
    <section class="py-20 border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
        <div><p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">提携オフィス</p><p class="text-4xl font-black text-slate-900 tracking-tighter">120+<span class="text-sm ml-1 font-bold text-gray-300">社</span></p></div>
        <div><p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">登録セラピスト</p><p class="text-4xl font-black text-slate-900 tracking-tighter">1,200+<span class="text-sm ml-1 font-bold text-gray-300">名</span></p></div>
        <div><p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">設置ブース (CUBE)</p><p class="text-4xl font-black text-slate-900 tracking-tighter">450+<span class="text-sm ml-1 font-bold text-gray-300">拠点</span></p></div>
        <div><p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">平均還元率</p><p class="text-4xl font-black text-slate-900 tracking-tighter">70<span class="text-sm ml-1 font-bold text-gray-300">%</span></p></div>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-4 py-32 space-y-48">
      <!-- Office Section -->
      <section id="office" class="scroll-mt-32">
        <div class="grid lg:grid-cols-2 gap-20 items-center">
          <div class="space-y-10">
            <div>
              <span class="bg-teal-50 text-teal-600 px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-6 inline-block border border-teal-100">For Therapist Offices &amp; Agencies</span>
              <h2 class="text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                あなたの事務所を、<br/>
                <span class="text-teal-600 underline decoration-teal-500/20 underline-offset-8">全国区のブランドへ。</span>
              </h2>
            </div>
            <p class="text-gray-500 text-xl font-bold leading-relaxed italic">
              セラピストの採用・管理・配信を、HOGUSYプラットフォーム上で一元化。<br/>
              集客も、決済も、安全管理も、すべて本部がサポートします。
            </p>
            <div class="grid sm:grid-cols-2 gap-8">
              <div class="space-y-3"><div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-teal-600 shadow-inner text-xl">👥</div><h4 class="font-black text-slate-900 tracking-tight">セラピスト管理機能</h4><p class="text-xs font-bold text-gray-400 leading-relaxed">所属セラピストの稼働管理、シフト管理、給与計算を自動化。管理コストを大幅削減。</p></div>
              <div class="space-y-3"><div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-teal-600 shadow-inner text-xl">🛡</div><h4 class="font-black text-slate-900 tracking-tight">Gemini ライブ安全監視</h4><p class="text-xs font-bold text-gray-400 leading-relaxed">全施術にAI音声モニタリングを標準装備。あなたの大切なセラピストを守ります。</p></div>
              <div class="space-y-3"><div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-teal-600 shadow-inner text-xl">⚡</div><h4 class="font-black text-slate-900 tracking-tight">集客はプラットフォーム任せ</h4><p class="text-xs font-bold text-gray-400 leading-relaxed">HOGUSYのアルゴリズムが最適な顧客を自動マッチング。営業活動は不要です。</p></div>
              <div class="space-y-3"><div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-teal-600 shadow-inner text-xl">📈</div><h4 class="font-black text-slate-900 tracking-tight">高い還元率</h4><p class="text-xs font-bold text-gray-400 leading-relaxed">オフィス手数料＋セラピスト取り分で、業界最高水準の70%以上を還元。</p></div>
            </div>
            <a href="/auth/signup/office" class="bg-slate-900 text-white px-12 py-6 rounded-[32px] font-black text-lg hover:bg-teal-600 transition-all shadow-2xl inline-flex items-center gap-4">
              オフィスとして登録する →
            </a>
          </div>
          <div class="relative">
            <div class="rounded-[80px] overflow-hidden shadow-[0_80px_160px_-40px_rgba(0,0,0,0.2)] aspect-[4/5] relative">
              <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=1000" class="w-full h-full object-cover" alt="セラピスト施術イメージ" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <!-- Host Section -->
      <section id="host" class="scroll-mt-32">
        <div class="bg-slate-900 rounded-[100px] p-12 md:p-24 overflow-hidden relative text-white">
          <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
          <div class="max-w-3xl relative z-10 space-y-10">
            <span class="bg-orange-500 text-white px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-block shadow-lg">For Facility Owners</span>
            <h2 class="text-5xl font-black tracking-tighter leading-tight">
              遊休資産を、<br/>
              <span class="text-orange-400 underline decoration-orange-400/20 underline-offset-8">自動収益ブースへ。</span>
            </h2>
            <p class="text-gray-400 text-xl font-bold leading-relaxed">
              ホテルの客室、商業施設の余剰スペース、ビルの一室。CARE CUBEを設置するだけで、高単価なウェルネス予約を受け入れ可能。
            </p>
            <ul class="space-y-4">
              <li class="flex items-center gap-4 font-bold text-gray-300 text-lg">✅ 完全無人運営が可能（スマートキー連動）</li>
              <li class="flex items-center gap-4 font-bold text-gray-300 text-lg">✅ 本部が集客、決済、セラピスト手配を一元管理</li>
              <li class="flex items-center gap-4 font-bold text-gray-300 text-lg">✅ 既存の設備を活用した低コスト導入プランあり</li>
            </ul>
            <a href="/auth/signup/host" class="bg-orange-500 text-white px-12 py-6 rounded-[32px] font-black text-lg hover:bg-orange-600 transition-all shadow-2xl inline-flex items-center gap-4">
              ホスト資料を請求する →
            </a>
          </div>
        </div>
      </section>
    </div>
    `,
  })

  return c.html(html)
})

// ============================================
// 利用規約ページ (/legal)
// ============================================
app.get('/legal', (c) => {
  const html = renderPage({
    title: '利用規約・プライバシーポリシー - HOGUSY',
    description: 'HOGUSY（ホグシー）の利用規約およびプライバシーポリシー。サービスの利用条件、個人情報の取り扱いについて。',
    url: 'https://hogusy.com/legal',
    body: `
    <div class="pt-24 pb-16 max-w-4xl mx-auto px-4">
      <h1 class="text-4xl font-black text-slate-900 tracking-tighter mb-8">利用規約・プライバシーポリシー</h1>
      <div class="prose prose-lg max-w-none text-gray-600">
        <p class="font-bold">このページはサーバーサイドでレンダリングされています。</p>
        <p>詳細な利用規約・プライバシーポリシーの内容は、正式リリース時に掲載予定です。</p>
        <h2 class="text-2xl font-black text-slate-900 mt-12">利用規約</h2>
        <p>HOGUSY（以下「本サービス」）をご利用いただく際の条件を定めます。</p>
        <h2 class="text-2xl font-black text-slate-900 mt-12">プライバシーポリシー</h2>
        <p>お客様の個人情報の取り扱いについて定めます。</p>
      </div>
    </div>
    `,
  })

  return c.html(html)
})

// ============================================
// 特定商取引法 (/commercial-transaction)
// ============================================
app.get('/commercial-transaction', (c) => {
  const html = renderPage({
    title: '特定商取引法に基づく表示 - HOGUSY',
    description: 'HOGUSY（ホグシー）の特定商取引法に基づく表示。販売事業者情報、返品・キャンセルポリシーなど。',
    url: 'https://hogusy.com/commercial-transaction',
    body: `
    <div class="pt-24 pb-16 max-w-4xl mx-auto px-4">
      <h1 class="text-4xl font-black text-slate-900 tracking-tighter mb-8">特定商取引法に基づく表示</h1>
      <div class="prose prose-lg max-w-none text-gray-600">
        <p class="font-bold">このページはサーバーサイドでレンダリングされています。</p>
        <p>詳細な情報は正式リリース時に掲載予定です。</p>
      </div>
    </div>
    `,
  })

  return c.html(html)
})

// ============================================
// 会社概要 (/about)
// ============================================
app.get('/about', (c) => {
  const html = renderPage({
    title: 'HOGUSYとは - ほぐす、を、もっと身近に。',
    description: 'HOGUSYは、AIテクノロジーと人の温もりを融合した次世代ウェルネス・プラットフォームです。セラピスト、施設、テクノロジーを統合し、新しい「癒やし」の体験を。',
    url: 'https://hogusy.com/about',
    body: `
    <section class="pt-32 pb-24 bg-slate-900 text-white text-center">
      <div class="max-w-4xl mx-auto px-4 space-y-8">
        <h1 class="text-5xl md:text-7xl font-black tracking-tighter">HOGUSYとは</h1>
        <p class="text-gray-400 text-xl font-bold leading-relaxed">
          テクノロジーと人の温もりで、<br/>
          日本の「癒やし」をアップグレードする。
        </p>
      </div>
    </section>
    <section class="py-24 max-w-4xl mx-auto px-4">
      <div class="prose prose-lg max-w-none text-gray-600 space-y-8">
        <p class="text-xl font-bold leading-relaxed">HOGUSY（ホグシー）は、セラピスト、施設オーナー、そして癒やしを求めるすべての人をつなぐ、次世代のウェルネス・プラットフォームです。</p>
        <h2 class="text-3xl font-black text-slate-900">3つの柱</h2>
        <div class="grid md:grid-cols-3 gap-8 not-prose">
          <div class="bg-teal-50 p-8 rounded-3xl border border-teal-100">
            <h3 class="text-lg font-black text-teal-800 mb-3">🏢 CARE CUBE</h3>
            <p class="text-sm text-teal-700 font-bold">ホテルや商業施設に設置する、完全プライベートなウェルネスブース。</p>
          </div>
          <div class="bg-indigo-50 p-8 rounded-3xl border border-indigo-100">
            <h3 class="text-lg font-black text-indigo-800 mb-3">🛡 AI安全監視</h3>
            <p class="text-sm text-indigo-700 font-bold">Gemini AIによるリアルタイム音声分析で、すべての施術の安全を見守ります。</p>
          </div>
          <div class="bg-orange-50 p-8 rounded-3xl border border-orange-100">
            <h3 class="text-lg font-black text-orange-800 mb-3">💼 オフィス制度</h3>
            <p class="text-sm text-orange-700 font-bold">セラピストオフィスが採用・管理・配信を一元管理。プロの組織運営を支援。</p>
          </div>
        </div>
      </div>
    </section>
    `,
  })

  return c.html(html)
})

export default app
