import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

/**
 * Route protégée basée sur le contexte d'authentification (cookies httpOnly).
 *
 * La validité de la session est déterminée côté serveur via GET /auth/me
 * (appelé par AuthProvider au montage). On ne décode plus aucun JWT côté
 * client et on ne lit plus de token dans localStorage.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <span className="db-spinner" aria-label="Chargement…" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/francomaliship/auth/login" replace />;
  }

  // Réservé aux administrateurs
  if (user.role !== "Admin" && user.role !== "SuperAdmin") {
    return <Navigate to="/francomaliship/auth/login" replace />;
  }

  return children;
}
