import React, { useState, useEffect, useCallback, Suspense } from 'react';
import AppShell from '../components/layout/AppShell';
import { ErrorBoundary } from '../components/layout/ErrorBoundary';
import { ThemeProvider } from '../providers/ThemeProvider';
import { useTheme } from '../hooks/useTheme';
import ImpersonationModal from '../components/ui/ImpersonationModal';
import { ROUTES } from '../../config/routes';

// Lazy-loaded page components — each gets its own chunk
const Dashboard = React.lazy(() => import('../pages/super/Dashboard'));
const Hotels = React.lazy(() => import('../pages/super/Hotels'));
const HotelDetails = React.lazy(() => import('../pages/super/HotelDetails'));
const Plans = React.lazy(() => import('../pages/super/Plans'));
const KioskFleet = React.lazy(() => import('../pages/super/KioskFleet'));
const KioskDetail = React.lazy(() => import('../pages/super/KioskDetail'));
const Subscriptions = React.lazy(() => import('../pages/super/Subscriptions'));
const Invoices = React.lazy(() => import('../pages/super/Invoices'));
const Reports = React.lazy(() => import('../pages/super/Reports'));
const UsersManagement = React.lazy(() => import('../pages/super/UsersManagement'));
const AuditLogs = React.lazy(() => import('../pages/super/AuditLogs'));
const Helpdesk = React.lazy(() => import('../pages/super/Helpdesk'));
const AdminProfile = React.lazy(() => import('../pages/super/AdminProfile'));
const PlatformSettings = React.lazy(() => import('../pages/super/PlatformSettings'));
const Login = React.lazy(() => import('../pages/Login'));
// Hotel Side
const HotelDashboard = React.lazy(() => import('../pages/hotel/HotelDashboard'));
const GuestRegistry = React.lazy(() => import('../pages/hotel/GuestRegistry'));
const RoomManagement = React.lazy(() => import('../pages/hotel/RoomManagement'));
const BookingEngine = React.lazy(() => import('../pages/hotel/BookingEngine'));
const BillingHub = React.lazy(() => import('../pages/hotel/BillingHub'));
const IncidentsRecord = React.lazy(() => import('../pages/hotel/IncidentsRecord'));
const HotelUsers = React.lazy(() => import('../pages/hotel/HotelUsers'));
const HotelRoles = React.lazy(() => import('../pages/hotel/HotelRoles'));
const HotelHelp = React.lazy(() => import('../pages/hotel/HotelHelp'));
const HotelReports = React.lazy(() => import('../pages/hotel/HotelReports'));
const RateInventoryManager = React.lazy(() => import('../pages/hotel/RateInventoryManager'));
const SubscriptionBilling = React.lazy(() => import('../pages/hotel/SubscriptionBilling'));
const StaffProfile = React.lazy(() => import('../pages/hotel/StaffProfile'));
const PropertySettings = React.lazy(() => import('../pages/hotel/PropertySettings'));

// Invisible suspense fallback — matches background so there's no visual flash
const PageFallback = () => <div className="flex-1" />;

