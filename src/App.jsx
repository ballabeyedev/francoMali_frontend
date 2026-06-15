import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/AppRoutes';
import ToastProvider from './components/common/ToastProvider';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ToastProvider>
  );
}
