#!/usr/bin/env python3
"""
D1マイグレーション実行スクリプト
Cloudflare D1 REST APIを使って、SQLを1文ずつ安全に実行する
"""
import os
import sys
import json
import urllib.request
import urllib.error

API_TOKEN = os.environ.get("CLOUDFLARE_API_TOKEN", "")
ACCOUNT_ID = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
DATABASE_ID = os.environ.get("DATABASE_ID", "97aee8a1-83d8-45e3-8a30-95ca6875e8ed")

if not API_TOKEN or not ACCOUNT_ID:
    print("ERROR: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID must be set")
    sys.exit(1)

# SQLファイルのパスを引数から取得
sql_file = sys.argv[1] if len(sys.argv) > 1 else "migrations/0045_add_booking_timelock.sql"

with open(sql_file, "r") as f:
    content = f.read()

# コメント行を除去してSQL文を分割
lines = []
for line in content.split("\n"):
    stripped = line.strip()
    if stripped and not stripped.startswith("--"):
        lines.append(stripped)

# セミコロンで区切ってSQL文を分割
full_sql = " ".join(lines)
statements = [s.strip() for s in full_sql.split(";") if s.strip()]

print(f"Found {len(statements)} SQL statements to execute")

url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/d1/database/{DATABASE_ID}/query"
headers = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

success_count = 0
skip_count = 0
error_count = 0

for i, stmt in enumerate(statements, 1):
    print(f"\n[{i}/{len(statements)}] Executing: {stmt[:80]}...")
    
    payload = json.dumps({"sql": stmt}).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    
    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read())
            if result.get("success"):
                print(f"  ✅ Success")
                success_count += 1
            else:
                errors = result.get("errors", [])
                error_msg = errors[0].get("message", "Unknown error") if errors else "Unknown error"
                # "already exists" や "duplicate column" は無視（冪等性のため）
                if "already exists" in error_msg or "duplicate column" in error_msg.lower():
                    print(f"  ⚠️  Skipped (already exists): {error_msg}")
                    skip_count += 1
                else:
                    print(f"  ❌ Error: {error_msg}")
                    error_count += 1
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            err_data = json.loads(body)
            errors = err_data.get("errors", [])
            error_msg = errors[0].get("message", str(e)) if errors else str(e)
        except Exception:
            error_msg = body[:200]
        
        if "already exists" in error_msg or "duplicate column" in error_msg.lower():
            print(f"  ⚠️  Skipped (already exists): {error_msg}")
            skip_count += 1
        else:
            print(f"  ❌ HTTP Error {e.code}: {error_msg}")
            error_count += 1

print(f"\n{'='*50}")
print(f"Migration complete: {success_count} succeeded, {skip_count} skipped, {error_count} failed")

if error_count > 0:
    print("MIGRATION FAILED with errors")
    sys.exit(1)
else:
    print("MIGRATION SUCCESSFUL")
    sys.exit(0)
