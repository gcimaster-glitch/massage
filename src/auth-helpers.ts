/**
 * auth-helpers.ts
 * 認証ユーティリティ（セキュリティ強化版）
 *
 * - JWT: joseライブラリ（HS256）を使用した標準準拠実装
 * - パスワードハッシュ: PBKDF2 + ランダムソルト（Web Crypto API）
 * - ソーシャル認証ヘルパー
 */

import { SignJWT, jwtVerify } from 'jose'

// ============================================
// Type Definitions
// ============================================

export interface SocialAuthProvider {
  name: string
  clientId: string
  clientSecret: string
  authUrl: string
  tokenUrl: string
  userInfoUrl: string
  scopes: string[]
  // 旧インターフェース互換
  scope?: string[]
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
  [key: string]: unknown
}

// ============================================
// JWT（jose標準ライブラリ使用）
// ============================================

/**
 * JWTトークンを生成する
 * @param payload - トークンに含めるペイロード
 * @param secret - 署名シークレット（環境変数から取得すること）
 * @param expiresInDays - 有効期限（日数）
 */
export async function createJWT(
  payload: JWTPayload,
  secret: string,
  expiresInDays: number = 7
): Promise<string> {
  const secretKey = new TextEncoder().encode(secret)
  const expirationTime = Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60

  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(secretKey)
}

/**
 * JWTトークンを検証する
 * @param token - 検証するJWTトークン
 * @param secret - 署名シークレット（環境変数から取得すること）
 * @returns ペイロード（検証失敗時はnull）
 */
export async function verifyJWT(
  token: string,
  secret: string
): Promise<JWTPayload | null> {
  try {
    const secretKey = new TextEncoder().encode(secret)
    const { payload } = await jwtVerify(token, secretKey)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

// ============================================
// パスワードハッシュ（PBKDF2 + ソルト）
// ============================================

const HASH_ALGORITHM = 'PBKDF2'
const HASH_DIGEST = 'SHA-256'
const HASH_ITERATIONS = 100000
const SALT_LENGTH = 32

/**
 * パスワードをPBKDF2でハッシュ化する（ソルト付き）
 * 保存形式: "pbkdf2:{iterations}:{base64(salt)}:{base64(hash)}"
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    HASH_ALGORITHM,
    false,
    ['deriveBits']
  )
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: HASH_ALGORITHM,
      salt,
      iterations: HASH_ITERATIONS,
      hash: HASH_DIGEST,
    },
    keyMaterial,
    256
  )
  const saltB64 = btoa(String.fromCharCode(...salt))
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
  return `pbkdf2:${HASH_ITERATIONS}:${saltB64}:${hashB64}`
}

/**
 * パスワードをハッシュと比較する
 * 旧形式（SHA-256 hex、Base64）も互換対応
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    // 新形式: pbkdf2:{iterations}:{salt}:{hash}
    if (storedHash.startsWith('pbkdf2:')) {
      const parts = storedHash.split(':')
      if (parts.length !== 4) return false
      const iterations = parseInt(parts[1], 10)
      const salt = Uint8Array.from(atob(parts[2]), (c) => c.charCodeAt(0))
      const expectedHash = parts[3]

      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        HASH_ALGORITHM,
        false,
        ['deriveBits']
      )
      const hashBuffer = await crypto.subtle.deriveBits(
        {
          name: HASH_ALGORITHM,
          salt,
          iterations,
          hash: HASH_DIGEST,
        },
        keyMaterial,
        256
      )
      const hashB64 = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
      return hashB64 === expectedHash
    }

    // 旧形式互換: SHA-256 hex（64文字）
    if (storedHash.length === 64 && /^[0-9a-f]+$/.test(storedHash)) {
      const data = new TextEncoder().encode(password)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const legacyHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
      return legacyHash === storedHash
    }

    // 旧形式互換: Base64エンコード（デモ用）
    try {
      if (storedHash === btoa(password)) {
        return true
      }
    } catch {
      // btoa失敗時は無視
    }

    return false
  } catch {
    return false
  }
}

// ============================================
// OAuth URL生成
// ============================================

export function generateOAuthUrl(
  provider: SocialAuthProvider,
  redirectUri: string,
  state: string
): string {
  const scopes = provider.scopes || provider.scope || []
  const params = new URLSearchParams({
    client_id: provider.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    state,
  })
  return `${provider.authUrl}?${params.toString()}`
}

// ============================================
// ソーシャル認証ヘルパー
// ============================================

export async function exchangeCodeForToken(
  provider: SocialAuthProvider,
  code: string,
  redirectUri: string
): Promise<any> {
  const response = await fetch(provider.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: provider.clientId,
      client_secret: provider.clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  if (!response.ok) {
    throw new Error('Failed to exchange code for token')
  }
  return await response.json()
}

export async function getUserInfo(
  provider: SocialAuthProvider,
  accessToken: string
): Promise<{ id: string; email: string; name: string; avatar_url?: string }> {
  const response = await fetch(provider.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  if (!response.ok) {
    throw new Error('Failed to get user info')
  }
  const data = await response.json()
  return normalizeUserInfo(provider.name, data)
}

function normalizeUserInfo(
  providerName: string,
  data: any
): { id: string; email: string; name: string; avatar_url?: string } {
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

// ============================================
// ID生成ユーティリティ（crypto.getRandomValues使用）
// ============================================

function randomHex(bytes: number): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function generateUserId(): string {
  return `u-${Date.now()}-${randomHex(8)}`
}

export function generateSocialAccountId(): string {
  return `sa-${Date.now()}-${randomHex(8)}`
}

export function generateSessionId(): string {
  return `sess-${Date.now()}-${randomHex(8)}`
}

export function generateSessionToken(): string {
  return randomHex(32)
}

export function generateState(): string {
  return randomHex(32)
}
