import Swal from 'sweetalert2';
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getUser } from "../../services/auth.service";
import {
  getUtilisateurs,
  activerUtilisateur,
  desactiverUtilisateur,
  getNombreUtilisateurs,
  getColisEnvoyes,
  getColisAttente,
  getNombreColis,
  getStatistiquesColis,
} from "../../services/admin.service";
import "../../assets/css/Dashboard.css";

/* ── Helpers ── */
const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const STATUT_CONFIG = {
  livré: { label: "Livré", className: "badge badge--success", icon: "ti-circle-check" },
  transit: { label: "En transit", className: "badge badge--info", icon: "ti-truck" },
  attente: { label: "En attente", className: "badge badge--warning", icon: "ti-clock" },
  envoyé: { label: "Envoyé", className: "badge badge--success", icon: "ti-send" },
  livraison: { label: "En livraison", className: "badge badge--info", icon: "ti-map-pin" },
};

const NAV_ITEMS = [
  { key: "accueil", label: "Accueil", icon: "ti-home" },
  { key: "colis", label: "Colis", icon: "ti-package" },
  { key: "utilisateurs", label: "Utilisateurs", icon: "ti-users" },
  { key: "statistiques", label: "Statistiques", icon: "ti-chart-bar" },
];

const PAGE_TITLES = {
  accueil: "Tableau de bord",
  colis: "Gestion des colis",
  utilisateurs: "Gestion des utilisateurs",
  statistiques: "Statistiques",
};

/* ── Spinner ── */
function Spinner() {
  return (
    <div className="db-spinner-wrap">
      <span className="db-spinner" aria-label="Chargement…" />
    </div>
  );
}

