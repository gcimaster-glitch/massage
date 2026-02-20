import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * React SPA クライアントビルド設定
 * 
 * LAMP環境でいう「HTML + JS + CSS」部分。
 * index.html → App.tsx → 各ページコンポーネントをビルド。
 * 
 * ビルド後は dist/ 内に静的ファイルとして配置され、
 * Cloudflare Pagesの静的配信で提供される。
 */
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: false,  // _worker.js を消さない
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'icons': ['lucide-react'],
          'admin': [
            './pages/admin/Dashboard',
            './pages/admin/Incidents',
            './pages/admin/IncidentDetail',
            './pages/admin/UserManagement',
            './pages/admin/Payouts',
            './pages/admin/RevenueConfig',
            './pages/admin/StripeDashboard',
            './pages/admin/AffiliateManager',
            './pages/admin/EmailSettings',
            './pages/admin/BookingLogs',
            './pages/admin/Analytics',
            './pages/admin/AdminPricingApprovals',
            './pages/admin/OfficeManagement',
            './pages/admin/SiteManagement',
            './pages/admin/CorporateDashboard',
            './pages/admin/SupportInbox',
            './pages/admin/MarketingDashboard'
          ],
          'therapist': [
            './pages/therapist/Dashboard',
            './pages/therapist/Calendar',
            './pages/therapist/Earnings',
            './pages/therapist/Safety',
            './pages/therapist/Profile',
            './pages/therapist/ActiveSession',
            './pages/therapist/SessionSummary',
            './pages/therapist/BioEditor'
          ],
          'host': [
            './pages/host/HostDashboard',
            './pages/host/Sites',
            './pages/host/HostIncidents',
            './pages/host/HostEarnings'
          ],
          'office': [
            './pages/office/OfficeDashboard',
            './pages/office/Therapists',
            './pages/office/Recruitment',
            './pages/office/RecruitmentDetail',
            './pages/office/OfficeEarnings',
            './pages/office/OfficeSettings',
            './pages/office/OfficeSupportInbox',
            './pages/office/MenuManagement',
            './pages/office/OfficeSafety'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
