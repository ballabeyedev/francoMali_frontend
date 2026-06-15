import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../utils/toast';
import { logger } from '../../utils/logger';
import useAuth from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';
import { LOGIN_MAX_ATTEMPTS, LOGIN_FREEZE_SEC } from '../../constants/ui';

export default function LoginPage() {
  const [email, setEmail]           = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [loading, setLoading]       = useState(false);
  const [attempts, setAttempts]     = useState(0);
  const [frozenUntil, setFrozen]    = useState(null);
  const [showPwd, setShowPwd]       = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const isFrozen   = frozenUntil && Date.now() < frozenUntil;
  const remaining  = isFrozen ? Math.ceil((frozenUntil - Date.now()) / 1000) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFrozen) return;
    setLoading(true);
    logger.info('Auth', 'Tentative de connexion', { identifiant: email });
    try {
      const user = await login(email, motDePasse);
      logger.info('Auth', 'Connexion réussie', { id: user?.id, role: user?.role });
      toast.success('Connexion réussie', `Bienvenue, ${user.prenom || user.nom || 'Admin'} !`);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      const status  = err?.response?.status;
      const msg     = err?.response?.data?.message || err?.message || 'Erreur réseau';
      const detail  = err?.response?.data;
      logger.error('Auth', `Échec connexion [${status}]`, { msg, detail, url: err?.config?.url, baseURL: err?.config?.baseURL });
      const next = attempts + 1;
      setAttempts(next);
      if (next >= LOGIN_MAX_ATTEMPTS) {
        setFrozen(Date.now() + LOGIN_FREEZE_SEC * 1000);
        toast.error('Compte temporairement bloqué', `Trop de tentatives. Réessayez dans ${LOGIN_FREEZE_SEC} secondes.`);
      } else {
        toast.error(`Échec [${status || 'NET'}]`, msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Panel gauche — branding */}
      <div className="login-panel-left" aria-hidden="true">
        {/* Blobs décoratifs */}
        <div className="lp-blob lp-blob-1" />
        <div className="lp-blob lp-blob-2" />
        <div className="lp-blob lp-blob-3" />

        <div className="login-panel-content">
          {/* Logo */}
          <div className="lp-logo-wrap">
            <div className="lp-logo-ring" />
            <div className="lp-logo-inner">N</div>
          </div>

          {/* Brand */}
          <div className="lp-brand">Nanei</div>
          <div className="lp-divider"><span /></div>

          {/* Tagline */}
          <div className="lp-tagline">La logistique France&nbsp;↔&nbsp;Mali,<br />Sénégal &amp; Côte d&apos;Ivoire.</div>

          {/* Stats déco */}
          <div className="lp-stats">
            <div className="lp-stat">
              <div className="lp-stat-val">3</div>
              <div className="lp-stat-lbl">Pays</div>
            </div>
            <div className="lp-stat-sep" />
            <div className="lp-stat">
              <div className="lp-stat-val">24/7</div>
              <div className="lp-stat-lbl">Suivi</div>
            </div>
            <div className="lp-stat-sep" />
            <div className="lp-stat">
              <div className="lp-stat-val">100%</div>
              <div className="lp-stat-lbl">Fiable</div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel droit — formulaire */}
      <div className="login-panel-right">
        <div className="login-form-wrap">
          {/* Header mobile uniquement */}
          <div className="login-mobile-brand">
            <div className="login-mobile-mono">N</div>
            <div>
              <div className="login-mobile-name">Nanei</div>
              <div className="login-mobile-sub">Administration</div>
            </div>
          </div>

          <h1 className="login-heading">Connexion</h1>
          <p className="login-sub">Accédez à votre espace d&apos;administration</p>

          {isFrozen && (
            <div className="login-freeze-banner" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Compte bloqué — réessayez dans {remaining}s
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="lf-field">
              <label className="lf-label" htmlFor="email">Adresse email</label>
              <div className="lf-input-wrap">
                <svg className="lf-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input
                  id="email" type="email" className="lf-input"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com" required
                  autoComplete="email" disabled={isFrozen}
                />
              </div>
            </div>

            <div className="lf-field">
              <label className="lf-label" htmlFor="motDePasse">Mot de passe</label>
              <div className="lf-input-wrap">
                <svg className="lf-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input
                  id="motDePasse" type={showPwd ? 'text' : 'password'} className="lf-input"
                  value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder="••••••••" required
                  autoComplete="current-password" disabled={isFrozen}
                />
                <button type="button" className="lf-eye" onClick={() => setShowPwd((v) => !v)} aria-label={showPwd ? 'Masquer' : 'Afficher'} tabIndex={-1}>
                  {showPwd
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <button className="lf-btn" type="submit" disabled={loading || isFrozen}>
              {loading
                ? <><div className="lf-spinner" /><span>Connexion…</span></>
                : 'Se connecter'
              }
            </button>
          </form>

          <p className="login-footer-note">Accès réservé aux administrateurs Nanei</p>
        </div>
      </div>
    </div>
  );
}
