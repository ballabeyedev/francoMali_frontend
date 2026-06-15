import { useEffect, useMemo, useState } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import Modal from '../../components/modals/Modal';
import ConfirmModal from '../../components/modals/ConfirmModal';
import FormField from '../../components/forms/FormField';
import FormSelect from '../../components/forms/FormSelect';
import { toast } from '../../utils/toast';
import { getCountries, createCountry, updateCountry, deleteCountry } from '../../api/countries.api';

const PAGE_SIZE = 15;
const EMPTY = { name: '', code: '', isActive: 'true' };
const STATUS_OPTIONS = [
  { value: 'true', label: 'Actif' },
  { value: 'false', label: 'Inactif' },
];

const extract = (res) => res.data?.data ?? res.data?.countries ?? res.data ?? [];

export default function CountriesPage() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
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
      const res = await getCountries();
      const data = extract(res);
      setCountries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors du chargement des pays');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((c) =>
      (c.name || '').toLowerCase().includes(q) || (c.code || '').toLowerCase().includes(q)
    );
  }, [countries, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const pageItems = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const openCreate = () => { setEditId(null); setForm(EMPTY); setFormErrors({}); setShowForm(true); };
  const openEdit = (c) => {
    setEditId(c.id || c._id);
    setForm({ name: c.name || '', code: c.code || '', isActive: String(c.isActive ?? true) });
    setFormErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Nom invalide';
    if (!form.code.trim()) errs.code = 'Code requis';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      isActive: form.isActive === 'true',
    };
    try {
      if (editId) {
        await updateCountry(editId, payload);
        toast.success('Pays mis à jour');
      } else {
        await createCountry(payload);
        toast.success('Pays créé');
      }
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
      await deleteCountry(confirmDel);
      toast.success('Pays supprimé');
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
          <div className="card-title">Pays ({filtered.length})</div>
          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Rechercher (nom ou code)…" />
            <button className="btn btn-primary" onClick={openCreate}>+ Ajouter un pays</button>
          </div>
        </div>

        {loading ? <LoadingSpinner />
          : error ? <ErrorState message={error} onRetry={load} />
          : filtered.length === 0 ? <EmptyState message="Aucun pays trouvé" />
          : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Nom</th><th>Code</th><th>Statut</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {pageItems.map((c) => (
                    <tr key={c.id || c._id}>
                      <td className="td-bold">{c.name}</td>
                      <td className="td-muted">{c.code}</td>
                      <td>{c.isActive ? <Badge variant="success">Actif</Badge> : <Badge variant="danger">Inactif</Badge>}</td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>Modifier</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setConfirmDel(c.id || c._id)}>Supprimer</button>
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
        title={editId ? 'Modifier le pays' : 'Ajouter un pays'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Enregistrement…' : (editId ? 'Mettre à jour' : 'Créer')}</button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <FormField label="Nom du pays" name="name" value={form.name} onChange={setField('name')} error={formErrors.name} placeholder="Ex: Mali" required />
          <FormField label="Code du pays" name="code" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} error={formErrors.code} placeholder="Ex: ML" maxLength={3} required />
          <FormSelect label="Statut" name="isActive" value={form.isActive} onChange={setField('isActive')} options={STATUS_OPTIONS} />
          <button type="submit" style={{ display: 'none' }} />
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={handleDelete}
        title="Supprimer le pays"
        message="Êtes-vous sûr de vouloir supprimer ce pays ? Cette action est irréversible."
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  );
}
