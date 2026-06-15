import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROUTES } from '../constants/routes';

export default function ProtectedRoute() {
  const { user, loading, isFirstLogin } = useAuth();

  if (loading) return <LoadingSpinner fullPage />;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  if (user.role !== 'Admin' && user.role !== 'SuperAdmin') return <Navigate to={ROUTES.LOGIN} replace />;
  if (isFirstLogin) return <Navigate to={ROUTES.CHANGE_PASSWORD} replace />;

  return <Outlet />;
}
