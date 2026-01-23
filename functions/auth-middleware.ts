/**
 * 認証ミドルウェア - JWT検証（Cloudflare Workers対応）
 * セキュリティ強化版: Web Crypto APIを使用した署名検証
 */

// ============================================
// JWT署名検証（Web Crypto API使用）
// ============================================
export async function verifyJWT(token: string, secret: string): Promise<any | null> {
  try {
    // JWT の構造: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('[verifyJWT] Invalid JWT format');
      return null;
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // Base64URLデコード関数（Cloudflare Workers対応）
    const base64UrlDecode = (str: string): string => {
      // Base64URL → Base64
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      // パディング追加
      const pad = base64.length % 4;
      if (pad) {
        if (pad === 1) {
          throw new Error('InvalidLength');
        }
        base64 += new Array(5 - pad).join('=');
      }
      // デコード
      return new TextDecoder().decode(
        Uint8Array.from(atob(base64), c => c.charCodeAt(0))
      );
    };

    // Payload をデコード
    let payload: any;
    try {
      payload = JSON.parse(base64UrlDecode(payloadB64));
    } catch (e) {
      console.error('[verifyJWT] Failed to decode payload:', e);
      return null;
    }

    // 有効期限チェック
    if (payload.exp && payload.exp < Date.now() / 1000) {
      console.log('[verifyJWT] Token expired');
      return null;
    }

    // ============================================
    // 署名検証（Web Crypto API）
    // ============================================
    try {
      // シークレットキーをインポート
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );

      // 署名対象データ（header.payload）
      const data = encoder.encode(`${headerB64}.${payloadB64}`);

      // 署名をデコード
      const signatureBytes = Uint8Array.from(
        atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')),
        c => c.charCodeAt(0)
      );

      // 署名を検証
      const isValid = await crypto.subtle.verify(
        'HMAC',
        key,
        signatureBytes,
        data
      );

      if (!isValid) {
        console.log('[verifyJWT] Invalid signature');
        return null;
      }

      console.log('[verifyJWT] Token verified successfully. Role:', payload.role);
      return payload;
    } catch (e) {
      console.error('[verifyJWT] Signature verification failed:', e);
      return null;
    }
  } catch (e) {
    console.error('[verifyJWT] JWT verification failed:', e);
    return null;
  }
}

// ============================================
// 認証ミドルウェア（ロールベースアクセス制御）
// ============================================
export async function requireAuth(
  authHeader: string | null,
  secret: string,
  allowedRoles: string[] = []
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    // Authorization ヘッダーチェック
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Missing or invalid authorization header' };
    }

    // トークン抽出
    const token = authHeader.substring(7);
    if (!token) {
      return { success: false, error: 'Missing token' };
    }

    // JWT検証
    const user = await verifyJWT(token, secret);
    if (!user) {
      return { success: false, error: 'Invalid or expired token' };
    }

    // ロールチェック（指定された場合）
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return { 
        success: false, 
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
      };
    }

    return { success: true, user };
  } catch (e) {
    console.error('[requireAuth] Authentication failed:', e);
    return { success: false, error: 'Authentication failed' };
  }
}

// ============================================
// 管理者権限チェック
// ============================================
export async function requireAdmin(
  authHeader: string | null,
  secret: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  return requireAuth(authHeader, secret, ['Admin']);
}

// ============================================
// セラピスト権限チェック
// ============================================
export async function requireTherapist(
  authHeader: string | null,
  secret: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  return requireAuth(authHeader, secret, ['Therapist', 'Admin']);
}

// ============================================
// ユーザー権限チェック
// ============================================
export async function requireUser(
  authHeader: string | null,
  secret: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  return requireAuth(authHeader, secret, ['User', 'Therapist', 'Admin']);
}
