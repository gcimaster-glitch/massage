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

  const key = `uploads/${payload.userId}/${Date.now()}-${fileName}`;

  // R2 署名付きURLの生成
  // 本番では c.env.STORAGE.createMultipartUpload() または presigned URL を使用
  return c.json({
    url: `https://storage.hogusy.com/${key}`,
    key,
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
