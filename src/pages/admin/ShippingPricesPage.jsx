import { useEffect, useMemo, useState } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import Modal from '../../components/modals/Modal';
import ConfirmModal from '../../components/modals/ConfirmModal';
import FormField from '../../components/forms/FormField';
import FormSelect from '../../components/forms/FormSelect';
import { toast } from '../../utils/toast';
import { getShippingPrices, createShippingPrice, updateShippingPrice, deleteShippingPrice } from '../../api/shippingPrices.api';
import { getCountries } from '../../api/countries.api';
import { formatPrice } from '../../utils/formatters';

const PAGE_SIZE = 15;
const EMPTY = { countryId: '', type: 'aérien', minWeight: '', maxWeight: '', pricePerKg: '' };
const TYPE_OPTIONS = [
  { value: 'aérien', label: 'Aérien' },
  { value: 'maritime', label: 'Maritime' },
];
const extract = (res) => res.data?.data ?? res.data?.shippingPrices ?? res.data ?? [];

export default function ShippingPricesPage() {
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
      const [pRes, cRes] = await Promise.all([getShippingPrices(), getCountries()]);
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
    setForm({ countryId: p.countryId || '', type: p.type || 'aérien', minWeight: String(p.minWeight ?? ''), maxWeight: String(p.maxWeight ?? ''), pricePerKg: String(p.pricePerKg ?? '') });
    setFormErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.countryId) errs.countryId = 'Pays requis';
    const min = parseFloat(form.minWeight), max = parseFloat(form.maxWeight), ppk = parseFloat(form.pricePerKg);
    if (!(min >= 0)) errs.minWeight = 'Poids min invalide';
    if (!(max > 0)) errs.maxWeight = 'Poids max invalide';
    if (min >= 0 && max > 0 && min >= max) errs.maxWeight = 'Le max doit être supérieur au min';
    if (!(ppk >= 0)) errs.pricePerKg = 'Prix invalide';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      countryId: form.countryId,
      type: form.type,
      minWeight: parseFloat(form.minWeight),
      maxWeight: parseFloat(form.maxWeight),
      pricePerKg: parseFloat(form.pricePerKg),
    };
    try {
      if (editId) { await updateShippingPrice(editId, payload); toast.success('Prix mis à jour'); }
      else { await createShippingPrice(payload); toast.success('Prix créé'); }
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
      await deleteShippingPrice(confirmDel);
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
          <div className="card-title">Prix de fret ({prices.length})</div>
          <button className="btn btn-primary" onClick={openCreate}>+ Ajouter un prix</button>
        </div>

        {loading ? <LoadingSpinner />
          : error ? <ErrorState message={error} onRetry={load} />
          : prices.length === 0 ? <EmptyState message="Aucun prix trouvé" />
          : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Pays</th><th>Type</th><th>Poids min</th><th>Poids max</th><th>Prix/kg</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {pageItems.map((p) => (
                    <tr key={p.id || p._id}>
                      <td className="td-bold">{countryName(p.countryId)}</td>
                      <td><Badge variant={(p.type || '').includes('mar') ? 'info' : 'default'}>{p.type}</Badge></td>
                      <td>{p.minWeight} kg</td>
                      <td>{p.maxWeight} kg</td>
                      <td>{formatPrice(p.pricePerKg)}</td>
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
          <FormSelect label="Type de transport" name="type" value={form.type} onChange={setField('type')} options={TYPE_OPTIONS} />
          <FormField label="Poids minimum (kg)" name="minWeight" type="number" step="0.1" value={form.minWeight} onChange={setField('minWeight')} error={formErrors.minWeight} required />
          <FormField label="Poids maximum (kg)" name="maxWeight" type="number" step="0.1" value={form.maxWeight} onChange={setField('maxWeight')} error={formErrors.maxWeight} required />
          <FormField label="Prix par kg (€)" name="pricePerKg" type="number" step="0.01" value={form.pricePerKg} onChange={setField('pricePerKg')} error={formErrors.pricePerKg} required />
          <button type="submit" style={{ display: 'none' }} />
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={handleDelete}
        title="Supprimer le prix"
        message="Êtes-vous sûr de vouloir supprimer ce prix de fret ?"
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  );
}
