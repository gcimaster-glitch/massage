// ============================================
// Social Auth Helper Functions
// ============================================

export interface SocialAuthProvider {
  name: string
  authUrl: string
  tokenUrl: string
  userInfoUrl: string
  clientId: string
  clientSecret: string
  scope: string[]
}

// Generate OAuth URL
export function generateOAuthUrl(
  provider: SocialAuthProvider,
  redirectUri: string,
  state: string
): string {
  const params = new URLSearchParams({
    client_id: provider.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: provider.scope.join(' '),
    state: state,
  })

  return `${provider.authUrl}?${params.toString()}`
}

// Exchange code for token
export async function exchangeCodeForToken(
  provider: SocialAuthProvider,
  code: string,
  redirectUri: string
): Promise<{ access_token: string; refresh_token?: string; expires_in?: number }> {
  const response = await fetch(provider.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: provider.clientId,
      client_secret: provider.clientSecret,
      code: code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to exchange code for token')
  }

  return await response.json()
}

// Get user info from provider
export async function getUserInfo(
  provider: SocialAuthProvider,
  accessToken: string
): Promise<{
  id: string
  email: string
  name: string
  avatar_url?: string
}> {
  const response = await fetch(provider.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get user info')
  }

  const data = await response.json()

  // Normalize response based on provider
  return normalizeUserInfo(provider.name, data)
}

// Normalize user info from different providers
function normalizeUserInfo(providerName: string, data: any) {
  switch (providerName) {
    case 'GOOGLE':
      return {
        id: data.sub || data.id,
        email: data.email,
        name: data.name,
        avatar_url: data.picture,
      }
    case 'YAHOO':
      return {
        id: data.sub || data.user_id,
        email: data.email,
        name: data.name || data.nickname,
        avatar_url: data.picture,
      }
    case 'X':
      return {
        id: data.id || data.id_str,
        email: data.email,
        name: data.name,
        avatar_url: data.profile_image_url_https,
      }
    case 'FACEBOOK':
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        avatar_url: data.picture?.data?.url,
      }
    case 'LINE':
      return {
        id: data.userId,
        email: data.email,
        name: data.displayName,
        avatar_url: data.pictureUrl,
      }
    default:
      return {
        id: data.id || data.sub,
        email: data.email,
        name: data.name,
        avatar_url: data.picture || data.avatar_url,
      }
  }
}

// Generate random state for CSRF protection
export function generateState(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Generate session token
export function generateSessionToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Generate user ID
export function generateUserId(): string {
  return `u-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Generate social account ID
export function generateSocialAccountId(): string {
  return `sa-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Generate session ID
export function generateSessionId(): string {
  return `sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Create JWT token (simple version)
export function createJWT(payload: any, secret: string, expiresInDays: number = 7): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const exp = Date.now() + expiresInDays * 24 * 60 * 60 * 1000
  const data = { ...payload, exp }

  // Simple JWT encoding (for production, use a proper JWT library)
  const encodedHeader = btoa(JSON.stringify(header))
  const encodedPayload = btoa(JSON.stringify(data))
  const signature = btoa(`${encodedHeader}.${encodedPayload}.${secret}`)

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

// Verify JWT token
export function verifyJWT(token: string, secret: string): any {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.')
    const expectedSignature = btoa(`${encodedHeader}.${encodedPayload}.${secret}`)

    if (signature !== expectedSignature) {
      throw new Error('Invalid signature')
    }

    const payload = JSON.parse(atob(encodedPayload))

    if (payload.exp < Date.now()) {
      throw new Error('Token expired')
    }

    return payload
  } catch (e) {
    throw new Error('Invalid token')
  }
}
