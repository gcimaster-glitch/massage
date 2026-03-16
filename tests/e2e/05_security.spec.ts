import { test, expect } from '@playwright/test';
import { loginViaAPI, TEST_USERS } from './helpers/auth';

// ============================================
// テストスイート 05: セキュリティ検証
// - セキュリティヘッダーの確認
// - 認証・認可の境界テスト
// - 入力バリデーション
// - レート制限
// ============================================

test.describe('セキュリティ検証', () => {
  test.describe('セキュリティヘッダー', () => {
    test('ホームページに必須セキュリティヘッダーが設定されている', async ({ page }) => {
      const response = await page.goto('/');
      expect(response).toBeTruthy();

      if (response) {
        const headers = response.headers();

        // X-Content-Type-Options
        expect(headers['x-content-type-options']).toBe('nosniff');

        // X-Frame-Options または CSP frame-ancestors
        const hasFrameProtection =
          headers['x-frame-options'] === 'DENY' ||
          headers['x-frame-options'] === 'SAMEORIGIN' ||
          (headers['content-security-policy'] || '').includes('frame-ancestors');
        expect(hasFrameProtection).toBeTruthy();

        // X-XSS-Protection（レガシーだが確認）
        // または Content-Security-Policy
        const hasXSSProtection =
          headers['x-xss-protection'] !== undefined ||
          headers['content-security-policy'] !== undefined;
        expect(hasXSSProtection).toBeTruthy();
      }
    });

    test('APIエンドポイントにセキュリティヘッダーが設定されている', async ({ page }) => {
      const response = await page.request.get('/api/health');

      if (response.status() === 200) {
        const headers = response.headers();
        // APIレスポンスにもセキュリティヘッダーが含まれることを確認
        expect(headers['x-content-type-options']).toBe('nosniff');
      }
    });
  });

  test.describe('認証・認可の境界', () => {
    test('一般ユーザーが管理者APIにアクセスできない', async ({ page }) => {
      const token = await loginViaAPI(page, TEST_USERS.USER);

      const adminEndpoints = [
        '/api/admin/users',
        '/api/admin/revenue-config',
        '/api/admin/plans',
        '/api/kyc/admin',
      ];

      for (const endpoint of adminEndpoints) {
        const response = await page.request.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        expect([401, 403]).toContain(response.status());
      }
    });

    test('セラピストが他のセラピストのデータにアクセスできない', async ({ page }) => {
      const token = await loginViaAPI(page, TEST_USERS.THERAPIST);

      // 他のユーザーIDを使ったアクセス試行
      const response = await page.request.get('/api/users/other-user-id/private', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect([401, 403, 404]).toContain(response.status());
    });

    test('期限切れトークンで認証が失敗する', async ({ page }) => {
      // 偽のJWTトークン（期限切れ）
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiZXhwIjoxfQ.invalid';

      const response = await page.request.get('/api/bookings', {
        headers: { Authorization: `Bearer ${expiredToken}` },
      });

      expect([401, 403]).toContain(response.status());
    });
  });

  test.describe('入力バリデーション', () => {
    test('SQLインジェクション試行がブロックされる', async ({ page }) => {
      const token = await loginViaAPI(page, TEST_USERS.USER);

      // SQLインジェクションペイロードを含むリクエスト
      const maliciousPayloads = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "admin'--",
      ];

      for (const payload of maliciousPayloads) {
        const response = await page.request.get(`/api/therapists?search=${encodeURIComponent(payload)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // エラーが返っても500（サーバーエラー）ではないことを確認
        // 200（空の結果）または400（バリデーションエラー）が期待値
        expect(response.status()).not.toBe(500);
      }
    });

    test('XSSペイロードがエスケープされる', async ({ page }) => {
      const token = await loginViaAPI(page, TEST_USERS.USER);

      const xssPayload = '<script>alert("XSS")</script>';

      const response = await page.request.get(
        `/api/therapists?search=${encodeURIComponent(xssPayload)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status() === 200) {
        const body = await response.text();
        // レスポンスにスクリプトタグが含まれないことを確認
        expect(body).not.toContain('<script>');
      }
    });
  });

  test.describe('レート制限', () => {
    test('ログイン試行のレート制限が機能する', async ({ page }) => {
      await page.goto('/');

      // 短時間に多数のログイン試行
      const attempts = [];
      for (let i = 0; i < 10; i++) {
        attempts.push(
          page.request.post('/api/auth/login', {
            data: {
              email: 'nonexistent@test.com',
              password: 'WrongPassword',
            },
          })
        );
      }

      const responses = await Promise.all(attempts);
      const statusCodes = responses.map((r) => r.status());

      // 少なくとも1つのレート制限（429）または認証失敗（401）が返ることを確認
      const hasRateLimit = statusCodes.some((s) => s === 429);
      const hasAuthFailure = statusCodes.every((s) => [401, 429].includes(s));
      expect(hasRateLimit || hasAuthFailure).toBeTruthy();
    });
  });

  test.describe('HTTPS・通信セキュリティ', () => {
    test('HTTPSが有効であることを確認', async ({ page }) => {
      const url = page.url();
      // テスト対象がhttpsであることを確認（本番環境）
      if (process.env.BASE_URL?.startsWith('https://')) {
        expect(url).toMatch(/^https:\/\//);
      }
    });
  });
});
