import { useEffect, useMemo, useState } from 'react';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import SkeletonTable from '../../components/common/SkeletonTable';
import ConfirmModal from '../../components/modals/ConfirmModal';
import { toast } from '../../utils/toast';
import useDebounce from '../../hooks/useDebounce';
import useTitle from '../../hooks/useTitle';
import useSort from '../../hooks/useSort';
import { getUtilisateurs, rechercherUtilisateur, activerUtilisateur, desactiverUtilisateur } from '../../api/utilisateurs.api';
import { formatDate } from '../../utils/formatters';
import { extractList, extractError } from '../../utils/apiHelpers';
import { PAGE_SIZE } from '../../constants/ui';

const isActif = (u) => u.actif ?? u.isActive ?? u.active ?? false;

export default function UtilisateursPage() {
  useTitle('Utilisateurs');
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [confirm, setConfirm] = useState(null);
  const debounced = useDebounce(search, 300);
  const { sorted, toggle, sortIcon } = useSort(users, null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = debounced.trim()
        ? await rechercherUtilisateur(debounced.trim())
        : await getUtilisateurs();
      setUsers(extractList(res, 'utilisateurs', 'data'));
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); setPage(1); }, [debounced]);

  const totalPages = Math.ceil((sorted?.length ?? 0) / PAGE_SIZE) || 1;
  const pageItems = useMemo(
    () => (sorted ?? []).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sorted, page]
  );

  const handleConfirm = async () => {
    if (!confirm) return;
    try {
      await confirm.action(confirm.id);
      toast.success(confirm.activate ? 'Utilisateur activé' : 'Utilisateur désactivé');
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(extractError(err));
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

        {loading ? <SkeletonTable rows={8} cols={7} />
          : error ? <ErrorState message={error} onRetry={load} />
          : users.length === 0 ? <EmptyState message="Aucun utilisateur trouvé" searchTerm={search} />
          : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => toggle('prenom')} className="sortable-th" tabIndex={0} role="columnheader">Prénom <span className="sort-icon" aria-hidden="true">{sortIcon('prenom')}</span></th>
                    <th onClick={() => toggle('nom')} className="sortable-th" tabIndex={0} role="columnheader">Nom <span className="sort-icon" aria-hidden="true">{sortIcon('nom')}</span></th>
                    <th onClick={() => toggle('email')} className="sortable-th" tabIndex={0} role="columnheader">Email <span className="sort-icon" aria-hidden="true">{sortIcon('email')}</span></th>
                    <th>Téléphone</th><th>Statut</th>
                    <th onClick={() => toggle('createdAt')} className="sortable-th" tabIndex={0} role="columnheader">Inscription <span className="sort-icon" aria-hidden="true">{sortIcon('createdAt')}</span></th>
                    <th>Actions</th>
                  </tr>
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
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} totalItems={users.length} />
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
