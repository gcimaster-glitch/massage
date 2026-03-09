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
  if [ -f "functions/$name" ] || [ "$name" != "index.tsx" ]; then
    cp "$f" "functions/$name" 2>/dev/null || true
  fi
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

# services/ サブディレクトリを同期
mkdir -p functions/services
for f in src/services/*.ts 2>/dev/null; do
  [ -f "$f" ] && cp "$f" "functions/services/$(basename "$f")"
done

echo "✅ 同期完了"
