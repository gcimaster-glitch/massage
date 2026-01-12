# Genspark Developer 指示書: HOGUSY フロントエンド改善

## 📊 プロジェクト概要

**プロジェクト名**: HOGUSY  
**GitHub**: https://github.com/gcimaster-glitch/massage  
**現在の動作URL**: https://3000-i5p7tkvsvj3ulos6jliw6-d0b9e1e2.sandbox.novita.ai

### ビジネスコンセプト
「癒やしを、都市のインフラへ。」

日本版HOGUSY × CARE CUBEは、セラピストとユーザーを安全につなぐ次世代ウェルネス・プラットフォームです。

---

## 🎯 今回の目標

### Phase A: フロントエンドUI改善（優先度：高）

以下のページを重点的に改善してください：

---

## 📄 1. 事業戦略ページ (/strategy) の強化

**ファイル**: `pages/portal/BusinessStrategy.tsx`

### 実装してほしい内容

#### 🏆 Hero セクション
```
タイトル: 「癒やしを、都市のインフラへ。」
サブタイトル: 日本独自の三者共栄エコシステム

デザイン要件:
- 深みのあるネイビー背景 (#0F172A)
- グラデーション文字（ティール #14B8A6 → インディゴ #4338ca）
- 都市のスカイライン画像をオーバーレイ
- フェードインアニメーション
```

#### 🏢 CARE CUBE (IaaS) セクション
```
見出し: 「建築物ではなく、家具として。」

強調すべきポイント:
✅ 消防法を回避 → 都心部に高速展開可能
✅ 遊休スペースを収益化 → ホテル、オフィス、商業施設
✅ 初期投資ゼロ → プラットフォームが全て提供

ビジュアル:
- CARE CUBEの3Dイラストまたは写真
- 「家具扱い」であることを強調する図解
- 設置までの所要時間（例: 最短3日）
```

#### 🛡️ Safety Tech (AI Sentinel) セクション
```
見出し: 「密室リスクを、ゼロに。」

技術的特徴:
🎤 Gemini Live APIによる音声監視
⚡ ミリ秒単位でハラスメント検知
🚨 自動緊急通報システム
📊 AI信頼度スコア表示

ビジュアル:
- 音声波形のアニメーション
- リアルタイム監視のダッシュボード風UI
- 安全スコアのメーター表示
```

#### 💰 Revenue Split (経済圏) セクション
```
見出し: 「みんなが笑顔になる、新しい経済圏。」

収益分配の可視化:
┌─────────────────────────────────┐
│ セラピスト: 65-75% │ 🟩🟩🟩🟩🟩🟩🟩 │
│ ホスト:     20-30% │ 🟦🟦🟦       │
│ プラットフォーム: 10-15% │ 🟧🟧 │
└─────────────────────────────────┘

比較表:
| 項目 | 従来の店舗型 | HOGUSY |
|------|-------------|--------|
| 初期投資 | 500-1000万円 | 0円 |
| セラピスト収益率 | 40-50% | 65-75% |
| 固定費 | 月30-50万円 | 0円 |
| 集客コスト | 自己負担 | プラットフォーム負担 |

ビジュアル:
- 円グラフまたはプログレスバー
- アニメーション付きの数字カウントアップ
- 従来モデルとの比較表
```

#### 🏪 Multi-Agency (日本独自) セクション
```
見出し: 「既存の『事務所』が、新しい形で進化する。」

特徴:
✨ 既存の人材派遣会社・事務所が参画可能
📊 セラピスト管理をシステム化
💼 事務所には10-15%の手数料
🔄 伝統的なビジネスモデルとの融合

ビジュアル:
- 事務所とプラットフォームの関係図
- 参画事務所の増加グラフ
```

---

## 📄 2. トップページ (/) の改善

**ファイル**: `pages/portal/PortalHome.tsx`

### 改善してほしい点

#### Hero セクションの強化
```
現状: シンプルなテキストと画像
改善後:
- より大胆なタイポグラフィ
- インタラクティブな検索バー
- 「今すぐ予約」CTA ボタンを目立たせる
- スクロールダウン矢印アニメーション
```

#### CARE CUBE vs 出張派遣の比較セクション
```
現状: 2つの選択肢がある
改善後:
- ビジュアル比較を強化
- それぞれのメリットをアイコンで表示
- 「どちらが自分に合っているか」診断機能
```

#### セラピスト紹介セクション
```
現状: リスト表示
改善後:
- カード型デザイン
- ホバー時に詳細情報を表示
- 評価★とレビュー数を強調
- 「お気に入り」ハートボタン追加
```

---

## 🎨 デザインガイドライン

### カラーパレット

```css
/* プライマリカラー */
--navy-dark: #0F172A;        /* 背景、見出し */
--teal-primary: #14B8A6;     /* CTA、アクセント */
--indigo-accent: #4338CA;    /* リンク、セカンダリ */
--orange-energy: #F97316;    /* 強調、警告 */

/* セカンダリカラー */
--gray-bg: #F8FAFC;          /* 背景グレー */
--white: #FFFFFF;            /* カード背景 */
--text-primary: #111827;     /* 本文テキスト */
--text-secondary: #6B7280;   /* サブテキスト */
```

