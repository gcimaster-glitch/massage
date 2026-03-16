import { defineConfig, devices } from '@playwright/test';

/**
 * HOGUSY E2Eテスト設定
 * ローカル開発環境に対してテストを実行
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // 並列実行を無効化
  forbidOnly: !!process.env.CI,
  retries: 0, // CI以外ではリトライしない
  workers: 1, // 単一ワーカーで実行
  reporter: [
    ['html', { outputFolder: 'tests/e2e-report' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 30000, // アクションタイムアウトを30秒に延長
    navigationTimeout: 60000, // ナビゲーションタイムアウトを60秒に延長
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  timeout: 180000, // 全体タイムアウトを3分に延長

  // ローカル開発サーバーを自動起動
  webServer: {
    command: 'pnpm dev:full',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000, // サーバー起動タイムアウトを3分に延長
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
