import { AuthProvider } from './contexts/AuthContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import AppRoutes from './routes/AppRoutes';
import ToastProvider from './components/common/ToastProvider';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <PermissionsProvider>
          <AppRoutes />
        </PermissionsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
