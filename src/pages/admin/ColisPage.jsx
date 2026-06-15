import { useEffect, useMemo, useState } from 'react';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import SkeletonTable from '../../components/common/SkeletonTable';
import useDebounce from '../../hooks/useDebounce';
import useTitle from '../../hooks/useTitle';
import useSort from '../../hooks/useSort';
import { getColis, rechercherColis } from '../../api/colis.api';
import { formatDate, formatWeight, truncate } from '../../utils/formatters';
import { statutBadge, typeLabel } from '../../utils/colisHelpers.jsx';
import { extractList, extractError } from '../../utils/apiHelpers';
import { PAGE_SIZE } from '../../constants/ui';

export default function ColisPage() {
  useTitle('Tous les colis');
  const [colis, setColis]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const debounced = useDebounce(search, 300);
  const { sorted, toggle, sortIcon } = useSort(colis, null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = debounced.trim()
        ? await rechercherColis(debounced.trim())
        : await getColis();
      setColis(extractList(res, 'colis', 'data'));
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

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Tous les colis ({colis.length})</div>
          <SearchInput value={search} onChange={setSearch} placeholder="Rechercher par référence…" />
        </div>

        {loading ? <SkeletonTable rows={8} cols={8} />
          : error ? <ErrorState message={error} onRetry={load} />
          : colis.length === 0 ? <EmptyState message="Aucun colis trouvé" searchTerm={search} />
          : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => toggle('reference')} className="sortable-th" tabIndex={0} role="columnheader" aria-sort="none">
                      Référence <span className="sort-icon" aria-hidden="true">{sortIcon('reference')}</span>
                    </th>
                    <th>Expéditeur</th><th>Destinataire</th>
                    <th>Pays</th><th>Poids</th><th>Type</th><th>Statut</th>
                    <th onClick={() => toggle('createdAt')} className="sortable-th" tabIndex={0} role="columnheader">
                      Date <span className="sort-icon" aria-hidden="true">{sortIcon('createdAt')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((c) => (
                    <tr key={c.id || c._id || c.reference}>
                      <td className="td-bold">{c.reference || '—'}</td>
                      <td>{truncate(c.expediteur || c.nomExpediteur || '—', 24)}</td>
                      <td>{truncate(c.destinataire || c.nomDestinataire || '—', 24)}</td>
                      <td className="td-muted">{c.paysDestination || c.pays || c.country?.name || '—'}</td>
                      <td>{formatWeight(c.poids)}</td>
                      <td className="td-muted">{typeLabel(c.type || c.typeExpedition)}</td>
                      <td>{statutBadge(c.statut || c.status)}</td>
                      <td className="td-muted">{formatDate(c.createdAt || c.dateCreation)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} totalItems={colis.length} />
      </div>
    </div>
  );
}
