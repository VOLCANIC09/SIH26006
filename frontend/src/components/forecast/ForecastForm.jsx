import React, { useState } from 'react';
import ForecastResult from './ForecastResult';
import { Activity, ShieldAlert, BarChart2, Ship, Anchor, Globe, Scale } from 'lucide-react';

export default function ForecastForm() {
  const [formData, setFormData] = useState({
    origin: "Australia",
    destination: "Paradip",
    commodity: "Coal",
    cargoQuantity: 70000,
    vesselType: "Panamax",
    forecastPeriod: 30
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // API placeholder function as requested
  const generateForecastApi = async (data) => {
    // Later this will call:
    // const response = await fetch('/api/forecast', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // });
    // return await response.json();
    
    // For now, simulate API response with delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Deterministic mock calculations based on route and vessel for realism
    const baseRates = {
      Australia: { Paradip: 20.40, Visakhapatnam: 21.80, Gangavaram: 19.50, Gopalpur: 23.00, Dhamra: 20.00, "Sagar-Sandheads": 28.50, Haldia: 32.00 },
      USA: { Paradip: 32.50, Visakhapatnam: 33.80, Gangavaram: 31.00, Gopalpur: 35.00, Dhamra: 32.00, "Sagar-Sandheads": 42.00, Haldia: 46.50 },
      Mozambique: { Paradip: 18.20, Visakhapatnam: 19.50, Gangavaram: 17.50, Gopalpur: 20.80, Dhamra: 18.00, "Sagar-Sandheads": 26.00, Haldia: 29.50 },
      Indonesia: { Paradip: 14.50, Visakhapatnam: 15.80, Gangavaram: 13.80, Gopalpur: 16.50, Dhamra: 14.00, "Sagar-Sandheads": 21.00, Haldia: 24.50 },
      Russia: { Paradip: 23.50, Visakhapatnam: 24.80, Gangavaram: 22.00, Gopalpur: 26.00, Dhamra: 23.00, "Sagar-Sandheads": 31.50, Haldia: 35.00 }
    };

    const base = baseRates[data.origin]?.[data.destination] || 25.0;
    const factor = data.vesselType === 'Capesize' ? 0.8 : data.vesselType === 'Panamax' ? 1.0 : data.vesselType === 'Supramax' ? 1.25 : 1.5;
    
    const currentRate = parseFloat((base * factor).toFixed(2));
    
    // Simulate expected change based on period and commodity
    const changePct = data.commodity === 'Coal' ? -8.33 : data.commodity === 'Iron Ore' ? 5.25 : 2.10;
    const predictedRate = parseFloat((currentRate * (1 + changePct / 100)).toFixed(2));
    const confidence = data.forecastPeriod <= 30 ? 86 : data.forecastPeriod <= 60 ? 78 : 65;

    return {
      currentRate,
      predictedRate,
      expectedChange: changePct,
      confidence
    };
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    // 1. Validation
    if (!formData.origin || !formData.destination || !formData.commodity || !formData.cargoQuantity || !formData.vesselType || !formData.forecastPeriod) {
      setError('Please fill in all route and cargo parameter fields.');
      return;
    }

    if (formData.cargoQuantity <= 0) {
      setError('Cargo quantity must be a positive number.');
      return;
    }

    // 2. Set Loading
    setLoading(true);

    try {
      // 3. Call simulated API
      const forecastData = await generateForecastApi(formData);
      setResult(forecastData);
    } catch (err) {
      setError('An error occurred while generating the forecast.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forecast-input-panel">
      <div className="glass-forecast-card">
        
        {/* Card Header */}
        <div className="form-card-header">
          <h2 className="form-card-title">Freight Forecast</h2>
          <p className="form-card-subtitle">Configure your cargo and route parameters</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="form-error-alert">
            <ShieldAlert className="error-alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* 2-Column Responsive Form */}
        <form onSubmit={handleSubmit} className="forecast-form-layout">
          
          {/* Origin Port */}
          <div className="form-input-group">
            <label className="form-input-label">Origin</label>
            <div className="input-with-icon">
              <Globe className="field-icon" />
              <select
                value={formData.origin}
                onChange={(e) => handleInputChange('origin', e.target.value)}
                className="form-select-field"
                disabled={loading}
              >
                <option value="Australia">Australia</option>
                <option value="USA">USA</option>
                <option value="Mozambique">Mozambique</option>
                <option value="Indonesia">Indonesia</option>
                <option value="Russia">Russia</option>
              </select>
            </div>
          </div>

          {/* Destination Port */}
          <div className="form-input-group">
            <label className="form-input-label">Destination</label>
            <div className="input-with-icon">
              <Anchor className="field-icon" />
              <select
                value={formData.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                className="form-select-field"
                disabled={loading}
              >
                <option value="Paradip">Paradip</option>
                <option value="Visakhapatnam">Visakhapatnam</option>
                <option value="Gangavaram">Gangavaram</option>
                <option value="Gopalpur">Gopalpur</option>
                <option value="Dhamra">Dhamra</option>
                <option value="Sagar-Sandheads">Sagar-Sandheads</option>
                <option value="Haldia">Haldia</option>
              </select>
            </div>
          </div>

          {/* Commodity */}
          <div className="form-input-group">
            <label className="form-input-label">Commodity</label>
            <div className="input-with-icon">
              <Scale className="field-icon" />
              <select
                value={formData.commodity}
                onChange={(e) => handleInputChange('commodity', e.target.value)}
                className="form-select-field"
                disabled={loading}
              >
                <option value="Coal">Coal</option>
                <option value="Iron Ore">Iron Ore</option>
                <option value="Limestone">Limestone</option>
                <option value="Other Bulk Cargo">Other Bulk Cargo</option>
              </select>
            </div>
          </div>

          {/* Cargo Quantity */}
          <div className="form-input-group">
            <label className="form-input-label">Cargo Quantity</label>
            <div className="quantity-field-container">
              <input
                type="number"
                value={formData.cargoQuantity}
                onChange={(e) => handleInputChange('cargoQuantity', parseInt(e.target.value) || 0)}
                className="form-number-field"
                placeholder="70000"
                min="1000"
                disabled={loading}
              />
              <span className="quantity-unit-tag">MT</span>
            </div>
          </div>

          {/* Vessel Type */}
          <div className="form-input-group">
            <label className="form-input-label">Vessel Type</label>
            <div className="input-with-icon">
              <Ship className="field-icon" />
              <select
                value={formData.vesselType}
                onChange={(e) => handleInputChange('vesselType', e.target.value)}
                className="form-select-field"
                disabled={loading}
              >
                <option value="Handysize">Handysize</option>
                <option value="Supramax">Supramax</option>
                <option value="Panamax">Panamax</option>
                <option value="Capesize">Capesize</option>
              </select>
            </div>
          </div>

          {/* Forecast Period */}
          <div className="form-input-group">
            <label className="form-input-label">Forecast Period</label>
            <div className="input-with-icon">
              <Activity className="field-icon" />
              <select
                value={formData.forecastPeriod}
                onChange={(e) => handleInputChange('forecastPeriod', parseInt(e.target.value) || 30)}
                className="form-select-field"
                disabled={loading}
              >
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
                <option value="30">30 Days</option>
                <option value="60">60 Days</option>
                <option value="90">90 Days</option>
              </select>
            </div>
          </div>

          {/* Button container: spans 2 columns on desktop */}
          <div className="form-submit-container">
            <button
              type="submit"
              disabled={loading}
              className={`btn-generate-forecast ${loading ? 'loading-state' : ''}`}
            >
              {loading ? (
                <>
                  <div className="btn-spinner" />
                  <span>CALCULATING MODEL...</span>
                </>
              ) : (
                <>
                  <BarChart2 className="btn-chart-icon" />
                  <span>GENERATE FORECAST</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Render result output below the form */}
      <ForecastResult result={result} />

      <style>{`
        .glass-forecast-card {
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--border-radius);
          padding: 2rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);
          color: white;
          position: relative;
        }

        .form-card-header {
          margin-bottom: 1.5rem;
        }

        .form-card-title {
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
        }

        .form-card-subtitle {
          font-size: 0.85rem;
          color: #94a3b8;
          margin-top: 0.25rem;
        }

        .form-error-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 0.6rem 0.85rem;
          border-radius: 8px;
          font-size: 0.8rem;
          margin-bottom: 1.25rem;
        }

        .error-alert-icon {
          width: 1rem;
          height: 1rem;
          flex-shrink: 0;
        }

        .forecast-form-layout {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 768px) {
          .forecast-form-layout {
            grid-template-columns: 1fr;
          }
          .form-submit-container {
            grid-column: span 1 !important;
          }
        }

        .form-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .form-input-label {
          font-size: 0.725rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 0.85rem;
          width: 0.95rem;
          height: 0.95rem;
          color: #475569;
          pointer-events: none;
        }

        .form-select-field {
          width: 100%;
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          padding: 0.65rem 1rem 0.65rem 2.25rem;
          font-family: var(--font-sans);
          font-size: 0.875rem;
          outline: none;
          cursor: pointer;
          transition: var(--transition-smooth);
          appearance: none; /* remove default arrow */
          background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.85rem center;
          background-size: 0.95rem;
        }

        .form-select-field:focus {
          border-color: #0284c7;
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
          background-color: #1e293b;
        }

        .quantity-field-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .form-number-field {
          width: 100%;
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          padding: 0.65rem 3.5rem 0.65rem 1rem;
          font-family: var(--font-sans);
          font-size: 0.875rem;
          outline: none;
          transition: var(--transition-smooth);
        }

        .form-number-field:focus {
          border-color: #0284c7;
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
          background-color: #1e293b;
        }

        .quantity-unit-tag {
          position: absolute;
          right: 0.85rem;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.8rem;
          color: #64748b;
          background-color: rgba(255, 255, 255, 0.05);
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
        }

        .form-submit-container {
          grid-column: span 2;
          margin-top: 0.5rem;
        }

        .btn-generate-forecast {
          width: 100%;
          background: #0284c7;
          color: white;
          border: 1px solid rgba(2, 132, 199, 0.4);
          border-radius: 8px;
          padding: 0.8rem 1.5rem;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: 0.03em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: var(--transition-smooth);
          box-shadow: 0 4px 15px rgba(2, 132, 199, 0.3);
        }

        .btn-generate-forecast:hover:not(:disabled) {
          background: #0369a1;
          box-shadow: 0 6px 20px rgba(2, 132, 199, 0.5);
          transform: translateY(-1px);
        }

        .btn-generate-forecast:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-chart-icon {
          width: 1.1rem;
          height: 1.1rem;
        }

        .btn-spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
