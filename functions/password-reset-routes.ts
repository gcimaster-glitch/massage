import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { EmailService } from './services/email-service';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  RESEND_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// パスワードリセット申請（メール送信）
app.post('/forgot-password', async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: 'メールアドレスを入力してください' }, 400);
    }

    // ユーザーの存在確認
    const user = await c.env.DB.prepare('SELECT id, email, name FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (!user) {
      // セキュリティのため、ユーザーが存在しなくても成功レスポンスを返す
      return c.json({ 
        success: true, 
        message: 'パスワードリセットメールを送信しました（存在する場合）' 
      });
    }

    // リセットトークンを生成（有効期限: 1時間）
    const resetToken = nanoid(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1時間後

    // リセットトークンをDBに保存
    await c.env.DB.prepare(`
      INSERT INTO password_reset_tokens (token, user_id, email, expires_at, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).bind(resetToken, user.id, email, expiresAt).run();

    // リセットリンクを生成
    const resetUrl = `${new URL(c.req.url).origin}/auth/reset-password?token=${resetToken}`;

    console.log(`🔐 パスワードリセット申請 - Email: ${email}, Token: ${resetToken}`);
    console.log(`📧 リセットURL: ${resetUrl}`);

    // メール送信
    if (c.env.RESEND_API_KEY) {
      const emailService = new EmailService(c.env.RESEND_API_KEY);
      const sent = await emailService.sendPasswordReset(email, resetUrl, user.name as string);
      
      if (sent) {
        console.log('✅ パスワードリセットメール送信成功');
      } else {
        console.error('❌ パスワードリセットメール送信失敗');
      }
    } else {
      console.warn('⚠️ RESEND_API_KEY が設定されていません。メール送信をスキップします。');
    }

    return c.json({ 
      success: true, 
      message: 'パスワードリセットメールを送信しました',
      // 開発環境でのみリセットURLを返す（本番では削除）
      resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return c.json({ error: 'パスワードリセット申請に失敗しました' }, 500);
  }
});

// パスワード再設定
app.post('/reset-password', async (c) => {
  try {
    const { token, password } = await c.req.json();

    if (!token || !password) {
      return c.json({ error: 'トークンとパスワードを入力してください' }, 400);
    }

    if (password.length < 8) {
      return c.json({ error: 'パスワードは8文字以上で設定してください' }, 400);
    }

    // トークンの検証
    const resetToken = await c.env.DB.prepare(`
      SELECT * FROM password_reset_tokens 
      WHERE token = ? AND used = 0 AND datetime(expires_at) > datetime('now')
    `).bind(token).first();

    if (!resetToken) {
      return c.json({ error: '無効または期限切れのリセットトークンです' }, 400);
    }

    // パスワードをハッシュ化（bcryptは使えないので、Web Crypto APIを使用）
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // パスワードを更新
    await c.env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
      .bind(passwordHash, resetToken.user_id)
      .run();

    // トークンを使用済みにする
    await c.env.DB.prepare('UPDATE password_reset_tokens SET used = 1 WHERE token = ?')
      .bind(token)
      .run();

    console.log(`✅ パスワードリセット成功 - User ID: ${resetToken.user_id}`);

    return c.json({ 
      success: true, 
      message: 'パスワードをリセットしました' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return c.json({ error: 'パスワードのリセットに失敗しました' }, 500);
  }
});

export default app;
