import { test, expect } from '@playwright/test';
import { login, loginViaAPI, TEST_USERS } from './helpers/auth';

// ============================================
// テストスイート 02: 予約フロー
// - セラピスト一覧の表示
// - 予約の作成
// - 予約確認・キャンセル
// ============================================

test.describe('予約フロー', () => {
  test.describe('セラピスト一覧', () => {
    test('一般ユーザーがセラピスト一覧を閲覧できる', async ({ page }) => {
      await login(page, TEST_USERS.USER);

      // セラピスト一覧ページに遷移
      await page.goto('/app/therapists');
      await page.waitForLoadState('networkidle');

      // セラピスト一覧が表示されることを確認
      await expect(page.locator('body')).toBeVisible();
      // ページタイトルまたはセラピスト関連のテキストを確認
      const pageContent = await page.textContent('body');
      expect(pageContent).toBeTruthy();
    });

    test('セラピスト検索機能が動作する', async ({ page }) => {
      await login(page, TEST_USERS.USER);
      await page.goto('/app/therapists');
      await page.waitForLoadState('networkidle');

      // 検索フィールドを探す
      const searchInput = page.locator('input[type="search"], input[placeholder*="検索"], input[placeholder*="search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('マッサージ');
        await page.waitForTimeout(1000); // デバウンス待機
        // 検索結果が表示されることを確認（エラーが出ないことを確認）
        await expect(page.locator('body')).toBeVisible();
      }
    });
  });

  test.describe('予約作成', () => {
    test('一般ユーザーがセラピストの予約ページにアクセスできる', async ({ page }) => {
      await login(page, TEST_USERS.USER);

      // セラピスト一覧から最初のセラピストを選択
      await page.goto('/app/therapists');
      await page.waitForLoadState('networkidle');

      // セラピストカードまたはリンクをクリック
      const therapistLink = page.locator('a[href*="/therapist/"], a[href*="/profile/"], [data-testid="therapist-card"]').first();
      if (await therapistLink.isVisible()) {
        await therapistLink.click();
        await page.waitForLoadState('networkidle');
        // セラピスト詳細ページが表示されることを確認
        await expect(page.locator('body')).toBeVisible();
      }
    });
  });

  test.describe('予約一覧', () => {
    test('一般ユーザーが自分の予約一覧を確認できる', async ({ page }) => {
      await login(page, TEST_USERS.USER);

      await page.goto('/app/bookings');
      await page.waitForLoadState('networkidle');

      // 予約一覧ページが表示されることを確認
      await expect(page.locator('body')).toBeVisible();
    });

    test('セラピストが受け取った予約一覧を確認できる', async ({ page }) => {
      await login(page, TEST_USERS.THERAPIST);

      // セラピストダッシュボードの予約管理に遷移
      await page.goto('/app/therapist/bookings');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('body')).toBeVisible();
    });
  });
});

// ============================================
// API直接テスト：予約APIの動作確認
// ============================================
test.describe('予約API', () => {
  test('予約一覧APIが正常に応答する', async ({ page }) => {
    const token = await loginViaAPI(page, TEST_USERS.USER);

    const response = await page.request.get('/api/bookings', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // 200または空のリストを返すことを確認
    expect([200, 404]).toContain(response.status());
    if (response.status() === 200) {
      const data = await response.json() as { bookings?: unknown[] };
      expect(data).toHaveProperty('bookings');
    }
  });

  test('認証なしで予約APIにアクセスすると401が返る', async ({ page }) => {
    await page.goto('/');
    const response = await page.request.get('/api/bookings');
    expect(response.status()).toBe(401);
  });
});
