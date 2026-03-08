// ============================================
// Social Authentication Routes
// ============================================
// This file contains OAuth endpoints for social login integration

import { Hono } from 'hono'
import { getProvider } from './auth-providers'
import {
  generateOAuthUrl,
  generateState,
  generateUserId,
  generateSocialAccountId,
  generateSessionId,
  generateSessionToken,
  exchangeCodeForToken,
  getUserInfo,
  createJWT,
  verifyJWT,
  hashPassword,
  verifyPassword,
  encryptToken, // HOG-SEC-006: access_token暗号化
} from './auth-helpers'
import { checkRateLimit, RATE_LIMITS } from './rate-limit'
import { validateEmail, validatePassword } from './validation'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
  RESEND_API_KEY: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  YAHOO_CLIENT_ID: string
  YAHOO_CLIENT_SECRET: string
  X_CLIENT_ID: string
  X_CLIENT_SECRET: string
  FACEBOOK_CLIENT_ID: string
  FACEBOOK_CLIENT_SECRET: string
  LINE_CLIENT_ID: string
  LINE_CLIENT_SECRET: string
  APPLE_CLIENT_ID: string
  APPLE_CLIENT_SECRET: string
}

const authApp = new Hono<{ Bindings: Bindings }>()

// ============================================
// OAuth Initiation
// ============================================
// OAuth経由で許可されるロール（ADMIN・AFFILIATE等の特権ロールは除外）
const OAUTH_ALLOWED_ROLES = ['USER', 'THERAPIST', 'HOST', 'THERAPIST_OFFICE'] as const
type OAuthAllowedRole = typeof OAUTH_ALLOWED_ROLES[number]

/**
 * HOG-SEC-001: roleパラメータのホワイトリスト検証
 * OAuth経由での新規登録は一般ユーザーロールのみ許可し、ADMIN等の特権ロールへの昇格を防ぐ
 */
function sanitizeOAuthRole(role: string | undefined): OAuthAllowedRole {
  if (!role) return 'USER'
  const upperRole = role.toUpperCase()
  if ((OAUTH_ALLOWED_ROLES as readonly string[]).includes(upperRole)) {
    return upperRole as OAuthAllowedRole
  }
  // 許可されていないロール（ADMIN, AFFILIATE等）が指定された場合はUSERに強制
  console.warn(`[SEC] Rejected unauthorized OAuth role request: "${role}". Defaulting to USER.`)
  return 'USER'
}

/**
 * HOG-SEC-002: redirectパラメータのホワイトリスト検証
 * 外部ドメインへのオープンリダイレクトを防ぐため、相対パスのみを許可する
 */
function sanitizeOAuthRedirect(redirect: string | undefined): string {
  const DEFAULT_REDIRECT = '/app'
  if (!redirect) return DEFAULT_REDIRECT

  // プロトコル相対URL（//example.com）や絶対URLを拒否
  if (redirect.startsWith('//') || /^https?:\/\//i.test(redirect)) {
    console.warn(`[SEC] Rejected open redirect attempt: "${redirect}". Defaulting to ${DEFAULT_REDIRECT}.`)
    return DEFAULT_REDIRECT
  }

  // スラッシュ始まりの相対パスのみ許可
  if (!redirect.startsWith('/')) {
    console.warn(`[SEC] Rejected non-absolute redirect path: "${redirect}". Defaulting to ${DEFAULT_REDIRECT}.`)
    return DEFAULT_REDIRECT
  }

  // 許可する内部パスのホワイトリスト
  const ALLOWED_REDIRECT_PREFIXES = ['/app', '/t', '/h', '/admin', '/affiliate', '/login', '/auth']
  const isAllowed = ALLOWED_REDIRECT_PREFIXES.some(prefix => redirect.startsWith(prefix))
  if (!isAllowed) {
    console.warn(`[SEC] Rejected unlisted redirect path: "${redirect}". Defaulting to ${DEFAULT_REDIRECT}.`)
    return DEFAULT_REDIRECT
  }

  return redirect
}

/**
 * HOG-SEC-003: OAuthプロバイダーから返されるerrorパラメータのホワイトリスト検証
 * 任意の文字列をURLに含めることによる反射型XSSを防ぐ
 */
function sanitizeOAuthError(error: string | undefined): string {
  const ALLOWED_OAUTH_ERRORS = [
    'access_denied',
    'temporarily_unavailable',
    'server_error',
    'invalid_request',
    'unauthorized_client',
    'unsupported_response_type',
    'invalid_scope',
  ] as const
  if (!error) return 'auth_failed'
  const lowerError = error.toLowerCase()
  if ((ALLOWED_OAUTH_ERRORS as readonly string[]).includes(lowerError)) {
    return lowerError
  }
  // 未知のエラーコードは汎用エラーに変換（任意文字列の反射を防ぐ）
  return 'auth_failed'
}

