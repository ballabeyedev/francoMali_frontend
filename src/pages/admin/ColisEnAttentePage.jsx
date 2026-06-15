import { useEffect, useMemo, useState } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/modals/ConfirmModal';
import { toast } from '../../utils/toast';
import { getColisEnAttente, changerEnLivre, changerEnRecupere } from '../../api/colis.api';
import { formatDate, formatWeight, truncate } from '../../utils/formatters';
import { typeLabel } from './colisHelpers';

const PAGE_SIZE = 15;

export default function ColisEnAttentePage() {
  const [colis, setColis]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [page, setPage]       = useState(1);
  const [confirm, setConfirm] = useState(null); // { id, action, label }

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getColisEnAttente();
      const data = res.data?.colis ?? res.data?.data ?? res.data ?? [];
      setColis(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totalPages = Math.ceil(colis.length / PAGE_SIZE) || 1;
  const pageItems = useMemo(
    () => colis.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [colis, page]
  );

  const handleConfirm = async () => {
    if (!confirm) return;
    try {
      await confirm.action(confirm.id);
      toast.success(`Colis marqué « ${confirm.label} »`);
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors du changement de statut');
      setConfirm(null);
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Colis en attente ({colis.length})</div>
        </div>

        {loading ? <LoadingSpinner />
          : error ? <ErrorState message={error} onRetry={load} />
          : colis.length === 0 ? <EmptyState message="Aucun colis en attente" />
          : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Référence</th><th>Expéditeur</th><th>Destinataire</th>
                    <th>Pays</th><th>Poids</th><th>Type</th><th>Date</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((c) => {
                    const id = c.id || c._id;
                    return (
                      <tr key={id || c.reference}>
                        <td className="td-bold">{c.reference || '—'}</td>
                        <td>{truncate(c.expediteur || c.nomExpediteur || '—', 24)}</td>
                        <td>{truncate(c.destinataire || c.nomDestinataire || '—', 24)}</td>
                        <td className="td-muted">{c.paysDestination || c.pays || c.country?.name || '—'}</td>
                        <td>{formatWeight(c.poids)}</td>
                        <td className="td-muted">{typeLabel(c.type || c.typeExpedition)}</td>
                        <td className="td-muted">{formatDate(c.createdAt || c.dateCreation)}</td>
                        <td>
                          <div className="table-actions">
                            <button className="btn btn-success btn-sm" onClick={() => setConfirm({ id, action: changerEnLivre, label: 'Livré' })}>Livré</button>
                            <button className="btn btn-primary btn-sm" onClick={() => setConfirm({ id, action: changerEnRecupere, label: 'Récupéré' })}>Récupéré</button>
                          </div>
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
        title="Changer le statut"
        message={confirm ? `Confirmer le passage du colis au statut « ${confirm.label} » ?` : ''}
        confirmLabel="Confirmer"
        variant="primary"
      />
    </div>
  );
}
