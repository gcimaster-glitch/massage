# 🎯 HOGUSY 予約フロー完全実装ガイド

## ✅ 完了済み

### 1. 本番環境デプロイ
- **URL**: https://616be5e6.hogusy.pages.dev
- **D1データベース**: 11名セラピスト + 19施設 投入完了
- **API修正**: 本番DBスキーマに対応完了

### 2. 予約フロー基盤
- **型定義**: `/types/booking.ts` 作成完了
- **メインコンポーネント**: `/components/booking/BookingFlow.tsx` 作成完了

---

## 📋 予約フロー仕様

### 4つの予約パターン

#### パターン1: マップから予約（3ステップ）
```
Step 1: 施設選択（マップ上）
Step 2: セラピスト選択 + メニュー選択
Step 3: 日時選択 → 確認 → 決済/完了
```

#### パターン2: セラピストから予約（3ステップ）
```
Step 1: セラピスト選択
Step 2: 施設選択 + メニュー選択
Step 3: 日時選択 → 確認 → 決済/完了
```

#### パターン3: 指名予約（2ステップ）
```
Step 1: メニュー選択 + 施設選択
Step 2: 日時選択 → 確認 → 決済/完了
```

#### パターン4: おまかせAI予約（3ステップ）
```
Step 1: 悩み・症状選択（AIチャット）
Step 2: AIおすすめ（セラピスト + 施設 + メニュー）
Step 3: 日時選択 → 確認 → 決済/完了
```

### KYC・決済ルール

#### 出張予約時
- ✅ **KYC必須**（本人確認完了済みユーザーのみ予約可能）
- KYC未完了の場合：予約前にKYC画面へ誘導

#### フリー会員（未登録ユーザー）
- ✅ 予約の最後に **KYC + 会員登録 + カード決済** を一括実施
- **施設予約**: KYC不要 → 会員登録 + カード決済のみ
- **出張予約**: KYC + 会員登録 + カード決済

---

## 🚀 次の実装ステップ

### Step 3: 個別コンポーネント実装（優先度: 高）

#### 必要なコンポーネント:
1. **TherapistSelect.tsx** - セラピスト選択UI
2. **SiteSelect.tsx** - 施設選択UI
3. **MenuSelect.tsx** - メニュー（コース・オプション）選択UI
4. **DateTimeSelect.tsx** - 日時選択UI（カレンダー + 時間帯）
5. **BookingConfirm.tsx** - 予約確認UI
6. **BookingComplete.tsx** - 予約完了画面
7. **KYCForm.tsx** - KYC本人確認フォーム
8. **PaymentForm.tsx** - 決済フォーム

### Step 4: ルーティング設定

#### 予約フローエントリーポイント:
- `/booking/from-map/:siteId` - マップから予約
- `/booking/from-therapist/:therapistId` - セラピストから予約
- `/booking/direct/:therapistId` - 指名予約
- `/booking/ai` - AI予約

### Step 5: API統合

#### 使用するAPIエンドポイント:
- `GET /api/therapists` - セラピスト一覧取得
- `GET /api/therapists/:id` - セラピスト詳細取得
- `GET /api/therapists/:id/menu` - メニュー取得
- `GET /api/therapists/:id/schedule` - スケジュール取得
- `GET /api/sites` - 施設一覧取得
- `GET /api/sites/:id` - 施設詳細取得
- `POST /api/bookings` - 予約作成
- `POST /api/auth/register` - ユーザー登録
- `POST /api/kyc/submit` - KYC提出

---

## 📝 実装の進め方（推奨）

### フェーズ1: コアコンポーネント実装（1-2日）
1. TherapistSelect.tsx
2. SiteSelect.tsx
3. MenuSelect.tsx
4. DateTimeSelect.tsx

### フェーズ2: 確認・完了画面（0.5日）
5. BookingConfirm.tsx
6. BookingComplete.tsx

### フェーズ3: KYC・決済（1日）
7. KYCForm.tsx
8. PaymentForm.tsx
9. RegistrationForm.tsx

### フェーズ4: 統合・テスト（0.5日）
10. ルーティング設定
11. エントリーポイント作成
12. E2Eテスト

---

## 🎨 デザイン方針

### UI/UX原則:
- **シンプル**: 各ステップは1画面完結
- **明確**: 次のアクションが明確
- **モバイルファースト**: スマホ最適化
- **フィードバック**: ローディング・エラー表示

### カラースキーム:
- **Primary**: Teal-600 (#0d9488)
- **Success**: Green-600
- **Warning**: Amber-600
- **Error**: Red-600

### コンポーネント構造:
```tsx
<ステップコンポーネント>
  <ヘッダー>
    <戻るボタン>
    <タイトル>
  </ヘッダー>
  
  <メインコンテンツ>
    <選択肢リスト or フォーム>
  </メインコンテンツ>
  
  <フッター>
    <料金サマリー>
    <次へボタン>
  </フッター>
</ステップコンポーネント>
```

---

## 🔧 技術スタック

### フロントエンド:
- **React 18+** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons

### 状態管理:
- **React Hooks** (useState, useEffect, useContext)
- **localStorage** for temporary booking data

### API通信:
- **Fetch API** with async/await
- **JWT** for authentication
- **Error handling** with try-catch

---

## 🧪 テストシナリオ

### シナリオ1: 会員ユーザー → 施設予約
1. セラピスト一覧から選択
2. CARE CUBE施設を選択
3. メニュー選択（60分コース）
4. 日時選択（明日 14:00）
5. 確認画面 → 決済
6. 予約完了

### シナリオ2: フリーユーザー → 出張予約
1. マップから施設選択
2. セラピスト選択
3. 出張先住所入力
4. KYC提出（身分証 + セルフィー）
5. 会員登録（メール + パスワード）
6. カード決済
7. 予約完了

### シナリオ3: 指名予約
1. お気に入りセラピストを直接指名
2. メニュー + 施設選択
3. 日時選択
4. 確認 → 決済
5. 予約完了

---

## 📊 進捗管理

| タスク | 担当 | ステータス | 完了予定 |
|--------|------|------------|----------|
| 型定義作成 | ✅ | 完了 | - |
| BookingFlow | ✅ | 完了 | - |
| TherapistSelect | ⏳ | 未着手 | - |
| SiteSelect | ⏳ | 未着手 | - |
| MenuSelect | ⏳ | 未着手 | - |
| DateTimeSelect | ⏳ | 未着手 | - |
| BookingConfirm | ⏳ | 未着手 | - |
| BookingComplete | ⏳ | 未着手 | - |
| KYCForm | ⏳ | 未着手 | - |
| PaymentForm | ⏳ | 未着手 | - |

---

## 🚀 デプロイ手順

### ローカル開発:
```bash
cd /home/user/webapp
npm run build
pm2 restart hogusy
```

### 本番デプロイ:
```bash
cd /home/user/webapp
git add -A
git commit -m "feat: Booking flow implementation"
npm run build
npx wrangler pages deploy dist --project-name hogusy
```

---

## 📞 サポート・質問

実装中に不明点があれば、以下を確認:
1. **API仕様**: `/src/*-routes.ts` ファイル
2. **型定義**: `/types/booking.ts`
3. **既存コンポーネント**: `/components/` ディレクトリ

---

**てつじさん、このガイドに基づいて実装を進めます。次は個別コンポーネントの実装に移ります！**
