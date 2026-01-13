#!/bin/bash
# hogusy プロジェクト再設定スクリプト

echo "🚀 HOGUSY プロジェクト再設定"
echo ""

PROJECT_NAME="hogusy"

# Step 1: 環境変数を設定
echo "📝 Step 1: 環境変数を設定..."
echo "re_AKEPFY69_2PNpV6wAVteKeQEApQkuRpDu" | npx wrangler pages secret put RESEND_API_KEY --project-name "$PROJECT_NAME"

# Step 2: package.json を更新
echo "📝 Step 2: package.json を更新..."
cd /home/user/webapp
cat package.json | jq '
  .name = "hogusy" |
  .scripts.deploy = "npm run build && wrangler pages deploy dist --project-name hogusy" |
  .scripts["deploy:prod"] = "npm run build && wrangler pages deploy dist --project-name hogusy --branch main"
' > package.json.tmp && mv package.json.tmp package.json

# Step 3: wrangler.jsonc を更新
echo "📝 Step 3: wrangler.jsonc を更新..."
sed -i 's/"name": "massage"/"name": "hogusy"/' wrangler.jsonc

# Step 4: ecosystem.config.cjs を更新
echo "📝 Step 4: ecosystem.config.cjs を更新..."
sed -i "s/name: 'massage'/name: 'hogusy'/" ecosystem.config.cjs

# Step 5: PM2 再起動
echo "📝 Step 5: PM2 を再起動..."
pm2 delete massage 2>/dev/null || true
pm2 delete hogusy 2>/dev/null || true
pm2 start ecosystem.config.cjs

# Step 6: Git コミット
echo "📝 Step 6: Git コミット..."
git add .
git commit -m "feat: Rename project from massage to hogusy

- Update all configuration files
- Set RESEND_API_KEY for hogusy project
- Final project name: hogusy"

# Step 7: Git プッシュ
echo "📝 Step 7: GitHub にプッシュ..."
git push origin main

echo ""
echo "✅ 再設定完了！"
echo ""
echo "新しい URL: https://hogusy.pages.dev"
