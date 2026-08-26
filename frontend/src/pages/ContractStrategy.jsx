import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { FileText, DollarSign, Calendar, Sparkles, Scale, Info } from 'lucide-react';

export default function ContractStrategy() {
  const [origin, setOrigin] = useState('newcastle');
  const [destination, setDestination] = useState('paradip');
  const [parcelSize, setParcelSize] = useState(70000);
  const [voyages, setVoyages] = useState(4);

  const [simResults, setSimResults] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const handleSimulate = async () => {
    setSimulating(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    const baseSpotRate = destination === 'paradip' ? 24.2 : destination === 'vizag' ? 36.5 : 28.0;
    const size = parseFloat(parcelSize) || 70000;
    
    // Spot voyages cost model
    const totalSpotUnit = baseSpotRate + 3.5;
    const totalSpotCost = size * voyages * totalSpotUnit;
    
    // Short-term contract (3-6 voyages) model
    const shortTermUnit = baseSpotRate - 1.2;
    const totalShortCost = size * voyages * shortTermUnit;
    
    // Medium-term contract (>6 voyages) model
    const mediumTermUnit = baseSpotRate - 2.8;
    const totalMediumCost = size * voyages * mediumTermUnit;

    const savingsST = totalSpotCost - totalShortCost;
    const savingsMT = totalSpotCost - totalMediumCost;

    setSimResults({
      spot: { rate: totalSpotUnit, total: totalSpotCost },
      shortTerm: { rate: shortTermUnit, total: totalShortCost, savings: savingsST },
      mediumTerm: { rate: mediumTermUnit, total: totalMediumCost, savings: savingsMT }
    });
    setSimulating(false);
  };

  useEffect(() => {
    handleSimulate();
  }, [origin, destination, parcelSize, voyages]);

  return (
    <div className="contract-strategy-view">
      <div className="page-header-desc">
        <p className="page-subtitle">Run contract coverage models. Contrast spot exposure against multi-voyage contract schedules to secure long-term cargo margins.</p>
      </div>

      <div className="simulation-wrapper">
        {/* Simulator Settings Form */}
        <div className="card simulation-settings">
          <h4 className="card-sub-title"><Scale className="sub-icon" /> Voyage Parameters</h4>
          <form className="sim-form" onSubmit={(e) => { e.preventDefault(); handleSimulate(); }}>
            <div className="sim-group">
              <label className="sim-label">Origin Port</label>
              <select value={origin} onChange={(e) => setOrigin(e.target.value)} className="select-input">
                <option value="newcastle">Newcastle (Australia)</option>
                <option value="baltimore">Baltimore (US)</option>
                <option value="nacala">Nacala (Mozambique)</option>
                <option value="samarinda">Samarinda (Indonesia)</option>
              </select>
            </div>

            <div className="sim-group">
              <label className="sim-label">Indian Discharge Port</label>
              <select value={destination} onChange={(e) => setDestination(e.target.value)} className="select-input">
                <option value="paradip">Paradip Port</option>
                <option value="vizag">Visakhapatnam (Vizag)</option>
                <option value="gangavaram">Gangavaram Port</option>
                <option value="haldia">Haldia Port</option>
              </select>
            </div>

            <div className="sim-group">
              <label className="sim-label">Parcel Size (Tons per voyage)</label>
              <input 
                type="number" 
                value={parcelSize} 
                onChange={(e) => setParcelSize(e.target.value)} 
                className="text-input"
                min="10000"
              />
            </div>

            <div className="sim-group">
              <label className="sim-label">Contract Scope (Voyages)</label>
              <input 
                type="number" 
                value={voyages} 
                onChange={(e) => setVoyages(e.target.value)} 
                className="text-input"
                min="1"
                max="12"
              />
            </div>
          </form>
        </div>

        {/* Simulator Calculations Output */}
        <div className="simulation-output">
          {simulating ? (
            <div className="card output-loader-card">
              <div className="loader" />
              <p>Simulating charter hedge profiles...</p>
            </div>
          ) : simResults && (
            <div className="sim-results-grid">
              
              {/* Spot Market Card */}
              <div className="card sim-rate-card spot-cost-card">
                <div className="rate-card-header">
                  <h4>Spot Contract</h4>
                  <span className="badge badge-danger">High Risk</span>
                </div>
                <div className="rate-card-body">
                  <span className="rate-price">${simResults.spot.rate.toFixed(1)} / t</span>
                  <span className="rate-total">Total: ${simResults.spot.total.toLocaleString()}</span>
                  <p className="rate-explain">Exposed to extreme global dry bulk rate spikes. Demurrage risks fully absorbed by cargo owner.</p>
                </div>
              </div>

              {/* Short Term (3-6 Voyages) Card */}
              <div className="card sim-rate-card contract-card recommended">
                <div className="rate-card-header">
                  <h4>Short-Term Lock</h4>
                  <span className="badge badge-success">Recommended</span>
                </div>
                <div className="rate-card-body">
                  <span className="rate-price">${simResults.shortTerm.rate.toFixed(1)} / t</span>
                  <span className="rate-total">Total: ${simResults.shortTerm.total.toLocaleString()}</span>
                  <div className="savings-highlight">
                    <Sparkles className="spark-icon" />
                    <span>Net Savings: <strong>${simResults.shortTerm.savings.toLocaleString()}</strong></span>
                  </div>
                  <p className="rate-explain">Secures pricing for the next 2-3 months. Ideal for hedging monsoon disruption seasons.</p>
                </div>
              </div>

              {/* Medium Term (>6 Voyages) Card */}
              <div className="card sim-rate-card contract-card">
                <div className="rate-card-header">
                  <h4>Medium-Term COA</h4>
                  <span className="badge badge-success">High Discount</span>
                </div>
                <div className="rate-card-body">
                  <span className="rate-price">${simResults.mediumTerm.rate.toFixed(1)} / t</span>
                  <span className="rate-total">Total: ${simResults.mediumTerm.total.toLocaleString()}</span>
                  <div className="savings-highlight">
                    <Sparkles className="spark-icon" />
                    <span>Net Savings: <strong>${simResults.mediumTerm.savings.toLocaleString()}</strong></span>
                  </div>
                  <p className="rate-explain">Requires volume commitments. Unlocks deeper contract rate discounts with dry bulk owners.</p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      <style>{`
        .contract-strategy-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .simulation-wrapper {
          display: grid;
          grid-template-columns: 1fr 2.5fr;
          gap: 1.5rem;
        }

        @media (max-width: 1024px) {
          .simulation-wrapper {
            grid-template-columns: 1fr;
          }
        }

        .simulation-settings {
          background-color: var(--bg-secondary);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          height: fit-content;
        }

        .card-sub-title {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .sub-icon {
          width: 0.95rem;
          height: 0.95rem;
          color: var(--color-primary);
        }

        .sim-form {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .sim-group {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .sim-label {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .output-loader-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 250px;
          color: var(--text-secondary);
          gap: 1rem;
        }

        .output-loader-card .loader {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border-color);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .sim-results-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          height: 100%;
        }

        @media (max-width: 768px) {
          .sim-results-grid {
            grid-template-columns: 1fr;
          }
        }

        .sim-rate-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.25rem;
          justify-content: space-between;
        }

        .sim-rate-card.recommended {
          border-color: var(--color-success);
          box-shadow: var(--box-shadow-glow);
          background: linear-gradient(145deg, var(--bg-secondary) 0%, rgba(16, 185, 129, 0.02) 100%);
        }

        .rate-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
        }

        .rate-card-header h4 {
          font-size: 0.85rem;
          color: var(--text-primary);
          font-weight: 600;
          line-height: 1.3;
        }

        .rate-card-body {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          height: 100%;
        }

        .rate-price {
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .rate-total {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .savings-highlight {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background-color: var(--color-success-glow);
          color: var(--color-success);
          padding: 0.4rem 0.6rem;
          border-radius: 6px;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .spark-icon {
          width: 0.85rem;
          height: 0.85rem;
          flex-shrink: 0;
        }

        .rate-explain {
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.4;
          margin-top: auto;
        }
      `}</style>
    </div>
  );
}
