import Swal from 'sweetalert2';
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getUser } from "../../services/auth.service";
import {
  getUtilisateurs,
  activerUtilisateur,
  desactiverUtilisateur,
  getNombreUtilisateurs,
  getListeColis,
  getColisEnAttente,
  getColisLivres,
  getColisRecuperes,
  getNombreColis,
  getNombreColisEnAttente,
  getNombreColisLivres,
  getNombreColisRecuperes,
  rechercherColis,
  changerStatutEnAttente,
  changerStatutLivre,
  changerStatutRecupere,
  modifierPassword,
  modifierInfo,
  getAdmins,
  ajouterAdmin,
  activerAdmin,
  desactiverAdmin,
  getNombreAdmins,
  rechercherAdmin,
  rechercherUtilisateur,
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
  { key: "admins", label: "Admins", icon: "ti-shield" },
  { key: "profil", label: "Profil", icon: "ti-user" },
];

const PAGE_TITLES = {
  accueil: "Tableau de bord",
  colis: "Gestion des colis",
  utilisateurs: "Gestion des utilisateurs",
  admins: "Gestion des Administrateurs",
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
      case "admins": return <ListeAdmins />;
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
  const [stats, setStats] = useState({ colis: null, utilisateurs: null, admins: null });
  const [colisAttente, setColisAttente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nbColis, nbUtilisateurs, nbAdmins, attente] = await Promise.all([
        getNombreColis(),
        getNombreUtilisateurs(),
        getNombreAdmins(),
        getColisEnAttente(),
      ]);
      setStats({ colis: nbColis, utilisateurs: nbUtilisateurs, admins: nbAdmins });
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
      label: "Total Colis",
      value: stats.colis?.nombre_colis ?? "—",
      subType: "success",
      icon: "ti-package",
    },
    {
      label: "En attente",
      value: colisAttente.length ?? "—",
      subType: "warning",
      icon: "ti-clock",
    },
    {
      label: "Utilisateurs",
      value: stats.utilisateurs?.total ?? "—",
      subType: "success",
      icon: "ti-users",
    },
    {
      label: "Administrateurs",
      value: stats.admins?.data ?? "—",
      subType: "info",
      icon: "ti-shield",
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
          <ColisTable data={colisAttente.slice(0, 5)} onRefresh={fetchData} />
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
  const [filter, setFilter] = useState("tous"); // "tous" | "en_attente" | "recupere" | "livre"
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({ tous: 0, en_attente: 0, recupere: 0, livre: 0 });

  const fetchCounts = useCallback(async () => {
    try {
      const [nbTous, nbAttente, nbRecupere, nbLivre] = await Promise.all([
        getNombreColis(),
        getNombreColisEnAttente(),
        getNombreColisRecuperes(),
        getNombreColisLivres(),
      ]);
      setCounts({
        tous: nbTous?.nombre_colis ?? 0,
        en_attente: nbAttente?.nombre_colis ?? 0,
        recupere: nbRecupere?.nombre_colis ?? 0,
        livre: nbLivre?.nombre_colis ?? 0,
      });
    } catch (e) {
      console.error("Error loading counts", e);
    }
  }, []);

  const fetchColis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (filter === "tous") {
        data = await getListeColis();
      } else if (filter === "en_attente") {
        data = await getColisEnAttente();
      } else if (filter === "recupere") {
        data = await getColisRecuperes();
      } else if (filter === "livre") {
        data = await getColisLivres();
      }
      setColis(data?.colis || data || []);
      await fetchCounts();
    } catch {
      setError("Impossible de charger la liste des colis.");
    } finally {
      setLoading(false);
    }
  }, [filter, fetchCounts]);

  useEffect(() => {
    fetchColis();
  }, [fetchColis]);

  const filtered = colis.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const ref = (c.reference || "").toLowerCase();
    const dest = (c.destination || "").toLowerCase();

    // Extract labels safely
    const expName = `${c.expediteur?.prenom || ""} ${c.expediteur?.nom || ""}`.toLowerCase();
    const recName = `${c.recepteur?.prenom || ""} ${c.recepteur?.nom || ""}`.toLowerCase();
    const expRaw = typeof c.expediteur === "string" ? c.expediteur.toLowerCase() : "";
    const recRaw = typeof c.destinataire === "string" ? c.destinataire.toLowerCase() : "";

    return (
      ref.includes(q) ||
      dest.includes(q) ||
      expName.includes(q) ||
      recName.includes(q) ||
      expRaw.includes(q) ||
      recRaw.includes(q)
    );
  });

  const tabItems = [
    { key: "tous", label: "Tous", icon: "ti-package", count: counts.tous },
    { key: "en_attente", label: "En attente", icon: "ti-clock", count: counts.en_attente },
    { key: "recupere", label: "Récupérés", icon: "ti-truck", count: counts.recupere },
    { key: "livre", label: "Livrés", icon: "ti-circle-check", count: counts.livre },
  ];

  return (
    <div className="db-table-card">
      <div className="db-table-header" style={{ borderBottom: "none", paddingBottom: "10px" }}>
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

      {/* Segmented Control Tabs */}
      <div className="db-tabs-segment">
        {tabItems.map((item) => (
          <button
            key={item.key}
            className={`db-tab-segment-btn ${filter === item.key ? "active" : ""}`}
            onClick={() => {
              setFilter(item.key);
              setSearch("");
            }}
          >
            <i className={`ti ${item.icon}`} aria-hidden="true" />
            <span>{item.label}</span>
            <span className="db-tab-badge">{item.count}</span>
          </button>
        ))}
      </div>

      {loading && <Spinner />}
      {!loading && error && <ErrorBanner message={error} onRetry={fetchColis} />}
      {!loading && !error && filtered.length === 0 && (
        <div className="db-empty">
          <i className="ti ti-package-off" aria-hidden="true" />
          <span>{search ? "Aucun résultat pour cette recherche" : "Aucun colis trouvé"}</span>
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <ColisTable data={filtered} onRefresh={fetchColis} />
      )}
    </div>
  );
}

