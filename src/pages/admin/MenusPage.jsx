import { useEffect, useState, useCallback } from 'react';
import { getMenus, creerMenu, updateMenu, supprimerMenu } from '../../api/rbac.api';
import SkeletonTable from '../../components/common/SkeletonTable';
import Badge from '../../components/common/Badge';
import Modal from '../../components/modals/Modal';
import ConfirmModal from '../../components/modals/ConfirmModal';
import FormField from '../../components/forms/FormField';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/formatters';
import { extractError } from '../../utils/apiHelpers';
import { toast } from '../../utils/toast';
import useDebounce from '../../hooks/useDebounce';
import useTitle from '../../hooks/useTitle';
import { PAGE_SIZE } from '../../constants/ui';

const EMPTY_FORM = { name: '', code: '', path: '', icon: '', ordre: 0 };

export default function MenusPage() {
  useTitle('Menus');
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  const load = useCallback(async () => {
    try {
      const res = await getMenus();
      setMenus(res.data?.menus || []);
    } catch (e) {
      toast.error(extractError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = menus.filter((m) => {
    const s = debouncedSearch.toLowerCase();
    return !s || (m.name || '').toLowerCase().includes(s) || (m.code || '').toLowerCase().includes(s);
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setFormErrors({}); setFormOpen(true); };
  const openEdit = (menu) => {
    setEditTarget(menu);
    setForm({ name: menu.name, code: menu.code, path: menu.path, icon: menu.icon || '', ordre: menu.ordre || 0 });
    setFormErrors({});
    setFormOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Requis';
    if (!form.code.trim()) e.code = 'Requis';
    if (!form.path.trim()) e.path = 'Requis';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (formErrors[name]) setFormErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editTarget) {
        await updateMenu(editTarget.id, form);
        toast.success('Menu modifié');
      } else {
        await creerMenu(form);
        toast.success('Menu créé');
      }
      setFormOpen(false);
      await load();
    } catch (e) {
      toast.error(extractError(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await supprimerMenu(deleteTarget.id);
      toast.success(`Menu "${deleteTarget.name}" supprimé`);
      setDeleteTarget(null);
      await load();
    } catch (e) {
      toast.error(extractError(e));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Menus</h1>
          <p>{menus.length} menu(s) configuré(s)</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Ajouter un menu</button>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Liste des menus</span>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Rechercher..." />
        </div>
        {loading ? <SkeletonTable rows={8} cols={7} /> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom</th><th>Code</th><th>Chemin</th><th>Ordre</th><th>Statut</th><th>Créé le</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                    {debouncedSearch ? `Aucun résultat pour "${debouncedSearch}"` : 'Aucun menu enregistré'}
                  </td></tr>
                ) : paginated.map((m) => (
                  <tr key={m.id}>
                    <td className="td-bold">{m.name}</td>
                    <td><code style={{ background: 'var(--color-bg)', padding: '2px 6px', borderRadius: 4, fontSize: '0.8rem' }}>{m.code}</code></td>
                    <td className="td-muted">{m.path}</td>
                    <td className="td-muted">{m.ordre}</td>
                    <td><Badge variant={m.isActive ? 'success' : 'default'}>{m.isActive ? 'Actif' : 'Inactif'}</Badge></td>
                    <td className="td-muted">{formatDate(m.createdAt)}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(m)}>Modifier</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(m)}>Supprimer</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding: '0.75rem 1.25rem' }}>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} />
        </div>
      </div>

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editTarget ? 'Modifier le menu' : 'Nouveau menu'}
        footer={<>
          <button className="btn btn-secondary" onClick={() => setFormOpen(false)} disabled={saving}>Annuler</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Sauvegarde...' : (editTarget ? 'Enregistrer' : 'Créer')}</button>
        </>}
      >
        <FormField label="Nom" name="name" value={form.name} onChange={handleChange} error={formErrors.name} required placeholder="Ex: Utilisateurs" />
        <FormField label="Code" name="code" value={form.code} onChange={handleChange} error={formErrors.code} required placeholder="Ex: UTILISATEURS" />
        <FormField label="Chemin (route)" name="path" value={form.path} onChange={handleChange} error={formErrors.path} required placeholder="Ex: /francomaliship/admin/utilisateurs" />
        <FormField label="Icône (optionnel)" name="icon" value={form.icon} onChange={handleChange} placeholder="Ex: users" />
        <FormField label="Ordre d'affichage" name="ordre" type="number" value={form.ordre} onChange={handleChange} placeholder="0" />
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Supprimer le menu"
        message={`Voulez-vous supprimer "${deleteTarget?.name}" ? Les permissions associées seront aussi supprimées.`}
        confirmLabel="Supprimer" variant="danger"
      />
    </div>
  );
}
