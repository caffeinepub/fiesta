import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useGetCallerUserProfile';
import LandingPage from './pages/LandingPage';
import GuestEventManagement from './pages/GuestEventManagement';
import GuestOrganizerBrowsing from './pages/GuestOrganizerBrowsing';
import OrganizerComparison from './pages/OrganizerComparison';
import GuestBookings from './pages/GuestBookings';
import OrganizerDashboard from './pages/OrganizerDashboard';
import OrganizerBookingManagement from './pages/OrganizerBookingManagement';
import AdminDashboard from './pages/AdminDashboard';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

function Layout() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {showProfileSetup && <ProfileSetupModal />}
    </div>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const guestEventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/guest/events',
  component: GuestEventManagement,
});

const guestOrganizersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/guest/organizers',
  component: GuestOrganizerBrowsing,
});

const organizerComparisonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/guest/organizers/compare',
  component: OrganizerComparison,
});

const guestBookingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/guest/bookings',
  component: GuestBookings,
});

const organizerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/organizer/dashboard',
  component: OrganizerDashboard,
});

const organizerBookingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/organizer/bookings',
  component: OrganizerBookingManagement,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/dashboard',
  component: AdminDashboard,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  guestEventsRoute,
  guestOrganizersRoute,
  organizerComparisonRoute,
  guestBookingsRoute,
  organizerDashboardRoute,
  organizerBookingsRoute,
  adminDashboardRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
