/**
 * SSR用 HTMLテンプレートヘルパー
 * 公開ページ（SEO重要）のHTMLをサーバーサイドで生成
 * 
 * LAMP環境でいう「header.php」「footer.php」に相当
 */

// 共通のHTMLヘッダー部分（<head>タグ内）
export function htmlHead(opts: {
  title: string
  description: string
  url: string
  ogImage?: string
  canonical?: string
}) {
  const ogImage = opts.ogImage || 'https://hogusy.com/og-image.png'
  const canonical = opts.canonical || opts.url
  
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${opts.title}</title>
  <meta name="description" content="${opts.description}" />
  <meta name="keywords" content="マッサージ,セラピスト,出張マッサージ,リラクゼーション,ほぐし,HOGUSY,ホグシー,CARE CUBE" />
  <link rel="canonical" href="${canonical}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${opts.url}" />
  <meta property="og:title" content="${opts.title}" />
  <meta property="og:description" content="${opts.description}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:locale" content="ja_JP" />
  <meta property="og:site_name" content="HOGUSY" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${opts.title}" />
  <meta name="twitter:description" content="${opts.description}" />
  <meta name="twitter:image" content="${ogImage}" />

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Outfit:wght@400;600;900&display=swap" rel="stylesheet" />

  <!-- Tailwind CSS (CDN for SSR pages) -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: { teal: '#14b8a6', indigo: '#4338ca' }
          },
          fontFamily: {
            sans: ['Noto Sans JP', 'Outfit', 'sans-serif'],
            outfit: ['Outfit', 'sans-serif']
          }
        }
      }
    }
  </script>

  <style>
    body { font-family: 'Noto Sans JP', 'Outfit', sans-serif; }
    .font-outfit { font-family: 'Outfit', sans-serif; }
    ::selection { background-color: #ccfbf1; color: #0f766e; }
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up { animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  </style>
</head>`
}

// 共通ヘッダーナビゲーション
export function headerNav() {
  return `
<header class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
  <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
    <a href="/" class="flex items-center gap-2">
      <span class="text-2xl font-black text-slate-900 tracking-tighter font-outfit">HOGUSY</span>
    </a>
    <nav class="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600">
      <a href="/recruit" class="hover:text-teal-600 transition-colors">パートナー募集</a>
      <a href="/about" class="hover:text-teal-600 transition-colors">HOGUSYとは</a>
      <a href="/fee" class="hover:text-teal-600 transition-colors">料金</a>
      <a href="/news" class="hover:text-teal-600 transition-colors">お知らせ</a>
    </nav>
    <div class="flex items-center gap-3">
      <a href="/app/map" class="hidden md:flex px-4 py-2 text-teal-600 border border-teal-200 rounded-full text-sm font-bold hover:bg-teal-50 transition-colors">場所で探す</a>
      <a href="/login" class="px-5 py-2 bg-teal-600 text-white rounded-full text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm">ログイン</a>
    </div>
  </div>
</header>`
}

// 共通フッター
export function footer() {
  return `
<footer class="bg-slate-900 text-white pt-20 pb-10">
  <div class="max-w-7xl mx-auto px-4">
    <div class="grid md:grid-cols-4 gap-12 mb-16">
      <div class="space-y-4">
        <p class="text-2xl font-black tracking-tighter font-outfit">HOGUSY</p>
        <p class="text-sm text-gray-400 font-bold">ほぐす、を、もっと身近に。</p>
        <p class="text-xs text-gray-500">次世代ウェルネス・プラットフォーム</p>
      </div>
      <div>
        <h4 class="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">サービス</h4>
        <ul class="space-y-3 text-sm font-bold text-gray-300">
          <li><a href="/app/map" class="hover:text-teal-400 transition-colors">マップ検索</a></li>
          <li><a href="/therapists" class="hover:text-teal-400 transition-colors">セラピスト一覧</a></li>
          <li><a href="/fee" class="hover:text-teal-400 transition-colors">料金体系</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">パートナー</h4>
        <ul class="space-y-3 text-sm font-bold text-gray-300">
          <li><a href="/recruit" class="hover:text-teal-400 transition-colors">パートナー募集</a></li>
          <li><a href="/recruit#office" class="hover:text-teal-400 transition-colors">セラピストオフィス</a></li>
          <li><a href="/recruit#host" class="hover:text-teal-400 transition-colors">施設ホスト</a></li>
        </ul>
      </div>
      <div>
        <h4 class="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">会社情報</h4>
        <ul class="space-y-3 text-sm font-bold text-gray-300">
          <li><a href="/about" class="hover:text-teal-400 transition-colors">HOGUSYとは</a></li>
          <li><a href="/legal" class="hover:text-teal-400 transition-colors">利用規約・プライバシー</a></li>
          <li><a href="/commercial-transaction" class="hover:text-teal-400 transition-colors">特定商取引法</a></li>
          <li><a href="/strategy" class="hover:text-teal-400 transition-colors">事業モデル</a></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-gray-800 pt-8 text-center">
      <p class="text-xs text-gray-500 font-bold">&copy; 2026 HOGUSY Inc. All rights reserved.</p>
    </div>
  </div>
</footer>`
}

// 完全なHTMLページを組み立てるヘルパー
export function renderPage(opts: {
  title: string
  description: string
  url: string
  body: string
  ogImage?: string
  canonical?: string
  includeHeader?: boolean
  includeFooter?: boolean
}) {
  const head = htmlHead(opts)
  const header = opts.includeHeader !== false ? headerNav() : ''
  const foot = opts.includeFooter !== false ? footer() : ''
  
  return `${head}
<body class="bg-white text-gray-900 overflow-x-hidden">
  ${header}
  <main>${opts.body}</main>
  ${foot}
</body>
</html>`
}
