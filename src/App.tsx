import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/auth/Login';

// --- Portal (Public) ---
import PortalHome from './pages/portal/PortalHome';
import AboutPage from './pages/portal/About';
import NewsPage from './pages/portal/News';
import RecruitPage from './pages/portal/Recruit';
import TherapistListPage from './pages/portal/TherapistList';

// --- User (Client) ---
import UserHome from './pages/user/UserHome';
import SiteDetail from './pages/user/SiteDetail';
import BookingNew from './pages/user/BookingNew';
import BookingDetail from './pages/user/BookingDetail';
import BookingReview from './pages/user/BookingReview';
import UserBookings from './pages/user/UserBookings';
import Account from './pages/user/Account';
import ProfileEdit from './pages/user/ProfileEdit';
import PaymentMethods from './pages/user/PaymentMethods';
import SafetySettings from './pages/user/SafetySettings';
import NotificationSettings from './pages/user/NotificationSettings';

// --- Therapist ---
import TherapistDashboard from './pages/therapist/Dashboard';
import TherapistCalendar from './pages/therapist/Calendar';
import TherapistEarnings from './pages/therapist/Earnings';
import TherapistSafety from './pages/therapist/Safety';
import TherapistProfile from './pages/therapist/Profile';

// --- Host ---
import HostDashboard from './pages/host/HostDashboard';
import HostSites from './pages/host/Sites';
import HostIncidents from './pages/host/HostIncidents';
import HostEarnings from './pages/host/HostEarnings';

// --- Affiliate ---
import AffiliateDashboard from './pages/affiliate/Dashboard';
import AffiliateEarnings from './pages/affiliate/Earnings';

// --- Admin ---
import AdminDashboard from './pages/admin/Dashboard';
import AdminIncidents from './pages/admin/Incidents';
import AdminRefunds from './pages/admin/Refunds';
import AdminUsers from './pages/admin/Users';
import AdminRevenueConfig from './pages/admin/RevenueConfig';
import AdminPayouts from './pages/admin/Payouts';

// --- Shared / Misc ---
import Chat from './pages/shared/Chat';
import Notifications from './pages/shared/Notifications';
import Legal from './pages/shared/Legal';
import { Role } from './types';
import { Settings } from 'lucide-react';

// Props for RequireAuth
interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  currentUser: { role: Role; displayName: string } | null;
  onLogout: () => void;
}

// Role Guard Component
const RequireAuth: React.FC<RequireAuthProps> = ({ children, allowedRoles, currentUser, onLogout }) => {
  const location = useLocation();
  
  if (!currentUser) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
         <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
           <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <span className="text-2xl font-bold">!</span>
           </div>
           <h2 className="text-gray-900 text-xl font-bold mb-2">アクセス権限がありません</h2>
           <p className="text-gray-600 mb-6 text-sm">
             現在のアカウント（{currentUser.role}）ではこのページにアクセスできません。
           </p>
           <button 
             onClick={onLogout}
             className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition-colors"
           >
             ログアウトして別のアカウントでログイン
           </button>
         </div>
       </div>
     );
  }
  return <Layout currentUser={currentUser} onLogout={onLogout}>{children}</Layout>;
};

// Props for PublicOnly
interface PublicOnlyProps {
  children: React.ReactNode;
  currentUser: { role: Role; displayName: string } | null;
  homePath: string;
}

