/**
 * auth-middleware.ts
 * 認証ミドルウェア（jose標準ライブラリ使用）
 *
 * auth-helpers.ts の verifyJWT を再エクスポートし、
 * ロールベースアクセス制御（RBAC）を提供する。
 */

import { verifyJWT as _verifyJWT } from './auth-helpers'

// auth-helpers.ts の verifyJWT を再エクスポート（後方互換）
export { verifyJWT } from './auth-helpers'

// ============================================
// 認証ミドルウェア（ロールベースアクセス制御）
// ============================================

export async function requireAuth(
  authHeader: string | null,
  secret: string,
  allowedRoles: string[] = []
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Missing or invalid authorization header' }
    }

    const token = authHeader.substring(7)
    if (!token) {
      return { success: false, error: 'Missing token' }
    }

    const user = await _verifyJWT(token, secret)
    if (!user) {
      return { success: false, error: 'Invalid or expired token' }
    }

    // ロールチェック（指定された場合）
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return {
        success: false,
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      }
    }

    return { success: true, user }
  } catch (e) {
    console.error('[requireAuth] Authentication failed:', e)
    return { success: false, error: 'Authentication failed' }
  }
}

// ============================================
// 管理者権限チェック
// ============================================
export async function requireAdmin(
  authHeader: string | null,
  secret: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  return requireAuth(authHeader, secret, ['ADMIN', 'Admin'])
}

// ============================================
// セラピスト権限チェック
// ============================================
export async function requireTherapist(
  authHeader: string | null,
  secret: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  return requireAuth(authHeader, secret, ['THERAPIST', 'Therapist', 'ADMIN', 'Admin'])
}

// ============================================
// ユーザー権限チェック
// ============================================
export async function requireUser(
  authHeader: string | null,
  secret: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  return requireAuth(authHeader, secret, ['USER', 'User', 'THERAPIST', 'Therapist', 'ADMIN', 'Admin'])
}