/* ── Erreur ── */
function ErrorBanner({ message, onRetry }) {
  return (
    <div className="db-error-banner" role="alert">
      <i className="ti ti-alert-circle" aria-hidden="true" />
      <span>{message}</span>
      {onRetry && (
        <button className="db-error-retry" onClick={onRetry}>
          <i className="ti ti-refresh" aria-hidden="true" /> Réessayer
        </button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState("accueil");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = getUser() || { nom: "Admin", email: "admin@francomaliship.com" };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Confirmer la déconnexion",
      text: "Êtes-vous sûr de vouloir vous déconnecter ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, déconnecter",
      cancelButtonText: "Annuler",
    });
    if (result.isConfirmed) {
      logout();
      navigate("/francomaliship/auth/login");
    }
  };

  const handleMenuSelect = (key) => {
    setSelectedMenu(key);
    setMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case "accueil": return <Accueil />;
      case "colis": return <ListeColis />;
      case "utilisateurs": return <ListeUtilisateurs />;
      case "statistiques": return <Statistiques />;
      default: return <Accueil />;
    }
  };

  return (
    <div className="db-shell">

      {/* Overlay mobile */}
      {mobileMenuOpen && (
        <div className="db-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`db-sidebar ${sidebarCollapsed ? "db-sidebar--collapsed" : ""} ${mobileMenuOpen ? "db-sidebar--mobile-open" : ""}`}
      >
        <div className="db-brand">
          <div className="db-brand-mark">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17h18M3 17V7l6-4h6l6 4v10M3 17l3 3h12l3-3" />
              <path d="M9 3v8m6-8v8" />
            </svg>
          </div>
          {!sidebarCollapsed && <span className="db-brand-name">FrancoMaliShip</span>}
        </div>

        {!sidebarCollapsed && <p className="db-nav-section">Principal</p>}

        <nav className="db-nav">
          {NAV_ITEMS.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`db-nav-item ${selectedMenu === key ? "db-nav-item--active" : ""}`}
              onClick={() => handleMenuSelect(key)}
              title={sidebarCollapsed ? label : undefined}
            >
              <i className={`ti ${icon}`} aria-hidden="true" />
              {!sidebarCollapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>

        {!sidebarCollapsed && <p className="db-nav-section">Système</p>}

        <button className="db-nav-item" title={sidebarCollapsed ? "Paramètres" : undefined}>
          <i className="ti ti-settings" aria-hidden="true" />
          {!sidebarCollapsed && <span>Paramètres</span>}
        </button>

        <button
          className="db-nav-item db-nav-item--logout"
          onClick={handleLogout}
          title={sidebarCollapsed ? "Déconnexion" : undefined}
        >
          <i className="ti ti-logout" aria-hidden="true" />
          {!sidebarCollapsed && <span>Déconnexion</span>}
        </button>

        <div className="db-sidebar-footer">
          <div className="db-user-avatar">{getInitials(user.nom)}</div>
          {!sidebarCollapsed && (
            <div className="db-user-info">
              <span className="db-user-name">{user.nom} {user.prenom}</span>
              <span className="db-user-email">{user.email}</span>
            </div>
          )}
        </div>

        <button
          className="db-collapse-btn"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? "Ouvrir le menu" : "Réduire le menu"}
        >
          <i className={`ti ${sidebarCollapsed ? "ti-chevron-right" : "ti-chevron-left"}`} aria-hidden="true" />
        </button>
      </aside>

      {/* ── Zone principale ── */}
      <div className="db-main">
        <header className="db-topbar">
          <button
            className="db-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Ouvrir le menu"
          >
            <i className="ti ti-menu-2" aria-hidden="true" />
          </button>

          <h1 className="db-page-title">{PAGE_TITLES[selectedMenu]}</h1>

          <div className="db-topbar-right">
            <span className="db-status-badge">
              <i className="ti ti-circle-check" aria-hidden="true" />
              <span className="db-status-text">Système opérationnel</span>
            </span>
            <button className="db-notif-btn" aria-label="Notifications">
              <i className="ti ti-bell" aria-hidden="true" />
              <span className="db-notif-dot" />
            </button>
          </div>
        </header>

        <div className="db-content" key={selectedMenu}>
          {renderContent()}
        </div>

        {/* Navigation mobile en bas */}
        <nav className="db-bottom-nav">
          {NAV_ITEMS.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`db-bottom-nav-item ${selectedMenu === key ? "db-bottom-nav-item--active" : ""}`}
              onClick={() => handleMenuSelect(key)}
            >
              <i className={`ti ${icon}`} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   ACCUEIL
══════════════════════════════════════ */
function Accueil() {
  const [stats, setStats] = useState({ colis: null, utilisateurs: null });
  const [colisAttente, setColisAttente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nbColis, nbUtilisateurs, attente] = await Promise.all([
        getNombreColis(),
        getNombreUtilisateurs(),
        getColisAttente(),
      ]);
      setStats({ colis: nbColis, utilisateurs: nbUtilisateurs });
      setColisAttente(attente?.colis || attente || []);
    } catch {
      setError("Impossible de charger les données du tableau de bord.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={fetchData} />;

  const statCards = [
    {
      label: "Colis envoyés",
      value: stats.colis?.total ?? "—",
      sub: stats.colis?.evolution || "+0% ce mois",
      subType: "success",
      icon: "ti-send",
    },
    {
      label: "En attente",
      value: stats.colis?.enAttente ?? colisAttente.length ?? "—",
      sub: "À traiter",
      subType: "warning",
      icon: "ti-clock",
    },
    {
      label: "Utilisateurs",
      value: stats.utilisateurs?.total ?? "—",
      sub: stats.utilisateurs?.evolution || "+0 cette semaine",
      subType: "success",
      icon: "ti-users",
    },
  ];

  return (
    <>
      <div className="db-stats-grid">
        {statCards.map((s) => (
          <div className="db-stat-card" key={s.label}>
            <div className="db-stat-top">
              <span className="db-stat-label">{s.label}</span>
              <div className="db-stat-icon">
                <i className={`ti ${s.icon}`} aria-hidden="true" />
              </div>
            </div>
            <div className="db-stat-value">{s.value}</div>
            <div className={`db-stat-sub db-stat-sub--${s.subType}`}>
              <i className={`ti ${s.subType === "success" ? "ti-trending-up" : "ti-alert-triangle"}`} aria-hidden="true" />
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="db-table-card">
        <div className="db-table-header">
          <span className="db-table-title">Colis en attente</span>
          <span className="db-count-badge">{colisAttente.length} colis</span>
        </div>
        {colisAttente.length === 0 ? (
          <div className="db-empty">
            <i className="ti ti-package-off" aria-hidden="true" />
            <span>Aucun colis en attente</span>
          </div>
        ) : (
          <ColisTable data={colisAttente.slice(0, 5)} />
        )}
      </div>
    </>
  );
}

/* ══════════════════════════════════════
   LISTE COLIS
══════════════════════════════════════ */
function ListeColis() {
  const [colis, setColis] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchColis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getColisEnvoyes();
      setColis(data?.colis || data || []);
    } catch {
      setError("Impossible de charger la liste des colis.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchColis(); }, [fetchColis]);

  const filtered = colis.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.reference?.toLowerCase().includes(q) ||
      c.expediteur?.toLowerCase().includes(q) ||
      c.destinataire?.toLowerCase().includes(q) ||
      c.destination?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="db-table-card">
      <div className="db-table-header">
        <span className="db-table-title">Tous les colis</span>
        <div className="db-table-actions">
          <div className="db-search-wrap">
            <i className="ti ti-search" aria-hidden="true" />
            <input
              type="text"
              placeholder="Rechercher…"
              className="db-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="db-search-clear" onClick={() => setSearch("")} aria-label="Effacer">
                <i className="ti ti-x" aria-hidden="true" />
              </button>
            )}
          </div>
          <button className="db-btn-secondary" onClick={fetchColis} aria-label="Rafraîchir">
            <i className="ti ti-refresh" aria-hidden="true" />
          </button>
        </div>
      </div>

      {loading && <Spinner />}
      {!loading && error && <ErrorBanner message={error} onRetry={fetchColis} />}
      {!loading && !error && filtered.length === 0 && (
        <div className="db-empty">
          <i className="ti ti-package-off" aria-hidden="true" />
          <span>{search ? "Aucun résultat pour cette recherche" : "Aucun colis trouvé"}</span>
        </div>
      )}
      {!loading && !error && filtered.length > 0 && <ColisTable data={filtered} />}
    </div>
  );
}

function ColisTable({ data }) {
  return (
    <div className="db-table-wrap">
      <table className="db-table">
        <thead>
          <tr>
            <th>Référence</th>
            <th>Expéditeur</th>
            <th>Destinataire</th>
            <th>Destination</th>
            <th>Poids</th>
            <th>Prix</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c, i) => {
            const statutKey = (c.statut || "").toLowerCase();
            const s = STATUT_CONFIG[statutKey] || {
              label: c.statut || "—",
              className: "badge badge--warning",
              icon: "ti-help-circle",
            };
            return (
              <tr key={c.reference || i}>
                <td className="db-td-primary">{c.reference || "—"}</td>
                <td>{c.expediteur || "—"}</td>
                <td>{c.destinataire || "—"}</td>
                <td>{c.destination || "—"}</td>
                <td>{c.poids != null ? `${c.poids} kg` : "—"}</td>
                <td>{c.prix != null ? `${Number(c.prix).toFixed(2)} €` : "—"}</td>
                <td>
                  <span className={s.className}>
                    <i className={`ti ${s.icon}`} aria-hidden="true" />
                    {s.label}
                  </span>
                </td>
                <td>
                  <div className="db-row-actions">
                    <button className="db-action-btn" aria-label="Modifier">
                      <i className="ti ti-edit" aria-hidden="true" />
                    </button>
                    <button className="db-action-btn db-action-btn--danger" aria-label="Supprimer">
                      <i className="ti ti-trash" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════════════════════
   LISTE UTILISATEURS
══════════════════════════════════════ */
function ListeUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const fetchUtilisateurs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUtilisateurs();
      setUtilisateurs(data?.data || []);
    } catch {
      setError("Impossible de charger la liste des utilisateurs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUtilisateurs(); }, [fetchUtilisateurs]);

  const handleToggleActif = async (user) => {
    const id = user._id || user.id;
    setTogglingId(id);
    try {
      if (isActif(user)) {
        await desactiverUtilisateur(id);
      } else {
        await activerUtilisateur(id);
      }
      await fetchUtilisateurs();
    } catch {
      // Erreur silencieuse
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = utilisateurs.filter((u) => {
    const q = search.toLowerCase();
    const fullName = `${u.prenom || ""} ${u.nom || ""}`.toLowerCase();
    return (
      fullName.includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.telephone?.includes(q)
    );
  });

  const isActif = (u) => u.actif ?? u.isActive ?? u.active ?? true;

  return (
    <div className="db-table-card">
      <div className="db-table-header">
        <span className="db-table-title">Tous les utilisateurs</span>
        <div className="db-table-actions">
          <div className="db-search-wrap">
            <i className="ti ti-search" aria-hidden="true" />
            <input
              type="text"
              placeholder="Rechercher…"
              className="db-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="db-search-clear" onClick={() => setSearch("")} aria-label="Effacer">
                <i className="ti ti-x" aria-hidden="true" />
              </button>
            )}
          </div>
          <button className="db-btn-secondary" onClick={fetchUtilisateurs} aria-label="Rafraîchir">
            <i className="ti ti-refresh" aria-hidden="true" />
          </button>
        </div>
      </div>

      {loading && <Spinner />}
      {!loading && error && <ErrorBanner message={error} onRetry={fetchUtilisateurs} />}
      {!loading && !error && filtered.length === 0 && (
        <div className="db-empty">
          <i className="ti ti-users-off" aria-hidden="true" />
          <span>{search ? "Aucun résultat" : "Aucun utilisateur trouvé"}</span>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          {/* ── Vue cartes MOBILE ── */}
          <div className="db-user-cards">
            {filtered.map((u, i) => {
              const id = u._id || u.id;
              const actif = isActif(u);
              const isToggling = togglingId === id;
              return (
                <div key={id || i} className="db-user-card">
                  <div className="db-user-card-header">
                    <div className="db-user-cell">
                      <div className="db-user-avatar db-user-avatar--sm">
                        {getInitials(`${u.prenom || ""} ${u.nom || ""}`)}
                      </div>
                      <div>
                        <div className="db-td-primary">{u.prenom} {u.nom}</div>
                        <div className="db-td-secondary">{u.role || "Utilisateur"}</div>
                      </div>
                    </div>
                    <span className={actif ? "badge badge--success" : "badge badge--danger"}>
                      <i className={`ti ${actif ? "ti-circle-check" : "ti-circle-x"}`} aria-hidden="true" />
                      {actif ? "Actif" : "Inactif"}
                    </span>
                  </div>

                  <div className="db-user-card-body">
                    {u.email && (
                      <div className="db-user-card-row">
                        <i className="ti ti-mail" aria-hidden="true" />
                        <span>{u.email}</span>
                      </div>
                    )}
                    {u.telephone && (
                      <div className="db-user-card-row">
                        <i className="ti ti-phone" aria-hidden="true" />
                        <span>{u.telephone}</span>
                      </div>
                    )}
                    {u.adresse && (
                      <div className="db-user-card-row">
                        <i className="ti ti-map-pin" aria-hidden="true" />
                        <span>{u.adresse}</span>
                      </div>
                    )}
                  </div>

                  <div className="db-user-card-actions">
                    <button
                      className={`db-action-btn ${actif ? "db-action-btn--warning" : "db-action-btn--success"}`}
                      onClick={() => handleToggleActif(u)}
                      disabled={isToggling}
                      aria-label={actif ? "Désactiver" : "Activer"}
                    >
                      {isToggling ? (
                        <span className="db-spinner db-spinner--sm" />
                      ) : (
                        <>
                          <i className={`ti ${actif ? "ti-user-off" : "ti-user-check"}`} aria-hidden="true" />
                          <span className="db-action-btn-label">{actif ? "Désactiver" : "Activer"}</span>
                        </>
                      )}
                    </button>
                    <button className="db-action-btn db-action-btn--info" aria-label="Voir le profil">
                      <i className="ti ti-eye" aria-hidden="true" />
                      <span className="db-action-btn-label">Voir</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Vue tableau DESKTOP ── */}
          <div className="db-table-wrap db-table-desktop">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Adresse</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const id = u._id || u.id;
                  const actif = isActif(u);
                  const isToggling = togglingId === id;
                  return (
                    <tr key={id || i}>
                      <td>
                        <div className="db-user-cell">
                          <div className="db-user-avatar db-user-avatar--sm">
                            {getInitials(`${u.prenom || ""} ${u.nom || ""}`)}
                          </div>
                          <div>
                            <div className="db-td-primary">{u.prenom} {u.nom}</div>
                            <div className="db-td-secondary">{u.role || "Utilisateur"}</div>
                          </div>
                        </div>
                      </td>
                      <td>{u.adresse || "—"}</td>
                      <td>{u.telephone || "—"}</td>
                      <td>{u.email || "—"}</td>
                      <td>
                        <span className={actif ? "badge badge--success" : "badge badge--danger"}>
                          <i className={`ti ${actif ? "ti-circle-check" : "ti-circle-x"}`} aria-hidden="true" />
                          {actif ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td>
                        <div className="db-row-actions">
                          <button
                            className={`db-action-btn ${actif ? "db-action-btn--warning" : "db-action-btn--success"}`}
                            onClick={() => handleToggleActif(u)}
                            disabled={isToggling}
                            aria-label={actif ? "Désactiver" : "Activer"}
                            title={actif ? "Désactiver cet utilisateur" : "Activer cet utilisateur"}
                          >
                            {isToggling ? (
                              <span className="db-spinner db-spinner--sm" />
                            ) : (
                              <>
                                <i className={`ti ${actif ? "ti-user-off" : "ti-user-check"}`} aria-hidden="true" />
                                <span className="db-action-btn-label">{actif ? "Désactiver" : "Activer"}</span>
                              </>
                            )}
                          </button>
                          <button className="db-action-btn db-action-btn--info" aria-label="Voir le profil" title="Voir le profil">
                            <i className="ti ti-eye" aria-hidden="true" />
                            <span className="db-action-btn-label">Voir</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   STATISTIQUES
══════════════════════════════════════ */
function Statistiques() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStatistiquesColis();
      setStats(data);
    } catch {
      setError("Impossible de charger les statistiques.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={fetchStats} />;
  if (!stats) return null;

  const statItems = [
    { label: "Total colis", value: stats.total ?? "—", icon: "ti-package" },
    { label: "Livrés", value: stats.livres ?? "—", icon: "ti-circle-check" },
    { label: "En transit", value: stats.enTransit ?? "—", icon: "ti-truck" },
    { label: "En attente", value: stats.enAttente ?? "—", icon: "ti-clock" },
    { label: "Poids total (kg)", value: stats.poidsTotal ?? "—", icon: "ti-weight" },
    {
      label: "Revenus (€)",
      value: stats.revenusTotal != null
        ? Number(stats.revenusTotal).toLocaleString("fr-FR", { minimumFractionDigits: 2 })
        : "—",
      icon: "ti-coin",
    },
  ];

  return (
    <div className="db-stats-grid db-stats-grid--6">
      {statItems.map((s) => (
        <div className="db-stat-card" key={s.label}>
          <div className="db-stat-top">
            <span className="db-stat-label">{s.label}</span>
            <div className="db-stat-icon">
              <i className={`ti ${s.icon}`} aria-hidden="true" />
            </div>
          </div>
          <div className="db-stat-value">{s.value}</div>
        </div>
      ))}
    </div>
  );
}