
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import RegisterSelect from './pages/auth/RegisterSelect';
import SignupUser from './pages/auth/SignupUser';
import SignupTherapist from './pages/auth/SignupTherapist';
import SignupHost from './pages/auth/SignupHost';
import SignupOffice from './pages/auth/SignupOffice';

// --- Portal (Public) ---
import PortalHome from './pages/portal/PortalHome';
import AboutPage from './pages/portal/About';
import BusinessStrategy from './pages/portal/BusinessStrategy'; // New
import NewsPage from './pages/portal/News';
import RecruitPage from './pages/portal/Recruit';
import TherapistListPage from './pages/portal/TherapistList';
import FeeStructure from './pages/portal/FeeStructure';

// --- User (Client) ---
import UserHome from './pages/user/UserHome';
import SiteDetail from './pages/user/SiteDetail';
import TherapistDetail from './pages/user/TherapistDetail';
import BookingNew from './pages/user/BookingNew';
import BookingDetail from './pages/user/BookingDetail';
import BookingReview from './pages/user/BookingReview';
import BookingSuccess from './pages/user/BookingSuccess';
import UserBookings from './pages/user/UserBookings';
import Account from './pages/user/Account';
import ProfileEdit from './pages/user/ProfileEdit';
import PaymentMethods from './pages/user/PaymentMethods';
import SafetySettings from './pages/user/SafetySettings';
import NotificationSettings from './pages/user/NotificationSettings';
import WellnessJournal from './pages/user/WellnessJournal';
import SubscriptionPlans from './pages/user/SubscriptionPlans';
import Gifting from './pages/user/Gifting';
import SiteMapSearch from './pages/user/SiteMapSearch';
import KYCVerification from './pages/shared/KYCVerification';
import SupportCenter from './pages/shared/SupportCenter';

// --- Therapist ---
import TherapistDashboard from './pages/therapist/Dashboard';
import TherapistCalendar from './pages/therapist/Calendar';
import TherapistEarnings from './pages/therapist/Earnings';
import TherapistSafety from './pages/therapist/Safety';
import TherapistProfile from './pages/therapist/Profile';
import ActiveSession from './pages/therapist/ActiveSession';
import SessionSummary from './pages/therapist/SessionSummary';
import BioEditor from './pages/therapist/BioEditor';

// --- Host ---
import HostDashboard from './pages/host/HostDashboard';
import HostSites from './pages/host/Sites';
import HostIncidents from './pages/host/HostIncidents';
import HostEarnings from './pages/host/HostEarnings';

// --- Affiliate ---
import AffiliateDashboard from './pages/affiliate/Dashboard';
import AffiliateEarnings from './pages/affiliate/Earnings';

// --- Agency (Office) ---
import OfficeDashboard from './pages/office/OfficeDashboard';
import OfficeTherapists from './pages/office/Therapists';
import OfficeRecruitment from './pages/office/Recruitment';
import OfficeRecruitmentDetail from './pages/office/RecruitmentDetail';
import OfficeEarnings from './pages/office/OfficeEarnings';
import OfficeSettings from './pages/office/OfficeSettings';
import OfficeSupportInbox from './pages/office/OfficeSupportInbox';
import OfficeMenuManagement from './pages/office/MenuManagement';
import OfficeSafety from './pages/office/OfficeSafety';

// --- Admin ---
import AdminDashboard from './pages/admin/Dashboard';
import AdminIncidents from './pages/admin/Incidents';
import AdminIncidentDetail from './pages/admin/IncidentDetail';
import AdminUserManagement from './pages/admin/UserManagement';
import AdminPayouts from './pages/admin/Payouts';
import AdminRevenueConfig from './pages/admin/RevenueConfig';
import AdminStripeDashboard from './pages/admin/StripeDashboard';
import AdminAffiliateManager from './pages/admin/AffiliateManager';
import AdminEmailSettings from './pages/admin/EmailSettings';
import AdminBookingLogs from './pages/admin/BookingLogs';
import AdminAnalytics from './pages/admin/Analytics';
import AdminPricingApprovals from './pages/admin/AdminPricingApprovals';
import AdminOfficeManagement from './pages/admin/OfficeManagement';
import AdminCorporateDashboard from './pages/admin/CorporateDashboard';
import AdminSupportInbox from './pages/admin/SupportInbox';
import AdminMarketingDashboard from './pages/admin/MarketingDashboard';

// --- Shared ---
import Chat from './pages/shared/Chat';
import Notifications from './pages/shared/Notifications';
import Legal from './pages/shared/Legal';

import { Role } from './types';

