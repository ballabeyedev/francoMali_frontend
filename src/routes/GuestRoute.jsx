import { Navigate, Outlet } from 'react-router-dom';
import { getUserId } from '../utils/storage';
import { ROUTES } from '../constants/routes';
export default function GuestRoute() {
  return getUserId() ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Outlet />;
}
