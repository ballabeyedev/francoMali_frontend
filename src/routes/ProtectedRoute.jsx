import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ROUTES } from '../constants/routes';

export default function ProtectedRoute() {
  const { user } = useAuth();

  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  if (user.role !== 'Admin' && user.role !== 'SuperAdmin') return <Navigate to={ROUTES.LOGIN} replace />;

  return <Outlet />;
}
