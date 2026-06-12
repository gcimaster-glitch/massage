import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { EmailService } from './services/email-service';
import { hashPassword } from './auth-helpers';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  RESEND_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// ============================================
// ヘルパー関数
// ============================================

// IPアドレス取得
function getClientIP(c: any): string {
  return c.req.header('CF-Connecting-IP') || 
         c.req.header('X-Forwarded-For')?.split(',')[0] || 
         'unknown';
}

// User Agent取得
function getUserAgent(c: any): string {
  return c.req.header('User-Agent') || 'unknown';
}

// セキュリティログ記録
async function logSecurityEvent(
  db: D1Database,
  eventType: string,
  details: {
    userId?: string;
    email?: string;
    ipAddress?: string;
    userAgent?: string;
    severity?: 'info' | 'warning' | 'error' | 'critical';
    additionalDetails?: any;
  }
) {
  try {
    const id = `log_${nanoid()}`;
    const now = Date.now();
    
    await db.prepare(`
      INSERT INTO security_logs (id, event_type, user_id, email, ip_address, user_agent, details, severity, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      eventType,
      details.userId || null,
      details.email || null,
      details.ipAddress || null,
      details.userAgent || null,
      JSON.stringify(details.additionalDetails || {}),
      details.severity || 'info',
      now
    ).run();
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// レート制限チェック
async function checkRateLimit(
  db: D1Database,
  identifier: string,
  endpoint: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const now = Date.now();
  const windowStart = now - windowMs;

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
        
        if (requestCount >= limit) {
          // レート制限超過
          const retryAfter = Math.ceil((windowStartTime + windowMs - now) / 1000);
          return { allowed: false, retryAfter };
        }

        // カウントを増やす
        await db.prepare(`
          UPDATE rate_limit_tracking
          SET request_count = request_count + 1, updated_at = ?
          WHERE id = ?
        `).bind(now, existing.id).run();

        return { allowed: true };
      }
    }

    // 新しいウィンドウを開始
    const id = `rl_${nanoid()}`;
    await db.prepare(`
      INSERT INTO rate_limit_tracking (id, identifier, endpoint, request_count, window_start, expires_at, created_at, updated_at)
      VALUES (?, ?, ?, 1, ?, ?, ?, ?)
    `).bind(id, identifier, endpoint, now, now + windowMs, now, now).run();

    return { allowed: true };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // エラー時は許可（フェイルオープン）
    return { allowed: true };
  }
}

// ============================================
// パスワードリセット申請（メール送信）
// ============================================
app.post('/forgot-password', async (c) => {
  const ipAddress = getClientIP(c);
  const userAgent = getUserAgent(c);

  let email: string | undefined;
  try {
    const body = await c.req.json();
    email = body?.email;
  } catch {
    return c.json({ error: 'メールアドレスを入力してください' }, 400);
  }
  try {
    // 入力バリデーション
    if (!email || typeof email !== 'string') {
      return c.json({ error: 'メールアドレスを入力してください' }, 400);
    }

    // メールアドレス形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: '有効なメールアドレスを入力してください' }, 400);
    }

    // レート制限チェック（3回/時間）
    const rateLimitResult = await checkRateLimit(
      c.env.DB,
      ipAddress,
      '/api/auth/forgot-password',
      3,
      60 * 60 * 1000 // 1時間
    );

    if (!rateLimitResult.allowed) {
      await logSecurityEvent(c.env.DB, 'rate_limit_exceeded', {
        email,
        ipAddress,
        userAgent,
        severity: 'warning',
        additionalDetails: { endpoint: '/api/auth/forgot-password' }
      });

      return c.json({ 
        error: `リクエスト制限を超えました。${rateLimitResult.retryAfter}秒後に再試行してください。` 
      }, 429);
    }

    // ユーザーの存在確認
    const user = await c.env.DB.prepare('SELECT id, email, name FROM users WHERE email = ?')
      .bind(email)
      .first() as Record<string, unknown>;

    if (!user) {
      // セキュリティのため、ユーザーが存在しなくても成功レスポンスを返す
      await logSecurityEvent(c.env.DB, 'password_reset_request_invalid_email', {
        email,
        ipAddress,
        userAgent,
        severity: 'info'
      });

      return c.json({ 
        success: true, 
        message: 'パスワードリセットメールを送信しました（存在する場合）' 
      });
    }

    // リセットトークンを生成（セキュア：32文字のランダム文字列）
    const resetToken = nanoid(32);
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1時間後

    // 古いトークンを無効化（同じユーザーの未使用トークン）
    await c.env.DB.prepare(`
      UPDATE password_reset_tokens
      SET used_at = ?
      WHERE user_id = ? AND used_at IS NULL
    `).bind(Date.now(), user.id).run();

    // 新しいリセットトークンをDBに保存
    const tokenId = `prt_${nanoid()}`;
    await c.env.DB.prepare(`
      INSERT INTO password_reset_tokens (id, user_id, email, token, expires_at, ip_address, user_agent, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(tokenId, user.id, email, resetToken, expiresAt, ipAddress, userAgent, Date.now()).run();

    // リセットリンクを生成
    const resetUrl = `${new URL(c.req.url).origin}/auth/reset-password?token=${resetToken}`;


    // セキュリティログ記録
    await logSecurityEvent(c.env.DB, 'password_reset_request', {
      userId: user.id as string,
      email: email,
      ipAddress,
      userAgent,
      severity: 'info'
    });

    // メール送信
    if (c.env.RESEND_API_KEY) {
      try {
        const emailService = new EmailService(c.env.RESEND_API_KEY);
        const sent = await emailService.sendPasswordReset(email, resetUrl, user.name as string);
        
        if (sent) {
          console.log('✅ パスワードリセットメール送信成功');
        } else {
          console.error('❌ パスワードリセットメール送信失敗');
        }
      } catch (emailError) {
        console.error('メール送信エラー:', emailError);
      }
    } else {
      console.warn('⚠️ RESEND_API_KEY が設定されていません。メール送信をスキップします。');
    }

    return c.json({ 
      success: true, 
      message: 'パスワードリセットメールを送信しました'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    
    await logSecurityEvent(c.env.DB, 'password_reset_request_error', {
      ipAddress,
      userAgent,
      severity: 'error',
      additionalDetails: { error: String(error) }
    });

    return c.json({ error: 'パスワードリセット申請に失敗しました' }, 500);
  }
});

// ============================================
// パスワード再設定
// ============================================
app.post('/reset-password', async (c) => {
  const ipAddress = getClientIP(c);
  const userAgent = getUserAgent(c);

  try {
    const { token, password } = await c.req.json();

    // 入力バリデーション
    if (!token || typeof token !== 'string') {
      return c.json({ error: 'トークンが無効です' }, 400);
    }

    if (!password || typeof password !== 'string') {
      return c.json({ error: 'パスワードを入力してください' }, 400);
    }

    // パスワード強度チェック
    if (password.length < 8) {
      return c.json({ error: 'パスワードは8文字以上で設定してください' }, 400);
    }

    if (password.length > 128) {
      return c.json({ error: 'パスワードが長すぎます' }, 400);
    }

    // トークンの検証（ワンタイム使用 + 有効期限チェック）
    const now = Date.now();
    const resetToken = await c.env.DB.prepare(`
      SELECT * FROM password_reset_tokens 
      WHERE token = ? AND used_at IS NULL AND expires_at > ?
    `).bind(token, now).first() as Record<string, unknown>;

    if (!resetToken) {
      await logSecurityEvent(c.env.DB, 'password_reset_invalid_token', {
        ipAddress,
        userAgent,
        severity: 'warning',
        additionalDetails: { token: token.substring(0, 8) + '...' }
      });

      return c.json({ error: '無効または期限切れのリセットトークンです' }, 400);
    }

    const userId = resetToken.user_id as string;
    const email = resetToken.email as string;

    // パスワードをハッシュ化（実際の本番環境では bcrypt などを使用）
    // Cloudflare Workers環境では Web Crypto APIを使用
    const passwordHash = await hashPassword(password);

    // パスワードを更新
    await c.env.DB.prepare(`
      UPDATE users 
      SET password_hash = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(passwordHash, userId).run();

    // トークンを使用済みにマーク
    await c.env.DB.prepare(`
      UPDATE password_reset_tokens
      SET used_at = ?
      WHERE id = ?
    `).bind(now, resetToken.id).run();

    // セキュリティログ記録
    await logSecurityEvent(c.env.DB, 'password_reset_success', {
      userId,
      email,
      ipAddress,
      userAgent,
      severity: 'info'
    });

    console.log(`✅ パスワードリセット成功 - User ID: ${userId}, Email: ${email}`);

    return c.json({ 
      success: true, 
      message: 'パスワードをリセットしました'
    });

  } catch (error) {
    console.error('Reset password error:', error);

    await logSecurityEvent(c.env.DB, 'password_reset_error', {
      ipAddress,
      userAgent,
      severity: 'error',
      additionalDetails: { error: String(error) }
    });

    return c.json({ error: 'パスワードリセットに失敗しました' }, 500);
  }
});

export default app;