function ColisTable({ data, onRefresh }) {
  const [updatingId, setUpdatingId] = useState(null);

  const getExpediteurLabel = (c) => {
    if (!c) return "—";
    if (c.expediteur && typeof c.expediteur === "object") {
      return `${c.expediteur.prenom || ""} ${c.expediteur.nom || ""}`.trim() || "—";
    }
    return c.expediteur || "—";
  };

  const getDestinataireLabel = (c) => {
    if (!c) return "—";
    const target = c.recepteur || c.destinataire;
    if (target && typeof target === "object") {
      return `${target.prenom || ""} ${target.nom || ""}`.trim() || "—";
    }
    return c.destinataire || c.recepteur || "—";
  };

  const handleStatusChange = async (colisId, newStatus) => {
    const actionText =
      newStatus === "en_attente" ? "mettre en attente" :
        newStatus === "recupere" ? "marquer comme récupéré" : "marquer comme livré";

    const result = await Swal.fire({
      title: "Modifier le statut du colis ?",
      text: `Êtes-vous sûr de vouloir ${actionText} ce colis ?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Oui, confirmer",
      cancelButtonText: "Annuler",
    });

    if (!result.isConfirmed) return;

    setUpdatingId(colisId);
    try {
      if (newStatus === "en_attente") {
        await changerStatutEnAttente(colisId);
      } else if (newStatus === "recupere") {
        await changerStatutRecupere(colisId);
      } else if (newStatus === "livre") {
        await changerStatutLivre(colisId);
      }

      Swal.fire({
        title: "Statut mis à jour !",
        text: "Le statut du colis a été modifié avec succès.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      if (onRefresh) onRefresh();
    } catch (err) {
      Swal.fire({
        title: "Erreur !",
        text: err.response?.data?.message || "Impossible de modifier le statut.",
        icon: "error",
      });
    } finally {
      setUpdatingId(null);
    }
  };

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
            const id = c._id || c.id;
            return (
              <tr key={c.reference || i}>
                <td className="db-td-primary">{c.reference || "—"}</td>
                <td>{getExpediteurLabel(c)}</td>
                <td>{getDestinataireLabel(c)}</td>
                <td>{c.destination || "—"}</td>
                <td>{c.poids != null ? `${c.poids} kg` : "—"}</td>
                <td>{c.prix != null ? `${Number(c.prix).toFixed(2)} €` : "—"}</td>
                <td>
                  <span className={s.className}>
                    <i className={`ti ${s.icon}`} aria-hidden="true" />
                    {s.label}
                  </span>
                </td>
                <td style={{ minWidth: "260px" }}>
                  <div className="db-row-actions" style={{ display: "flex", gap: "6px" }}>
                    {updatingId === id ? (
                      <span className="db-spinner db-spinner--sm" />
                    ) : (
                      <>
                        {c.statut !== "en_attente" && (
                          <button
                            className="db-action-pill-btn"
                            onClick={() => handleStatusChange(id, "en_attente")}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "6px 10px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: "600",
                              border: "1px solid #ffedd5",
                              backgroundColor: "#fff7ed",
                              color: "#ea580c",
                              cursor: "pointer"
                            }}
                          >
                            <i className="ti ti-clock" aria-hidden="true" />
                            <span>En attente</span>
                          </button>
                        )}
                        {c.statut !== "recupere" && (
                          <button
                            className="db-action-pill-btn"
                            onClick={() => handleStatusChange(id, "recupere")}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "6px 10px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: "600",
                              border: "1px solid #dcfce7",
                              backgroundColor: "#f0fdf4",
                              color: "#16a34a",
                              cursor: "pointer"
                            }}
                          >
                            <i className="ti ti-truck" aria-hidden="true" />
                            <span>Récupéré</span>
                          </button>
                        )}
                        {c.statut !== "livre" && (
                          <button
                            className="db-action-pill-btn"
                            onClick={() => handleStatusChange(id, "livre")}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "6px 10px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: "600",
                              border: "1px solid #e0f2fe",
                              backgroundColor: "#f0f9ff",
                              color: "#0284c7",
                              cursor: "pointer"
                            }}
                          >
                            <i className="ti ti-circle-check" aria-hidden="true" />
                            <span>Livré</span>
                          </button>
                        )}
                      </>
                    )}
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
      let data;
      if (search.trim()) {
        const params = {};
        const q = search.trim();
        if (q.includes("@")) {
          params.email = q;
        } else {
          const parts = q.split(/\s+/);
          if (parts.length >= 2) {
            params.prenom = parts[0];
            params.nom = parts.slice(1).join(" ");
          } else {
            params.nom = q;
          }
        }
        data = await rechercherUtilisateur(params);
      } else {
        data = await getUtilisateurs();
      }
      setUtilisateurs(data?.data || data || []);
    } catch {
      setError("Impossible de charger la liste des utilisateurs.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUtilisateurs();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search, fetchUtilisateurs]);

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

  const filtered = utilisateurs;

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
   LISTE ADMINS
   ══════════════════════════════════════ */
function ListeAdmins() {
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // États pour l'Ajout d'Admin
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    mot_de_passe: "",
    telephone: "",
    adresse: "",
  });
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState(null);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (search.trim()) {
        const params = {};
        const q = search.trim();
        if (q.includes("@")) {
          params.email = q;
        } else {
          const parts = q.split(/\s+/);
          if (parts.length >= 2) {
            params.prenom = parts[0];
            params.nom = parts.slice(1).join(" ");
          } else {
            params.nom = q;
          }
        }
        data = await rechercherAdmin(params);
      } else {
        data = await getAdmins();
      }
      setAdmins(data?.data || data || []);
    } catch {
      setError("Impossible de charger la liste des administrateurs.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchAdmins();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search, fetchAdmins]);

  const openAddModal = () => {
    setAddForm({
      nom: "",
      prenom: "",
      email: "",
      mot_de_passe: "",
      telephone: "",
      adresse: "",
    });
    setAddError(null);
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError(null);
    setAddSubmitting(true);
    try {
      await ajouterAdmin(addForm);
      Swal.fire({
        title: "Admin créé !",
        text: "Le nouvel administrateur a été ajouté avec succès.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      setShowAddModal(false);
      await fetchAdmins();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Une erreur est survenue lors de l'ajout.";
      setAddError(errMsg);
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleToggleActif = async (admin) => {
    const id = admin._id || admin.id;
    const active = isActif(admin);
    const actionText = active ? "désactiver" : "activer";

    const result = await Swal.fire({
      title: active ? "Désactiver l'admin ?" : "Activer l'admin ?",
      text: `Êtes-vous sûr de vouloir ${actionText} l'administrateur ${admin.prenom || ""} ${admin.nom || ""} ?`,
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
        await desactiverAdmin(id);
        Swal.fire({
          title: "Désactivé !",
          text: "L'administrateur a été désactivé avec succès.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await activerAdmin(id);
        Swal.fire({
          title: "Activé !",
          text: "L'administrateur a été activé avec succès.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
      await fetchAdmins();
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

  const filtered = admins;

  const isActif = (a) => {
    return (
      a.statut === "actif" ||
      a.actif === true ||
      a.isActive === true
    );
  };

  return (
    <div className="db-table-card">
      <div className="db-table-header">
        <span className="db-table-title">Tous les administrateurs</span>
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
          <button className="db-btn-secondary" onClick={fetchAdmins} aria-label="Rafraîchir">
            <i className="ti ti-refresh" aria-hidden="true" />
          </button>
          <button className="db-profile-action-btn db-profile-action-btn--primary" onClick={openAddModal} style={{ height: "38px", padding: "0 14px", borderRadius: "10px" }}>
            <i className="ti ti-plus" aria-hidden="true" />
            <span>Ajouter Admin</span>
          </button>
        </div>
      </div>

      {loading && <Spinner />}
      {!loading && error && <ErrorBanner message={error} onRetry={fetchAdmins} />}
      {!loading && !error && filtered.length === 0 && (
        <div className="db-empty">
          <i className="ti ti-users-off" aria-hidden="true" />
          <span>{search ? "Aucun résultat" : "Aucun administrateur trouvé"}</span>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          {/* ── Vue cartes MOBILE ── */}
          <div className="db-user-cards">
            {filtered.map((a, i) => {
              const id = a._id || a.id;
              const actif = isActif(a);
              const isToggling = togglingId === id;
              return (
                <div key={id || i} className="db-user-card">
                  <div className="db-user-card-header">
                    <div className="db-user-cell">
                      <div className="db-user-avatar db-user-avatar--sm">
                        {getInitials(`${a.prenom || ""} ${a.nom || ""}`)}
                      </div>
                      <div>
                        <div className="db-td-primary">{a.prenom} {a.nom}</div>
                        <div className="db-td-secondary">{a.role || "Admin"}</div>
                      </div>
                    </div>
                    <span className={actif ? "badge badge--success" : "badge badge--danger"}>
                      <i className={`ti ${actif ? "ti-circle-check" : "ti-circle-x"}`} aria-hidden="true" />
                      {actif ? "Actif" : "Inactif"}
                    </span>
                  </div>

                  <div className="db-user-card-body">
                    {a.email && (
                      <div className="db-user-card-row">
                        <i className="ti ti-mail" aria-hidden="true" />
                        <span>{a.email}</span>
                      </div>
                    )}
                    {a.telephone && (
                      <div className="db-user-card-row">
                        <i className="ti ti-phone" aria-hidden="true" />
                        <span>{a.telephone}</span>
                      </div>
                    )}
                    {a.adresse && (
                      <div className="db-user-card-row">
                        <i className="ti ti-map-pin" aria-hidden="true" />
                        <span>{a.adresse}</span>
                      </div>
                    )}
                  </div>

                  <div className="db-user-card-actions">
                    <button
                      className={`db-action-btn ${actif ? "db-action-btn--warning" : "db-action-btn--success"}`}
                      onClick={() => handleToggleActif(a)}
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
                  <th>Administrateur</th>
                  <th>Adresse</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => {
                  const id = a._id || a.id;
                  const actif = isActif(a);
                  const isToggling = togglingId === id;
                  return (
                    <tr key={id || i}>
                      <td>
                        <div className="db-user-cell">
                          <div className="db-user-avatar db-user-avatar--sm">
                            {getInitials(`${a.prenom || ""} ${a.nom || ""}`)}
                          </div>
                          <div>
                            <div className="db-td-primary">{a.prenom} {a.nom}</div>
                            <div className="db-td-secondary">{a.role || "Admin"}</div>
                          </div>
                        </div>
                      </td>
                      <td>{a.adresse || "—"}</td>
                      <td>{a.telephone || "—"}</td>
                      <td>{a.email || "—"}</td>
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
                            onClick={() => handleToggleActif(a)}
                            disabled={isToggling}
                            aria-label={actif ? "Désactiver" : "Activer"}
                            title={actif ? "Désactiver cet admin" : "Activer cet admin"}
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

      {/* ── MODAL AJOUT ADMIN ── */}
      {showAddModal && (
        <div className="db-modal-overlay">
          <div className="db-modal-container">
            <div className="db-modal-header">
              <span className="db-modal-title">Ajouter un nouvel Administrateur</span>
              <button className="db-modal-close-btn" onClick={() => setShowAddModal(false)} aria-label="Fermer">
                <i className="ti ti-x" aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="db-modal-form">
              <div className="db-form-row">
                <div className="db-form-group">
                  <label htmlFor="admin-prenom">Prénom</label>
                  <input
                    id="admin-prenom"
                    type="text"
                    required
                    value={addForm.prenom}
                    onChange={(e) => setAddForm({ ...addForm, prenom: e.target.value })}
                    placeholder="Entrez le prénom"
                  />
                </div>
                <div className="db-form-group">
                  <label htmlFor="admin-nom">Nom</label>
                  <input
                    id="admin-nom"
                    type="text"
                    required
                    value={addForm.nom}
                    onChange={(e) => setAddForm({ ...addForm, nom: e.target.value })}
                    placeholder="Entrez le nom"
                  />
                </div>
              </div>

              <div className="db-form-group">
                <label htmlFor="admin-email">Adresse Email</label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="exemple@gmail.com"
                />
              </div>

              <div className="db-form-group">
                <label htmlFor="admin-mot-de-passe">Mot de passe</label>
                <input
                  id="admin-mot-de-passe"
                  type="password"
                  required
                  value={addForm.mot_de_passe}
                  onChange={(e) => setAddForm({ ...addForm, mot_de_passe: e.target.value })}
                  placeholder="Au moins 8 caractères"
                />
              </div>

              <div className="db-form-row">
                <div className="db-form-group">
                  <label htmlFor="admin-telephone">Téléphone</label>
                  <input
                    id="admin-telephone"
                    type="tel"
                    value={addForm.telephone}
                    onChange={(e) => setAddForm({ ...addForm, telephone: e.target.value })}
                    placeholder="+22177..."
                  />
                </div>
                <div className="db-form-group">
                  <label htmlFor="admin-adresse">Adresse</label>
                  <input
                    id="admin-adresse"
                    type="text"
                    value={addForm.adresse}
                    onChange={(e) => setAddForm({ ...addForm, adresse: e.target.value })}
                    placeholder="Dakar, Sénégal"
                  />
                </div>
              </div>

              {addError && (
                <div className="db-modal-error-banner" role="alert">
                  <i className="ti ti-alert-circle" aria-hidden="true" />
                  <span>{addError}</span>
                </div>
              )}

              <div className="db-modal-footer">
                <button
                  type="button"
                  className="db-modal-btn db-modal-btn--secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="db-modal-btn db-modal-btn--primary"
                  disabled={addSubmitting}
                >
                  {addSubmitting ? (
                    <span className="db-spinner db-spinner--sm" />
                  ) : (
                    "Créer l'administrateur"
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

/* ══════════════════════════════════════
   MON PROFIL (VUE ADMIN)
   ══════════════════════════════════════ */
function Profil({ user, onUpdateUser }) {
  const navigate = useNavigate();
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
      const responseData = await modifierInfo(user.id, infoForm);

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
        text: "Vos informations personnelles ont été modifiées avec succès. Veuillez vous reconnecter.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      setShowInfoModal(false);

      // Déconnexion et redirection vers le login après le message de succès (2s)
      setTimeout(() => {
        logout();
        navigate("/francomaliship/auth/login");
      }, 2000);
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
      await modifierPassword(user.id, passwordForm.oldPassword, passwordForm.newPassword);

      Swal.fire({
        title: "Succès !",
        text: "Votre mot de passe a été modifié avec succès. Veuillez vous reconnecter.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      setShowPasswordModal(false);
      setPasswordForm({ oldPassword: "", newPassword: "" });

      // Déconnexion et redirection vers le login après le message de succès (2s)
      setTimeout(() => {
        logout();
        navigate("/francomaliship/auth/login");
      }, 2000);
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