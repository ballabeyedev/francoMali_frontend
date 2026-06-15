import useAuth from '../../hooks/useAuth';

export default function Topbar({ pageTitle, pageSub, onMobileMenuToggle }) {
  const { user } = useAuth();
  const initials = user ? `${(user.prenom||'')[0]||''}${(user.nom||'')[0]||''}`.toUpperCase() : 'A';
  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button className="topbar-hamburger" onClick={onMobileMenuToggle} aria-label="Menu" title="Menu">
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div>
          <div className="topbar-title">{pageTitle}</div>
          {pageSub && <div className="topbar-sub">{pageSub}</div>}
        </div>
      </div>
      <div className="topbar-right">
        <div className="topbar-user">
          <div className="topbar-user-avatar">{initials}</div>
          <span className="topbar-user-name">{user ? `${user.prenom||''} ${user.nom||''}`.trim() : 'Admin'}</span>
        </div>
      </div>
    </header>
  );
}
