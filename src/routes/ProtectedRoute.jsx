import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROUTES } from '../constants/routes';
export default function ProtectedRoute() {
  const { user, loading, isLoading } = useAuth();
  if (loading || isLoading) return <LoadingSpinner fullPage />;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  return <Outlet />;
}
