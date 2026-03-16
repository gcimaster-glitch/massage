import { test, expect } from '@playwright/test';
import { login, logout, TEST_USERS } from './helpers/auth';

// ============================================
// テストスイート 01: 認証フロー
// - ログイン成功・失敗
// - ロール別ダッシュボードへのリダイレクト
// - ログアウト
// ============================================

test.describe('認証フロー', () => {
  test.describe('ログイン成功', () => {
    test('一般ユーザー（USER）がログインしてダッシュボードに遷移できる', async ({ page }) => {
      await login(page, TEST_USERS.USER);
      // ダッシュボードまたはホームページに遷移していることを確認
      await expect(page).not.toHaveURL(/\/login/);
      // ページタイトルまたは主要コンテンツの存在確認
      await expect(page.locator('body')).toBeVisible();
    });

    test('管理者（ADMIN）がログインして管理画面に遷移できる', async ({ page }) => {
      await login(page, TEST_USERS.ADMIN);
      await expect(page).not.toHaveURL(/\/login/);
      // 管理者向けナビゲーション要素の確認
      const adminNav = page.locator('[href*="/admin"], a:has-text("管理"), nav');
      await expect(adminNav.first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('ログイン失敗', () => {
    test('誤ったパスワードでログインが失敗する', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      await emailInput.fill(TEST_USERS.USER.email);

      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
      await passwordInput.fill('WrongPassword@999!');

      const loginButton = page.locator('button[type="submit"]').first();
      await loginButton.click();

      // ログインページに留まることを確認
      await page.waitForTimeout(3000);
      await expect(page).toHaveURL(/\/login/);
    });

    test('空のフォームでログインが失敗する', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      const loginButton = page.locator('button[type="submit"]').first();
      await loginButton.click();

      // ログインページに留まることを確認
      await page.waitForTimeout(2000);
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('ログアウト', () => {
    test('ログイン後にログアウトできる', async ({ page }) => {
      await login(page, TEST_USERS.USER);
      await expect(page).not.toHaveURL(/\/login/);

      await logout(page);
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('未認証アクセス制御', () => {
    test('未ログイン状態でダッシュボードにアクセスするとログインページにリダイレクトされる', async ({ page }) => {
      // localStorageをクリアして未認証状態にする
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());

      await page.goto('/app/dashboard');
      await page.waitForLoadState('networkidle');

      // ログインページへのリダイレクトを確認
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('未ログイン状態で管理画面にアクセスするとリダイレクトされる', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());

      await page.goto('/admin');
      await page.waitForLoadState('networkidle');

      // ログインページまたはアクセス拒否ページへのリダイレクトを確認
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/login|\/403|\/unauthorized/);
    });
  });
});
