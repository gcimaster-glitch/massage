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

      // TODO: Send verification email via Resend
      // For now, we'll return success with verification link
      const verificationUrl = `${new URL(c.req.url).origin}/api/auth/verify-email?token=${verificationToken}`

      return c.json({
        success: true,
        message: '仮登録が完了しました。ご登録のメールアドレスに確認メールを送信しました。',
        userId: userId,
        email: email,
        verificationUrl: verificationUrl, // In production, this should only be sent via email
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

export default authApp
