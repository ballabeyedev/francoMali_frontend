import { useState, useEffect } from 'react';
import countryAPI from '../api/country.api';
import pricingAPI from '../api/pricing.api';
import './ShipmentCalculator.css';

export default function ShipmentCalculator({ onPriceCalculated }) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const [formData, setFormData] = useState({
    countryId: '',
    weight: '',
    shippingType: 'aérien',
    needsPickup: false,
    needsDelivery: false,
  });

  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [error, setError] = useState(null);

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(true);
      try {
        const response = await countryAPI.getAllCountries({ isActive: true });
        setCountries(response.data || []);
      } catch (err) {
        console.error('Error fetching countries:', err);
        setError('Erreur lors du chargement des pays');
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Calculate price whenever relevant fields change
  const handleCalculatePrice = async () => {
    if (!formData.countryId || !formData.weight || !formData.shippingType) {
      setError('Veuillez remplir tous les champs obligatoires');
      setPriceBreakdown(null);
      return;
    }

    setCalculating(true);
    setError(null);

    try {
      const response = await pricingAPI.calculatePrice({
        countryId: formData.countryId,
        weight: parseFloat(formData.weight),
        shippingType: formData.shippingType,
        needsPickup: formData.needsPickup,
        needsDelivery: formData.needsDelivery,
      });

      if (response.success) {
        setPriceBreakdown(response.data);
        if (onPriceCalculated) {
          onPriceCalculated(response.data.total, response.data);
        }
      } else {
        setError(response.message || 'Erreur lors du calcul du prix');
        setPriceBreakdown(null);
      }
    } catch (err) {
      console.error('Error calculating price:', err);
      setError(err.message || 'Erreur lors du calcul du prix');
      setPriceBreakdown(null);
    } finally {
      setCalculating(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Reset price when form changes
    setPriceBreakdown(null);
    setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCalculatePrice();
  };

  const getCountryName = (countryId) => {
    const country = countries.find(c => c.id === countryId);
    return country ? country.name : '';
  };

  return (
    <div className="shipment-calculator">
      <div className="calculator-card">
        <h2>Calculateur de Prix d'Envoi</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="country">Pays de Destination *</label>
              <select
                id="country"
                value={formData.countryId}
                onChange={(e) => handleInputChange('countryId', e.target.value)}
                disabled={loading}
              >
                <option value="">Sélectionner un pays...</option>
                {countries.map(country => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="weight">Poids du Colis (kg) *</label>
              <input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="Ex: 5"
              />
            </div>

            <div className="form-group">
              <label>Type d'Envoi *</label>
              <fieldset className="radio-group">
                <legend>Choisir le type d'envoi</legend>
                <label>
                  <input
                    type="radio"
                    name="shippingType"
                    value="aérien"
                    checked={formData.shippingType === 'aérien'}
                    onChange={(e) => handleInputChange('shippingType', e.target.value)}
                  />
                  Aérien
                </label>
                <label>
                  <input
                    type="radio"
                    name="shippingType"
                    value="maritime"
                    checked={formData.shippingType === 'maritime'}
                    onChange={(e) => handleInputChange('shippingType', e.target.value)}
                  />
                  Maritime
                </label>
              </fieldset>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.needsPickup}
                  onChange={(e) => handleInputChange('needsPickup', e.target.checked)}
                />
                Récupération du colis à domicile
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.needsDelivery}
                  onChange={(e) => handleInputChange('needsDelivery', e.target.checked)}
                />
                Livraison au destinataire
              </label>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="btn-calculate"
            disabled={calculating || loading}
          >
            {calculating ? 'Calcul en cours...' : 'Calculer le Prix'}
          </button>
        </form>

        {priceBreakdown && (
          <div className="price-breakdown">
            <h3>Détail du Tarif</h3>
            <div className="breakdown-item">
              <span>Transport ({formData.shippingType}):</span>
              <span className="price">{priceBreakdown.shippingPrice.toFixed(2)} €</span>
            </div>
            {formData.needsPickup && (
              <div className="breakdown-item">
                <span>Récupération:</span>
                <span className="price">{priceBreakdown.pickupPrice.toFixed(2)} €</span>
              </div>
            )}
            {formData.needsDelivery && (
              <div className="breakdown-item">
                <span>Livraison:</span>
                <span className="price">{priceBreakdown.deliveryPrice.toFixed(2)} €</span>
              </div>
            )}
            <div className="breakdown-total">
              <span>Total:</span>
              <span className="total-price">{priceBreakdown.total.toFixed(2)} €</span>
            </div>

            <div className="breakdown-info">
              <p>Destination: <strong>{getCountryName(formData.countryId)}</strong></p>
              <p>Poids: <strong>{formData.weight} kg</strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
