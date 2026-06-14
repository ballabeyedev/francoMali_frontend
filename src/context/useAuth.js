import { useContext } from 'react';
import AuthContext from './AuthContext';

/**
 * Hook d'accès au contexte d'authentification.
 * Séparé du provider pour satisfaire react-refresh (un fichier de composant
 * ne doit exporter que des composants).
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}

export default useAuth;
