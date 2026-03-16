import { Page, expect } from '@playwright/test';

// ============================================
// HOGUSY E2Eテスト 認証ヘルパー
// ============================================

export interface TestUser {
  email: string;
  password: string;
  role: string;
  name: string;
}

/**
 * テスト用ユーザーアカウント定義
 * ※本番環境でのテストには専用テストアカウントを使用すること
 * ※パスワードは環境変数から取得することを推奨
 */
export const TEST_USERS: Record<string, TestUser> = {
  USER: {
    email: process.env.TEST_USER_EMAIL || 'test-user@hogusy-test.com',
    password: process.env.TEST_USER_PASSWORD || 'TestUser@2024!',
    role: 'USER',
    name: 'テストユーザー',
  },
  THERAPIST: {
    email: process.env.TEST_THERAPIST_EMAIL || 'test-therapist@hogusy-test.com',
    password: process.env.TEST_THERAPIST_PASSWORD || 'TestTherapist@2024!',
    role: 'THERAPIST',
    name: 'テストセラピスト',
  },
  HOST: {
    email: process.env.TEST_HOST_EMAIL || 'test-host@hogusy-test.com',
    password: process.env.TEST_HOST_PASSWORD || 'TestHost@2024!',
    role: 'HOST',
    name: 'テスト拠点ホスト',
  },
  THERAPIST_OFFICE: {
    email: process.env.TEST_OFFICE_EMAIL || 'test-office@hogusy-test.com',
    password: process.env.TEST_OFFICE_PASSWORD || 'TestOffice@2024!',
    role: 'THERAPIST_OFFICE',
    name: 'テストセラピストオフィス',
  },
  ADMIN: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@hogusy-test.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'TestAdmin@2024!',
    role: 'ADMIN',
    name: 'テスト管理者',
  },
  AFFILIATE: {
    email: process.env.TEST_AFFILIATE_EMAIL || 'test-affiliate@hogusy-test.com',
    password: process.env.TEST_AFFILIATE_PASSWORD || 'TestAffiliate@2024!',
    role: 'AFFILIATE',
    name: 'テストアフィリエイター',
  },
};

/**
 * ログイン処理
 * @param page Playwrightのページオブジェクト
 * @param user ログインするユーザー情報
 */
export async function login(page: Page, user: TestUser): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // メールアドレス入力
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  await emailInput.fill(user.email);

  // パスワード入力
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  await passwordInput.fill(user.password);

  // ログインボタンクリック
  const loginButton = page.locator('button[type="submit"]').first();
  await loginButton.click();

  // ログイン完了を待機（URLの変化またはダッシュボード要素の出現）
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
}

/**
 * ログアウト処理
 */
export async function logout(page: Page): Promise<void> {
  // ログアウトボタンを探してクリック
  const logoutButton = page.locator('[data-testid="logout"], button:has-text("ログアウト")').first();
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await page.waitForURL('/login', { timeout: 10000 });
  } else {
    // 直接ログインページに遷移
    await page.goto('/login');
  }
}

/**
 * APIトークンを使った直接認証（UIをスキップして高速化）
 */
export async function loginViaAPI(page: Page, user: TestUser): Promise<string> {
  const response = await page.request.post('/api/auth/login', {
    data: {
      email: user.email,
      password: user.password,
    },
  });

  if (!response.ok()) {
    throw new Error(`ログインAPI失敗: ${response.status()} ${await response.text()}`);
  }

  const data = await response.json() as { token?: string };
  const token = data.token;
  if (!token) {
    throw new Error('トークンが返されませんでした');
  }

  // localStorageにトークンを設定
  await page.goto('/');
  await page.evaluate((t) => {
    localStorage.setItem('auth_token', t);
  }, token);

  return token;
}
