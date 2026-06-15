import { Navigate, Outlet } from 'react-router-dom';
import { getToken } from '../utils/storage';
import { ROUTES } from '../constants/routes';
export default function GuestRoute() {
  return getToken() ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Outlet />;
}