// Redirect if already logged in
const PublicOnly: React.FC<PublicOnlyProps> = ({ children, currentUser, homePath }) => {
  if (currentUser) {
    return <Navigate to={homePath} replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  // Auth State with Persistence
  const [currentUser, setCurrentUser] = useState<{ role: Role; displayName: string } | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (role: Role) => {
    let name = "ユーザー";
    if (role === Role.USER) name = "山田 花子";
    if (role === Role.THERAPIST) name = "田中 有紀";
    if (role === Role.HOST) name = "ホテルグランド支配人";
    if (role === Role.AFFILIATE) name = "ウェルネスメディア運営部";
    if (role === Role.ADMIN) name = "システム管理者";
    
    const user = { role, displayName: name };
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  // Helper to determine home path by role
  const getHomePath = (role: Role) => {
    switch (role) {
      case Role.ADMIN: return '/admin';
      case Role.THERAPIST: return '/t';
      case Role.HOST: return '/h';
      case Role.AFFILIATE: return '/affiliate';
      default: return '/app';
    }
  };

  const homePath = currentUser ? getHomePath(currentUser.role) : '/auth/login';

  return (
    <HashRouter>
      <Routes>
        {/* --- Public Portal Routes --- */}
        <Route path="/" element={<PortalHome />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/therapists" element={<TherapistListPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/recruit" element={<RecruitPage />} />
        <Route path="/legal" element={<Legal />} />

        {/* --- Auth --- */}
        <Route path="/auth/login" element={
          <PublicOnly currentUser={currentUser} homePath={homePath}>
            <Login onLogin={handleLogin} />
          </PublicOnly>
        } />
        
        {/* --- Shared Authenticated Routes --- */}
        <Route path="/notifications" element={
          <RequireAuth currentUser={currentUser} onLogout={handleLogout}>
            <Notifications />
          </RequireAuth>
        } />
        {/* Chat accessible by User and Therapist involved in booking */}
        <Route path="/app/booking/:bookingId/chat" element={
          <RequireAuth allowedRoles={[Role.USER, Role.THERAPIST]} currentUser={currentUser} onLogout={handleLogout}>
            <Chat />
          </RequireAuth>
        } />

        {/* --- User Routes (Client) --- */}
        <Route path="/app" element={
          <RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}>
            <UserHome />
          </RequireAuth>
        } />
        <Route path="/app/site/:siteId" element={
          <RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}>
            <SiteDetail />
          </RequireAuth>
        } />
        <Route path="/app/booking/new" element={
          <RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}>
            <BookingNew />
          </RequireAuth>
        } />
        {/* Booking Detail: Accessible by User & Therapist */}
        <Route path="/app/booking/:bookingId" element={
          <RequireAuth allowedRoles={[Role.USER, Role.THERAPIST]} currentUser={currentUser} onLogout={handleLogout}>
            <BookingDetail />
          </RequireAuth>
        } />
        <Route path="/app/booking/:bookingId/review" element={
          <RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}>
            <BookingReview />
          </RequireAuth>
        } />
        <Route path="/app/bookings" element={
          <RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}>
            <UserBookings />
          </RequireAuth>
        } />
        
        {/* User Account & Settings */}
        <Route path="/app/account" element={
          <RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}>
            <Account onLogout={handleLogout} />
          </RequireAuth>
        } />
        <Route path="/app/account/profile" element={
          <RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}>
            <ProfileEdit />
          </RequireAuth>
        } />
        <Route path="/app/account/payment" element={
          <RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}>
            <PaymentMethods />
          </RequireAuth>
        } />
        <Route path="/app/account/safety" element={
          <RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}>
            <SafetySettings />
          </RequireAuth>
        } />
        <Route path="/app/account/notifications" element={
          <RequireAuth allowedRoles={[Role.USER]} currentUser={currentUser} onLogout={handleLogout}>
            <NotificationSettings />
          </RequireAuth>
        } />

        {/* --- Therapist Routes --- */}
        <Route path="/t" element={
          <RequireAuth allowedRoles={[Role.THERAPIST]} currentUser={currentUser} onLogout={handleLogout}>
            <TherapistDashboard />
          </RequireAuth>
        } />
        <Route path="/t/calendar" element={
          <RequireAuth allowedRoles={[Role.THERAPIST]} currentUser={currentUser} onLogout={handleLogout}>
            <TherapistCalendar />
          </RequireAuth>
        } />
        <Route path="/t/earnings" element={
          <RequireAuth allowedRoles={[Role.THERAPIST]} currentUser={currentUser} onLogout={handleLogout}>
            <TherapistEarnings />
          </RequireAuth>
        } />
        <Route path="/t/safety" element={
          <RequireAuth allowedRoles={[Role.THERAPIST]} currentUser={currentUser} onLogout={handleLogout}>
            <TherapistSafety />
          </RequireAuth>
        } />
        <Route path="/t/profile" element={
          <RequireAuth allowedRoles={[Role.THERAPIST]} currentUser={currentUser} onLogout={handleLogout}>
            <TherapistProfile />
          </RequireAuth>
        } />

        {/* --- Host Routes --- */}
        <Route path="/h" element={
          <RequireAuth allowedRoles={[Role.HOST]} currentUser={currentUser} onLogout={handleLogout}>
            <HostDashboard />
          </RequireAuth>
        } />
        <Route path="/h/sites" element={
          <RequireAuth allowedRoles={[Role.HOST]} currentUser={currentUser} onLogout={handleLogout}>
            <HostSites />
          </RequireAuth>
        } />
        <Route path="/h/incidents" element={
          <RequireAuth allowedRoles={[Role.HOST]} currentUser={currentUser} onLogout={handleLogout}>
            <HostIncidents />
          </RequireAuth>
        } />
        <Route path="/h/earnings" element={
          <RequireAuth allowedRoles={[Role.HOST]} currentUser={currentUser} onLogout={handleLogout}>
            <HostEarnings />
          </RequireAuth>
        } />

        {/* --- Affiliate Routes --- */}
        <Route path="/affiliate" element={
          <RequireAuth allowedRoles={[Role.AFFILIATE]} currentUser={currentUser} onLogout={handleLogout}>
            <AffiliateDashboard />
          </RequireAuth>
        } />
        <Route path="/affiliate/earnings" element={
          <RequireAuth allowedRoles={[Role.AFFILIATE]} currentUser={currentUser} onLogout={handleLogout}>
            <AffiliateEarnings />
          </RequireAuth>
        } />

        {/* --- Admin Routes --- */}
        <Route path="/admin" element={
          <RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}>
            <AdminDashboard />
          </RequireAuth>
        } />
        <Route path="/admin/incidents" element={
          <RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}>
            <AdminIncidents />
          </RequireAuth>
        } />
        <Route path="/admin/refunds" element={
          <RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}>
            <AdminRefunds />
          </RequireAuth>
        } />
        <Route path="/admin/users" element={
          <RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}>
            <AdminUsers />
          </RequireAuth>
        } />
        <Route path="/admin/revenue-config" element={
          <RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}>
            <AdminRevenueConfig />
          </RequireAuth>
        } />
        <Route path="/admin/payouts" element={
          <RequireAuth allowedRoles={[Role.ADMIN]} currentUser={currentUser} onLogout={handleLogout}>
            <AdminPayouts />
          </RequireAuth>
        } />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to={currentUser ? getHomePath(currentUser.role) : "/"} replace />} />
      </Routes>

      {/* DevTools: Quick Logout Switcher */}
      {currentUser && (
        <div className="fixed bottom-4 left-4 z-50">
          <button 
            onClick={handleLogout}
            className="bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-700 text-xs flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity"
            title="デバッグ用: ログアウト"
          >
            <Settings size={14} /> ログアウト ({currentUser.role})
          </button>
        </div>
      )}
    </HashRouter>
  );
};

export default App;