authApp.get('/oauth/:provider', async (c) => {
  const providerName = c.req.param('provider').toUpperCase()
  // HOG-SEC-001: roleをホワイトリストで検証（ADMIN等の特権ロールへの昇格を防止）
  const role = sanitizeOAuthRole(c.req.query('role'))
  // HOG-SEC-002: redirectをホワイトリストで検証（オープンリダイレクトを防止）
  const redirect = sanitizeOAuthRedirect(c.req.query('redirect'))

  const provider = getProvider(providerName, c.env)
  if (!provider) {
    return c.json({ error: 'Unsupported provider' }, 400)
  }

  // Generate CSRF state
  const state = generateState()
  const redirectUri = `${new URL(c.req.url).origin}/api/auth/oauth/${providerName.toLowerCase()}/callback`

  // Store state in database (expires in 10 minutes)
  if (c.env.DB) {
    try {
      await c.env.DB.prepare(
        'INSERT INTO oauth_states (state, provider, redirect_uri, role, expires_at) VALUES (?, ?, ?, ?, datetime("now", "+10 minutes"))'
      )
        .bind(state, providerName, redirect, role)
        .run()
    } catch (e) {
      console.error('Failed to store OAuth state:', e)
    }
  }

  // Generate OAuth URL
  const authUrl = generateOAuthUrl(provider, redirectUri, state)

  return c.redirect(authUrl)
})

// ============================================
// OAuth Callback
// ============================================
authApp.get('/oauth/:provider/callback', async (c) => {
  const providerName = c.req.param('provider').toUpperCase()
  const code = c.req.query('code')
  const state = c.req.query('state')
  const error = c.req.query('error')

  if (error) {
    // HOG-SEC-003: プロバイダーからのerrorパラメータをホワイトリストでサニタイズ（反射型XSS防止）
    const safeError = sanitizeOAuthError(error)
    return c.redirect(`/?error=${safeError}`)
  }

  if (!code || !state) {
    return c.json({ error: 'Missing code or state' }, 400)
  }

  const provider = getProvider(providerName, c.env)
  if (!provider) {
    return c.json({ error: 'Unsupported provider' }, 400)
  }

  // Verify state (CSRF protection)
  let redirectPath = '/app'
  let userRole: OAuthAllowedRole = 'USER'
  
  if (c.env.DB) {
    try {
      const { results } = await c.env.DB.prepare(
        'SELECT redirect_uri, role FROM oauth_states WHERE state = ? AND expires_at > datetime("now")'
      )
        .bind(state)
        .all()

      if (results && results.length > 0) {
        // HOG-SEC-002: DBから取得した値にも再検証を適用（将来的なDB汚染・インジェクション対策）
        redirectPath = sanitizeOAuthRedirect((results[0] as Record<string, unknown>).redirect_uri as string | undefined)
        // HOG-SEC-001: DBから取得したロールにも再検証を適用
        userRole = sanitizeOAuthRole((results[0] as Record<string, unknown>).role as string | undefined)

        // Delete used state
        await c.env.DB.prepare('DELETE FROM oauth_states WHERE state = ?').bind(state).run()
      }
    } catch (e) {
      console.error('Failed to verify OAuth state:', e)
      // Continue with default values if DB query fails
    }
  }

  try {
    // Exchange code for token
    const redirectUri = `${new URL(c.req.url).origin}/api/auth/oauth/${providerName.toLowerCase()}/callback`
    const tokenData = await exchangeCodeForToken(provider, code, redirectUri)

    // Get user info from provider
    const providerUser = await getUserInfo(provider, tokenData.access_token)

    // Check if user exists or create new user
    let user: Record<string, unknown> | null
    let isNewUser = false

    // Try to use DB if available
    let dbSuccess = false
    if (c.env.DB) {
      try {
      // Check if social account exists
      const { results: socialAccounts } = await c.env.DB.prepare(
        'SELECT user_id FROM social_accounts WHERE provider = ? AND provider_user_id = ?'
      )
        .bind(providerName, providerUser.id)
        .all()

      if (socialAccounts.length > 0) {
        // Existing user - fetch user data
        const userId = (socialAccounts[0] as Record<string, unknown>).user_id
        const { results: users } = await c.env.DB.prepare(
          'SELECT id, email, name, role, avatar_url FROM users WHERE id = ?'
        )
          .bind(userId)
          .all()

        user = users[0]

        // Update last_used_at for social account
        await c.env.DB.prepare(
          'UPDATE social_accounts SET last_used_at = datetime("now") WHERE provider = ? AND provider_user_id = ?'
        )
          .bind(providerName, providerUser.id)
          .run()
      } else {
        // New user - create account
        isNewUser = true
        const userId = generateUserId()
        const socialAccountId = generateSocialAccountId()

        // Create user
        await c.env.DB.prepare(
          'INSERT INTO users (id, email, name, role, avatar_url, email_verified, email_verified_at, created_at) VALUES (?, ?, ?, ?, ?, TRUE, datetime("now"), datetime("now"))'
        )
          .bind(userId, providerUser.email, providerUser.name, userRole, providerUser.avatar_url)
          .run()

         // Create social account link
        const expiresAt = tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
          : null
        // HOG-SEC-006: access_tokenとrefresh_tokenをAES-GCMで暗号化して保存（平文保存を排除）
        const encryptedAccessToken = await encryptToken(tokenData.access_token, c.env.JWT_SECRET)
        const encryptedRefreshToken = tokenData.refresh_token
          ? await encryptToken(tokenData.refresh_token, c.env.JWT_SECRET)
          : null
        await c.env.DB.prepare(
          'INSERT INTO social_accounts (id, user_id, provider, provider_user_id, provider_email, provider_name, provider_avatar_url, access_token, refresh_token, token_expires_at, last_used_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))'
        )
          .bind(
            socialAccountId,
            userId,
            providerName,
            providerUser.id,
            providerUser.email,
            providerUser.name,
            providerUser.avatar_url,
            encryptedAccessToken,
            encryptedRefreshToken,
            expiresAt
          )
          .run()

        user = {
          id: userId,
          email: providerUser.email,
          name: providerUser.name,
          role: userRole,
          avatar_url: providerUser.avatar_url,
        }
      }

      // Create session
      const sessionId = generateSessionId()
      const sessionToken = generateSessionToken()
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days

      await c.env.DB.prepare(
        'INSERT INTO auth_sessions (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, datetime("now"))'
      )
        .bind(sessionId, user.id, sessionToken, expiresAt)
        .run()

      // Generate JWT
      const jwt = await createJWT(
        {
          userId: user.id,
          email: user.email,
          userName: user.name,
          role: user.role,
          sessionId: sessionId,
        },
        c.env.JWT_SECRET,
        7 // HOG-SEC-005: JWT有効期限を短縮 (30日 → 7日)。セッションは30日間有効なので、/api/auth/refreshでJWTを更新する
      )
      // Redirect with token
      const redirectUrl = new URL(redirectPath, new URL(c.req.url).origin)
      redirectUrl.searchParams.set('token', jwt)
      redirectUrl.searchParams.set('isNewUser', isNewUser.toString())
      return c.redirect(redirectUrl.toString())
      } catch (dbError) {
        console.error('Database error, falling back to mock mode:', dbError)
        // Fall through to development mode below
      }
    }
    
       // HOG-SEC-004: JWT_SECRETが設定されていない場合は認証を拒否する
    // 「dev-secret」フォールバックは除去。未設定のまま本番デプロイされた場合に漏洩したトークンが発行されるリスクを排除する
    if (!c.env.JWT_SECRET) {
      console.error('[SEC] JWT_SECRET is not configured. Refusing to issue token.')
      return c.redirect(`/?error=auth_failed`)
    }
    // DBエラー時のフォールバック（開発モードは廃止）— DB接続失敗としてエラーを返す
    console.error('[SEC] Database connection failed during OAuth callback. Cannot create user session.')
    return c.redirect(`/?error=auth_failed`)
  } catch (e) {
    console.error('OAuth callback error:', e)
    return c.redirect(`/?error=auth_failed`)
  }
})

