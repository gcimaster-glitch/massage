import { createRemoteJWKSet, jwtVerify } from 'jose';
import { Role, BookingStatus, Booking } from './types';

// Add missing ExecutionContext interface for Cloudflare Workers
export interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

/**
 * 環境変数の定義
 */
export interface Env {
  JWKS_URI: string;      // 例: https://auth.soothe.jp/.well-known/jwks.json
  JWT_ISSUER: string;    // 例: https://auth.soothe.jp/
  JWT_AUDIENCE: string;  // 例: https://api.soothe.jp/
  BACKEND_API_URL: string;
  AUDIT_LOG_ENDPOINT: string;
}

// キャッシュ用のJWKSセット
let _JWKS: any = null;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Content-Type': 'application/json',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * 1. 段階的住所開示・PIIマスク処理 (Privacy Guard)
 */
function privacyFilter(data: any, role: Role): any {
  if (!data) return data;

  // 配列の場合は再帰適用
  if (Array.isArray(data)) {
    return data.map(item => privacyFilter(item, role));
  }

  const filtered = { ...data };

  // 予約データの住所開示ロジック
  if (filtered.location && filtered.status) {
    const status = filtered.status as BookingStatus;
    
    // ADMINとTHERAPIST_OFFICEは全情報閲覧可能、それ以外は制限
    if (role !== Role.ADMIN && role !== Role.THERAPIST_OFFICE) {
      if (status === BookingStatus.CONFIRMED) {
        // 予約確定時は市区町村まで（例: 東京都渋谷区... -> 東京都渋谷区）
        filtered.location = filtered.location.split(' ').slice(0, 2).join(' ') + '（以降、施術開始前に公開）';
      } else if (status !== BookingStatus.IN_SERVICE && status !== BookingStatus.CHECKED_IN) {
        // それ以外の未開始状態は完全に隠蔽
        filtered.location = '予約確定後に公開されます';
      }
    }
  }

  // ロールに応じたPIIマスク
  if (role === Role.USER) {
    // ユーザーは他人の電話番号等は見れない
    delete filtered.therapistPhone;
    delete filtered.officeContact;
  }

  return filtered;
}

/**
 * 2. 監査ログ送信 (Audit Logger)
 */
async function sendAuditLog(env: Env, context: { userId: string, role: string, action: string, resourceId?: string, status: number }) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ...context,
    environment: 'production',
    source: 'BFF-Worker'
  };

  // 実行をブロックさせないために waitUntil を使用（ハンドラ内で呼び出しが必要）
  return fetch(env.AUDIT_LOG_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logEntry)
  }).catch(err => console.error('Audit Log Sync Failed', err));
}

/**
 * 3. 認証・認可 (RBAC)
 */
async function authenticate(request: Request, env: Env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing Token');
  }

  const token = authHeader.split(' ')[1];
  if (!_JWKS) {
    _JWKS = createRemoteJWKSet(new URL(env.JWKS_URI));
  }

  const { payload } = await jwtVerify(token, _JWKS, {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  });

  return {
    userId: payload.sub as string,
    role: payload.role as Role, // JWTのカスタムクレームにroleが含まれている想定
  };
}

/**
 * メインハンドラ
 */
export default {
  // Added fixed ExecutionContext parameter type definition above
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    try {
      // ステップ1: 認証
      const user = await authenticate(request, env);
      const url = new URL(request.url);
      const path = url.pathname;

      // ステップ2: ロールベースアクセス制御 (RBAC)
      const rbacRules: Record<string, Role[]> = {
        '/api/admin': [Role.ADMIN],
        '/api/office': [Role.ADMIN, Role.THERAPIST_OFFICE],
        '/api/therapist': [Role.ADMIN, Role.THERAPIST, Role.THERAPIST_OFFICE],
        '/api/host': [Role.ADMIN, Role.HOST],
        '/api/bookings': [Role.USER, Role.THERAPIST, Role.ADMIN],
      };

      const requiredRoles = Object.entries(rbacRules).find(([p]) => path.startsWith(p))?.[1];
      if (requiredRoles && !requiredRoles.includes(user.role)) {
        return new Response(JSON.stringify({ error: 'Forbidden: Insufficient Permissions' }), { 
          status: 403, 
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } 
        });
      }

      // ステップ3: バックエンドへのプロキシ
      const targetUrl = `${env.BACKEND_API_URL}${path}${url.search}`;
      const backendResponse = await fetch(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' ? await request.clone().arrayBuffer() : null
      });

      // ステップ4: レスポンスのプライバシーフィルタリング
      const rawData = await backendResponse.json();
      const safeData = privacyFilter(rawData, user.role);

      // ステップ5: 重要アクションの監査ログ送信 (非同期)
      const isCriticalAction = request.method !== 'GET' || path.includes('/safety/') || path.includes('/kyc/');
      if (isCriticalAction) {
        ctx.waitUntil(sendAuditLog(env, {
          userId: user.userId,
          role: user.role,
          action: `${request.method} ${path}`,
          status: backendResponse.status
        }));
      }

      return new Response(JSON.stringify(safeData), {
        status: backendResponse.status,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });

    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { 
        status: error.message?.includes('Unauthorized') ? 401 : 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } 
      });
    }
  }
};
