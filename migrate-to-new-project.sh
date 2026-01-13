#!/bin/bash
# 新プロジェクト移行スクリプト
# 使用方法: ./migrate-to-new-project.sh <新プロジェクト名>

NEW_PROJECT_NAME=${1:-hogusy-git}

echo "🚀 HOGUSY プロジェクト移行スクリプト"
echo "新プロジェクト名: $NEW_PROJECT_NAME"
echo ""

# Step 1: 環境変数を設定
echo "📝 Step 1: 環境変数を設定..."
echo ""
echo "Resend API Key を設定中..."
echo "re_AKEPFY69_2PNpV6wAVteKeQEApQkuRpDu" | npx wrangler pages secret put RESEND_API_KEY --project-name "$NEW_PROJECT_NAME"

echo ""
echo "✅ 環境変数の設定完了"
echo ""

# Step 2: package.json を更新
echo "📝 Step 2: package.json を更新..."
cd /home/user/webapp

# バックアップを作成
cp package.json package.json.backup

# deploy スクリプトを更新
cat package.json | jq --arg project "$NEW_PROJECT_NAME" '
  .scripts.deploy = "npm run build && wrangler pages deploy dist --project-name \($project)" |
  .scripts["deploy:prod"] = "npm run build && wrangler pages deploy dist --project-name \($project) --branch main"
' > package.json.tmp && mv package.json.tmp package.json

echo "✅ package.json 更新完了"
echo ""

# Step 3: wrangler.jsonc を更新
echo "📝 Step 3: wrangler.jsonc を更新..."
sed -i "s/\"name\": \"hogusy\"/\"name\": \"$NEW_PROJECT_NAME\"/" wrangler.jsonc
echo "✅ wrangler.jsonc 更新完了"
echo ""

# Step 4: meta_info を更新
echo "📝 Step 4: meta_info を更新..."
# これは後で meta_info ツールで実施
echo "（meta_info は後で更新）"
echo ""

# Step 5: ecosystem.config.cjs を更新（PM2設定）
echo "📝 Step 5: ecosystem.config.cjs を更新..."
sed -i "s/name: 'hogusy'/name: '$NEW_PROJECT_NAME'/" ecosystem.config.cjs
echo "✅ ecosystem.config.cjs 更新完了"
echo ""

# Step 6: コミット
echo "📝 Step 6: Git コミット..."
git add package.json wrangler.jsonc ecosystem.config.cjs
git commit -m "feat: Migrate to new Git-connected project $NEW_PROJECT_NAME

- Update deployment scripts to use $NEW_PROJECT_NAME
- Configure for automatic Git deployment
- Environment variables will be set separately"

echo "✅ Git コミット完了"
echo ""

# Step 7: プッシュ
echo "📝 Step 7: GitHub にプッシュ..."
git push origin main

echo ""
echo "✅ GitHub プッシュ完了"
echo ""

echo "🎉 移行作業完了！"
echo ""
echo "次のステップ:"
echo "1. Cloudflare Dashboard で $NEW_PROJECT_NAME にカスタムドメインを追加"
echo "2. D1 Database (hogusy-db-production) をバインディングに追加"
echo "3. R2 Bucket (hogusy-storage) をバインディングに追加"
echo "4. 旧プロジェクト (hogusy) からドメインを削除"
echo "5. Git push でデプロイが自動実行されることを確認"
echo ""
echo "新しい URL: https://$NEW_PROJECT_NAME.pages.dev"
