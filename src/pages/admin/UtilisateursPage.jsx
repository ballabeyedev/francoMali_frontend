import { useEffect, useMemo, useState } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import ConfirmModal from '../../components/modals/ConfirmModal';
import { toast } from '../../utils/toast';
import useDebounce from '../../hooks/useDebounce';
import { getUtilisateurs, rechercherUtilisateur, activerUtilisateur, desactiverUtilisateur } from '../../api/utilisateurs.api';
import { formatDate } from '../../utils/formatters';

const PAGE_SIZE = 15;
const isActif = (u) => u.actif ?? u.isActive ?? u.active ?? false;

export default function UtilisateursPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [confirm, setConfirm] = useState(null);
  const debounced = useDebounce(search, 300);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = debounced.trim()
        ? await rechercherUtilisateur(debounced.trim())
        : await getUtilisateurs();
      const data = res.data?.utilisateurs ?? res.data?.data ?? res.data ?? [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); setPage(1); }, [debounced]);

  const totalPages = Math.ceil(users.length / PAGE_SIZE) || 1;
  const pageItems = useMemo(
    () => users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [users, page]
  );

  const handleConfirm = async () => {
    if (!confirm) return;
    try {
      await confirm.action(confirm.id);
      toast.success(confirm.activate ? 'Utilisateur activé' : 'Utilisateur désactivé');
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action impossible');
      setConfirm(null);
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Utilisateurs ({users.length})</div>
          <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un utilisateur…" />
        </div>

        {loading ? <LoadingSpinner />
          : error ? <ErrorState message={error} onRetry={load} />
          : users.length === 0 ? <EmptyState message="Aucun utilisateur trouvé" />
          : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Prénom</th><th>Nom</th><th>Email</th><th>Téléphone</th><th>Statut</th><th>Inscription</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {pageItems.map((u) => {
                    const id = u.id || u._id;
                    const actif = isActif(u);
                    return (
                      <tr key={id || u.email}>
                        <td className="td-bold">{u.prenom || '—'}</td>
                        <td>{u.nom || '—'}</td>
                        <td className="td-muted">{u.email || '—'}</td>
                        <td className="td-muted">{u.telephone || u.tel || '—'}</td>
                        <td>{actif ? <Badge variant="success">Actif</Badge> : <Badge variant="danger">Inactif</Badge>}</td>
                        <td className="td-muted">{formatDate(u.createdAt || u.dateInscription)}</td>
                        <td>
                          {actif
                            ? <button className="btn btn-danger btn-sm" onClick={() => setConfirm({ id, action: desactiverUtilisateur, activate: false })}>Désactiver</button>
                            : <button className="btn btn-success btn-sm" onClick={() => setConfirm({ id, action: activerUtilisateur, activate: true })}>Activer</button>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <ConfirmModal
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleConfirm}
        title={confirm?.activate ? 'Activer l\'utilisateur' : 'Désactiver l\'utilisateur'}
        message={confirm?.activate ? 'Confirmer l\'activation de cet utilisateur ?' : 'Confirmer la désactivation de cet utilisateur ?'}
        confirmLabel={confirm?.activate ? 'Activer' : 'Désactiver'}
        variant={confirm?.activate ? 'success' : 'danger'}
      />
    </div>
  );
}
