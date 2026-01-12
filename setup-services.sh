#!/bin/bash
# Resend と Google サービスの設定スクリプト
# このスクリプトは対話的に API キーを設定します

set -e

echo "🔧 HOGUSY サービス設定スクリプト"
echo "=================================="
echo ""
echo "このスクリプトは以下のサービスを設定します:"
echo "  1. Resend (メール送信)"
echo "  2. Google Maps API (地図表示)"
echo "  3. Google OAuth 2.0 (Googleログイン)"
echo ""
echo "⚠️  注意: API キーは安全に保管してください"
echo ""

# .dev.vars ファイルの確認
DEV_VARS_FILE="/home/user/webapp/.dev.vars"

if [ ! -f "$DEV_VARS_FILE" ]; then
    echo "❌ Error: .dev.vars ファイルが見つかりません"
    exit 1
fi

echo "✅ .dev.vars ファイル検出"
echo ""

# バックアップ作成
cp "$DEV_VARS_FILE" "$DEV_VARS_FILE.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ バックアップ作成完了"
echo ""

# 対話的な設定
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📧 Part 1: Resend API Key"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Resend API Key を取得していますか？"
echo "  まだの場合: https://resend.com/api-keys"
echo ""
read -p "Resend API Key を入力してください (re_で始まる): " RESEND_KEY

if [[ ! $RESEND_KEY =~ ^re_ ]]; then
    echo "⚠️  警告: Resend API Key は通常 're_' で始まります"
    read -p "このまま続けますか？ (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "中止しました"
        exit 1
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗺️  Part 2: Google Maps API Key"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Google Maps API Key を取得していますか？"
echo "  まだの場合: https://console.cloud.google.com/apis/credentials"
echo ""
read -p "Google Maps API Key を入力してください (AIzaSyで始まる): " MAPS_KEY

if [[ ! $MAPS_KEY =~ ^AIzaSy ]]; then
    echo "⚠️  警告: Google Maps API Key は通常 'AIzaSy' で始まります"
    read -p "このまま続けますか？ (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "中止しました"
        exit 1
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Part 3: Google OAuth 2.0"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Google OAuth Client ID を取得していますか？"
echo "  まだの場合: https://console.cloud.google.com/apis/credentials"
echo ""
read -p "Google OAuth Client ID を入力してください: " OAUTH_CLIENT_ID

echo ""
read -p "Google OAuth Client Secret を入力してください (GOCSPX-で始まる): " OAUTH_CLIENT_SECRET

if [[ ! $OAUTH_CLIENT_SECRET =~ ^GOCSPX- ]]; then
    echo "⚠️  警告: Google OAuth Client Secret は通常 'GOCSPX-' で始まります"
    read -p "このまま続けますか？ (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "中止しました"
        exit 1
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 設定内容の確認"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Resend API Key: ${RESEND_KEY:0:10}... (${#RESEND_KEY} 文字)"
echo "Google Maps API Key: ${MAPS_KEY:0:10}... (${#MAPS_KEY} 文字)"
echo "Google OAuth Client ID: ${OAUTH_CLIENT_ID:0:20}..."
echo "Google OAuth Client Secret: ${OAUTH_CLIENT_SECRET:0:10}... (${#OAUTH_CLIENT_SECRET} 文字)"
echo ""
read -p "この内容で .dev.vars を更新しますか？ (y/n): " final_confirm

if [ "$final_confirm" != "y" ]; then
    echo "中止しました"
    exit 1
fi

# .dev.vars を更新
echo ""
echo "🔄 .dev.vars を更新中..."

# Resend
if grep -q "^RESEND_API_KEY=" "$DEV_VARS_FILE"; then
    sed -i "s|^RESEND_API_KEY=.*|RESEND_API_KEY=$RESEND_KEY|" "$DEV_VARS_FILE"
    echo "  ✅ RESEND_API_KEY を更新"
else
    echo "RESEND_API_KEY=$RESEND_KEY" >> "$DEV_VARS_FILE"
    echo "  ✅ RESEND_API_KEY を追加"
fi

# Google Maps
if grep -q "^GOOGLE_MAPS_API_KEY=" "$DEV_VARS_FILE"; then
    sed -i "s|^GOOGLE_MAPS_API_KEY=.*|GOOGLE_MAPS_API_KEY=$MAPS_KEY|" "$DEV_VARS_FILE"
    echo "  ✅ GOOGLE_MAPS_API_KEY を更新"
else
    echo "GOOGLE_MAPS_API_KEY=$MAPS_KEY" >> "$DEV_VARS_FILE"
    echo "  ✅ GOOGLE_MAPS_API_KEY を追加"
