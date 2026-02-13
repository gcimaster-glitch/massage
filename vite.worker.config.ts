import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pages from '@hono/vite-cloudflare-pages'

export default defineConfig({
  plugins: [
    pages(),
    react()
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Don't delete client assets
    rollupOptions: {
      input: './src/index.tsx' // Worker entry point
    }
  }
})
