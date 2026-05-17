import { Navigate } from "react-router-dom";

/**
 * Vérifie :
 * - token
 * - utilisateur
 * - rôle admin
 * - expiration JWT
 */

export default function ProtectedRoute({ children }) {

  let auth = null;

  try {
    const raw = localStorage.getItem("auth");
    auth = raw ? JSON.parse(raw) : null;
  } catch {
    auth = null;
  }

  // ❌ pas connecté
  if (!auth?.token || !auth?.user) {
    localStorage.removeItem("auth");
    return <Navigate to="/francomaliship/auth/login" replace />;
  }

  // ✅ vérifier expiration token JWT
  try {
    const payload = JSON.parse(atob(auth.token.split('.')[1]));

    // temps actuel en secondes
    const now = Date.now() / 1000;

    // token expiré
    if (payload.exp < now) {
      localStorage.removeItem("auth");

      return (
        <Navigate
          to="/francomaliship/auth/login"
          replace
        />
      );
    }
  } catch (error) {
    localStorage.removeItem("auth");

    return (
      <Navigate
        to="/francomaliship/auth/login"
        replace
      />
    );
  }

  // ❌ pas admin
  if (auth.user.role !== "Admin") {
    localStorage.removeItem("auth");

    return (
      <Navigate
        to="/francomaliship/auth/login"
        replace
      />
    );
  }

  // ✅ accès autorisé
  return children;
}