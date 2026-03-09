#!/bin/bash
# sync-functions.sh
# src/ ディレクトリの変更を functions/ に自動同期するスクリプト
# Cloudflare Pages は functions/ ディレクトリを直接使用するため、
# src/ を修正したら functions/ も同期する必要がある。
# このスクリプトは package.json の build コマンドから自動実行される。

set -e

echo "🔄 src/ → functions/ を同期中..."

# ルートレベルのTSファイルを同期
for f in src/*.ts; do
  name=$(basename "$f")
  cp "$f" "functions/$name"
done

# src/index.tsx → functions/[[route]].ts に同期
cp src/index.tsx "functions/[[route]].ts"

# routes/ サブディレクトリを同期
mkdir -p functions/routes
for f in src/routes/*.ts; do
  name=$(basename "$f")
  cp "$f" "functions/routes/$name"
done

# ssr/ サブディレクトリを同期
mkdir -p functions/ssr
for f in src/ssr/*.ts; do
  name=$(basename "$f")
  cp "$f" "functions/ssr/$name"
done

# services/ サブディレクトリを同期（存在する場合のみ）
if ls src/services/*.ts 1>/dev/null 2>&1; then
  mkdir -p functions/services
  for f in src/services/*.ts; do
    name=$(basename "$f")
    cp "$f" "functions/services/$name"
  done
fi

echo "✅ 同期完了"
