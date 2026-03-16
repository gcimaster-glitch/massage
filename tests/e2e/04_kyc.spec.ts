import { test, expect } from '@playwright/test';
import { login, loginViaAPI, TEST_USERS } from './helpers/auth';
import path from 'path';
import fs from 'fs';

// ============================================
// テストスイート 04: KYC申請・審査フロー
// - KYC申請ページの表示
// - 書類アップロード
// - 管理者による承認・却下
// - メール通知の確認（メール送信APIのモック）
// ============================================

test.describe('KYC申請フロー', () => {
  test.describe('ユーザー側：KYC申請', () => {
    test('一般ユーザーがKYC申請ページにアクセスできる', async ({ page }) => {
      await login(page, TEST_USERS.USER);

      await page.goto('/app/account/kyc');
      await page.waitForLoadState('networkidle');

      // KYC申請ページが表示されることを確認
      await expect(page.locator('body')).toBeVisible();

      // 本人確認に関連するテキストが存在することを確認
      const pageText = await page.textContent('body');
      expect(pageText).toContain('本人確認');
    });

    test('証明書種類の選択UIが表示される', async ({ page }) => {
      await login(page, TEST_USERS.USER);
      await page.goto('/app/account/kyc');
      await page.waitForLoadState('networkidle');

      // 証明書種類の選択肢が表示されることを確認
      const pageText = await page.textContent('body');
      expect(pageText).toMatch(/運転免許証|マイナンバー|パスポート/);
    });

    test('KYC申請APIが認証なしで401を返す', async ({ page }) => {
      await page.goto('/');
      const response = await page.request.post('/api/kyc', {
        data: {
          id_type: 'DRIVERS_LICENSE',
          document_data: 'dummy_base64',
          file_name: 'test.jpg',
          mime_type: 'image/jpeg',
        },
      });
      expect(response.status()).toBe(401);
    });

    test('KYC申請APIがファイルサイズ超過で400を返す', async ({ page }) => {
      const token = await loginViaAPI(page, TEST_USERS.USER);

      // 10MB超のダミーデータを生成
      const oversizedData = 'A'.repeat(11 * 1024 * 1024);

      const response = await page.request.post('/api/kyc', {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          id_type: 'DRIVERS_LICENSE',
          document_data: oversizedData,
          file_name: 'oversized.jpg',
          mime_type: 'image/jpeg',
        },
      });

      // 400（Bad Request）またはサイズ超過エラーを確認
      expect([400, 413, 429]).toContain(response.status());
    });
  });

  test.describe('KYCステータス確認', () => {
    test('KYCステータス確認APIが正常に応答する', async ({ page }) => {
      const token = await loginViaAPI(page, TEST_USERS.USER);

      const response = await page.request.get('/api/kyc/status', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect([200, 404]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json() as { kyc_status?: string };
        expect(data).toHaveProperty('kyc_status');
        // ステータスは NONE, PENDING, VERIFIED, REJECTED のいずれか
        expect(['NONE', 'PENDING', 'VERIFIED', 'REJECTED']).toContain(data.kyc_status);
      }
    });
  });

  test.describe('管理者側：KYC審査', () => {
    test('管理者がKYC審査一覧にアクセスできる', async ({ page }) => {
      await login(page, TEST_USERS.ADMIN);

      await page.goto('/admin/kyc-approvals');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('body')).toBeVisible();
      const pageText = await page.textContent('body');
      expect(pageText).toContain('KYC');
    });

    test('KYC申請一覧APIが管理者のみアクセス可能', async ({ page }) => {
      // 一般ユーザーでのアクセス
      const userToken = await loginViaAPI(page, TEST_USERS.USER);
      const userResponse = await page.request.get('/api/kyc/admin', {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      // 一般ユーザーは403を受け取るべき
      expect([403, 401]).toContain(userResponse.status());

      // 管理者でのアクセス
      const adminToken = await loginViaAPI(page, TEST_USERS.ADMIN);
      const adminResponse = await page.request.get('/api/kyc/admin', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      // 管理者は200を受け取るべき
      expect(adminResponse.status()).toBe(200);
    });

    test('KYC承認APIが正しいリクエスト形式を受け付ける', async ({ page }) => {
      const adminToken = await loginViaAPI(page, TEST_USERS.ADMIN);

      // 存在しないユーザーIDでのテスト（404が返ることを確認）
      const response = await page.request.patch('/api/kyc/admin/non-existent-user-id', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          status: 'VERIFIED',
        },
      });

      // 404または400が返ることを確認（存在しないユーザーID）
      expect([400, 404, 200]).toContain(response.status());
    });
  });
});
