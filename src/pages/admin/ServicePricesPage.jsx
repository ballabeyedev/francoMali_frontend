import { useEffect, useMemo, useState } from 'react';
import useTitle from '../../hooks/useTitle';
import SkeletonTable from '../../components/common/SkeletonTable';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import Modal from '../../components/modals/Modal';
import ConfirmModal from '../../components/modals/ConfirmModal';
import FormField from '../../components/forms/FormField';
import FormSelect from '../../components/forms/FormSelect';
import { toast } from '../../utils/toast';
import { getServicePrices, createServicePrice, updateServicePrice, deleteServicePrice } from '../../api/servicePrices.api';
import { getCountries } from '../../api/countries.api';
import { formatPrice } from '../../utils/formatters';

const PAGE_SIZE = 15;
const EMPTY = { countryId: '', serviceType: 'récupération', price: '' };
const SERVICE_OPTIONS = [
  { value: 'récupération', label: 'Récupération' },
  { value: 'livraison', label: 'Livraison' },
];
const extract = (res) => res.data?.data ?? res.data?.servicePrices ?? res.data ?? [];

export default function ServicePricesPage() {
  useTitle('Prix services');
  const [prices, setPrices]       = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [page, setPage]           = useState(1);
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving]       = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, cRes] = await Promise.all([getServicePrices(), getCountries()]);
      const pData = extract(pRes);
      const cData = cRes.data?.data ?? cRes.data?.countries ?? cRes.data ?? [];
      setPrices(Array.isArray(pData) ? pData : []);
      setCountries(Array.isArray(cData) ? cData : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const countryName = (id) => {
    const c = countries.find((x) => (x.id || x._id) === id);
    return c ? c.name : 'N/A';
  };
  const countryOptions = useMemo(
    () => countries.map((c) => ({ value: c.id || c._id, label: c.name })),
    [countries]
  );

  const totalPages = Math.ceil(prices.length / PAGE_SIZE) || 1;
  const pageItems = useMemo(
    () => prices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [prices, page]
  );

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const openCreate = () => { setEditId(null); setForm(EMPTY); setFormErrors({}); setShowForm(true); };
  const openEdit = (p) => {
    setEditId(p.id || p._id);
    setForm({ countryId: p.countryId || '', serviceType: p.serviceType || 'récupération', price: String(p.price ?? '') });
    setFormErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.countryId) errs.countryId = 'Pays requis';
    if (!(parseFloat(form.price) >= 0)) errs.price = 'Prix invalide';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = { countryId: form.countryId, serviceType: form.serviceType, price: parseFloat(form.price) };
    try {
      if (editId) { await updateServicePrice(editId, payload); toast.success('Prix mis à jour'); }
      else { await createServicePrice(payload); toast.success('Prix créé'); }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Enregistrement impossible');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    try {
      await deleteServicePrice(confirmDel);
      toast.success('Prix supprimé');
      setConfirmDel(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Suppression impossible');
      setConfirmDel(null);
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Prix services ({prices.length})</div>
          <button className="btn btn-primary" onClick={openCreate}>+ Ajouter un prix</button>
        </div>

        {loading ? <SkeletonTable rows={8} cols={4} />
          : error ? <ErrorState message={error} onRetry={load} />
          : prices.length === 0 ? <EmptyState message="Aucun prix trouvé" />
          : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Pays</th><th>Service</th><th>Prix</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {pageItems.map((p) => (
                    <tr key={p.id || p._id}>
                      <td className="td-bold">{countryName(p.countryId)}</td>
                      <td><Badge variant={(p.serviceType || '').includes('livr') ? 'info' : 'default'}>{p.serviceType}</Badge></td>
                      <td>{formatPrice(p.price)}</td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Modifier</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setConfirmDel(p.id || p._id)}>Supprimer</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editId ? 'Modifier le prix' : 'Ajouter un prix'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Enregistrement…' : (editId ? 'Mettre à jour' : 'Créer')}</button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <FormSelect label="Pays" name="countryId" value={form.countryId} onChange={setField('countryId')} options={countryOptions} placeholder="Sélectionner un pays" error={formErrors.countryId} required />
          <FormSelect label="Type de service" name="serviceType" value={form.serviceType} onChange={setField('serviceType')} options={SERVICE_OPTIONS} />
          <FormField label="Prix (€)" name="price" type="number" step="0.01" value={form.price} onChange={setField('price')} error={formErrors.price} required />
          <button type="submit" style={{ display: 'none' }} />
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={handleDelete}
        title="Supprimer le prix"
        message="Êtes-vous sûr de vouloir supprimer ce prix de service ?"
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  );
}
