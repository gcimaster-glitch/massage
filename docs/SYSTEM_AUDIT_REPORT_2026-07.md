# システム全体監査レポート（2026-07）

バグ・整合性・未実装・データベース不一致の全体監査を実施し、検出した問題を修正した。
検証方法: 全マイグレーションをローカルD1へ適用（`wrangler d1 migrations apply --local`、FK制約有効）
→ ソース内の全SQL（348クエリ）を実スキーマに対して機械検証 → ローカルサーバーでE2E動作確認。

## 検出・修正した問題一覧

### 🔴 Critical（機能全滅級）

| # | 問題 | 影響 | 修正 |
|---|------|------|------|
| 1 | `datetime("now")` 二重引用符SQL（auth-routes 6箇所ほか） | D1は二重引用符文字列を受け付けないため **OAuthログイン/新規登録が全て失敗**（`auth_failed` の根本原因の可能性大） | 単一引用符に統一 |
| 2 | `bookings.therapist_id` / `booking_timelocks.therapist_id` のFKが `therapist_profiles(id)` を参照（コードは `users.id` を格納） | **通常予約の作成がFOREIGN KEY constraintで全て失敗** | 0053で `users(id)` へFK張り替え |
| 3 | マイグレーション 0038 が `ADD COLUMN IF NOT EXISTS`（SQLite非対応構文）で**適用不能** | 新規環境構築が0038で停止 | 構文修正 |
| 4 | マイグレーション 0036 が存在しない `host-default` ユーザーを参照しFK違反で**適用不能** | `wrangler d1 migrations apply` が0036で停止（以降0037〜0053が未適用のまま） | ホストユーザーを先に作成 |
| 5 | 0043系2ファイルが `revenue_share_rules` / `transactions` 等を互いに矛盾する定義で作成、0044は重複カラムで失敗 | マイグレーション連鎖が壊れ、収益分配エンジンのSQLがほぼ全て実行不能 | 競合を整理し 0052 で正規化 |
| 6 | `functions/api/admin/[[route]].ts` が独立アプリとして `/api/admin/*` を横取り（Pages functionsモード時） | 管理APIのほぼ全てが404（しかも内部クエリは存在しない `amount` カラム参照） | メインアプリへの委譲に変更 |

### 🟠 High（機能単位の障害）

| # | 問題 | 影響 | 修正 |
|---|------|------|------|
| 7 | src/ → functions/ の同期漏れ（auth/payments/therapists の修正済みコードが未反映） | 修正が本番に届かない事故の温床 | 同期実施（build時に自動同期） |
| 8 | `favorites-routes` / `admin-plans-routes` / `ai-config-routes` / `host-affiliate-routes` / `user-self-routes` が functions/ にのみ存在し**未マウント** | お気に入り・プラン管理・アフィリエイト画面等がAPI 404（フロントは呼んでいる） | src/ へ移設しルーター登録 |
| 9 | notify-routes の認証が存在しない `sessions` テーブル参照＋セッション方式 | 通知一覧が常に401 | JWT検証（auth-middleware）に統一 |
| 10 | reviews テーブルに `customer_age_range` / `therapist_reply` 等が無い（コードは使用） | レビュー投稿・一覧・返信が全滅 | 0052で拡張（FKも users へ） |
| 11 | `transactions` / `transaction_splits` / `payout_statements` がコードの期待と不一致（`gross_amount`/`updated_at`/`total_amount`/`fee_amount` 等欠落、role CHECKが `THERAPIST_OFFICE` を拒否） | 収益分配・精算バッチが全滅 | 0052で再構築 |
| 12 | host-routes が存在しない `sites.host_user_id` / `bookings.total_price` / `services` / `revenue_splits` を参照 | ホストダッシュボードが常にデモデータ | 実スキーマ（host_id/price/service_name/transaction_splits）に修正 |
| 13 | stripe-webhook-routes が存在しない `therapists` / `earnings_distributions` / `subscription_plans` / `user_subscriptions` テーブルを参照 | 決済Webhookの収益分配・サブスク処理が全滅 | テーブル新設（0052）＋ `plans` / `therapist_profiles` 参照に修正 |
| 14 | 予約拒否 `PATCH /:id/reject` に認証ミドルウェア未適用（常に403）＋ CHECK制約に無い `REJECTED` ステータスを書き込み | 拒否機能が使用不能 | requireAuth追加、CANCELLED+booking_logsで表現 |
| 15 | `booking_logs` テーブル未作成（コードは書き込み） | 拒否理由・ステータス変更履歴が記録されない | 0052で作成 |
| 16 | incidents INSERTが旧スキーマ（`reported_by`、NOT NULL列欠落） | 安全上の懸念報告が記録されない | reporter_id/reporter_role/severity/type に修正 |
| 17 | therapist_profiles に出張設定カラム（outcall_available等8列）が無い | セラピスト出張設定の保存が失敗 | 0052で追加 |
| 18 | offices に address/phone/email 等が無い＋ INSERTがNOT NULL列（user_id等）を欠落＋ `owner_user_id` 参照 | 事務所の作成・更新・一覧が失敗 | 0052でカラム追加＋コード修正 |
| 19 | 公開メニューAPIが `therapist_menu_courses`（空）のみ参照 | シードデータ（`therapist_menu`）があるのにメニューが空＝予約フローが進めない | 旧テーブルへのフォールバック追加 |