// ============================================
// Email/Password Registration
// ============================================
authApp.post('/register', async (c) => {
  try {
    const body = await c.req.json()
    const { email, password, name, phone, role = 'USER' } = body

    // === バリデーション（validation.ts を使用）===
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return c.json({ error: 'お名前は必須です' }, 400)
    }
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return c.json({ error: emailValidation.error }, 400)
    }
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return c.json({ error: passwordValidation.error }, 400)
    }
    const sanitizedEmail = emailValidation.sanitized as string

    // === レート制限（登録は1時間に5回まで）===
    if (c.env.DB) {
      const rateLimitResult = await checkRateLimit(
        c.env.DB,
        c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For')?.split(',')[0] || 'unknown',
        'register',
        RATE_LIMITS.REGISTER
      )
      if (!rateLimitResult.allowed) {
        return c.json({
          error: `登録リクエストが多すぎます。${rateLimitResult.retryAfter}秒後に再試行してください。`,
          retryAfter: rateLimitResult.retryAfter
        }, 429)
      }
    }

    // Check if DB is available
    if (!c.env.DB) {
      // Development mode - return mock success
      return c.json({
        success: true,
        message: '仮登録が完了しました。ご登録のメールアドレスに確認メールを送信しました。',
        userId: generateUserId(),
        email: sanitizedEmail,
      })
    }

    try {
      // Check if email already exists
      const { results: existingUsers } = await c.env.DB.prepare(
        'SELECT id FROM users WHERE email = ?'
      )
        .bind(email)
        .all()

      if (existingUsers.length > 0) {
        const existingUserId = existingUsers[0].id
        console.log(`⚠️ Existing user found: ${existingUserId}, updating instead of deleting...`)
        
        // Update existing user instead of deleting
        try {
          // Hash password (PBKDF2 + salt)
          const passwordHash = await hashPassword(password)

          console.log(`🔍 Attempting to update user: ${existingUserId}`)
          console.log(`  - name: ${name}`)
          console.log(`  - phone: ${phone || '(empty)'}`)

          // Update user with new password and info
          const updateResult = await c.env.DB.prepare(
            `UPDATE users 
             SET password_hash = ?, name = ?, phone = ?
             WHERE id = ?`
          ).bind(passwordHash, name, phone || '', existingUserId).run()
          
          console.log('✅ User update result:', updateResult)
          
          // Reset email verification separately
          await c.env.DB.prepare(
            `UPDATE users SET email_verified = 0 WHERE id = ?`
          ).bind(existingUserId).run()
          
          // Delete old email verifications
          await c.env.DB.prepare('DELETE FROM email_verifications WHERE user_id = ?')
            .bind(existingUserId).run()
          
          // Generate new verification token
          const verificationToken = generateState()
          
          // Insert new verification
          await c.env.DB.prepare(
            `INSERT INTO email_verifications (id, user_id, token, expires_at, created_at)
             VALUES (?, ?, ?, datetime('now', '+24 hours'), datetime('now'))`
          ).bind(
            `ev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            existingUserId,
            verificationToken
          ).run()
          
          console.log(`✅ Existing user updated: ${existingUserId}`)
          
          // Send verification email
          if (c.env.RESEND_API_KEY) {
            const verificationUrl = `${c.req.header('origin') || 'https://hogusy.com'}/api/auth/verify-email?token=${verificationToken}`
            
            console.log('📧 [OAuth] Sending verification email to:', email);
            console.log('🔗 [OAuth] Verification URL:', verificationUrl);
            
            try {
              const resendResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  from: 'HOGUSY <noreply@hogusy.com>',
                  to: email,
                  subject: '【HOGUSY】メールアドレスの確認',
                  html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta charset="UTF-8">
                    </head>
                    <body style="font-family: sans-serif; line-height: 1.6;">
                      <h2>メールアドレスの確認</h2>
                      <p>${name} 様</p>
                      <p>HOGUSYにご登録いただきありがとうございます。</p>
                      <p>以下のリンクをクリックして、メールアドレスの確認を完了してください：</p>
                      <p><a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">メールアドレスを確認する</a></p>
                      <p>または、以下のURLをブラウザにコピー＆ペーストしてください：</p>
                      <p>${verificationUrl}</p>
                      <p>このリンクは24時間有効です。</p>
                      <hr>
                      <p style="color: #666; font-size: 12px;">このメールに心当たりがない場合は、無視してください。</p>
                    </body>
                    </html>
                  `
                })
              })

              if (!resendResponse.ok) {
                const errorText = await resendResponse.text();
                console.error('❌ [OAuth] Failed to send verification email:', resendResponse.status, errorText);
              } else {
                const responseData = await resendResponse.json();
                console.log('✅ [OAuth] Email sent successfully:', responseData);
              }
            } catch (emailError) {
              console.error('❌ [OAuth] Email sending error:', emailError)
            }
          }

          return c.json({
            success: true,
            message: 'アカウント情報を更新しました。確認メールを送信しましたので、メールアドレスの確認を完了してください。',
            userId: existingUserId,
            email: email
          }, 200)
        } catch (updateError: unknown) {
          console.error('❌ Failed to update existing user:', updateError)
          return c.json({ 
            error: 'アカウント情報の更新に失敗しました。',
            details: updateError.message 
          }, 500)
        }
      }

      // Hash password using Web Crypto API
      // Hash password (PBKDF2 + salt)
      const passwordHash = await hashPassword(password)

      // Generate user ID and verification token
      const userId = generateUserId()
      const verificationToken = generateState() // Reuse state generator for token

      // Insert new user
      await c.env.DB.prepare(
        `INSERT INTO users (id, email, password_hash, name, phone, role, email_verified, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'))`
      )
        .bind(userId, email, passwordHash, name, phone || null, role)
        .run()

      // Store verification token (expires in 24 hours)
      await c.env.DB.prepare(
        `INSERT INTO email_verifications (user_id, token, expires_at)
         VALUES (?, ?, datetime('now', '+24 hours'))`
      )
        .bind(userId, verificationToken)
        .run()

      // Send verification email via Resend
      const verificationUrl = `${new URL(c.req.url).origin}/api/auth/verify-email?token=${verificationToken}`
      
      console.log('📧 Sending verification email to:', email);
      console.log('🔗 Verification URL:', verificationUrl);
      
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'HOGUSY <noreply@hogusy.com>',
            to: [email],
            subject: '【HOGUSY】メールアドレスの認証をお願いします',
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 20px; }
                  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                  .header { background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); padding: 40px 20px; text-align: center; }
                  .header h1 { color: white; margin: 0; font-size: 32px; font-weight: bold; }
                  .content { padding: 40px 30px; }
                  .content h2 { color: #14b8a6; margin-top: 0; font-size: 24px; }
                  .content p { margin: 16px 0; color: #555; font-size: 16px; }
                  .button { display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); color: white; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 18px; margin: 24px 0; box-shadow: 0 4px 12px rgba(20,184,166,0.3); }
                  .button:hover { box-shadow: 0 6px 16px rgba(20,184,166,0.4); }
                  .footer { background: #f8f8f8; padding: 30px; text-align: center; color: #888; font-size: 14px; border-top: 1px solid #e0e0e0; }
                  .info-box { background: #f0fdfa; border-left: 4px solid #14b8a6; padding: 20px; margin: 24px 0; border-radius: 8px; }
                  .warning { color: #dc2626; font-weight: bold; margin: 20px 0; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>🌿 HOGUSY</h1>
                  </div>
                  <div class="content">
                    <h2>ようこそ、${name || 'お客様'}さん！</h2>
                    <p>HOGUSY へのご登録ありがとうございます。</p>
                    <p>以下のボタンをクリックして、メールアドレスの認証を完了してください：</p>
                    
                    <div style="text-align: center;">
                      <a href="${verificationUrl}" class="button">メールアドレスを認証する</a>
                    </div>
                    
                    <div class="info-box">
                      <p style="margin: 0;"><strong>📧 認証リンクについて</strong></p>
                      <p style="margin: 8px 0 0 0; font-size: 14px;">このリンクは24時間有効です。期限切れの場合は、再度登録手続きを行ってください。</p>
                    </div>
                    
                    <p class="warning">⚠️ このメールに心当たりがない場合は、無視していただいて問題ありません。</p>
                    
                    <p style="margin-top: 32px; font-size: 14px; color: #888;">
                      ボタンが機能しない場合は、以下のURLをコピーしてブラウザに貼り付けてください：<br>
                      <span style="color: #14b8a6; word-break: break-all;">${verificationUrl}</span>
                    </p>
                  </div>
                  <div class="footer">
                    <p><strong>HOGUSY</strong> - あなたの心と体をリフレッシュ</p>
                    <p style="font-size: 12px; color: #aaa; margin-top: 16px;">
                      このメールは自動送信されています。返信はできません。<br>
                      お問い合わせは <a href="https://hogusy.com/support" style="color: #14b8a6;">サポートセンター</a> までお願いします。
                    </p>
                  </div>
                </div>
              </body>
              </html>
            `
          })
        });
        
        // Check email response
        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error('❌ Email sending failed:', emailResponse.status, errorText);
        } else {
          const responseData = await emailResponse.json();
          console.log('✅ Email sent successfully:', responseData);
        }
      } catch (emailError) {
        console.error('❌ Email sending error:', emailError);
        // メール送信失敗してもユーザー登録は成功とする
      }

      return c.json({
        success: true,
        message: '仮登録が完了しました。ご登録のメールアドレスに確認メールを送信しました。',
        userId: userId,
        email: email,
      })
    } catch (dbError) {
      console.error('Database error during registration:', dbError)
      return c.json({ error: '登録処理中にエラーが発生しました。しばらくしてから再度お試しください。' }, 500)
    }
  } catch (e) {
    console.error('Registration error:', e)
    return c.json({ error: 'サーバーエラーが発生しました' }, 500)
  }
})

// ============================================
// Email Verification
// ============================================
authApp.get('/verify-email', async (c) => {
  const token = c.req.query('token')
  const redirectTo = c.req.query('redirect') || '/app' // 予約途中だった場合はredirect指定

  if (!token) {
    return c.redirect('/?error=invalid_verification_token')
  }

  if (!c.env.DB) {
    // Development mode
    return c.redirect('/auth/login?verified=true')
  }

  try {
    // Find verification token
    const { results } = await c.env.DB.prepare(
      `SELECT user_id FROM email_verifications 
       WHERE token = ? AND expires_at > datetime('now')`
    )
      .bind(token)
      .all()

    if (results.length === 0) {
      return c.redirect('/?error=invalid_or_expired_token')
    }

    const userId = (results[0] as Record<string, unknown>).user_id

    // Get user info for auto-login
    const { results: userResults } = await c.env.DB.prepare(
      'SELECT id, email, name, role, avatar_url FROM users WHERE id = ?'
    )
      .bind(userId)
      .all()

    if (userResults.length === 0) {
      return c.redirect('/?error=user_not_found')
    }

    const user = userResults[0] as Record<string, unknown>

    // Update user as verified
    await c.env.DB.prepare(
      'UPDATE users SET email_verified = 1 WHERE id = ?'
    )
      .bind(userId)
      .run()

    // Delete verification token
    await c.env.DB.prepare(
      'DELETE FROM email_verifications WHERE token = ?'
    )
      .bind(token)
      .run()

    console.log(`✅ Email verified successfully for user: ${userId}`)

    // Create session for auto-login
    const sessionId = generateSessionId()
    const sessionToken = generateSessionToken()

    await c.env.DB.prepare(
      `INSERT INTO auth_sessions (id, user_id, token, expires_at)
       VALUES (?, ?, ?, datetime('now', '+30 days'))`
    )
      .bind(sessionId, user.id, sessionToken)
      .run()

    // Create JWT token
     const jwt = await createJWT(
      {
        userId: user.id,
        email: user.email,
        userName: user.name,
        role: user.role,
        sessionId: sessionId,
      },
      c.env.JWT_SECRET,
      7 // HOG-SEC-005: JWT有効期限を短縮 (30日 → 7日)
    )
    console.log(`✅ Auto-login session created for user: ${userId}`)

    // Redirect to dashboard with JWT token in URL
    // フロントエンドでURLからトークンを取得してlocalStorageに保存
    return c.redirect(`${redirectTo}?verified=true&token=${jwt}&message=${encodeURIComponent('メール認証が完了しました！')}`)
  } catch (e) {
    console.error('Email verification error:', e)
    return c.redirect('/?error=verification_failed')
  }
})

// ============================================
// Email/Password Login（セキュリティ強化版）
// ============================================
authApp.post('/login', async (c) => {
  const ipAddress = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For')?.split(',')[0] || 'unknown';

  try {
    const body = await c.req.json()
    const { email, password } = body

    // 入力バリデーション
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return c.json({ error: emailValidation.error }, 400);
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return c.json({ error: passwordValidation.error }, 400);
    }

    // レート制限チェック（5回/分）
    const rateLimitResult = await checkRateLimit(
      c.env.DB,
      ipAddress,
      '/api/auth/login',
      RATE_LIMITS.LOGIN
    );

    if (!rateLimitResult.allowed) {
      return c.json({ 
        error: RATE_LIMITS.LOGIN.message,
        retryAfter: rateLimitResult.retryAfter
      }, 429);
    }

    // HOG-SEC-004: DB未接続時は認証を拒否する（開発モードモックログインは廃止）
    // 「dev-secret」フォールバックを除去。JWT_SECRET未設定またはDB未接続のまま本番デプロイされた場合のリスクを排除
    if (!c.env.DB) {
      console.error('[SEC] Database is not configured. Refusing to authenticate.')
      return c.json({ error: 'Service temporarily unavailable' }, 503)
    }
    if (!c.env.JWT_SECRET) {
      console.error('[SEC] JWT_SECRET is not configured. Refusing to issue token.')
      return c.json({ error: 'Service temporarily unavailable' }, 503)
    }

    try {
      // ユーザーをメールで取得し、verifyPasswordでハッシュを比較（旧形式互換対応済み）
      const { results: userResults } = await c.env.DB.prepare(
        'SELECT id, email, name, role, avatar_url, email_verified, password_hash FROM users WHERE email = ?'
      )
        .bind(email)
        .all()

      let user: Record<string, unknown> | null = null
      if (userResults.length > 0) {
        const candidate = userResults[0] as Record<string, unknown>
        const storedHash = candidate.password_hash as string
        const isValid = await verifyPassword(password, storedHash)
        if (isValid) {
          user = candidate
        }
      }

      if (!user) {
        return c.json({ error: 'メールアドレスまたはパスワードが正しくありません' }, 401)
      }

      // Skip email verification for admin accounts
      if (user.role !== 'ADMIN' && !user.email_verified) {
        return c.json({ error: 'メールアドレスが未認証です。ご登録のメールから認証を完了してください。' }, 403)
      }

      // Create session
      const sessionId = generateSessionId()
      const sessionToken = generateSessionToken()

      await c.env.DB.prepare(
        `INSERT INTO auth_sessions (id, user_id, token, expires_at)
         VALUES (?, ?, ?, datetime('now', '+30 days'))`
      )
        .bind(sessionId, user.id, sessionToken)
        .run()

      // Create JWT
      const jwt = await createJWT(
        {
          userId: user.id,
          email: user.email,
          userName: user.name,
          role: user.role,
          sessionId: sessionId,
        },
        c.env.JWT_SECRET,
        7 // HOG-SEC-005: JWT有効期限を短縮 (30日 → 7日)
      )
      return c.json({
        success: true,
        token: jwt,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar_url: user.avatar_url,
        },
      })
    } catch (dbError) {
      console.error('Database error during login:', dbError)
      return c.json({ error: 'ログイン処理中にエラーが発生しました' }, 500)
    }
  } catch (e) {
    console.error('Login error:', e)
    return c.json({ error: 'サーバーエラーが発生しました' }, 500)
  }
})

// ============================================
// Get Current User Info (requires JWT)
// ============================================
authApp.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: '認証が必要です' }, 401)
    }

    const token = authHeader.substring(7)
    
    let decoded
    try {
      decoded = await verifyJWT(token, c.env.JWT_SECRET)
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError)
      return c.json({ error: '無効なトークンです' }, 401)
    }
    
    if (!decoded) {
      return c.json({ error: '無効なトークンです' }, 401)
    }

    if (!c.env.DB) {
      // Development mode
      return c.json({
        user: {
          id: decoded.userId,
          email: decoded.email,
          name: decoded.userName,
          role: decoded.role,
        },
      })
    }

    // Fetch user from database
    const { results } = await c.env.DB.prepare(
      'SELECT id, email, name, role, avatar_url, phone FROM users WHERE id = ?'
    )
      .bind(decoded.userId)
      .all()

    if (results.length === 0) {
      return c.json({ error: 'ユーザーが見つかりません' }, 404)
    }

    const user = results[0] as Record<string, unknown>

    // Check if user has linked social accounts
    const { results: socialAccounts } = await c.env.DB.prepare(
      'SELECT provider FROM social_accounts WHERE user_id = ?'
    )
      .bind(user.id)
      .all()

    const linkedProviders = socialAccounts.map((acc: Record<string, unknown>) => acc.provider)

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar_url: user.avatar_url,
        phone: user.phone,
        linkedProviders: linkedProviders,
      },
    })
  } catch (e) {
    console.error('Get user info error:', e)
    return c.json({ error: 'サーバーエラーが発生しました' }, 500)
  }
})

// ============================================
// Link Social Account (for existing users)
// ============================================
authApp.get('/link/:provider', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const provider = c.req.param('provider')?.toUpperCase()
    const redirectPath = c.req.query('redirectPath') || '/app'

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.redirect(`/?error=auth_required`)
    }

    const token = authHeader.substring(7)
    const decoded = await verifyJWT(token, c.env.JWT_SECRET)
    
    if (!decoded) {
      return c.redirect(`/?error=invalid_token`)
    }

    // Store user ID in state for later
    const state = generateState()
    const stateData = {
      userId: decoded.userId,
      action: 'link',
      redirectPath: redirectPath,
    }

    if (!c.env.DB) {
      // Development mode - just redirect back
      return c.redirect(`${redirectPath}?linked=${provider}`)
    }

    // Store state
    await c.env.DB.prepare(
      `INSERT INTO oauth_states (state, provider, redirect_uri, role, expires_at, user_id, action)
       VALUES (?, ?, ?, ?, datetime('now', '+10 minutes'), ?, ?)`
    )
      .bind(state, provider, redirectPath, 'USER', decoded.userId, 'link')
      .run()

    // Get OAuth provider config
    const providerConfig = getOAuthProvider(c.env, provider)
    if (!providerConfig) {
      return c.redirect(`/?error=unsupported_provider`)
    }

    const callbackUrl = `${new URL(c.req.url).origin}/api/auth/oauth/${provider.toLowerCase()}/callback`
    const oauthUrl = generateOAuthUrl(providerConfig, callbackUrl, state)

    return c.redirect(oauthUrl)
  } catch (e) {
    console.error('Link account error:', e)
    return c.redirect(`/?error=link_failed`)
  }
})

// ============================================
// Unlink Social Account
// ============================================
authApp.delete('/link/:provider', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const provider = c.req.param('provider')?.toUpperCase()

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: '認証が必要です' }, 401)
    }

    const token = authHeader.substring(7)
    const decoded = await verifyJWT(token, c.env.JWT_SECRET)
    
    if (!decoded) {
      return c.json({ error: '無効なトークンです' }, 401)
    }

    if (!c.env.DB) {
      return c.json({ success: true, message: '開発モード: 連携を解除しました' })
    }

    // Remove social account link
    await c.env.DB.prepare(
      'DELETE FROM social_accounts WHERE user_id = ? AND provider = ?'
    )
      .bind(decoded.userId, provider)
      .run()

    return c.json({ success: true, message: '連携を解除しました' })
  } catch (e) {
    console.error('Unlink account error:', e)
    return c.json({ error: 'サーバーエラーが発生しました' }, 500)
  }
})

// =========================================
// Admin: ユーザー削除 (本番環境のみ)
// =========================================
authApp.post('/admin/delete-users', async (c) => {
  try {
    const { emails } = await c.req.json()

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return c.json({ error: 'メールアドレスが必要です' }, 400)
    }

    if (!c.env.DB) {
      return c.json({ error: 'データベースが利用できません' }, 500)
    }

    console.log('🗑️ 削除リクエスト:', emails)

    const deletedUsers: string[] = []
    const errors: { email: string, error: string }[] = []

    for (const email of emails) {
      try {
        // ユーザーを検索
        const { results } = await c.env.DB.prepare(
          'SELECT id FROM users WHERE email = ?'
        ).bind(email).all()

        if (results.length === 0) {
          errors.push({ email, error: 'ユーザーが見つかりません' })
          continue
        }

        const userId = (results[0] as Record<string, unknown>).id

        console.log(`🔍 削除開始: ${email} (ID: ${userId})`)

        // 1. メール認証トークン削除
        try {
          await c.env.DB.prepare(
            'DELETE FROM email_verifications WHERE user_id = ?'
          ).bind(userId).run()
        } catch (e) {
          console.log('  ⚠️ email_verifications削除スキップ:', e)
        }

        // 2. セッション削除
        try {
          await c.env.DB.prepare(
            'DELETE FROM auth_sessions WHERE user_id = ?'
          ).bind(userId).run()
        } catch (e) {
          console.log('  ⚠️ auth_sessions削除スキップ:', e)
        }

        // 3. ソーシャルアカウント削除
        try {
          await c.env.DB.prepare(
            'DELETE FROM social_accounts WHERE user_id = ?'
          ).bind(userId).run()
        } catch (e) {
          console.log('  ⚠️ social_accounts削除スキップ:', e)
        }

        // 4. ゲスト予約は削除しない（履歴保持）が、user_idをNULLにする
        try {
          await c.env.DB.prepare(
            'UPDATE bookings SET user_id = NULL WHERE user_id = ?'
          ).bind(userId).run()
        } catch (e) {
          console.log('  ⚠️ bookings更新スキップ:', e)
        }

        // 5. セラピスト編集ログを削除（therapist_profilesの前に）
        try {
          // 本番環境では therapist_profiles.id = user_id
          // therapist_edit_logs.therapist_id = therapist_profiles.id (= user_id)
          await c.env.DB.prepare(
            'DELETE FROM therapist_edit_logs WHERE therapist_id = ?'
          ).bind(userId).run()
        } catch (e) {
          console.log('  ⚠️ therapist_edit_logs削除スキップ:', e)
        }

        // 6. セラピストプロファイル削除
        try {
          await c.env.DB.prepare(
            'DELETE FROM therapist_profiles WHERE user_id = ?'
          ).bind(userId).run()
        } catch (e) {
          console.log('  ⚠️ therapist_profiles削除スキップ:', e)
        }

        // 7. 最後にユーザー本体を削除
        await c.env.DB.prepare(
          'DELETE FROM users WHERE id = ?'
        ).bind(userId).run()

        deletedUsers.push(email)
        console.log(`✅ 削除完了: ${email}`)
      } catch (e) {
        console.error(`❌ 削除失敗: ${email}`, e)
        errors.push({ email, error: (e as Error).message })
      }
    }

    return c.json({
      success: true,
      deletedUsers,
      errors,
      message: `${deletedUsers.length}件のユーザーを削除しました`,
    })
  } catch (e) {
    console.error('Delete users error:', e)
    return c.json({ error: 'サーバーエラーが発生しました' }, 500)
  }
})

// ============================================
// HOG-SEC-005: JWTリフレッシュエンドポイント
// セッショントークンでJWTを更新する。セッションは30日間有効で、JWTは7日ごとに更新する
// ============================================
authApp.post('/refresh', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}))
    const sessionToken = body.sessionToken as string | undefined

    if (!sessionToken) {
      return c.json({ error: 'Session token is required' }, 400)
    }

    if (!c.env.DB || !c.env.JWT_SECRET) {
      return c.json({ error: 'Service temporarily unavailable' }, 503)
    }

    // セッショントークンでDBを検索し、有効なセッションか確認する
    const { results: sessionResults } = await c.env.DB.prepare(
      `SELECT s.id, s.user_id, s.expires_at,
              u.email, u.name, u.role
       FROM auth_sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > datetime('now')`
    )
      .bind(sessionToken)
      .all()

    if (!sessionResults || sessionResults.length === 0) {
      return c.json({ error: 'Session expired or not found. Please log in again.' }, 401)
    }

    const session = sessionResults[0] as Record<string, unknown>

    // 新しいJWTを発行（7日有効）
    const newJwt = await createJWT(
      {
        userId: session.user_id as string,
        email: session.email as string,
        userName: session.name as string,
        role: session.role as string,
        sessionId: session.id as string,
      },
      c.env.JWT_SECRET,
      7
    )

    return c.json({
      success: true,
      token: newJwt,
    })
  } catch (e) {
    console.error('Token refresh error:', e)
    return c.json({ error: 'サーバーエラーが発生しました' }, 500)
  }
})

export default authApp