const AppContent: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [viewMode, setViewMode] = useState<'super' | 'hotel'>('super');
  const [currentRoute, setCurrentRoute] = useState<string>(ROUTES.DASHBOARD);
  const [selectedKiosk, setSelectedKiosk] = useState<string | null>(null);

  // Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Impersonation State
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedHotel, setImpersonatedHotel] = useState<string | null>(null);
  const [isImpModalOpen, setIsImpModalOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentRoute]);

  const handleNavigateToKiosk = useCallback((id: string) => {
    setSelectedKiosk(id);
    setCurrentRoute(ROUTES.KIOSK_DETAIL);
  }, []);

  const switchToHotel = useCallback(() => {
    setViewMode('hotel');
    setCurrentRoute(ROUTES.HOTEL_DASHBOARD);
  }, []);

  const switchToSuper = useCallback(() => {
    setViewMode('super');
    setCurrentRoute(ROUTES.DASHBOARD);
    setIsImpersonating(false);
    setImpersonatedHotel(null);
  }, []);

  const startImpersonation = useCallback((hotelName: string) => {
    setImpersonatedHotel(hotelName);
    setIsImpModalOpen(true);
  }, []);

  const confirmImpersonation = useCallback(() => {
    setIsImpModalOpen(false);
    setIsImpersonating(true);
    switchToHotel();
  }, [switchToHotel]);

  const handleLogin = useCallback((role: 'super' | 'hotel') => {
    setIsAuthenticated(true);
    if (role === 'hotel') {
      switchToHotel();
    } else {
      switchToSuper();
    }
  }, [switchToHotel, switchToSuper]);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const handleNavigate = useCallback((r: string) => {
    if (r === ROUTES.KIOSK_FLEET) handleNavigateToKiosk('ATC-SN-7766');
    else setCurrentRoute(r);
  }, [handleNavigateToKiosk]);

  const handleToggleCollapse = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  const handleCloseMobile = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleOpenMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(true);
  }, []);

  const handleCloseImpModal = useCallback(() => {
    setIsImpModalOpen(false);
  }, []);

  const handleBackToFleet = useCallback(() => {
    setCurrentRoute(ROUTES.KIOSK_FLEET);
  }, []);

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<PageFallback />}>
        <Login onLogin={handleLogin} />
      </Suspense>
    );
  }

  return (
    <AppShell
      currentRoute={currentRoute}
      viewMode={viewMode}
      isSidebarCollapsed={isSidebarCollapsed}
      isMobileMenuOpen={isMobileMenuOpen}
      isImpersonating={isImpersonating}
      impersonatedHotel={impersonatedHotel}
      onNavigate={handleNavigate}
      onSwitchBack={switchToSuper}
      onSwitchToHotel={switchToHotel}
      onToggleCollapse={handleToggleCollapse}
      onCloseMobile={handleCloseMobile}
      onOpenMobileMenu={handleOpenMobileMenu}
      onLogout={handleLogout}
    >
      <ErrorBoundary>
        <Suspense fallback={<PageFallback />}>
          {/* Super Admin Routes */}
          {viewMode === 'super' && (
            <>
              {currentRoute === ROUTES.DASHBOARD && <Dashboard />}
              {currentRoute === ROUTES.HOTELS && (
                <Hotels 
                  onNavigate={setCurrentRoute} 
                  onLoginAsAdmin={startImpersonation} 
                />
              )}
              {currentRoute === ROUTES.HOTEL_DETAILS && (
                <HotelDetails 
                  onNavigate={setCurrentRoute} 
                  onLoginAsAdmin={startImpersonation} 
                />
              )}
              {currentRoute === ROUTES.PLANS && <Plans />}
              {currentRoute === ROUTES.KIOSK_FLEET && <KioskFleet onNavigateDetail={handleNavigateToKiosk} />}
              {currentRoute === ROUTES.KIOSK_DETAIL && <KioskDetail kioskId={selectedKiosk || 'ATC-SN-7766'} onBack={handleBackToFleet} />}
              {currentRoute === ROUTES.SUBSCRIPTIONS && <Subscriptions onNavigate={setCurrentRoute} />}
              {currentRoute === ROUTES.INVOICES && <Invoices />}
              {currentRoute === ROUTES.REPORTS && <Reports />}
              {currentRoute === ROUTES.USERS_MGMT && <UsersManagement />}
              {currentRoute === ROUTES.AUDIT_LOGS && <AuditLogs />}
              {currentRoute === ROUTES.HELPDESK && <Helpdesk />}
              {currentRoute === ROUTES.PROFILE && <AdminProfile />}
              {currentRoute === ROUTES.PLATFORM_SETTINGS && <PlatformSettings />}
            </>
          )}

          {/* Hotel Admin Routes */}
          {viewMode === 'hotel' && (
            <>
              {currentRoute === ROUTES.HOTEL_DASHBOARD && <HotelDashboard />}
              {currentRoute === ROUTES.GUEST_REGISTRY && <GuestRegistry />}
              {currentRoute === ROUTES.ROOM_MGMT && <RoomManagement />}
              {currentRoute === ROUTES.BOOKING_ENGINE && <BookingEngine />}
              {currentRoute === ROUTES.RATE_INVENTORY && <RateInventoryManager />}
              {currentRoute === ROUTES.BILLING && <BillingHub />}
              {currentRoute === ROUTES.INCIDENTS && <IncidentsRecord />}
              {currentRoute === ROUTES.USER_MGMT && <HotelUsers />}
              {currentRoute === ROUTES.ROLE_MGMT && <HotelRoles />}
              {currentRoute === ROUTES.HELP && <HotelHelp />}
              {currentRoute === ROUTES.HOTEL_REPORTS && <HotelReports />}
              {currentRoute === ROUTES.HOTEL_PROFILE && <StaffProfile />}
              {currentRoute === ROUTES.HOTEL_SETTINGS && <PropertySettings />}
            </>
          )}
        </Suspense>
      </ErrorBoundary>

      <ImpersonationModal 
        isOpen={isImpModalOpen}
        onClose={handleCloseImpModal}
        onConfirm={confirmImpersonation}
        hotelName={impersonatedHotel || ''}
      />
    </AppShell>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
