import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import useAuth from '../../hooks/useAuth';

const NAV = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></>, end: true },
  { to: ROUTES.COLIS, label: 'Tous les colis', icon: <><path d="M20 7L12 3L4 7m16 0v10l-8 4m8-14L12 11M4 7v10l8 4M12 11v10"/></> },
  { to: ROUTES.COLIS_EN_ATTENTE, label: 'En attente', icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></> },
  { to: ROUTES.COLIS_LIVRES, label: 'Livrés', icon: <><polyline points="20 6 9 17 4 12"/></> },
  { to: ROUTES.COLIS_RECUPERES, label: 'Récupérés', icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></> },
  { to: ROUTES.UTILISATEURS, label: 'Utilisateurs', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
  { to: ROUTES.ADMINS, label: 'Administrateurs', icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></> },
  { label: '──────', disabled: true },
  { to: ROUTES.COUNTRIES, label: 'Pays', icon: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></> },
  { to: ROUTES.SHIPPING_PRICES, label: 'Prix de fret', icon: <><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></> },
  { to: ROUTES.SERVICE_PRICES, label: 'Prix services', icon: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></> },
];

export default function Sidebar({ isOpen, setIsOpen, mobileOpen }) {
  const { user, logout } = useAuth();
  const initials = user ? `${(user.prenom||'')[0]||''}${(user.nom||'')[0]||''}`.toUpperCase() : 'A';

  return (
    <aside className={`sidebar${isOpen ? '' : ' closed'}${mobileOpen ? ' mobile-open' : ''}`}>
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <div className="sidebar-brand-name">FrancoMaliShip</div>
          {isOpen && <div className="sidebar-brand-sub">Administration</div>}
        </div>
        <button className="sidebar-toggle" onClick={() => setIsOpen(o => !o)} title={isOpen ? 'Réduire' : 'Développer'} aria-label="Toggle sidebar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points={isOpen ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Navigation principale">
        {NAV.map((item, i) =>
          item.disabled ? (
            <div key={i} className="sidebar-divider">{isOpen ? item.label : ''}</div>
          ) : (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
              title={!isOpen ? item.label : undefined}
              aria-current={({ isActive }) => isActive ? 'page' : undefined}
            >
              <span className="sidebar-item-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>{item.icon}</svg>
              </span>
              {isOpen && <span className="sidebar-item-label">{item.label}</span>}
            </NavLink>
          )
        )}
      </nav>

      <div className="sidebar-foot">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          {isOpen && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user ? `${user.prenom||''} ${user.nom||''}`.trim() : 'Admin'}</div>
              <div className="sidebar-user-role">{user?.role || 'Admin'}</div>
            </div>
          )}
          <button className="sidebar-logout" onClick={logout} title="Déconnexion" aria-label="Se déconnecter">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
