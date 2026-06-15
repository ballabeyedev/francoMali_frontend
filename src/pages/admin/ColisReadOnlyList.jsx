import { useEffect, useMemo, useState } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { formatDate, formatWeight, truncate } from '../../utils/formatters';
import { typeLabel } from './colisHelpers';

const PAGE_SIZE = 15;

/** Liste de colis en lecture seule, partagée par les pages Livrés / Récupérés. */
export default function ColisReadOnlyList({ title, fetchFn, emptyMessage }) {
  const [colis, setColis]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [page, setPage]       = useState(1);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn();
      const data = res.data?.colis ?? res.data?.data ?? res.data ?? [];
      setColis(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const totalPages = Math.ceil(colis.length / PAGE_SIZE) || 1;
  const pageItems = useMemo(
    () => colis.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [colis, page]
  );

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">{title} ({colis.length})</div>
      </div>

      {loading ? <LoadingSpinner />
        : error ? <ErrorState message={error} onRetry={load} />
        : colis.length === 0 ? <EmptyState message={emptyMessage} />
        : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Référence</th><th>Expéditeur</th><th>Destinataire</th>
                  <th>Pays</th><th>Poids</th><th>Type</th><th>Date</th>
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
                    <td className="td-muted">{formatDate(c.createdAt || c.dateCreation)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
