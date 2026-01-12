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

      if (results.length === 0) {
        return c.json({ error: 'Invalid or expired state' }, 400)
      }

      redirectPath = (results[0] as any).redirect_uri || '/app'
      userRole = (results[0] as any).role || 'USER'

      // Delete used state
      await c.env.DB.prepare('DELETE FROM oauth_states WHERE state = ?').bind(state).run()
    } catch (e) {
      console.error('Failed to verify OAuth state:', e)
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

    if (c.env.DB) {
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
    } else {
      // Development mode - no DB
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
          role: mockUser.role,
        },
        'dev-secret',
        30
      )

      const redirectUrl = new URL(redirectPath, new URL(c.req.url).origin)
      redirectUrl.searchParams.set('token', jwt)
      redirectUrl.searchParams.set('isNewUser', 'true')

      return c.redirect(redirectUrl.toString())
    }
  } catch (e) {
    console.error('OAuth callback error:', e)
    return c.redirect(`/?error=auth_failed`)
  }
})

// ============================================
// Link Social Account (for existing users)
// ============================================
authApp.post('/link/:provider', async (c) => {
  // TODO: Implement account linking for existing users
  return c.json({ message: 'Not implemented yet' }, 501)
})

// ============================================
// Unlink Social Account
// ============================================
authApp.delete('/link/:provider', async (c) => {
  // TODO: Implement account unlinking
  return c.json({ message: 'Not implemented yet' }, 501)
})

export default authApp
