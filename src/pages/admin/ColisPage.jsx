import { useEffect, useMemo, useState } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import useDebounce from '../../hooks/useDebounce';
import { getColis, rechercherColis } from '../../api/colis.api';
import { formatDate, formatWeight, truncate } from '../../utils/formatters';
import { statutBadge, typeLabel } from './colisHelpers';

const PAGE_SIZE = 15;

export default function ColisPage() {
  const [colis, setColis]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const debounced = useDebounce(search, 300);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = debounced.trim()
        ? await rechercherColis(debounced.trim())
        : await getColis();
      const data = res.data?.colis ?? res.data?.data ?? res.data ?? [];
      setColis(Array.isArray(data) ? data : [data].filter(Boolean));
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors du chargement des colis');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); setPage(1); }, [debounced]);

  const totalPages = Math.ceil(colis.length / PAGE_SIZE) || 1;
  const pageItems = useMemo(
    () => colis.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [colis, page]
  );

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Tous les colis ({colis.length})</div>
          <SearchInput value={search} onChange={setSearch} placeholder="Rechercher par référence…" />
        </div>

        {loading ? <LoadingSpinner />
          : error ? <ErrorState message={error} onRetry={load} />
          : colis.length === 0 ? <EmptyState message="Aucun colis trouvé" />
          : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Référence</th><th>Expéditeur</th><th>Destinataire</th>
                    <th>Pays</th><th>Poids</th><th>Type</th><th>Statut</th><th>Date</th>
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
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
