import { useState, useEffect, useCallback } from 'react';
import StatCard from '../../components/common/StatCard';
import useTitle from '../../hooks/useTitle';
import { getNombreColis, getNombreEnAttente, getNombreLivres, getNombreRecuperes } from '../../api/colis.api';
import { getNombreUtilisateurs } from '../../api/utilisateurs.api';
import { getNombreAdmins } from '../../api/admins.api';

const pick = (r) => r.data?.nombre ?? r.data?.count ?? r.data?.total ?? '--';

export default function DashboardPage() {
  useTitle('Tableau de bord');
  const [stats, setStats] = useState({ colis: '--', attente: '--', livres: '--', recuperes: '--', users: '--', admins: '--' });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      getNombreColis(),
      getNombreEnAttente(),
      getNombreLivres(),
      getNombreRecuperes(),
      getNombreUtilisateurs(),
      getNombreAdmins(),
    ]);
    const val = (r, extractor) => r.status === 'fulfilled' ? (extractor(r.value) ?? '--') : '--';
    setStats({
      colis:     val(results[0], pick),
      attente:   val(results[1], pick),
      livres:    val(results[2], pick),
      recuperes: val(results[3], pick),
      users:     val(results[4], pick),
      admins:    val(results[5], pick),
    });
    setLastUpdate(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    // loadStats gère son propre setLoading/setStats — c'est intentionnel
    void loadStats();
    const interval = setInterval(() => { void loadStats(); }, 60_000);
    return () => clearInterval(interval);
  }, [loadStats]);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Vue d&apos;ensemble</h1>
          {lastUpdate && (
            <p className="dashboard-last-update">
              Dernière mise à jour : {lastUpdate.toLocaleTimeString('fr-FR')}
            </p>
          )}
        </div>
        <button className="dashboard-refresh-btn" onClick={loadStats} disabled={loading}>
          {loading ? 'Chargement…' : '↻ Actualiser'}
        </button>
      </div>
      <div className="dashboard-grid">
        <StatCard loading={loading} title="Total colis"     value={stats.colis}     color="var(--color-primary)" icon={<><path d="M20 7L12 3L4 7m16 0v10l-8 4m8-14L12 11M4 7v10l8 4M12 11v10"/></>} />
        <StatCard loading={loading} title="En attente"      value={stats.attente}   color="#f57f17" icon={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>} />
        <StatCard loading={loading} title="Livrés"          value={stats.livres}    color="#2e7d32" icon={<><polyline points="20 6 9 17 4 12"/></>} />
        <StatCard loading={loading} title="Récupérés"       value={stats.recuperes} color="#1565c0" icon={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>} />
        <StatCard loading={loading} title="Utilisateurs"    value={stats.users}     color="var(--color-primary)" icon={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></>} />
        <StatCard loading={loading} title="Administrateurs" value={stats.admins}    color="#6a1b9a" icon={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>} />
      </div>
    </div>
  );
}
