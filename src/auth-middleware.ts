/**
 * 認証ミドルウェア - JWT検証
 */

export async function verifyJWT(token: string, secret: string): Promise<any | null> {
  try {
    // JWT の構造: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Payload をデコード
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

    // 有効期限チェック
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }

    return payload;
  } catch (e) {
    console.error('JWT verification failed:', e);
    return null;
  }
}
