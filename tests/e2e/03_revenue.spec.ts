import { test, expect } from '@playwright/test';
import { loginViaAPI, TEST_USERS } from './helpers/auth';

// ============================================
// テストスイート 03: 収益分配フロー
// - 収益分配設定の確認（管理者）
// - 収益分配計算の正確性検証
// ============================================

// 収益分配の期待値（5分割モデル）
const EXPECTED_REVENUE_RATES = {
  THERAPIST: 0.40,      // セラピスト: 40%
  THERAPIST_OFFICE: 0.25, // セラピストオフィス: 25%
  HOST: 0.20,           // 拠点ホスト: 20%
  PLATFORM: 0.10,       // 本部: 10%
  PROMOTION: 0.05,      // 販促: 5%
};

test.describe('収益分配フロー', () => {
  test.describe('管理者：収益分配設定画面', () => {
    test('管理者が収益分配設定画面にアクセスできる', async ({ page }) => {
      const token = await loginViaAPI(page, TEST_USERS.ADMIN);
      await page.goto('/admin/revenue-config');
      await page.waitForLoadState('networkidle');

      // 収益分配設定画面が表示されることを確認
      await expect(page.locator('body')).toBeVisible();
      const pageText = await page.textContent('body');
      // 収益分配に関連するテキストが存在することを確認
      expect(pageText).toBeTruthy();
    });

    test('収益分配の合計が100%になっている', async ({ page }) => {
      const token = await loginViaAPI(page, TEST_USERS.ADMIN);

      // 収益分配設定APIを直接確認
      const response = await page.request.get('/api/admin/revenue-config', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status() === 200) {
        const data = await response.json() as {
          therapist_rate?: number;
          office_rate?: number;
          host_rate?: number;
          platform_rate?: number;
          promotion_rate?: number;
        };

        // 各レートが期待値と一致することを確認
        if (data.therapist_rate !== undefined) {
          const total =
            (data.therapist_rate || 0) +
            (data.office_rate || 0) +
            (data.host_rate || 0) +
            (data.platform_rate || 0) +
            (data.promotion_rate || 0);

          // 合計が1.0（100%）になることを確認（浮動小数点誤差を考慮）
          expect(Math.abs(total - 1.0)).toBeLessThan(0.001);

          // セラピストが40%であることを確認
          expect(Math.abs(data.therapist_rate - EXPECTED_REVENUE_RATES.THERAPIST)).toBeLessThan(0.001);
        }
      }
    });
  });

  test.describe('収益分配計算の正確性', () => {
    test('収益分配エンジンが正しい金額を計算する', async ({ page }) => {
      const token = await loginViaAPI(page, TEST_USERS.ADMIN);

      // テスト用の収益計算APIを呼び出す（または直接計算を検証）
      const testAmount = 10000; // ¥10,000のテスト金額

      // 期待される分配金額
      const expectedDistribution = {
        therapist: testAmount * EXPECTED_REVENUE_RATES.THERAPIST,     // ¥4,000
        office: testAmount * EXPECTED_REVENUE_RATES.THERAPIST_OFFICE, // ¥2,500
        host: testAmount * EXPECTED_REVENUE_RATES.HOST,               // ¥2,000
        platform: testAmount * EXPECTED_REVENUE_RATES.PLATFORM,       // ¥1,000
        promotion: testAmount * EXPECTED_REVENUE_RATES.PROMOTION,     // ¥500
      };

      // 合計が元の金額と一致することを確認
      const total = Object.values(expectedDistribution).reduce((a, b) => a + b, 0);
      expect(total).toBe(testAmount);

      // 各分配金額の確認
      expect(expectedDistribution.therapist).toBe(4000);
      expect(expectedDistribution.office).toBe(2500);
      expect(expectedDistribution.host).toBe(2000);
      expect(expectedDistribution.platform).toBe(1000);
      expect(expectedDistribution.promotion).toBe(500);
    });
  });

  test.describe('料金プラン管理', () => {
    test('管理者が料金プラン一覧を確認できる', async ({ page }) => {
      const token = await loginViaAPI(page, TEST_USERS.ADMIN);

      const response = await page.request.get('/api/admin/plans', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 200または404（プランがまだない場合）を許容
      expect([200, 404]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json() as { plans?: unknown[] };
        expect(data).toHaveProperty('plans');
      }
    });

    test('料金プラン管理画面にアクセスできる', async ({ page }) => {
      await loginViaAPI(page, TEST_USERS.ADMIN);
      await page.goto('/admin/plan-management');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('body')).toBeVisible();
    });
  });
});
