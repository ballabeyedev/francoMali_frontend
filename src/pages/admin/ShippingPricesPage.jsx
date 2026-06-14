import { useState, useEffect } from 'react';
import shippingPriceAPI from '../../api/shippingPrice.api';
import countryAPI from '../../api/country.api';
import './AdminPages.css';

export default function ShippingPricesPage() {
  const [prices, setPrices] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({
    countryId: '',
    type: '',
  });
  const [formData, setFormData] = useState({
    countryId: '',
    type: 'aérien',
    minWeight: '',
    maxWeight: '',
    pricePerKg: '',
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
      const response = await shippingPriceAPI.getAllShippingPrices(filters);
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

    if (!formData.countryId || !formData.minWeight || !formData.maxWeight || !formData.pricePerKg) {
      alert('Tous les champs sont obligatoires');
      return;
    }

    if (parseFloat(formData.minWeight) >= parseFloat(formData.maxWeight)) {
      alert('Le poids minimum doit être inférieur au poids maximum');
      return;
    }

    try {
      const data = {
        countryId: formData.countryId,
        type: formData.type,
        minWeight: parseFloat(formData.minWeight),
        maxWeight: parseFloat(formData.maxWeight),
        pricePerKg: parseFloat(formData.pricePerKg),
      };

      if (editingId) {
        await shippingPriceAPI.updateShippingPrice(editingId, data);
        alert('Prix mis à jour avec succès');
      } else {
        await shippingPriceAPI.createShippingPrice(data);
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
      type: price.type,
      minWeight: price.minWeight,
      maxWeight: price.maxWeight,
      pricePerKg: price.pricePerKg,
    });
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce prix ?')) {
      try {
        await shippingPriceAPI.deleteShippingPrice(id);
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
      type: 'aérien',
      minWeight: '',
      maxWeight: '',
      pricePerKg: '',
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
        <h1>Gestion des Prix de Transport</h1>
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
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">Tous les types</option>
          <option value="aérien">Aérien</option>
          <option value="maritime">Maritime</option>
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
                <th>Type</th>
                <th>Poids Min (kg)</th>
                <th>Poids Max (kg)</th>
                <th>Prix/kg (€)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((price) => (
                <tr key={price.id}>
                  <td>{getCountryName(price.countryId)}</td>
                  <td>{price.type}</td>
                  <td>{price.minWeight}</td>
                  <td>{price.maxWeight}</td>
                  <td>{price.pricePerKg}</td>
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
                <label>Type de Transport *</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="type"
                      value="aérien"
                      checked={formData.type === 'aérien'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    />
                    Aérien
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="type"
                      value="maritime"
                      checked={formData.type === 'maritime'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    />
                    Maritime
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Poids Minimum (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.minWeight}
                  onChange={(e) => setFormData({ ...formData, minWeight: e.target.value })}
                  placeholder="Ex: 1"
                />
              </div>

              <div className="form-group">
                <label>Poids Maximum (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.maxWeight}
                  onChange={(e) => setFormData({ ...formData, maxWeight: e.target.value })}
                  placeholder="Ex: 10"
                />
              </div>

              <div className="form-group">
                <label>Prix par kg (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pricePerKg}
                  onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                  placeholder="Ex: 10"
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
