import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import OfflineBanner from '../common/OfflineBanner';
import { ROUTES } from '../../constants/routes';
import useAuth from '../../hooks/useAuth';
import useInactivityLogout from '../../hooks/useInactivityLogout';

const PAGE_TITLES = {
  [ROUTES.DASHBOARD]:       { title: 'Dashboard',         sub: 'Vue d\'ensemble' },
  [ROUTES.COLIS]:           { title: 'Tous les colis',    sub: 'Gestion des expéditions' },
  [ROUTES.COLIS_EN_ATTENTE]:{ title: 'Colis en attente',  sub: 'En cours de traitement' },
  [ROUTES.COLIS_LIVRES]:    { title: 'Colis livrés',      sub: 'Expéditions livrées' },
  [ROUTES.COLIS_RECUPERES]: { title: 'Colis récupérés',   sub: 'Expéditions récupérées' },
  [ROUTES.UTILISATEURS]:    { title: 'Utilisateurs',      sub: 'Gestion des clients' },
  [ROUTES.ADMINS]:          { title: 'Administrateurs',   sub: 'Gestion des admins' },
  [ROUTES.COUNTRIES]:       { title: 'Pays',              sub: 'Pays de destination' },
  [ROUTES.SHIPPING_PRICES]: { title: 'Prix de fret',      sub: 'Tarifs aérien & maritime' },
  [ROUTES.SERVICE_PRICES]:  { title: 'Prix services',     sub: 'Récupération & livraison' },
};

export default function AdminLayout() {
  const [isOpen, setIsOpen]     = useState(true);
  const [mobileOpen, setMobile] = useState(false);
  const { logout } = useAuth();
  const { pathname } = useLocation();
  useInactivityLogout(logout);
  const { title = 'Nanei', sub } = PAGE_TITLES[pathname] || {};

  return (
    <div className={`admin-shell${isOpen ? '' : ' sidebar-collapsed'}`}>
      <a href="#main-content" className="skip-link">Aller au contenu principal</a>
      <OfflineBanner />
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobile(false)} />}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} mobileOpen={mobileOpen} />
      <div className="admin-main">
        <Topbar pageTitle={title} pageSub={sub} onMobileMenuToggle={() => setMobile(o => !o)} />
        <main id="main-content" className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