### 🟡 Medium（データ整合性・セキュリティ）

| # | 問題 | 修正 |
|---|------|------|
| 20 | `/api/admin/refunds` の `status` クエリパラメータをSQLへ直埋め（SQLインジェクション） | プレースホルダ化 |
| 21 | therapist-edit-routes が任意のフィールド名を `SET ${fieldName}=` でSQLへ直埋め | カラム許可リスト（EDITABLE_PROFILE_FIELDS）を導入 |
| 22 | admin系ユーザー一覧が存在しない `users.is_active` を参照 | `is_archived` から導出 |
| 23 | areas-routes が存在しない `sites.prefecture/city` を参照（常にフォールバック） | `master_areas` から取得 |
| 24 | sites-routes が `sites.area`（実際は `area_code`）を参照 | 修正 |
| 25 | payments-routes 収益一覧が `te.platform_fee`（実際は `platform_amount`）を参照 | 修正 |
| 26 | mock-data が therapist_profiles を PK(id) 無し・存在しない `is_active` 付きでINSERT、menu/optionsにユーザーIDを格納（FK違反） | id付与・status使用・プロファイルIDに修正 |
| 27 | revenue_share_rules の率の単位が実装間で不統一（小数0.4 vs パーセント40） | %表記に正規化（0052、既存データは自動換算） |

## 新規マイグレーション

- **0052_audit_reconciliation.sql** — revenue_share_rules / transactions / transaction_splits / payout_statements / reviews の再構築（既存データ移行込み）、booking_logs / earnings_distributions / user_subscriptions の新設、therapist_profiles / offices へのカラム追加
- **0053_fix_booking_therapist_fk.sql** — bookings / booking_timelocks の therapist_id FK を users(id) へ張り替え

## 検証結果

- ✅ 全34マイグレーションが**フレッシュDBにエラーゼロで適用**（wrangler d1 / FK有効で確認）
- ✅ ソース内**348 SQLクエリの静的検証で不整合ゼロ**（修正前61件 → 0件。残6件は動的SQL組立による検査上の誤検知で目視確認済み）
- ✅ ローカルE2E: 会員登録 → メール認証 → ログイン → セラピスト一覧/メニュー取得 → **予約作成** → レビュー投稿/一覧 → 予約キャンセル（履歴記録）→ お気に入り/通知/ポイント/AI設定/アフィリエイトAPI応答 まで成功
- ✅ `npm run build`（サーバー+クライアント）成功

## ⚠️ 本番DBに関する重要な注意

本番D1はマイグレーション管理と乖離している可能性が高いです（0036/0038が適用不能だったため、手動SQLで運用されていた形跡あり。ルート直下の多数の `seed-*.sql` / `fix-*.sql` がその証拠）。

**本番適用手順の推奨:**
1. `wrangler d1 migrations list hogusy-db-production --remote` で未適用マイグレーションを確認
2. 適用前に `wrangler d1 export` でバックアップ取得
3. `wrangler d1 migrations apply hogusy-db-production --remote` を実行
4. 手動作成されたテーブルと衝突するエラーが出た場合は、そのマイグレーションのみ `d1_migrations` テーブルへ手動でINSERTしてスキップし、0052/0053（スキーマ正規化）は必ず適用する

## 未対応（今後の課題）

- TypeScriptの型エラー約100件（ビルドはesbuildのため通るが、`tsc --noEmit` は失敗する。実行時影響なし）
- ルート直下の大量のセットアップ用MD/SQLファイルの整理
- `therapist_menu`（マスター連携型）と `therapist_menu_courses`（個別登録型）の二重メニュー管理の一本化
- stripe-webhook-routes と revenue-engine-routes で収益分配処理が二重実装（`/api/webhook/stripe` と `/api/revenue/webhook`）。Stripeダッシュボードに登録されているURLに応じて片方へ統合すべき
