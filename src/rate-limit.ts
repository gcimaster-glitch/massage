/**
 * レート制限ミドルウェア
 * API abuse防止
 */

import { nanoid } from 'nanoid';

// ============================================
// レート制限設定
// ============================================
export interface RateLimitConfig {
  limit: number; // 許可するリクエスト数
  windowMs: number; // ウィンドウ時間（ミリ秒）
  message?: string; // カスタムエラーメッセージ
}

// デフォルト設定
export const RATE_LIMITS = {
  // ログインAPI: 5回/分
  LOGIN: {
    limit: 5,
    windowMs: 60 * 1000, // 1分
    message: 'ログイン試行回数が多すぎます。1分後に再試行してください。'
  },
  
  // パスワードリセット: 3回/時間
  PASSWORD_RESET: {
    limit: 3,
    windowMs: 60 * 60 * 1000, // 1時間
    message: 'パスワードリセット申請が多すぎます。1時間後に再試行してください。'
  },
  
  // 一般API: 100回/分
  GENERAL: {
    limit: 100,
    windowMs: 60 * 1000, // 1分
    message: 'リクエストが多すぎます。しばらく待ってから再試行してください。'
  },
  
  // ユーザー登録: 3回/時間
  REGISTER: {
    limit: 3,
    windowMs: 60 * 60 * 1000, // 1時間
    message: '登録申請が多すぎます。1時間後に再試行してください。'
  },

  // 予約作成: 20回/分（通常ユーザーには十分）
  BOOKING_CREATE: {
    limit: 20,
    windowMs: 60 * 1000, // 1分
    message: '予約リクエストが多すぎます。しばらく待ってから再試行してください。'
  },

  // KYC提出: 3回/時間
  KYC_SUBMIT: {
    limit: 3,
    windowMs: 60 * 60 * 1000, // 1時間
    message: 'KYC提出が多すぎます。1時間後に再試行してください。'
  },

  // 管理者API: 200回/分
  ADMIN: {
    limit: 200,
    windowMs: 60 * 1000, // 1分
    message: '管理者APIリクエストが多すぎます。しばらく待ってから再試行してください。'
  }
};

// ============================================
// レート制限チェック関数
// ============================================
export async function checkRateLimit(
  db: D1Database,
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; retryAfter?: number; remaining?: number }> {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  try {
    // 既存のレコードを取得
    const existing = await db.prepare(`
      SELECT * FROM rate_limit_tracking
      WHERE identifier = ? AND endpoint = ? AND expires_at > ?
    `).bind(identifier, endpoint, now).first() as Record<string, unknown>;

    if (existing) {
      const windowStartTime = existing.window_start as number;
      
      // ウィンドウ内のリクエスト数をチェック
      if (windowStartTime > windowStart) {
        const requestCount = existing.request_count as number;
        
        if (requestCount >= config.limit) {
          // レート制限超過
          const retryAfter = Math.ceil((windowStartTime + config.windowMs - now) / 1000);
          return { allowed: false, retryAfter, remaining: 0 };
        }

        // カウントを増やす
        await db.prepare(`
          UPDATE rate_limit_tracking
          SET request_count = request_count + 1, updated_at = ?
          WHERE id = ?
        `).bind(now, existing.id).run();

        const remaining = config.limit - requestCount - 1;
        return { allowed: true, remaining };
      }
    }

    // 新しいウィンドウを開始
    const id = `rl_${nanoid()}`;
    await db.prepare(`
      INSERT INTO rate_limit_tracking (id, identifier, endpoint, request_count, window_start, expires_at, created_at, updated_at)
      VALUES (?, ?, ?, 1, ?, ?, ?, ?)
    `).bind(id, identifier, endpoint, now, now + config.windowMs, now, now).run();

    const remaining = config.limit - 1;
    return { allowed: true, remaining };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // エラー時は許可（フェイルオープン）
    return { allowed: true };
  }
}

// ============================================
// レート制限ミドルウェア（Hono用）
// ============================================
export function rateLimitMiddleware(config: RateLimitConfig, getIdentifier?: (c: any) => string) {
  return async (c: any, next: any) => {
    const db = c.env.DB as D1Database;
    const endpoint = c.req.path;
    
    // 識別子取得（デフォルトはIPアドレス）
    const identifier = getIdentifier 
      ? getIdentifier(c)
      : (c.req.header('CF-Connecting-IP') || 
         c.req.header('X-Forwarded-For')?.split(',')[0] || 
         'unknown');

    const result = await checkRateLimit(db, identifier, endpoint, config);

    if (!result.allowed) {
      // レート制限超過時のヘッダー設定
      c.header('X-RateLimit-Limit', config.limit.toString());
      c.header('X-RateLimit-Remaining', '0');
      c.header('X-RateLimit-Reset', (Date.now() + (result.retryAfter || 0) * 1000).toString());
      c.header('Retry-After', result.retryAfter?.toString() || '60');

      return c.json({ 
        error: config.message || 'リクエストが多すぎます',
        retryAfter: result.retryAfter
      }, 429);
    }

    // レート制限情報をヘッダーに追加
    if (result.remaining !== undefined) {
      c.header('X-RateLimit-Limit', config.limit.toString());
      c.header('X-RateLimit-Remaining', result.remaining.toString());
    }

    await next();
  };
}

// ============================================
// クリーンアップ: 期限切れレコードを削除
// ============================================
export async function cleanupExpiredRateLimits(db: D1Database): Promise<number> {
  try {
    const now = Date.now();
    const result = await db.prepare(`
      DELETE FROM rate_limit_tracking
      WHERE expires_at < ?
    `).bind(now).run();

    const deleted = result.meta.changes || 0;
    console.log(`🧹 Cleaned up ${deleted} expired rate limit records`);
    return deleted;
  } catch (error) {
    console.error('Failed to cleanup expired rate limits:', error);
    return 0;
  }
}
