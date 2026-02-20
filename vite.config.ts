import pages from '@hono/vite-cloudflare-pages'
import { defineConfig } from 'vite'

/**
 * Hono バックエンド ビルド設定
 * 
 * これは LAMP環境でいう「Apache + mod_php」に相当。
 * src/index.tsx（Hono）を dist/_worker.js にコンパイルする。
 * 
 * APIルート（/api/*）とSSR公開ページ（/, /recruit, /about等）を処理。
 * それ以外のパスは、distフォルダの静的ファイル（React SPA）にフォールバック。
 */
export default defineConfig({
  plugins: [
    pages({
      entry: 'src/index.tsx',
    }),
  ],
})
