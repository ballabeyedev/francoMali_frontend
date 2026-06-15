import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../utils/toast';
import useAuth from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';

const MAX_ATTEMPTS = 3;
const FREEZE_SEC   = 30;

export default function LoginPage() {
  const [email, setEmail]           = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [loading, setLoading]       = useState(false);
  const [attempts, setAttempts]     = useState(0);
  const [frozenUntil, setFrozen]    = useState(null);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const isFrozen   = frozenUntil && Date.now() < frozenUntil;
  const remaining  = isFrozen ? Math.ceil((frozenUntil - Date.now()) / 1000) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFrozen) return;
    setLoading(true);
    try {
      const user = await login(email, motDePasse);
      toast.success(`Bienvenue, ${user.prenom || user.nom || 'Admin'} !`);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= MAX_ATTEMPTS) {
        setFrozen(Date.now() + FREEZE_SEC * 1000);
        toast.error(`Trop de tentatives. Patientez ${FREEZE_SEC}s.`);
      } else {
        const msg = err?.response?.data?.message || 'Identifiants incorrects';
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo-row">
          <div>
            <div className="login-brand-name">FrancoMaliShip</div>
            <div className="login-brand-sub">Administration</div>
          </div>
        </div>
        <div className="login-divider" />
        {isFrozen && (
          <div className="login-freeze-banner">
            Compte temporairement bloqué. Réessayez dans {remaining}s.
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label" htmlFor="email">Adresse email</label>
            <input id="email" type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@francomaliship.com" required autoComplete="email" disabled={isFrozen} />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="motDePasse">Mot de passe</label>
            <input id="motDePasse" type="password" className="form-input" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} placeholder="••••••••" required autoComplete="current-password" disabled={isFrozen} />
          </div>
          <button className="login-btn" type="submit" disabled={loading || isFrozen}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