fi

# Google OAuth Client ID
if grep -q "^GOOGLE_CLIENT_ID=" "$DEV_VARS_FILE"; then
    sed -i "s|^GOOGLE_CLIENT_ID=.*|GOOGLE_CLIENT_ID=$OAUTH_CLIENT_ID|" "$DEV_VARS_FILE"
    echo "  ✅ GOOGLE_CLIENT_ID を更新"
else
    echo "GOOGLE_CLIENT_ID=$OAUTH_CLIENT_ID" >> "$DEV_VARS_FILE"
    echo "  ✅ GOOGLE_CLIENT_ID を追加"
fi

# Google OAuth Client Secret
if grep -q "^GOOGLE_CLIENT_SECRET=" "$DEV_VARS_FILE"; then
    sed -i "s|^GOOGLE_CLIENT_SECRET=.*|GOOGLE_CLIENT_SECRET=$OAUTH_CLIENT_SECRET|" "$DEV_VARS_FILE"
    echo "  ✅ GOOGLE_CLIENT_SECRET を更新"
else
    echo "GOOGLE_CLIENT_SECRET=$OAUTH_CLIENT_SECRET" >> "$DEV_VARS_FILE"
    echo "  ✅ GOOGLE_CLIENT_SECRET を追加"
fi

echo ""
echo "✅ ローカル環境の設定完了！"
echo ""

# index.html の更新を促す
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 次のステップ: index.html の更新"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "index.html の Google Maps API Key を更新する必要があります:"
echo ""
echo "  sed -i 's/YOUR_API_KEY_HERE/$MAPS_KEY/g' /home/user/webapp/index.html"
echo ""
read -p "今すぐ index.html を更新しますか？ (y/n): " update_html

if [ "$update_html" = "y" ]; then
    sed -i "s/YOUR_API_KEY_HERE/$MAPS_KEY/g" /home/user/webapp/index.html
    echo "✅ index.html を更新しました"
else
    echo "⚠️  後で手動で更新してください"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "☁️  本番環境（Cloudflare Pages）への設定"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "以下のコマンドで本番環境に環境変数を設定できます:"
echo ""
echo "cd /home/user/webapp"
echo ""
echo "# Resend"
echo "npx wrangler pages secret put RESEND_API_KEY --project-name hogusy"
echo ""
echo "# Google Maps"
echo "npx wrangler pages secret put GOOGLE_MAPS_API_KEY --project-name hogusy"
echo ""
echo "# Google OAuth"
echo "npx wrangler pages secret put GOOGLE_CLIENT_ID --project-name hogusy"
echo "npx wrangler pages secret put GOOGLE_CLIENT_SECRET --project-name hogusy"
echo ""
read -p "今すぐ本番環境に設定しますか？ (y/n): " setup_prod

if [ "$setup_prod" = "y" ]; then
    echo ""
    echo "🔄 本番環境に設定中..."
    echo ""
    
    cd /home/user/webapp
    
    echo "Resend API Key を設定..."
    echo "$RESEND_KEY" | npx wrangler pages secret put RESEND_API_KEY --project-name hogusy
    
    echo "Google Maps API Key を設定..."
    echo "$MAPS_KEY" | npx wrangler pages secret put GOOGLE_MAPS_API_KEY --project-name hogusy
    
    echo "Google OAuth Client ID を設定..."
    echo "$OAUTH_CLIENT_ID" | npx wrangler pages secret put GOOGLE_CLIENT_ID --project-name hogusy
    
    echo "Google OAuth Client Secret を設定..."
    echo "$OAUTH_CLIENT_SECRET" | npx wrangler pages secret put GOOGLE_CLIENT_SECRET --project-name hogusy
    
    echo ""
    echo "✅ 本番環境への設定完了！"
else
    echo "⚠️  後で上記のコマンドを実行してください"
fi

echo ""
echo "=================================="
echo "🎉 設定完了！"
echo "=================================="
echo ""
echo "📊 設定サマリー:"
echo "  ✅ Resend API Key"
echo "  ✅ Google Maps API Key"
echo "  ✅ Google OAuth Client ID"
echo "  ✅ Google OAuth Client Secret"
echo ""
echo "📂 バックアップファイル:"
echo "  $DEV_VARS_FILE.backup.*"
echo ""
echo "🚀 次のステップ:"
echo "  1. npm run build でビルド"
echo "  2. pm2 restart hogusy でローカルサーバー再起動"
echo "  3. http://localhost:3000 で動作確認"
echo "  4. npm run deploy:prod で本番デプロイ"
echo ""
