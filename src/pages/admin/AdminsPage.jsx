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
import useDebounce from '../../hooks/useDebounce';
import { getAdmins, rechercherAdmin, ajouterAdmin, activerAdmin, desactiverAdmin } from '../../api/admins.api';
import { formatDate } from '../../utils/formatters';

const PAGE_SIZE = 15;
const isActif = (a) => a.actif ?? a.isActive ?? a.active ?? false;
const EMPTY = { prenom: '', nom: '', email: '', motDePasse: '', telephone: '', role: 'admin' };

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'superadmin', label: 'Super Admin' },
];

export default function AdminsPage() {
  const [admins, setAdmins]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [confirm, setConfirm] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState(EMPTY);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving]   = useState(false);
  const debounced = useDebounce(search, 300);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = debounced.trim() ? await rechercherAdmin(debounced.trim()) : await getAdmins();
      const data = res.data?.admins ?? res.data?.data ?? res.data ?? [];
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); setPage(1); }, [debounced]);

  const totalPages = Math.ceil(admins.length / PAGE_SIZE) || 1;
  const pageItems = useMemo(
    () => admins.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [admins, page]
  );

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.prenom.trim()) errs.prenom = 'Prénom requis';
    if (!form.nom.trim()) errs.nom = 'Nom requis';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Email invalide';
    if (form.motDePasse.length < 6) errs.motDePasse = 'Minimum 6 caractères';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await ajouterAdmin(form);
      toast.success('Administrateur ajouté');
      setShowAdd(false);
      setForm(EMPTY);
      setFormErrors({});
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Création impossible');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    try {
      await confirm.action(confirm.id);
      toast.success(confirm.activate ? 'Administrateur activé' : 'Administrateur désactivé');
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
          <div className="card-title">Administrateurs ({admins.length})</div>
          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
            <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un admin…" />
            <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setFormErrors({}); setShowAdd(true); }}>+ Ajouter admin</button>
          </div>
        </div>

        {loading ? <LoadingSpinner />
          : error ? <ErrorState message={error} onRetry={load} />
          : admins.length === 0 ? <EmptyState message="Aucun administrateur trouvé" />
          : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Prénom</th><th>Nom</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Date</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {pageItems.map((a) => {
                    const id = a.id || a._id;
                    const actif = isActif(a);
                    return (
                      <tr key={id || a.email}>
                        <td className="td-bold">{a.prenom || '—'}</td>
                        <td>{a.nom || '—'}</td>
                        <td className="td-muted">{a.email || '—'}</td>
                        <td className="td-muted">{a.role || 'admin'}</td>
                        <td>{actif ? <Badge variant="success">Actif</Badge> : <Badge variant="danger">Inactif</Badge>}</td>
                        <td className="td-muted">{formatDate(a.createdAt || a.dateCreation)}</td>
                        <td>
                          {actif
                            ? <button className="btn btn-danger btn-sm" onClick={() => setConfirm({ id, action: desactiverAdmin, activate: false })}>Désactiver</button>
                            : <button className="btn btn-success btn-sm" onClick={() => setConfirm({ id, action: activerAdmin, activate: true })}>Activer</button>}
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

      <Modal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Ajouter un administrateur"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Annuler</button>
            <button className="btn btn-primary" onClick={handleAdd} disabled={saving}>{saving ? 'Enregistrement…' : 'Créer'}</button>
          </>
        }
      >
        <form onSubmit={handleAdd}>
          <FormField label="Prénom" name="prenom" value={form.prenom} onChange={setField('prenom')} error={formErrors.prenom} required />
          <FormField label="Nom" name="nom" value={form.nom} onChange={setField('nom')} error={formErrors.nom} required />
          <FormField label="Email" name="email" type="email" value={form.email} onChange={setField('email')} error={formErrors.email} required />
          <FormField label="Mot de passe" name="motDePasse" type="password" value={form.motDePasse} onChange={setField('motDePasse')} error={formErrors.motDePasse} required />
          <FormField label="Téléphone" name="telephone" value={form.telephone} onChange={setField('telephone')} />
          <FormSelect label="Rôle" name="role" value={form.role} onChange={setField('role')} options={ROLE_OPTIONS} />
          <button type="submit" style={{ display: 'none' }} />
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleConfirm}
        title={confirm?.activate ? 'Activer l\'administrateur' : 'Désactiver l\'administrateur'}
        message={confirm?.activate ? 'Confirmer l\'activation de cet administrateur ?' : 'Confirmer la désactivation de cet administrateur ?'}
        confirmLabel={confirm?.activate ? 'Activer' : 'Désactiver'}
        variant={confirm?.activate ? 'success' : 'danger'}
      />
    </div>
  );
}
