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
  modifierPassword,
  modifierInfo,
} from "../../services/admin.service";
import { setAuth, getAuth } from "../../services/api";
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
  { key: "profil", label: "Profil", icon: "ti-user" },
];

const PAGE_TITLES = {
  accueil: "Tableau de bord",
  colis: "Gestion des colis",
  utilisateurs: "Gestion des utilisateurs",
  profil: "Mon Profil",
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

  const [currentUser, setCurrentUser] = useState(() => getUser() || { nom: "Admin", email: "admin@francomaliship.com" });

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

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
      case "profil": return <Profil user={currentUser} onUpdateUser={handleUpdateUser} />;
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


        <button
          className="db-nav-item db-nav-item--logout"
          onClick={handleLogout}
          title={sidebarCollapsed ? "Déconnexion" : undefined}
        >
          <i className="ti ti-logout" aria-hidden="true" />
          {!sidebarCollapsed && <span>Déconnexion</span>}
        </button>

        <div className="db-sidebar-footer">
          <div className="db-user-avatar">{getInitials(currentUser.nom)}</div>
          {!sidebarCollapsed && (
            <div className="db-user-info">
              <span className="db-user-name">{currentUser.nom} {currentUser.prenom}</span>
              <span className="db-user-email">{currentUser.email}</span>
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
            <span className="db-hamburger-label">Menu</span>
          </button>

          <h1 className="db-page-title">{PAGE_TITLES[selectedMenu]}</h1>
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
      subType: "success",
      icon: "ti-send",
    },
    {
      label: "En attente",
      value: stats.colis?.enAttente ?? colisAttente.length ?? "—",
      subType: "warning",
      icon: "ti-clock",
    },
    {
      label: "Utilisateurs",
      value: stats.utilisateurs?.total ?? "—",
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
    const active = isActif(user);
    const actionText = active ? "désactiver" : "activer";

    const result = await Swal.fire({
      title: active ? "Désactiver l'utilisateur ?" : "Activer l'utilisateur ?",
      text: `Êtes-vous sûr de vouloir ${actionText} l'utilisateur ${user.prenom || ""} ${user.nom || ""} ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: active ? "#d33" : "#3085d6",
      cancelButtonColor: "#aaa",
      confirmButtonText: active ? "Oui, désactiver" : "Oui, activer",
      cancelButtonText: "Annuler",
    });

    if (!result.isConfirmed) {
      return;
    }

    setTogglingId(id);
    try {
      if (active) {
        await desactiverUtilisateur(id);
        Swal.fire({
          title: "Désactivé !",
          text: "L'utilisateur a été désactivé avec succès.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await activerUtilisateur(id);
        Swal.fire({
          title: "Activé !",
          text: "L'utilisateur a été activé avec succès.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
      await fetchUtilisateurs();
    } catch {
      Swal.fire({
        title: "Erreur !",
        text: `Une erreur est survenue lors de l'activation/désactivation.`,
        icon: "error",
      });
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

  const isActif = (u) => {
    return (
      u.statut === "actif" ||
      u.actif === true ||
      u.isActive === true
    );
  };

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
   MON PROFIL (VUE ADMIN)
   ══════════════════════════════════════ */
function Profil({ user, onUpdateUser }) {
  const initials = getInitials(user.nom || "Admin");
  const fullNom = `${user.prenom || ""} ${user.nom || "Admin"}`;

  // États pour les Modals
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Formulaires & États d'envoi
  const [infoForm, setInfoForm] = useState({
    prenom: user.prenom || "",
    nom: user.nom || "",
    email: user.email || "",
    telephone: user.telephone || "",
    adresse: user.adresse || "",
  });
  const [infoSubmitting, setInfoSubmitting] = useState(false);
  const [infoError, setInfoError] = useState(null);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // Réinitialiser les formulaires à l'ouverture
  const openInfoModal = () => {
    setInfoForm({
      prenom: user.prenom || "",
      nom: user.nom || "",
      email: user.email || "",
      telephone: user.telephone || "",
      adresse: user.adresse || "",
    });
    setInfoError(null);
    setShowInfoModal(true);
  };

  const openPasswordModal = () => {
    setPasswordForm({ oldPassword: "", newPassword: "" });
    setPasswordError(null);
    setShowPasswordModal(true);
  };

  // Soumission de la modification des informations personnelles
  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setInfoError(null);
    setInfoSubmitting(true);
    try {
      const responseData = await modifierInfo(infoForm);

      // On capture l'utilisateur renvoyé par l'API
      const updatedUser = responseData.data || responseData.user || responseData;

      // On met à jour le localStorage pour garder la session synchronisée
      const auth = getAuth();
      if (auth?.token) {
        setAuth(auth.token, updatedUser);
      }

      // On notifie le composant principal (Dashboard) pour mettre à jour l'état réactif
      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }

      Swal.fire({
        title: "Mis à jour !",
        text: "Vos informations personnelles ont été modifiées avec succès.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      setShowInfoModal(false);
    } catch (error) {
      // Capturer le message précis renvoyé par le backend
      const errMsg = error.response?.data?.message || error.response?.data?.error || error.message || "Une erreur est survenue lors de la mise à jour.";
      setInfoError(errMsg);
    } finally {
      setInfoSubmitting(false);
    }
  };

  // Soumission de la modification du mot de passe
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSubmitting(true);
    try {
      await modifierPassword(passwordForm.oldPassword, passwordForm.newPassword);

      Swal.fire({
        title: "Succès !",
        text: "Votre mot de passe a été modifié avec succès.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      setShowPasswordModal(false);
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } catch (error) {
      // Capturer le message précis renvoyé par le backend
      const errMsg = error.response?.data?.message || error.response?.data?.error || error.message || "Une erreur est survenue.";
      setPasswordError(errMsg);
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <div className="db-profile-container">
      {/* Modernized Hero Card Section */}
      <div className="db-profile-modern-hero">
        <div className="db-profile-hero-left">
          <div className="db-profile-avatar-wrapper">
            <div className="db-profile-avatar-new">{initials}</div>
            <div className="db-profile-status-ring">
              <span className="db-profile-status-dot" />
            </div>
          </div>
          <div className="db-profile-hero-meta">
            <h2 className="db-profile-hero-fullname">{fullNom}</h2>
            <div className="db-profile-badges-row">
              <span className="db-profile-pill db-profile-pill--primary">
                <i className="ti ti-shield" aria-hidden="true" />
                {user.role || "Administrateur"}
              </span>
              <span className="db-profile-pill db-profile-pill--success">
                <span className="db-indicator-dot" />
                En ligne
              </span>
            </div>
          </div>
        </div>

        <div className="db-profile-hero-actions">
          <button className="db-profile-action-btn" onClick={openInfoModal}>
            <i className="ti ti-edit" aria-hidden="true" />
            Modifier mes informations
          </button>
          <button className="db-profile-action-btn db-profile-action-btn--primary" onClick={openPasswordModal}>
            <i className="ti ti-key" aria-hidden="true" />
            Changer le mot de passe
          </button>
        </div>
      </div>

      {/* Grid of Profile Details & System Info */}
      <div className="db-profile-grid">
        {/* Profile Details Card */}
        <div className="db-profile-card">
          <div className="db-profile-card-header">
            <i className="ti ti-id-badge" aria-hidden="true" />
            <h3>Informations personnelles</h3>
          </div>
          <div className="db-profile-details-list">
            <div className="db-profile-detail-item">
              <div className="db-profile-detail-icon">
                <i className="ti ti-mail" aria-hidden="true" />
              </div>
              <div className="db-profile-detail-text">
                <span className="db-profile-detail-label">Adresse email</span>
                <span className="db-profile-detail-value">{user.email || "admin@gmail.com"}</span>
              </div>
            </div>

            <div className="db-profile-detail-item">
              <div className="db-profile-detail-icon">
                <i className="ti ti-phone" aria-hidden="true" />
              </div>
              <div className="db-profile-detail-text">
                <span className="db-profile-detail-label">Numéro de téléphone</span>
                <span className="db-profile-detail-value">{user.telephone || "+221 77 344 44 44"}</span>
              </div>
            </div>

            <div className="db-profile-detail-item">
              <div className="db-profile-detail-icon">
                <i className="ti ti-map-pin" aria-hidden="true" />
              </div>
              <div className="db-profile-detail-text">
                <span className="db-profile-detail-label">Adresse physique</span>
                <span className="db-profile-detail-value">{user.adresse || "Dakar, Sénégal"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* System & Session Card */}
        <div className="db-profile-card">
          <div className="db-profile-card-header">
            <i className="ti ti-settings" aria-hidden="true" />
            <h3>Paramètres de sécurité</h3>
          </div>
          <div className="db-profile-details-list">
            <div className="db-profile-detail-item">
              <div className="db-profile-detail-icon db-profile-detail-icon--green">
                <i className="ti ti-lock" aria-hidden="true" />
              </div>
              <div className="db-profile-detail-text">
                <span className="db-profile-detail-label">Sécurité du compte</span>
                <span className="db-profile-detail-value">Activée (Chiffrement SSL)</span>
              </div>
            </div>

            <div className="db-profile-detail-item">
              <div className="db-profile-detail-icon db-profile-detail-icon--blue">
                <i className="ti ti-key" aria-hidden="true" />
              </div>
              <div className="db-profile-detail-text">
                <span className="db-profile-detail-label">Rôle d'administration</span>
                <span className="db-profile-detail-value">Super Admin (Droits complets)</span>
              </div>
            </div>

            <div className="db-profile-detail-item">
              <div className="db-profile-detail-icon db-profile-detail-icon--orange">
                <i className="ti ti-history" aria-hidden="true" />
              </div>
              <div className="db-profile-detail-text">
                <span className="db-profile-detail-label">Dernière connexion</span>
                <span className="db-profile-detail-value">{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integrated React Modal - MODIFIER LES INFORMATIONS */}
      {showInfoModal && (
        <div className="db-modal-overlay" onClick={() => setShowInfoModal(false)}>
          <div className="db-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-header">
              <h3 className="db-modal-title">Modifier mes informations</h3>
              <button className="db-modal-close-btn" onClick={() => setShowInfoModal(false)}>
                <i className="ti ti-x" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleInfoSubmit} className="db-modal-form">
              {infoError && (
                <div className="db-modal-error-banner">
                  <i className="ti ti-alert-triangle" aria-hidden="true" />
                  <span>{infoError}</span>
                </div>
              )}

              <div className="db-form-row">
                <div className="db-form-group">
                  <label>Prénom</label>
                  <input
                    type="text"
                    value={infoForm.prenom}
                    onChange={(e) => setInfoForm({ ...infoForm, prenom: e.target.value })}
                    required
                    placeholder="Votre prénom"
                  />
                </div>
                <div className="db-form-group">
                  <label>Nom</label>
                  <input
                    type="text"
                    value={infoForm.nom}
                    onChange={(e) => setInfoForm({ ...infoForm, nom: e.target.value })}
                    required
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div className="db-form-group">
                <label>Adresse email</label>
                <input
                  type="email"
                  value={infoForm.email}
                  onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })}
                  required
                  placeholder="exemple@domaine.com"
                />
              </div>

              <div className="db-form-group">
                <label>Numéro de téléphone</label>
                <input
                  type="text"
                  value={infoForm.telephone}
                  onChange={(e) => setInfoForm({ ...infoForm, telephone: e.target.value })}
                  placeholder="+221 77 000 00 00"
                />
              </div>

              <div className="db-form-group">
                <label>Adresse physique</label>
                <input
                  type="text"
                  value={infoForm.adresse}
                  onChange={(e) => setInfoForm({ ...infoForm, adresse: e.target.value })}
                  placeholder="Dakar, Sénégal"
                />
              </div>

              <div className="db-modal-footer">
                <button type="button" className="db-modal-btn db-modal-btn--secondary" onClick={() => setShowInfoModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="db-modal-btn db-modal-btn--primary" disabled={infoSubmitting}>
                  {infoSubmitting ? (
                    <span className="db-spinner db-spinner--sm" />
                  ) : (
                    "Enregistrer les modifications"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Integrated React Modal - MODIFIER LE MOT DE PASSE */}
      {showPasswordModal && (
        <div className="db-modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="db-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-header">
              <h3 className="db-modal-title">Modifier mon mot de passe</h3>
              <button className="db-modal-close-btn" onClick={() => setShowPasswordModal(false)}>
                <i className="ti ti-x" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="db-modal-form">
              {passwordError && (
                <div className="db-modal-error-banner">
                  <i className="ti ti-alert-triangle" aria-hidden="true" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="db-form-group">
                <label>Ancien mot de passe</label>
                <input
                  type="password"
                  placeholder="Saisissez votre mot de passe actuel"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  required
                />
              </div>

              <div className="db-form-group">
                <label>Nouveau mot de passe</label>
                <input
                  type="password"
                  placeholder="Minimum 8 caractères conseillés"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
              </div>

              <div className="db-modal-footer">
                <button type="button" className="db-modal-btn db-modal-btn--secondary" onClick={() => setShowPasswordModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="db-modal-btn db-modal-btn--primary" disabled={passwordSubmitting}>
                  {passwordSubmitting ? (
                    <span className="db-spinner db-spinner--sm" />
                  ) : (
                    "Mettre à jour le mot de passe"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}