const RequireAuth: React.FC<any> = ({ children, allowedRoles, currentUser, onLogout }) => {
  const location = useLocation();
  if (!currentUser) return <Navigate to="/auth/login" state={{ from: location }} replace />;
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
     return <div className="p-20 text-center font-black bg-white rounded-[40px] m-10 shadow-xl border border-red-100 text-red-600">Access Denied: Insufficient Permissions</div>;
  }
  return <Layout currentUser={currentUser} onLogout={onLogout}>{children}</Layout>;
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{ role: Role; displayName: string } | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (role: Role, name?: string) => {
    let displayName = name || "Demo User";
    if (role === Role.ADMIN) displayName = "総管理者 (Root)";
    
    const user = { role, displayName };
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    window.location.href = '#/';
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Portal */}
        <Route path="/" element={<PortalHome />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/strategy" element={<BusinessStrategy />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/recruit" element={<RecruitPage />} />
        <Route path="/therapists" element={<TherapistListPage />} />
        <Route path="/fee" element={<FeeStructure />} />
        <Route path="/legal" element={<Legal />} />

        {/* Auth */}
        <Route path="/auth/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/auth/register-select" element={<RegisterSelect />} />
        <Route path="/auth/signup/user" element={<SignupUser />} />
        <Route path="/auth/signup/therapist" element={<SignupTherapist />} />
        <Route path="/auth/signup/host" element={<SignupHost />} />
        <Route path="/auth/signup/office" element={<SignupOffice />} />

        {/* User App */}
        <Route path="/app" element={<RequireAuth allowedRoles={[Role.USER, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><UserHome /></RequireAuth>} />
        <Route path="/app/map" element={<RequireAuth allowedRoles={[Role.USER, Role.ADMIN, Role.THERAPIST, Role.HOST]} currentUser={currentUser} onLogout={handleLogout}><SiteMapSearch /></RequireAuth>} />
        <Route path="/app/site/:siteId" element={<RequireAuth allowedRoles={[Role.USER, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><SiteDetail /></RequireAuth>} />
        <Route path="/app/therapist/:therapistId" element={<RequireAuth allowedRoles={[Role.USER, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><TherapistDetail /></RequireAuth>} />
        <Route path="/app/booking/new" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><BookingNew onAutoLogin={handleLogin} /></RequireAuth>} />
        <Route path="/app/booking/success" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><BookingSuccess /></RequireAuth>} />
        <Route path="/app/booking/:bookingId" element={<RequireAuth allowedRoles={[Role.USER, Role.THERAPIST, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><BookingDetail /></RequireAuth>} />
        <Route path="/app/booking/:bookingId/chat" element={<RequireAuth allowedRoles={[Role.USER, Role.THERAPIST, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><Chat /></RequireAuth>} />
        <Route path="/app/booking/:bookingId/review" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><BookingReview /></RequireAuth>} />
        <Route path="/app/bookings" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><UserBookings /></RequireAuth>} />
        
        {/* User Settings */}
        <Route path="/app/account" element={<RequireAuth allowedRoles={[Role.USER, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><Account onLogout={handleLogout} /></RequireAuth>} />
        <Route path="/app/account/profile" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><ProfileEdit /></RequireAuth>} />
        <Route path="/app/account/payment" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><PaymentMethods /></RequireAuth>} />
        <Route path="/app/account/safety" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><SafetySettings /></RequireAuth>} />
        <Route path="/app/account/notifications" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><NotificationSettings /></RequireAuth>} />
        <Route path="/app/account/wellness" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><WellnessJournal /></RequireAuth>} />
        <Route path="/app/account/kyc" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><KYCVerification /></RequireAuth>} />
        <Route path="/app/subscriptions" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><SubscriptionPlans /></RequireAuth>} />
        <Route path="/app/gifting" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><Gifting /></RequireAuth>} />
        <Route path="/app/support" element={<RequireAuth allowedRoles={[Role.USER, Role.ADMIN, Role.THERAPIST]} currentUser={currentUser} onLogout={handleLogout}><SupportCenter /></RequireAuth>} />

        {/* Therapist App */}
        <Route path="/t" element={<RequireAuth allowedRoles={[Role.THERAPIST, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><TherapistDashboard /></RequireAuth>} />
        <Route path="/t/calendar" element={<RequireAuth allowedRoles={[Role.THERAPIST]} currentUser={currentUser} onLogout={handleLogout}><TherapistCalendar /></RequireAuth>} />
        <Route path="/t/earnings" element={<RequireAuth allowedRoles={[Role.THERAPIST]} currentUser={currentUser} onLogout={handleLogout}><TherapistEarnings /></RequireAuth>} />
        <Route path="/t/safety" element={<RequireAuth allowedRoles={[Role.THERAPIST]} currentUser={currentUser} onLogout={handleLogout}><TherapistSafety /></RequireAuth>} />
        <Route path="/t/profile" element={<RequireAuth allowedRoles={[Role.THERAPIST]} currentUser={currentUser} onLogout={handleLogout}><TherapistProfile /></RequireAuth>} />
        <Route path="/t/bio" element={<RequireAuth allowedRoles={[Role.THERAPIST]} currentUser={currentUser} onLogout={handleLogout}><BioEditor /></RequireAuth>} />
        <Route path="/t/session/:bookingId" element={<RequireAuth allowedRoles={[Role.THERAPIST]} currentUser={currentUser} onLogout={handleLogout}><ActiveSession /></RequireAuth>} />
        <Route path="/t/session-summary/:bookingId" element={<RequireAuth allowedRoles={[Role.THERAPIST]} currentUser={currentUser} onLogout={handleLogout}><SessionSummary /></RequireAuth>} />

        {/* Agency (Office) App */}
        <Route path="/o" element={<RequireAuth allowedRoles={[Role.THERAPIST_OFFICE, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><OfficeDashboard /></RequireAuth>} />
        <Route path="/o/therapists" element={<RequireAuth allowedRoles={[Role.THERAPIST_OFFICE, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><OfficeTherapists /></RequireAuth>} />
        <Route path="/o/recruitment" element={<RequireAuth allowedRoles={[Role.THERAPIST_OFFICE, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><OfficeRecruitment /></RequireAuth>} />
        <Route path="/o/recruitment/:id" element={<RequireAuth allowedRoles={[Role.THERAPIST_OFFICE, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><OfficeRecruitmentDetail /></RequireAuth>} />
        <Route path="/o/earnings" element={<RequireAuth allowedRoles={[Role.THERAPIST_OFFICE, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><OfficeEarnings /></RequireAuth>} />
        <Route path="/o/settings" element={<RequireAuth allowedRoles={[Role.THERAPIST_OFFICE]} currentUser={currentUser} onLogout={handleLogout}><OfficeSettings /></RequireAuth>} />
        <Route path="/o/support" element={<RequireAuth allowedRoles={[Role.THERAPIST_OFFICE, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><OfficeSupportInbox /></RequireAuth>} />
        <Route path="/o/menu" element={<RequireAuth allowedRoles={[Role.THERAPIST_OFFICE, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><OfficeMenuManagement /></RequireAuth>} />
        <Route path="/o/safety" element={<RequireAuth allowedRoles={[Role.THERAPIST_OFFICE, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><OfficeSafety /></RequireAuth>} />

        {/* Host App */}
        <Route path="/h" element={<RequireAuth allowedRoles={[Role.HOST, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><HostDashboard /></RequireAuth>} />
        <Route path="/h/sites" element={<RequireAuth allowedRoles={[Role.HOST, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><HostSites /></RequireAuth>} />
        <Route path="/h/incidents" element={<RequireAuth allowedRoles={[Role.HOST, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><HostIncidents /></RequireAuth>} />
        <Route path="/h/earnings" element={<RequireAuth allowedRoles={[Role.HOST, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><HostEarnings /></RequireAuth>} />

        {/* Affiliate App */}
        <Route path="/affiliate" element={<RequireAuth allowedRoles={[Role.AFFILIATE, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><AffiliateDashboard /></RequireAuth>} />
        <Route path="/affiliate/earnings" element={<RequireAuth allowedRoles={[Role.AFFILIATE, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><AffiliateEarnings /></RequireAuth>} />

        {/* Admin App */}
        <Route path="/admin" element={<RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><AdminDashboard /></RequireAuth>} />
        <Route path="/admin/users" element={<RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><AdminUserManagement /></RequireAuth>} />
        <Route path="/admin/incidents" element={<RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><AdminIncidents /></RequireAuth>} />
        <Route path="/admin/incident/:id" element={<RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><AdminIncidentDetail /></RequireAuth>} />
        <Route path="/admin/payouts" element={<RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><AdminPayouts /></RequireAuth>} />
        <Route path="/admin/revenue-config" element={<RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><AdminRevenueConfig /></RequireAuth>} />
        <Route path="/admin/stripe" element={<RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><AdminStripeDashboard /></RequireAuth>} />
        <Route path="/admin/affiliates" element={<RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><AdminAffiliateManager /></RequireAuth>} />
        <Route path="/admin/emails" element={<RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><AdminEmailSettings /></RequireAuth>} />
        <Route path="/admin/logs" element={<RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><AdminBookingLogs /></RequireAuth>} />
        <Route path="/admin/analytics" element={<RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><AdminAnalytics /></RequireAuth>} />
        <Route path="/admin/pricing-approvals" element={<RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><AdminPricingApprovals /></RequireAuth>} />
        <Route path="/admin/offices" element={<RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><AdminOfficeManagement /></RequireAuth>} />
        <Route path="/admin/corporate" element={<RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><AdminCorporateDashboard /></RequireAuth>} />
        <Route path="/admin/support" element={<RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><AdminSupportInbox /></RequireAuth>} />
        <Route path="/admin/marketing" element={<RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><AdminMarketingDashboard /></RequireAuth>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {currentUser && (
        <div className="fixed bottom-4 left-4 z-[200]">
          <button onClick={handleLogout} className="bg-gray-800/80 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-2xl text-[10px] font-black flex items-center gap-2 opacity-50 hover:opacity-100 hover:scale-105 transition-all uppercase tracking-widest border border-white/10">
            <Shield size={12} /> Logout ({currentUser.role})
          </button>
        </div>
      )}
    </BrowserRouter>
  );
};

// Sub-component Helper
const Shield = ({ size, className = "" }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
  </svg>
);

export default App;
