import { useState, useEffect } from 'react';
import servicePriceAPI from '../../api/servicePrice.api';
import countryAPI from '../../api/country.api';
import './AdminPages.css';

export default function ServicePricesPage() {
  const [prices, setPrices] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({
    countryId: '',
    serviceType: '',
  });
  const [formData, setFormData] = useState({
    countryId: '',
    serviceType: 'récupération',
    price: '',
  });

  // Fetch countries and prices
  const fetchCountries = async () => {
    try {
      const response = await countryAPI.getAllCountries();
      setCountries(response.data || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const response = await servicePriceAPI.getAllServicePrices(filters);
      setPrices(response.data || []);
    } catch (error) {
      console.error('Error fetching prices:', error);
      alert('Erreur lors de la récupération des prix');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [filters]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.countryId || !formData.price) {
      alert('Tous les champs sont obligatoires');
      return;
    }

    try {
      const data = {
        countryId: formData.countryId,
        serviceType: formData.serviceType,
        price: parseFloat(formData.price),
      };

      if (editingId) {
        await servicePriceAPI.updateServicePrice(editingId, data);
        alert('Prix mis à jour avec succès');
      } else {
        await servicePriceAPI.createServicePrice(data);
        alert('Prix créé avec succès');
      }
      resetForm();
      fetchPrices();
    } catch (error) {
      console.error('Error saving price:', error);
      alert(error.message || 'Erreur lors de l\'enregistrement');
    }
  };

  // Handle edit
  const handleEdit = (price) => {
    setEditingId(price.id);
    setFormData({
      countryId: price.countryId,
      serviceType: price.serviceType,
      price: price.price,
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce prix ?')) {
      try {
        await servicePriceAPI.deleteServicePrice(id);
        alert('Prix supprimé avec succès');
        fetchPrices();
      } catch (error) {
        console.error('Error deleting price:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      countryId: '',
      serviceType: 'récupération',
      price: '',
    });
    setEditingId(null);
    setShowModal(false);
  };

  // Get country name by ID
  const getCountryName = (countryId) => {
    const country = countries.find(c => c.id === countryId);
    return country ? country.name : 'N/A';
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Gestion des Prix de Services</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          Ajouter un Prix
        </button>
      </div>

      <div className="filters">
        <select
          value={filters.countryId}
          onChange={(e) => setFilters({ ...filters, countryId: e.target.value })}
        >
          <option value="">Tous les pays</option>
          {countries.map(country => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </select>

        <select
          value={filters.serviceType}
          onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
        >
          <option value="">Tous les services</option>
          <option value="récupération">Récupération</option>
          <option value="livraison">Livraison</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Chargement...</div>
      ) : (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Pays</th>
                <th>Service</th>
                <th>Prix (€)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((price) => (
                <tr key={price.id}>
                  <td>{getCountryName(price.countryId)}</td>
                  <td>{price.serviceType}</td>
                  <td>{price.price}</td>
                  <td className="actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(price)}
                    >
                      Modifier
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(price.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {prices.length === 0 && (
            <div className="no-data">Aucun prix trouvé</div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Modifier le Prix' : 'Ajouter un Prix'}</h2>
              <button className="close-btn" onClick={() => resetForm()}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Pays *</label>
                <select
                  value={formData.countryId}
                  onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
                >
                  <option value="">Sélectionner un pays</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Type de Service *</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="serviceType"
                      value="récupération"
                      checked={formData.serviceType === 'récupération'}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    />
                    Récupération
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="serviceType"
                      value="livraison"
                      checked={formData.serviceType === 'livraison'}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    />
                    Livraison
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Prix (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Ex: 5"
                />
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
