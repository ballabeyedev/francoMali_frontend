import { useCallback, useEffect, useMemo, useState } from 'react';
import validator from 'validator';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import SkeletonTable from '../../components/common/SkeletonTable';
import PasswordStrength from '../../components/common/PasswordStrength';
import Modal from '../../components/modals/Modal';
import ConfirmModal from '../../components/modals/ConfirmModal';
import FormField from '../../components/forms/FormField';
import FormSelect from '../../components/forms/FormSelect';
import { toast } from '../../utils/toast';
import useDebounce from '../../hooks/useDebounce';
import useTitle from '../../hooks/useTitle';
import useSort from '../../hooks/useSort';
import { getAdmins, rechercherAdmin, ajouterAdmin, activerAdmin, desactiverAdmin } from '../../api/admins.api';
import { formatDate } from '../../utils/formatters';
import { extractList, extractError } from '../../utils/apiHelpers';
import { PAGE_SIZE } from '../../constants/ui';

const isActif = (a) => a.actif ?? a.isActive ?? a.active ?? false;
const EMPTY = { prenom: '', nom: '', email: '', motDePasse: '', confirmMdp: '', telephone: '', role: 'admin' };

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'superadmin', label: 'Super Admin' },
];

export default function AdminsPage() {
  useTitle('Gestion des administrateurs');
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
  const { sorted, toggle, sortIcon } = useSort(admins, null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = debounced.trim() ? await rechercherAdmin(debounced.trim()) : await getAdmins();
      setAdmins(extractList(res, 'admins', 'data'));
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

  const setField = useCallback((k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value })), []);

  const validate = () => {
    const errs = {};
    if (!form.prenom.trim()) errs.prenom = 'Prénom requis';
    if (!form.nom.trim()) errs.nom = 'Nom requis';
    if (!validator.isEmail(form.email.trim())) errs.email = 'Email invalide';
    if (form.motDePasse.length < 8) errs.motDePasse = 'Minimum 8 caractères';
    else if (!/[A-Z]/.test(form.motDePasse)) errs.motDePasse = '1 majuscule requise';
    else if (!/[0-9]/.test(form.motDePasse)) errs.motDePasse = '1 chiffre requis';
    else if (!/[^A-Za-z0-9]/.test(form.motDePasse)) errs.motDePasse = '1 caractère spécial requis';
    if (form.confirmMdp !== form.motDePasse) errs.confirmMdp = 'Les mots de passe ne correspondent pas';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const { confirmMdp: _, ...payload } = form;
      await ajouterAdmin(payload);
      toast.success('Administrateur ajouté');
      setShowAdd(false);
      setForm(EMPTY);
      setFormErrors({});
      load();
    } catch (err) {
      toast.error(extractError(err));
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
      toast.error(extractError(err));
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

        {loading ? <SkeletonTable rows={8} cols={7} />
          : error ? <ErrorState message={error} onRetry={load} />
          : admins.length === 0 ? <EmptyState message="Aucun administrateur trouvé" searchTerm={search} />
          : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => toggle('prenom')} className="sortable-th" tabIndex={0} role="columnheader">Prénom <span className="sort-icon" aria-hidden="true">{sortIcon('prenom')}</span></th>
                    <th onClick={() => toggle('nom')} className="sortable-th" tabIndex={0} role="columnheader">Nom <span className="sort-icon" aria-hidden="true">{sortIcon('nom')}</span></th>
                    <th onClick={() => toggle('email')} className="sortable-th" tabIndex={0} role="columnheader">Email <span className="sort-icon" aria-hidden="true">{sortIcon('email')}</span></th>
                    <th>Rôle</th><th>Statut</th><th>Date</th><th>Actions</th>
                  </tr>
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
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} totalItems={admins.length} />
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
          <PasswordStrength password={form.motDePasse} />
          <FormField label="Confirmer mot de passe" name="confirmMdp" type="password" value={form.confirmMdp} onChange={setField('confirmMdp')} error={formErrors.confirmMdp} required />
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
