/**
 * 画像管理API（R2 Object Storage）
 * - 画像アップロード署名付きURL生成
 * - 画像取得
 */

import { Hono } from 'hono';
import { verifyJWT } from './auth-middleware';

type Bindings = {
  DB: D1Database;
  STORAGE: R2Bucket;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// ============================================
// R2 署名付きアップロードURL生成
// ============================================
app.get('/upload-url', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');
  const payload = await verifyJWT(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  const fileName = c.req.query('file');
  if (!fileName) {
    return c.json({ error: 'File name required' }, 400);
  }

  // ファイル名のサニタイズ（パストラバーサル対策）
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `uploads/${payload.userId}/${Date.now()}-${sanitizedFileName}`;

  if (!c.env.STORAGE) {
    return c.json({ error: 'Storage not configured' }, 503);
  }

  // R2の署名付きURLはCloudflare Workersではネイティブサポートなし。
  // フロントエンドからはこのURLに対してPUTリクエストを送ることでアップロードする。
  // アップロードエンドポイントは /api/images/upload エンドポイントで受け付ける
  const origin = new URL(c.req.url).origin;
  return c.json({
    url: `${origin}/api/images/upload`,
    key,
    method: 'POST',
  });
});

// ============================================
// 画像アップロード（R2へ直接保存）
// ============================================
app.post('/upload', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');
  const payload = await verifyJWT(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  if (!c.env.STORAGE) {
    return c.json({ error: 'Storage not configured' }, 503);
  }

  const contentType = c.req.header('Content-Type') || 'application/octet-stream';
  const key = c.req.query('key');

  if (!key) {
    return c.json({ error: 'Key parameter required' }, 400);
  }

  // セキュリティチェック: keyは必ず自分のuserIdで始まること
  if (!key.startsWith(`uploads/${payload.userId}/`)) {
    return c.json({ error: 'Unauthorized key path' }, 403);
  }

  const body = await c.req.arrayBuffer();

  // ファイルサイズチェック（20MB以下）
  if (body.byteLength > 20 * 1024 * 1024) {
    return c.json({ error: 'ファイルサイズは20MB以下にしてください' }, 400);
  }

  await c.env.STORAGE.put(key, body, {
    httpMetadata: { contentType },
    customMetadata: {
      userId: payload.userId as string,
      uploadedAt: new Date().toISOString(),
    },
  });

  const origin = new URL(c.req.url).origin;
  return c.json({
    success: true,
    key,
    url: `${origin}/api/images/${key}`,
  });
});

// ============================================
// 画像取得（R2から直接配信）
// ============================================
app.get('/:key{.+}', async (c) => {
  const key = c.req.param('key');
  const { STORAGE } = c.env;

  if (!STORAGE) {
    return c.json({ error: 'Storage not configured' }, 503);
  }

  const object = await STORAGE.get(key);

  if (!object) {
    return c.json({ error: 'Image not found' }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000');

  return new Response(object.body, { headers });
});

export default app;