### タイポグラフィ

```css
/* 見出し */
h1: 4rem (64px) - 超太字 (font-weight: 900)
h2: 3rem (48px) - 太字 (font-weight: 700)
h3: 2rem (32px) - 太字 (font-weight: 700)

/* 本文 */
body: 1rem (16px) - 通常 (font-weight: 400)
small: 0.875rem (14px)

/* フォントファミリー */
font-family: 'Noto Sans JP', 'Outfit', sans-serif;
```

### スペーシング

```
余白システム: 8px基準（8, 16, 24, 32, 48, 64, 96, 128）
セクション間: 96px (6rem)
カード padding: 32px (2rem)
ボタン padding: 12px 24px
```

### コンポーネントスタイル

#### ボタン
```css
/* Primary CTA */
background: linear-gradient(135deg, #14B8A6, #4338CA);
padding: 14px 32px;
border-radius: 9999px; /* 完全な丸 */
font-weight: 700;
transition: all 0.3s ease;
box-shadow: 0 10px 30px rgba(20, 184, 166, 0.3);

/* Hover */
transform: translateY(-2px);
box-shadow: 0 15px 40px rgba(20, 184, 166, 0.4);
```

#### カード
```css
background: white;
border-radius: 24px;
padding: 32px;
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
border: 1px solid rgba(0, 0, 0, 0.05);

/* Hover */
transform: translateY(-4px);
box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 🎬 アニメーション

### フェードイン（ページロード時）
```typescript
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### カウントアップ（数字）
```typescript
// 収益分配の数字をアニメーション
import { useEffect, useState } from 'react';

const CountUp = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  
  return <span>{count}%</span>;
};
```

---

## 📱 レスポンシブデザイン

### ブレークポイント
```
sm: 640px   (スマートフォン)
md: 768px   (タブレット縦)
lg: 1024px  (タブレット横、小型PC)
xl: 1280px  (デスクトップ)
2xl: 1536px (大型ディスプレイ)
```

### モバイルファースト設計
```typescript
// 基本: モバイル
<div className="text-2xl p-4">

// タブレット以上
<div className="text-2xl md:text-4xl p-4 md:p-8">

// デスクトップ
<div className="text-2xl md:text-4xl lg:text-5xl p-4 md:p-8 lg:p-12">
```

---

## 🚀 実装の優先順位

### 🔴 最優先（Phase A1）
1. **事業戦略ページ (/strategy) 完全リニューアル**
   - Hero セクション
   - CARE CUBE (IaaS) セクション
   - Safety Tech セクション
   - Revenue Split セクション

### 🟡 次に重要（Phase A2）
2. **トップページ (/) の改善**
   - Hero セクション強化
   - セラピスト紹介カード
   - CTA ボタン最適化

### 🟢 余裕があれば（Phase A3）
3. **その他のページ改善**
   - About ページ
   - セラピスト一覧ページ
   - ログインページ

---

## 🛠️ 技術的な制約

### 使用可能なライブラリ
```json
{
  "react": "^19.0.0",
  "react-router-dom": "^7.1.0",
  "lucide-react": "^0.561.0",
  "tailwindcss": "^3.4.17"
}
```

### 使用禁止
- ❌ 外部のUIライブラリ（Material-UI, Ant Design等）
- ❌ アニメーションライブラリ（Framer Motion等）
- ❌ 重いJavaScriptライブラリ

### 推奨
- ✅ Tailwind CSSのみでスタイリング
- ✅ CSSアニメーションを活用
- ✅ Lucide Reactのアイコンを活用
- ✅ シンプルで軽量なコード

---

## 📋 チェックリスト

### デザイン品質
- [ ] カラーパレットを統一使用
- [ ] タイポグラフィの階層が明確
- [ ] 余白が適切（8px基準）
- [ ] ホバー効果が実装されている
- [ ] アニメーションが滑らか

### レスポンシブ対応
- [ ] スマートフォン（320px-639px）で正常表示
- [ ] タブレット（640px-1023px）で正常表示
- [ ] デスクトップ（1024px以上）で正常表示

### パフォーマンス
- [ ] 画像は最適化されている
- [ ] 不要なre-renderがない
- [ ] JavaScriptバンドルサイズが小さい

### アクセシビリティ
- [ ] alt属性が適切に設定されている
- [ ] キーボード操作が可能
- [ ] コントラスト比が十分

---

## 💬 注意事項

### 既存コードの尊重
- 既存の `constants.ts` のデータを活用してください
- `types.ts` の型定義を遵守してください
- React Router のルーティング構造を維持してください

### バックエンド未実装
- 現時点ではバックエンドAPIが未実装です
- API呼び出しは `constants.ts` のモックデータを使用してください
- 将来的にAPIが実装されることを想定した設計にしてください

---

## 🎯 最終ゴール

**投資家やパートナーが見て、「このプラットフォームに参画したい！」と思えるような、プロフェッショナルで魅力的なフロントエンドを完成させる。**

---

## 📞 質問があれば

このドキュメントで不明な点があれば、遠慮なく質問してください。

**重要**: 実装後、GitHubにコミット＆プッシュして、動作確認URLを共有してください。

---

**頑張ってください！素晴らしいUIを期待しています！** 🚀