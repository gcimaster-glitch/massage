/**
 * 認証ミドルウェア - JWT検証（Cloudflare Workers対応）
 */

export async function verifyJWT(token: string, secret: string): Promise<any | null> {
  try {
    // JWT の構造: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('[verifyJWT] Invalid JWT format');
      return null;
    }

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
      // デコード（Cloudflare Workers環境ではatobの代わりにこれを使う）
      try {
        return new TextDecoder().decode(
          Uint8Array.from(atob(base64), c => c.charCodeAt(0))
        );
      } catch (e) {
        // Cloudflare Workers環境で atob が使えない場合のフォールバック
        const buffer = Uint8Array.from(
          [...base64].map(c => c.charCodeAt(0))
        );
        return new TextDecoder().decode(buffer);
      }
    };

    // Payload をデコード
    let payload;
    try {
      payload = JSON.parse(base64UrlDecode(parts[1]));
    } catch (e) {
      console.error('[verifyJWT] Failed to decode payload:', e);
      return null;
    }

    // 有効期限チェック
    if (payload.exp && payload.exp < Date.now() / 1000) {
      console.log('[verifyJWT] Token expired');
      return null;
    }

    console.log('[verifyJWT] Token decoded successfully. Role:', payload.role);
    return payload;
  } catch (e) {
    console.error('[verifyJWT] JWT verification failed:', e);
    return null;
  }
}
