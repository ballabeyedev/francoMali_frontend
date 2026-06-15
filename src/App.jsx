import { AuthProvider } from './contexts/AuthContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import AppRoutes from './routes/AppRoutes';
import ToastProvider from './components/common/ToastProvider';
import DebugPanel from './components/common/DebugPanel';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <PermissionsProvider>
          <AppRoutes />
        </PermissionsProvider>
      </AuthProvider>
      <DebugPanel />
    </ToastProvider>
  );
}
