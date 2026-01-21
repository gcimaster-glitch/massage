
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import UnifiedLogin from './pages/auth/UnifiedLogin';
import UnifiedRegister from './pages/auth/UnifiedRegister';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import TherapistLP from './pages/partner/TherapistLP';
import HostLP from './pages/partner/HostLP';
import OfficeLP from './pages/partner/OfficeLP';
import LoginUser from './pages/auth/LoginUser';
import LoginTherapist from './pages/auth/LoginTherapist';
import LoginOffice from './pages/auth/LoginOffice';
import LoginHost from './pages/auth/LoginHost';
import LoginAffiliate from './pages/auth/LoginAffiliate';
import LoginAdmin from './pages/auth/LoginAdmin';
import RegisterSelect from './pages/auth/RegisterSelect';
import SignupUser from './pages/auth/SignupUser';
import SignupTherapist from './pages/auth/SignupTherapist';
import SignupHost from './pages/auth/SignupHost';
import SignupOffice from './pages/auth/SignupOffice';

// --- Index List (Development Only) ---
import IndexList from './pages/IndexList';
import DevLogin from './pages/dev/DevLogin';

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
import UserHomeNew from './pages/user/UserHomeNew';
import UserDashboard from './pages/user/UserDashboard';
import SiteDetail from './pages/user/SiteDetail';
import TherapistDetail from './pages/user/TherapistDetail';
import BookingNew from './pages/user/BookingNew';
import BookingNewFlow from './pages/user/BookingNewFlow';
import BookingDetail from './pages/user/BookingDetail';
import BookingReview from './pages/user/BookingReview';
import BookingSuccess from './pages/user/BookingSuccess';
import UserBookings from './pages/user/UserBookings';
import UserBookingDetail from './pages/user/BookingDetail';
import Account from './pages/user/Account';
import ProfileEdit from './pages/user/ProfileEdit';
import PaymentMethods from './pages/user/PaymentMethods';
import PaymentHistory from './pages/user/PaymentHistory';
import SafetySettings from './pages/user/SafetySettings';
import NotificationSettings from './pages/user/NotificationSettings';
import WellnessJournal from './pages/user/WellnessJournal';
import SubscriptionPlans from './pages/user/SubscriptionPlans';
import Gifting from './pages/user/Gifting';
import SiteMapSearch from './pages/user/SiteMapSearch';
import SitesList from './pages/user/SitesList';
import KYCVerification from './pages/shared/KYCVerification';
import SupportCenter from './pages/shared/SupportCenter';

// --- Booking Flow Components ---
import SimpleBookingWrapper from './components/booking/SimpleBookingWrapper';
import SimpleBookingWrapperV2 from './components/booking/SimpleBookingWrapperV2';
import BookingPaymentV2 from './components/booking/BookingPaymentV2';
import BookingCompleteV2 from './components/booking/BookingCompleteV2';

// --- Therapist ---
import TherapistDashboard from './pages/therapist/Dashboard';
import TherapistBookingList from './pages/therapist/BookingList';
import TherapistBookingDetail from './pages/therapist/BookingDetail';
import TherapistCalendar from './pages/therapist/Calendar';
import TherapistEarnings from './pages/therapist/Earnings';
import TherapistSafety from './pages/therapist/Safety';
import TherapistProfile from './pages/therapist/Profile';
import TherapistProfileManagement from './pages/therapist/ProfileManagement';
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
import AdminKYCApprovals from './pages/admin/KYCApprovals';
import AdminOfficeManagement from './pages/admin/OfficeManagement';
import AdminTherapistOfficeManagement from './pages/admin/OfficeManagement';
import AdminSiteManagement from './pages/admin/SiteManagement';
import AdminCorporateDashboard from './pages/admin/CorporateDashboard';
import AdminSupportInbox from './pages/admin/SupportInbox';
import AdminMarketingDashboard from './pages/admin/MarketingDashboard';
import MockDataManager from './pages/admin/MockDataManager';
import ImageUpload from './pages/admin/ImageUpload';

