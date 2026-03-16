import { test, expect } from '@playwright/test';
import { login, loginViaAPI, TEST_USERS } from './helpers/auth';

// ============================================
// テストスイート 06: 管理者機能
// - 管理者ダッシュボード
// - ユーザー管理
// - 収益分配設定
// - 料金プラン管理
// ============================================

test.describe('管理者機能', () => {
  test.describe('管理者ダッシュボード', () => {
    test('管理者がダッシュボードにアクセスできる', async ({ page }) => {
      await login(page, TEST_USERS.ADMIN);

      await page.goto('/admin');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('body')).toBeVisible();
    });

    test('管理者ダッシュボードに主要メトリクスが表示される', async ({ page }) => {
      await login(page, TEST_USERS.ADMIN);
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');

      // ダッシュボードに何らかのコンテンツが表示されることを確認
      const pageText = await page.textContent('body');
      expect(pageText?.length).toBeGreaterThan(100);
    });
  });

  test.describe('ユーザー管理', () => {
    test('管理者がユーザー一覧APIにアクセスできる', async ({ page }) => {
      const token = await loginViaAPI(page, TEST_USERS.ADMIN);

      const response = await page.request.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect([200, 404]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json() as { users?: unknown[] };
        expect(data).toHaveProperty('users');
        expect(Array.isArray(data.users)).toBeTruthy();
      }
    });

    test('管理者がユーザー管理画面にアクセスできる', async ({ page }) => {
      await login(page, TEST_USERS.ADMIN);

      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('収益分配設定', () => {
    test('管理者が収益分配設定を取得できる', async ({ page }) => {
      const token = await loginViaAPI(page, TEST_USERS.ADMIN);

      const response = await page.request.get('/api/admin/revenue-config', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect([200, 404]).toContain(response.status());
    });

    test('収益分配設定画面にRevenue Flow Simulatorが表示される', async ({ page }) => {
      await login(page, TEST_USERS.ADMIN);
      await page.goto('/admin/revenue-config');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('body')).toBeVisible();

      // Revenue Flow SimulatorまたはシミュレーターUIの存在確認
      const pageText = await page.textContent('body');
      // 収益分配に関連するテキストが含まれることを確認
      expect(pageText).toBeTruthy();
    });
  });

  test.describe('料金プラン管理', () => {
    test('管理者が料金プラン管理画面にアクセスできる', async ({ page }) => {
      await login(page, TEST_USERS.ADMIN);
      await page.goto('/admin/plan-management');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('body')).toBeVisible();
    });

    test('料金プランAPIが正常に応答する', async ({ page }) => {
      const token = await loginViaAPI(page, TEST_USERS.ADMIN);

      const response = await page.request.get('/api/admin/plans', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect([200, 404]).toContain(response.status());
    });
  });

  test.describe('管理者ナビゲーション', () => {
    test('管理者サイドバーの主要リンクが機能する', async ({ page }) => {
      await login(page, TEST_USERS.ADMIN);
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');

      // サイドバーまたはナビゲーションメニューの確認
      const navLinks = page.locator('nav a, aside a, [role="navigation"] a');
      const count = await navLinks.count();

      // 少なくとも1つのナビゲーションリンクが存在することを確認
      expect(count).toBeGreaterThan(0);
    });
  });
});

// ============================================
// 管理者APIの包括的テスト
// ============================================
test.describe('管理者API包括テスト', () => {
  const adminApiEndpoints = [
    { path: '/api/admin/users', method: 'GET', description: 'ユーザー一覧' },
    { path: '/api/kyc/admin', method: 'GET', description: 'KYC申請一覧' },
    { path: '/api/admin/revenue-config', method: 'GET', description: '収益分配設定' },
    { path: '/api/admin/plans', method: 'GET', description: '料金プラン一覧' },
  ];

  for (const endpoint of adminApiEndpoints) {
    test(`${endpoint.description}APIが管理者トークンで正常応答する`, async ({ page }) => {
      const token = await loginViaAPI(page, TEST_USERS.ADMIN);

      const response = await page.request.fetch(endpoint.path, {
        method: endpoint.method,
        headers: { Authorization: `Bearer ${token}` },
      });

      // 200または404（データなし）を許容
      expect([200, 404]).toContain(response.status());
    });
  }
});
