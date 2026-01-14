import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        manualChunks: {
          // Vendor chunk for large libraries
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          // Lucide icons in separate chunk
          'icons': ['lucide-react'],
          // Admin pages in separate chunk (lazy loaded)
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
          // Therapist pages in separate chunk
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
          // Host pages in separate chunk
          'host': [
            './pages/host/HostDashboard',
            './pages/host/Sites',
            './pages/host/HostIncidents',
            './pages/host/HostEarnings'
          ],
          // Office pages in separate chunk
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
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000
  }
})