// --- Shared ---
import Chat from './pages/shared/Chat';
import Notifications from './pages/shared/Notifications';
import Legal from './pages/shared/Legal';
import CommercialTransaction from './pages/shared/CommercialTransaction';

import { Role } from './types';

// MAPからの予約リダイレクト
const RedirectToSiteDetail: React.FC = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (siteId) {
      navigate(`/app/site/${siteId}`, { replace: true });
    } else {
      navigate('/app/sites', { replace: true });
    }
  }, [siteId, navigate]);
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">リダイレクト中...</p>
      </div>
    </div>
  );
};

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
    if (saved) {
      return JSON.parse(saved);
    }
    
    // currentUserがない場合、auth_tokenからユーザー情報を復元
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        // JWT Base64デコード（日本語対応）
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        
        // roleをRole enumに変換
        let role = Role.USER;
        if (payload.role === 'ADMIN') role = Role.ADMIN;
        else if (payload.role === 'THERAPIST') role = Role.THERAPIST;
        else if (payload.role === 'HOST') role = Role.HOST;
        else if (payload.role === 'THERAPIST_OFFICE') role = Role.THERAPIST_OFFICE;
        else if (payload.role === 'AFFILIATE') role = Role.AFFILIATE;
        
        const displayName = payload.userName || payload.name || 'ユーザー';
        const user = { role, displayName };
        
        // currentUserを保存
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
      } catch (e) {
        console.error('Failed to decode token:', e);
        // トークンが無効な場合は削除
        localStorage.removeItem('auth_token');
        return null;
      }
    }
    
    return null;
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
    localStorage.removeItem('auth_token'); // Also remove auth token
    window.location.href = '/'; // Navigate to root without hash
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Development Only - Index List */}
        <Route path="/indexlist" element={<IndexList />} />
        <Route path="/dev/login" element={<DevLogin onLogin={handleLogin} />} />
        
        {/* Public Portal */}
        <Route path="/" element={<PortalHome />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/strategy" element={<BusinessStrategy />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/recruit" element={<RecruitPage />} />
        <Route path="/therapists" element={<TherapistListPage />} />
        <Route path="/fee" element={<FeeStructure />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/commercial-transaction" element={<CommercialTransaction />} />

        {/* ========================================== */}
        {/* Authentication Routes - New Structure */}
        {/* ========================================== */}
        
        {/* User Login & Registration */}
        <Route path="/login" element={<LoginUser onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignupUser />} />
        
        {/* Therapist Login & Registration */}
        <Route path="/therapist/login" element={<LoginTherapist onLogin={handleLogin} />} />
        <Route path="/therapist/join" element={<SignupTherapist />} />
        
        {/* Host (Facility) Login & Registration */}
        <Route path="/host/login" element={<LoginHost onLogin={handleLogin} />} />
        <Route path="/host/join" element={<SignupHost />} />
        
        {/* Therapist Office Login & Registration */}
        <Route path="/office/login" element={<LoginOffice onLogin={handleLogin} />} />
        <Route path="/office/join" element={<SignupOffice />} />
        
        {/* Admin Login */}
        <Route path="/admin/login" element={<LoginAdmin onLogin={handleLogin} />} />
        
        {/* Affiliate Login (optional) */}
        <Route path="/affiliate/login" element={<LoginAffiliate onLogin={handleLogin} />} />
        
        {/* NEW Unified Auth Routes */}
        <Route path="/auth/login" element={<UnifiedLogin />} />
        <Route path="/auth/register" element={<UnifiedRegister />} />
        <Route path="/auth/register/user" element={<UnifiedRegister />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        
        {/* Partner Landing Pages */}
        <Route path="/therapist-lp" element={<TherapistLP />} />
        <Route path="/host-lp" element={<HostLP />} />
        <Route path="/office-lp" element={<OfficeLP />} />
        
        {/* Legacy Auth Routes (kept for compatibility) */}
        <Route path="/auth/login/user" element={<LoginUser onLogin={handleLogin} />} />
        <Route path="/auth/login/therapist" element={<LoginTherapist onLogin={handleLogin} />} />
        <Route path="/auth/login/office" element={<LoginOffice onLogin={handleLogin} />} />
        <Route path="/auth/login/host" element={<LoginHost onLogin={handleLogin} />} />
        <Route path="/auth/login/affiliate" element={<LoginAffiliate onLogin={handleLogin} />} />
        <Route path="/auth/login/admin" element={<LoginAdmin onLogin={handleLogin} />} />
        <Route path="/auth/register-select" element={<RegisterSelect />} />
        <Route path="/auth/signup/user" element={<SignupUser />} />
        <Route path="/auth/signup/therapist" element={<SignupTherapist />} />
        <Route path="/auth/signup/host" element={<SignupHost />} />
        <Route path="/auth/signup/office" element={<SignupOffice />} />

        {/* User App - Public pages (no auth required) */}
        <Route path="/app" element={<RequireAuth allowedRoles={[Role.USER, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><UserDashboard onLogout={handleLogout} /></RequireAuth>} />
        <Route path="/app/home-old" element={<RequireAuth allowedRoles={[Role.USER, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><UserHome /></RequireAuth>} />
        <Route path="/app/home-new" element={<UserHomeNew currentUser={currentUser} />} />
        <Route path="/app/map" element={<SiteMapSearch />} />
        <Route path="/app/sites" element={<SitesList />} />
        <Route path="/app/site/:siteId" element={<SiteDetail />} />
        <Route path="/app/therapist/:therapistId" element={<TherapistDetail />} />
        
        {/* User App - Auth required pages */}
        {/* New Simple Booking Flow V2 (Guest-friendly) */}
        <Route path="/app/booking/v2/:therapistId" element={<SimpleBookingWrapperV2 />} />
        <Route path="/app/booking/payment/:bookingId" element={<BookingPaymentV2 />} />
        <Route path="/app/booking/complete/:bookingId" element={<BookingCompleteV2 />} />
        
        {/* New Simple Booking Flow */}
        <Route path="/app/booking/:therapistId" element={<SimpleBookingWrapper />} />
        <Route path="/booking/:therapistId" element={<SimpleBookingWrapper />} />
        
        {/* Legacy routes - redirect to simple flow v2 */}
        <Route path="/app/booking/direct/:therapistId" element={<SimpleBookingWrapperV2 />} />
        <Route path="/booking/direct/:therapistId" element={<SimpleBookingWrapperV2 />} />
        <Route path="/app/booking/from-therapist/:therapistId" element={<SimpleBookingWrapperV2 />} />
        <Route path="/booking/from-therapist/:therapistId" element={<SimpleBookingWrapperV2 />} />
        
        {/* Disabled routes - redirect to home */}
        <Route 
          path="/app/booking/from-map/:siteId" 
          element={
            <RedirectToSiteDetail />
          } 
        />
        <Route 
          path="/booking/from-map/:siteId" 
          element={
            <RedirectToSiteDetail />
          } 
        />
        <Route path="/app/booking/ai" element={<Navigate to="/" replace />} />
        <Route path="/booking/ai" element={<Navigate to="/" replace />} />
        
        {/* Legacy Booking Routes (kept for compatibility) */}
        <Route path="/app/booking/new" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><BookingNewFlow /></RequireAuth>} />
        <Route path="/app/booking/new-old" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><BookingNew onAutoLogin={handleLogin} /></RequireAuth>} />
        <Route path="/app/booking/success" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><BookingSuccess /></RequireAuth>} />
        <Route path="/app/booking/:bookingId" element={<RequireAuth allowedRoles={[Role.USER, Role.THERAPIST, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><BookingDetail /></RequireAuth>} />
        <Route path="/app/booking/:bookingId/chat" element={<RequireAuth allowedRoles={[Role.USER, Role.THERAPIST, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><Chat /></RequireAuth>} />
        <Route path="/app/booking/:bookingId/review" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><BookingReview /></RequireAuth>} />
        <Route path="/app/bookings" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><UserBookings /></RequireAuth>} />
        <Route path="/app/booking/:id" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><UserBookingDetail /></RequireAuth>} />
        
        {/* User Settings */}
        <Route path="/app/account" element={<RequireAuth allowedRoles={[Role.USER, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><Account onLogout={handleLogout} /></RequireAuth>} />
        <Route path="/app/account/profile" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><ProfileEdit /></RequireAuth>} />
        <Route path="/app/account/payment" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><PaymentMethods /></RequireAuth>} />
        <Route path="/app/account/payment-history" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><PaymentHistory /></RequireAuth>} />
        <Route path="/app/account/safety" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><SafetySettings /></RequireAuth>} />
        <Route path="/app/account/notifications" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><NotificationSettings /></RequireAuth>} />
        <Route path="/app/account/wellness" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><WellnessJournal /></RequireAuth>} />
        <Route path="/app/account/kyc" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><KYCVerification /></RequireAuth>} />
        <Route path="/app/subscriptions" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><SubscriptionPlans /></RequireAuth>} />
        <Route path="/app/gifting" element={<RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}><Gifting /></RequireAuth>} />
        <Route path="/app/support" element={<RequireAuth allowedRoles={[Role.USER, Role.ADMIN, Role.THERAPIST]} currentUser={currentUser} onLogout={handleLogout}><SupportCenter /></RequireAuth>} />

        {/* Therapist App */}
        <Route path="/t" element={<RequireAuth allowedRoles={[Role.THERAPIST, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><TherapistDashboard /></RequireAuth>} />
        <Route path="/t/bookings" element={<RequireAuth allowedRoles={[Role.THERAPIST, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><TherapistBookingList /></RequireAuth>} />
        <Route path="/t/bookings/:id" element={<RequireAuth allowedRoles={[Role.THERAPIST, Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><TherapistBookingDetail /></RequireAuth>} />
        <Route path="/t/calendar" element={<RequireAuth allowedRoles={[Role.THERAPIST]} currentUser={currentUser} onLogout={handleLogout}><TherapistCalendar /></RequireAuth>} />
        <Route path="/t/earnings" element={<RequireAuth allowedRoles={[Role.THERAPIST]} currentUser={currentUser} onLogout={handleLogout}><TherapistEarnings /></RequireAuth>} />
        <Route path="/t/safety" element={<RequireAuth allowedRoles={[Role.THERAPIST]} currentUser={currentUser} onLogout={handleLogout}><TherapistSafety /></RequireAuth>} />
        <Route path="/t/profile" element={<RequireAuth allowedRoles={[Role.THERAPIST]} currentUser={currentUser} onLogout={handleLogout}><TherapistProfile /></RequireAuth>} />
        <Route path="/t/profile-management" element={<RequireAuth allowedRoles={[Role.THERAPIST]} currentUser={currentUser} onLogout={handleLogout}><TherapistProfileManagement /></RequireAuth>} />
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
        <Route path="/admin/kyc-approvals" element={<RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><AdminKYCApprovals /></RequireAuth>} />
        <Route path="/admin/offices" element={<RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><AdminOfficeManagement /></RequireAuth>} />
        <Route path="/admin/office-management" element={<RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><AdminTherapistOfficeManagement /></RequireAuth>} />
        <Route path="/admin/site-management" element={<RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><AdminSiteManagement /></RequireAuth>} />
        <Route path="/admin/corporate" element={<RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><AdminCorporateDashboard /></RequireAuth>} />
        <Route path="/admin/support" element={<RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><AdminSupportInbox /></RequireAuth>} />
        <Route path="/admin/marketing" element={<RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><AdminMarketingDashboard /></RequireAuth>} />
        <Route path="/admin/images" element={<RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><ImageUpload /></RequireAuth>} />
        <Route path="/admin/mock-data" element={<RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}><MockDataManager /></RequireAuth>} />

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
