import { memo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { ROUTES } from '../../constants/routes';

// Map code → SVG content for known icons
const ICON_MAP = {
  DASHBOARD:       <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
  COLIS:           <><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16v-2"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
  COLIS_ATTENTE:   <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  COLIS_LIVRES:    <><polyline points="20 6 9 17 4 12"/></>,
  COLIS_RECUPERES: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
  UTILISATEURS:    <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  ADMINS:          <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
  COUNTRIES:       <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
  SHIPPING_PRICES: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
  SERVICE_PRICES:  <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></>,
  MENUS:           <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
};

const DEFAULT_ICON = <><circle cx="12" cy="12" r="10"/></>;

const Sidebar = memo(function Sidebar({ isOpen, setIsOpen, mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const { menus, isSuperAdmin } = usePermissions() || {};
  const navigate = useNavigate();

  const initials = user
    ? `${(user.prenom || '')[0] || ''}${(user.nom || '')[0] || ''}`.toUpperCase()
    : 'A';

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  // SuperAdmin sees all nav items; Admin sees only permitted menus
  const navItems = isSuperAdmin
    ? [
        { code: 'DASHBOARD',        name: 'Tableau de bord',   path: ROUTES.DASHBOARD },
        { code: 'COLIS',            name: 'Colis',             path: ROUTES.COLIS },
        { code: 'COLIS_ATTENTE',    name: 'En attente',        path: ROUTES.COLIS_EN_ATTENTE },
        { code: 'COLIS_LIVRES',     name: 'Livrés',            path: ROUTES.COLIS_LIVRES },
        { code: 'COLIS_RECUPERES',  name: 'Récupérés',         path: ROUTES.COLIS_RECUPERES },
        { code: 'UTILISATEURS',     name: 'Utilisateurs',      path: ROUTES.UTILISATEURS },
        { code: 'ADMINS',           name: 'Administrateurs',   path: ROUTES.ADMINS },
        { code: 'COUNTRIES',        name: 'Pays',              path: ROUTES.COUNTRIES },
        { code: 'SHIPPING_PRICES',  name: 'Prix expédition',   path: ROUTES.SHIPPING_PRICES },
        { code: 'SERVICE_PRICES',   name: 'Prix services',     path: ROUTES.SERVICE_PRICES },
        { code: 'MENUS',            name: 'Menus',             path: ROUTES.MENUS },
      ]
    : (menus || [])
        .filter((m) => m.permissions?.canView)
        .sort((a, b) => (a.ordre || 0) - (b.ordre || 0))
        .map((m) => ({ code: m.code, name: m.name, path: m.path }));

  const handleClose = onClose || (() => {});

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={handleClose} aria-hidden="true" />}
      <aside className={`sidebar${isOpen === false ? ' closed' : ''}${mobileOpen ? ' mobile-open' : ''}`} aria-label="Navigation principale">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="sidebar-brand-name">Nanei</div>
            {isOpen !== false && <div className="sidebar-brand-sub">Administration</div>}
          </div>
          {setIsOpen && (
            <button className="sidebar-toggle" onClick={() => setIsOpen((o) => !o)} title={isOpen ? 'Réduire' : 'Développer'} aria-label="Toggle sidebar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points={isOpen !== false ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
              </svg>
            </button>
          )}
        </div>

        <nav className="sidebar-nav" aria-label="Navigation principale">
          {navItems.map((item) => (
            <NavLink
              key={item.code}
              to={item.path}
              end={item.code === 'DASHBOARD'}
              className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
              title={isOpen === false ? item.name : undefined}
              aria-current={({ isActive }) => isActive ? 'page' : undefined}
              onClick={handleClose}
            >
              <span className="sidebar-item-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  {ICON_MAP[item.code] || DEFAULT_ICON}
                </svg>
              </span>
              {isOpen !== false && <span className="sidebar-item-label">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{initials}</div>
            {isOpen !== false && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user ? `${user.prenom || ''} ${user.nom || ''}`.trim() : 'Admin'}</div>
                <div className="sidebar-user-role">{user?.role || 'Administrateur'}</div>
              </div>
            )}
            <button className="sidebar-logout" onClick={handleLogout} title="Déconnexion" aria-label="Se déconnecter">
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
});

export default Sidebar;
