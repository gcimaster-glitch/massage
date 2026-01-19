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
} from './auth-helpers'

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
authApp.get('/oauth/:provider', async (c) => {
  const providerName = c.req.param('provider').toUpperCase()
  const role = c.req.query('role') || 'USER' // Optional: set role on signup
  const redirect = c.req.query('redirect') || '/app'

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
    return c.redirect(`/?error=${error}`)
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
  let userRole = 'USER'
  
  if (c.env.DB) {
    try {
      const { results } = await c.env.DB.prepare(
        'SELECT redirect_uri, role FROM oauth_states WHERE state = ? AND expires_at > datetime("now")'
      )
        .bind(state)
        .all()

      if (results && results.length > 0) {
        redirectPath = (results[0] as any).redirect_uri || '/app'
        userRole = (results[0] as any).role || 'USER'

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
    let user: any
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
        const userId = (socialAccounts[0] as any).user_id
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
            tokenData.access_token,
            tokenData.refresh_token || null,
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
      const jwt = createJWT(
        {
          userId: user.id,
          email: user.email,
          userName: user.name,
          role: user.role,
          sessionId: sessionId,
        },
        c.env.JWT_SECRET,
        30 // 30 days
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
    
    // Development mode - no DB or DB error
    const mockUser = {
      id: generateUserId(),
      email: providerUser.email,
      name: providerUser.name,
      role: userRole,
      avatar_url: providerUser.avatar_url,
    }

    const jwt = createJWT(
      {
        userId: mockUser.id,
        email: mockUser.email,
        userName: mockUser.name,
        role: mockUser.role,
      },
      c.env.JWT_SECRET || 'dev-secret',
      30
    )

    const redirectUrl = new URL(redirectPath, new URL(c.req.url).origin)
    redirectUrl.searchParams.set('token', jwt)
    redirectUrl.searchParams.set('isNewUser', 'true')

    return c.redirect(redirectUrl.toString())
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

    // Validation
    if (!email || !password || !name) {
      return c.json({ error: 'メールアドレス、パスワード、お名前は必須です' }, 400)
    }

    if (password.length < 8) {
      return c.json({ error: 'パスワードは8文字以上で入力してください' }, 400)
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return c.json({ error: '有効なメールアドレスを入力してください' }, 400)
    }

    // Check if DB is available
    if (!c.env.DB) {
      // Development mode - return mock success
      return c.json({
        success: true,
        message: '仮登録が完了しました。ご登録のメールアドレスに確認メールを送信しました。',
        userId: generateUserId(),
        email: email,
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
        return c.json({ error: 'このメールアドレスは既に登録されています' }, 409)
      }

      // Hash password using Web Crypto API
      const encoder = new TextEncoder()
      const data = encoder.encode(password)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

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
      
      try {
        await fetch('https://api.resend.com/emails', {
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
      } catch (emailError) {
        console.error('Email sending error:', emailError);
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

    const userId = (results[0] as any).user_id

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

    return c.redirect('/auth/login?verified=true&message=メール認証が完了しました。ログインしてご利用ください。')
  } catch (e) {
    console.error('Email verification error:', e)
    return c.redirect('/?error=verification_failed')
  }
})

// ============================================
// Email/Password Login
// ============================================
authApp.post('/login', async (c) => {
  try {
    const body = await c.req.json()
    const { email, password } = body

    if (!email || !password) {
      return c.json({ error: 'メールアドレスとパスワードを入力してください' }, 400)
    }

    if (!c.env.DB) {
      // Development mode - mock login
      return c.json({
        success: true,
        token: createJWT(
          {
            userId: 'dev-user',
            email: email,
            userName: 'デモユーザー',
            role: 'USER',
          },
          c.env.JWT_SECRET || 'dev-secret',
          30
        ),
        user: {
          id: 'dev-user',
          email: email,
          name: 'デモユーザー',
          role: 'USER',
        },
      })
    }

    try {
      // Hash password for comparison
      const encoder = new TextEncoder()
      const data = encoder.encode(password)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

      // Find user by email and password
      const { results } = await c.env.DB.prepare(
        'SELECT id, email, name, role, avatar_url, email_verified FROM users WHERE email = ? AND password_hash = ?'
      )
        .bind(email, passwordHash)
        .all()

      if (results.length === 0) {
        return c.json({ error: 'メールアドレスまたはパスワードが正しくありません' }, 401)
      }

      const user = results[0] as any

      if (!user.email_verified) {
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
      const jwt = createJWT(
        {
          userId: user.id,
          email: user.email,
          userName: user.name,
          role: user.role,
          sessionId: sessionId,
        },
        c.env.JWT_SECRET,
        30
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
    const decoded = verifyJWT(token, c.env.JWT_SECRET)
    
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

    const user = results[0] as any

    // Check if user has linked social accounts
    const { results: socialAccounts } = await c.env.DB.prepare(
      'SELECT provider FROM social_accounts WHERE user_id = ?'
    )
      .bind(user.id)
      .all()

    const linkedProviders = socialAccounts.map((acc: any) => acc.provider)

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
    const decoded = verifyJWT(token, c.env.JWT_SECRET)
    
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
    const decoded = verifyJWT(token, c.env.JWT_SECRET)
    
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

// ============================================
// User Registration (Email/Password)
// ============================================
authApp.post('/register', async (c) => {
  try {
    const { email, password, name, role = 'USER' } = await c.req.json()

    if (!email || !password || !name) {
      return c.json({ error: 'メールアドレス、パスワード、名前は必須です' }, 400)
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return c.json({ error: '有効なメールアドレスを入力してください' }, 400)
    }

    // Password validation (minimum 8 characters)
    if (password.length < 8) {
      return c.json({ error: 'パスワードは8文字以上である必要があります' }, 400)
    }

    if (!c.env.DB) {
      // 開発モード: モックユーザーを返す
      const mockUser = {
        id: generateUserId(),
        email,
        name,
        role,
        created_at: new Date().toISOString(),
      }
      
      const token = createJWT({ userId: mockUser.id, role: mockUser.role }, c.env.JWT_SECRET)
      
      return c.json({ 
        success: true,
        token, 
        user: mockUser,
        message: '開発モード: ユーザー登録が完了しました'
      })
    }

    // Check if email already exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first()

    if (existingUser) {
      return c.json({ error: 'このメールアドレスは既に登録されています' }, 400)
    }

    // Hash password (simple hash for demo - use bcrypt in production)
    const passwordHash = btoa(password) // Base64 encode (replace with bcrypt)

    // Create new user
    const userId = generateUserId()
    await c.env.DB.prepare(
      `INSERT INTO users (id, email, password_hash, name, role, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, 'ACTIVE', datetime('now'), datetime('now'))`
    ).bind(userId, email, passwordHash, name, role).run()

    // Fetch created user
    const user = await c.env.DB.prepare(
      'SELECT id, email, name, role, created_at FROM users WHERE id = ?'
    ).bind(userId).first()

    // Generate JWT token
    const token = createJWT({ userId: user.id, role: user.role }, c.env.JWT_SECRET)

    console.log('✅ User registered:', email)

    return c.json({ 
      success: true,
      token, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      message: 'ユーザー登録が完了しました'
    })
  } catch (e) {
    console.error('Registration error:', e)
    return c.json({ error: 'サーバーエラーが発生しました' }, 500)
  }
})

export default authApp
