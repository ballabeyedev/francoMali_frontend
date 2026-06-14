import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateLoginForm } from "../../services/auth.service";
import { useAuth } from "../../context/useAuth";
import "../../assets/css/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setApiError("");

    const validationErrors = validateLoginForm(email, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      await login({ email, mot_de_passe: password });
      navigate("/francomaliship/dashboard");
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo-row">
          <div className="login-logo-mark">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
              fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17h18M3 17V7l6-4h6l6 4v10M3 17l3 3h12l3-3" />
              <path d="M9 3v8m6-8v8" />
            </svg>
          </div>
          <span className="login-logo-text">FrancoMaliShip</span>
        </div>

        <h1 className="login-heading">Connexion</h1>
        <p className="login-subheading">Accédez à votre espace d'administration</p>

        {/* Erreur API */}
        {apiError && (
          <div className="login-alert-error" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form" noValidate>

          {/* Email */}
          <div className="login-field">
            <label className="login-label" htmlFor="email">Adresse email</label>
            <div className={`login-input-row ${focusedField === "email" ? "focused" : ""} ${errors.email ? "error" : ""}`}>
              <svg className="login-icon" xmlns="http://www.w3.org/2000/svg" width="17" height="17"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <input
                id="email"
                type="email"
                className="login-input"
                placeholder="admin@exemple.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                autoComplete="email"
                required
              />
            </div>
            {errors.email && <p className="login-field-error">{errors.email}</p>}
          </div>

          {/* Mot de passe */}
          <div className="login-field">
            <label className="login-label" htmlFor="password">Mot de passe</label>
            <div className={`login-input-row ${focusedField === "password" ? "focused" : ""} ${errors.password ? "error" : ""}`}>
              <svg className="login-icon" xmlns="http://www.w3.org/2000/svg" width="17" height="17"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                }}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="login-field-error">{errors.password}</p>}
          </div>

          <div className="login-forgot-row">
            <a href="/forgot-password" className="login-link">Mot de passe oublié ?</a>
          </div>

          <button type="submit" className="login-btn-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="login-spinner" aria-hidden="true" />
                <span>Connexion en cours…</span>
              </>
            ) : (
              <>
                <span>Se connecter</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}