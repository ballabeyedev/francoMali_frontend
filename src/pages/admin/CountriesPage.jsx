import { useState, useEffect } from 'react';
import countryAPI from '../../api/country.api';
import './AdminPages.css';

export default function CountriesPage() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    isActive: true,
  });

  // Fetch countries
  const fetchCountries = async () => {
    setLoading(true);
    try {
      const response = await countryAPI.getAllCountries();
      setCountries(response.data || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
      alert('Erreur lors de la récupération des pays');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.code) {
      alert('Tous les champs sont obligatoires');
      return;
    }

    try {
      if (editingId) {
        await countryAPI.updateCountry(editingId, formData);
        alert('Pays mis à jour avec succès');
      } else {
        await countryAPI.createCountry(formData);
        alert('Pays créé avec succès');
      }
      resetForm();
      fetchCountries();
    } catch (error) {
      console.error('Error saving country:', error);
      alert(error.message || 'Erreur lors de l\'enregistrement');
    }
  };

  // Handle edit
  const handleEdit = (country) => {
    setEditingId(country.id);
    setFormData({
      name: country.name,
      code: country.code,
      isActive: country.isActive,
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce pays ?')) {
      try {
        await countryAPI.deleteCountry(id);
        alert('Pays supprimé avec succès');
        fetchCountries();
      } catch (error) {
        console.error('Error deleting country:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      isActive: true,
    });
    setEditingId(null);
    setShowModal(false);
  };

  // Filter countries
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Gestion des Pays</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          Ajouter un Pays
        </button>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Rechercher par nom ou code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Chargement...</div>
      ) : (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Code</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCountries.map((country) => (
                <tr key={country.id}>
                  <td>{country.name}</td>
                  <td>{country.code}</td>
                  <td>
                    <span className={`badge ${country.isActive ? 'active' : 'inactive'}`}>
                      {country.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(country)}
                    >
                      Modifier
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(country.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCountries.length === 0 && (
            <div className="no-data">Aucun pays trouvé</div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Modifier le Pays' : 'Ajouter un Pays'}</h2>
              <button className="close-btn" onClick={() => resetForm()}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nom du Pays *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Mali"
                />
              </div>

              <div className="form-group">
                <label>Code du Pays *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="Ex: ML"
                  maxLength="3"
                />
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Actif
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingId ? 'Mettre à jour' : 'Créer'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => resetForm()}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
