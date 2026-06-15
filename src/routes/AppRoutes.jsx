import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import ErrorBoundary from '../components/common/ErrorBoundary';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AdminLayout from '../components/layout/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';
import FirstLoginRoute from './FirstLoginRoute';

const LoginPage           = lazy(() => import('../pages/auth/LoginPage'));
const ChangePasswordPage  = lazy(() => import('../pages/auth/ChangePasswordPage'));
const DashboardPage       = lazy(() => import('../pages/admin/DashboardPage'));
const ColisPage           = lazy(() => import('../pages/admin/ColisPage'));
const ColisEnAttentePage  = lazy(() => import('../pages/admin/ColisEnAttentePage'));
const ColisLivresPage     = lazy(() => import('../pages/admin/ColisLivresPage'));
const ColisRecuperesPage  = lazy(() => import('../pages/admin/ColisRecuperesPage'));
const UtilisateursPage    = lazy(() => import('../pages/admin/UtilisateursPage'));
const AdminsPage          = lazy(() => import('../pages/admin/AdminsPage'));
const MenusPage           = lazy(() => import('../pages/admin/MenusPage'));
const CountriesPage       = lazy(() => import('../pages/admin/CountriesPage'));
const ShippingPricesPage  = lazy(() => import('../pages/admin/ShippingPricesPage'));
const ServicePricesPage   = lazy(() => import('../pages/admin/ServicePricesPage'));

const Wrap = ({ children }) => (
  <ErrorBoundary><Suspense fallback={<LoadingSpinner fullPage />}>{children}</Suspense></ErrorBoundary>
);

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
        <Route path="/nanei" element={<Navigate to={ROUTES.LOGIN} replace />} />
        <Route path="/nanei/auth" element={<Navigate to={ROUTES.LOGIN} replace />} />

        <Route element={<GuestRoute />}>
          <Route path={ROUTES.LOGIN} element={<Wrap><LoginPage /></Wrap>} />
        </Route>

        <Route element={<FirstLoginRoute />}>
          <Route path={ROUTES.CHANGE_PASSWORD} element={<Wrap><ChangePasswordPage /></Wrap>} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path={ROUTES.DASHBOARD}        element={<Wrap><DashboardPage /></Wrap>} />
            <Route path={ROUTES.COLIS}            element={<Wrap><ColisPage /></Wrap>} />
            <Route path={ROUTES.COLIS_EN_ATTENTE} element={<Wrap><ColisEnAttentePage /></Wrap>} />
            <Route path={ROUTES.COLIS_LIVRES}     element={<Wrap><ColisLivresPage /></Wrap>} />
            <Route path={ROUTES.COLIS_RECUPERES}  element={<Wrap><ColisRecuperesPage /></Wrap>} />
            <Route path={ROUTES.UTILISATEURS}     element={<Wrap><UtilisateursPage /></Wrap>} />
            <Route path={ROUTES.ADMINS}           element={<Wrap><AdminsPage /></Wrap>} />
            <Route path={ROUTES.MENUS}            element={<Wrap><MenusPage /></Wrap>} />
            <Route path={ROUTES.COUNTRIES}        element={<Wrap><CountriesPage /></Wrap>} />
            <Route path={ROUTES.SHIPPING_PRICES}  element={<Wrap><ShippingPricesPage /></Wrap>} />
            <Route path={ROUTES.SERVICE_PRICES}   element={<Wrap><ServicePricesPage /></Wrap>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
