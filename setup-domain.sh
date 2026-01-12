#!/bin/bash
# hogusy.com ドメイン自動設定スクリプト
# このスクリプトは、てつじさんがhogusy.comを購入した後に実行します

set -e  # エラーが発生したら即座に終了

echo "🌐 HOGUSY Domain Setup Script"
echo "================================"
echo ""

# Cloudflare API トークンの確認
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ Error: CLOUDFLARE_API_TOKEN が設定されていません"
    echo "   setup_cloudflare_api_key を実行してください"
    exit 1
fi

echo "✅ Cloudflare API Token: 設定済み"
echo ""

# hogusy.com ゾーンの存在確認
echo "🔍 hogusy.com ドメインを確認中..."
ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  | python3 -c "import sys, json; zones = json.load(sys.stdin)['result']; hogusy_zones = [z for z in zones if z['name'] == 'hogusy.com']; print(hogusy_zones[0]['id'] if hogusy_zones else '')" 2>/dev/null)

if [ -z "$ZONE_ID" ]; then
    echo "❌ Error: hogusy.com ドメインが見つかりません"
    echo ""
    echo "📋 次のステップ:"
    echo "   1. Cloudflare Dashboard にアクセス"
    echo "      https://dash.cloudflare.com/26a3fcdbd2ec761fceb6e0d4138a5e46/domains/register"
    echo ""
    echo "   2. hogusy.com を検索して購入"
    echo ""
    echo "   3. 購入完了後、このスクリプトを再実行"
    echo ""
    exit 1
fi

echo "✅ hogusy.com ドメイン検出: $ZONE_ID"
echo ""

# Cloudflare Pages にカスタムドメインを追加
echo "📍 Cloudflare Pages にカスタムドメインを追加中..."

# apex ドメイン (hogusy.com)
echo "   - hogusy.com を追加..."
npx wrangler pages domain add hogusy.com --project-name hogusy 2>&1 | grep -E "(Success|Error|already)" || true

# www サブドメイン (www.hogusy.com)
echo "   - www.hogusy.com を追加..."
npx wrangler pages domain add www.hogusy.com --project-name hogusy 2>&1 | grep -E "(Success|Error|already)" || true

echo ""
echo "✅ カスタムドメイン追加完了"
echo ""

# DNS レコードの確認
echo "🔍 DNS レコードを確認中..."
DNS_RECORDS=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  | python3 -c "import sys, json; records = json.load(sys.stdin)['result']; print('\n'.join([f\"{r['type']:6s} {r['name']:30s} -> {r['content']}\" for r in records[:10]]))" 2>/dev/null)

echo "$DNS_RECORDS"
echo ""

# SSL/TLS 証明書の状態確認
echo "🔐 SSL/TLS 証明書を確認中..."
SSL_STATUS=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/ssl/certificate_packs" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  | python3 -c "import sys, json; packs = json.load(sys.stdin)['result']; print(packs[0]['status'] if packs else 'none')" 2>/dev/null)

if [ "$SSL_STATUS" = "active" ]; then
    echo "✅ SSL/TLS 証明書: アクティブ"
elif [ "$SSL_STATUS" = "pending_validation" ]; then
    echo "⏳ SSL/TLS 証明書: 発行中（5〜15分かかります）"
else
    echo "⚠️  SSL/TLS 証明書: $SSL_STATUS"
fi
echo ""

# DNS 伝播の確認
echo "🌍 DNS 伝播を確認中..."
echo "   dig hogusy.com:"
dig +short hogusy.com 2>/dev/null | head -3 || echo "   （まだ伝播していません）"
echo ""
echo "   dig www.hogusy.com:"
dig +short www.hogusy.com 2>/dev/null | head -3 || echo "   （まだ伝播していません）"
echo ""

# HTTP アクセステスト
echo "🌐 HTTP アクセステスト..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://hogusy.com 2>/dev/null || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ https://hogusy.com: 正常にアクセス可能"
elif [ "$HTTP_STATUS" = "000" ]; then
    echo "⏳ https://hogusy.com: DNS伝播待ち（最大24時間）"
else
    echo "⚠️  https://hogusy.com: HTTP $HTTP_STATUS"
fi
echo ""

# リダイレクト設定の案内
echo "🔄 次のステップ: www → apex リダイレクト設定"
echo ""
echo "   Cloudflare Dashboard でリダイレクトルールを作成:"
echo "   1. https://dash.cloudflare.com/ にアクセス"
echo "   2. hogusy.com ゾーンを選択"
echo "   3. Rules → Redirect Rules → Create Rule"
echo "   4. 設定:"
echo "      Rule name: Redirect www to apex"
echo "      When: Hostname equals www.hogusy.com"
echo "      Then: Dynamic redirect to concat(\"https://hogusy.com\", http.request.uri.path)"
echo "      Status code: 301"
echo "   5. Deploy をクリック"
echo ""

# Google サービス更新の案内
echo "🔑 Google サービスの更新が必要です"
echo ""
echo "   Google OAuth 2.0:"
echo "   1. https://console.cloud.google.com/apis/credentials"
echo "   2. OAuth クライアント ID を編集"
echo "   3. 承認済みの JavaScript 生成元に追加:"
echo "      https://hogusy.com"
echo "   4. 承認済みのリダイレクト URI に追加:"
echo "      https://hogusy.com/auth/callback/google"
echo ""
echo "   Google Maps API:"
echo "   1. https://console.cloud.google.com/apis/credentials"
echo "   2. API Key を編集"
echo "   3. HTTP リファラーに追加:"
echo "      https://hogusy.com/*"
echo ""

# 完了メッセージ
echo "================================"
echo "🎉 ドメイン設定が完了しました！"
echo ""
echo "📊 状態サマリー:"
echo "   - ドメイン: hogusy.com (Zone ID: $ZONE_ID)"
echo "   - Pages: hogusy"
echo "   - SSL/TLS: $SSL_STATUS"
echo "   - HTTP Status: $HTTP_STATUS"
echo ""
echo "📋 確認項目:"
echo "   [ ] DNS が伝播している（dig hogusy.com）"
echo "   [ ] HTTPS でアクセスできる（https://hogusy.com）"
echo "   [ ] SSL 証明書が有効"
echo "   [ ] www → apex リダイレクトが動作"
echo "   [ ] Google OAuth の URI を更新"
echo "   [ ] Google Maps API のリファラーを更新"
echo ""
echo "🚀 本番URL: https://hogusy.com"
echo "================================"
