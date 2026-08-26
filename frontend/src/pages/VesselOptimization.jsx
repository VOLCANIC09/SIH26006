import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import VesselCard from '../components/VesselCard';
import { ShieldCheck, ShieldAlert, Sparkles, Scale, Info, DollarSign, Calendar } from 'lucide-react';

export default function VesselOptimization() {
  const [ports, setPorts] = useState({ load: [], discharge: [] });
  const [loadPort, setLoadPort] = useState('');
  const [dischargePort, setDischargePort] = useState('');
  const [parcelSize, setParcelSize] = useState('70000'); // tons default

  const [loading, setLoading] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);

  useEffect(() => {
    async function loadPorts() {
      try {
        const portsData = await apiService.getPorts();
        setPorts(portsData);
        if (portsData.load.length > 0) setLoadPort(portsData.load[0].id);
        if (portsData.discharge.length > 0) setDischargePort(portsData.discharge[0].id);
      } catch (err) {
        console.error("Error loading ports", err);
      }
    }
    loadPorts();
  }, []);

  const handleOptimize = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const result = await apiService.optimizeVessel(loadPort, dischargePort, parcelSize);
      setOptimizationResult(result);
    } catch (err) {
      console.error("Error calculating vessel optimization", err);
    } finally {
      setLoading(false);
    }
  };

  // Run initial optimization once ports are loaded
  useEffect(() => {
    if (loadPort && dischargePort) {
      handleOptimize();
    }
  }, [loadPort, dischargePort]);

  return (
    <div className="vessel-optimization-view">
      <div className="page-header-desc">
        <p className="page-subtitle">Evaluate physical harbor restrictions (draft, beam, LOA) against vessel classes to minimize turnaround and deadfreight.</p>
      </div>

      {/* Control Input Form */}
      <div className="card optimization-controls">
        <form onSubmit={handleOptimize} className="controls-form">
          <div className="form-group">
            <label className="form-label">Loading Origin Port</label>
            <select 
              value={loadPort} 
              onChange={(e) => setLoadPort(e.target.value)}
              className="select-input"
            >
              {ports.load.map(p => (
                <option key={p.id} value={p.id}>{p.name} (Max Draft: {p.draft}m)</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Discharge Indian Port</label>
            <select 
              value={dischargePort} 
              onChange={(e) => setDischargePort(e.target.value)}
              className="select-input"
            >
              {ports.discharge.map(p => (
                <option key={p.id} value={p.id}>{p.name} (Max Draft: {p.draft}m)</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Cargo Volume (Metric Tons)</label>
            <input 
              type="number"
              value={parcelSize}
              onChange={(e) => setParcelSize(e.target.value)}
              className="text-input"
              placeholder="e.g. 75000"
              min="5000"
              max="250000"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-submit">
            <Scale className="btn-icon" />
            <span>{loading ? 'Analyzing...' : 'Optimize Allocation'}</span>
          </button>
        </form>
      </div>

      {/* Main Results Panel */}
      {loading ? (
        <div className="loading-panel card">
          <div className="loader" />
          <p>Running vessel DWT allocations, checking harbor draft levels, and calculating demurrage models...</p>
        </div>
      ) : optimizationResult && (
        <div className="optimization-results-grid">
          
          {/* Left Column: Recommended Strategy Details */}
          <div className="opt-left-column">
            {optimizationResult.recommendedVessel ? (
              <div className="card recommendation-highlight-card">
                <div className="highlight-header">
                  <Sparkles className="spark-icon" />
                  <h3>ML Recommendation: {optimizationResult.recommendedVessel.vesselName}</h3>
                </div>
                
                <p className="highlight-desc">
                  This vessel type is the most cost-efficient option that satisfies all port physical constraints for a parcel size of <strong>{parseInt(parcelSize).toLocaleString()} MT</strong> on the {optimizationResult.originPort.name} to {optimizationResult.destPort.name} route.
                </p>

                <div className="highlights-metrics">
                  <div className="h-metric">
                    <span className="hm-label"><DollarSign className="hm-icon" /> Total Voyage Cost</span>
                    <span className="hm-value">${optimizationResult.recommendedVessel.totalCost.toLocaleString()}</span>
                  </div>
                  <div className="h-metric">
                    <span className="hm-label"><DollarSign className="hm-icon" /> Freight Cost / Ton</span>
                    <span className="hm-value text-success">${optimizationResult.recommendedVessel.costPerTon} / t</span>
                  </div>
                  <div className="h-metric">
                    <span className="hm-label"><Calendar className="hm-icon" /> Estimated Voyage Days</span>
                    <span className="hm-value">{optimizationResult.recommendedVessel.totalDays} Days</span>
                  </div>
                </div>

                <div className="constraints-checker">
                  <h4>Harbor Limits Met at Discharge ({optimizationResult.destPort.name})</h4>
                  <div className="checker-row">
                    <span className="ch-label">Draft Allowance</span>
                    <span className="ch-status text-success">
                      <ShieldCheck className="ch-icon" /> {optimizationResult.destPort.draft}m Allowed vs {optimizationResult.results.find(r => r.vesselId === optimizationResult.recommendedVessel.vesselId)?.constraints.draft.required}m Required
                    </span>
                  </div>
                  <div className="checker-row">
                    <span className="ch-label">Length Overall (LOA)</span>
                    <span className="ch-status text-success">
                      <ShieldCheck className="ch-icon" /> {optimizationResult.destPort.loa}m Allowed vs {optimizationResult.results.find(r => r.vesselId === optimizationResult.recommendedVessel.vesselId)?.constraints.loa.required}m Required
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card alert-card">
                <div className="highlight-header error-text">
                  <ShieldAlert className="spark-icon text-danger" />
                  <h3>No Feasible Vessel Class Found</h3>
                </div>
                <p className="highlight-desc">
                  The requested parcel size or destination port draft restriction ({optimizationResult.destPort.draft}m) prevents any standard vessel class from docking safely.
                </p>
                <div className="suggestion-box">
                  <strong>Recommendation:</strong> Consider reducing parcel size, utilizing lighterage options at Sagar-Sandheads, or discharging at deeper ports like Paradip or Gangavaram and trucking inland.
                </div>
              </div>
            )}

            {/* List of Vessels detailed cards */}
            <div className="grid-cols-2 vessels-spec-list">
              {optimizationResult.results.map(res => (
                <VesselCard 
                  key={res.vesselId} 
                  vessel={{
                    ...res,
                    ...apiService.vessels ? { suitability: "No Info Available" } : {}, // Safe reference
                    name: res.vesselName,
                    capacity: apiService.vessels ? "DWT Specs loaded" : "",
                    draftLimit: res.constraints.draft.required,
                    loaLimit: res.constraints.loa.required,
                    beamLimit: res.constraints.beam.required,
                    suitability: "Check matrix suitability details in the table.",
                    efficiencyScore: res.efficiencyScore
                  }}
                  isRecommended={optimizationResult.recommendedVessel && res.vesselId === optimizationResult.recommendedVessel.vesselId}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Allocation Feasibility Matrix */}
          <div className="opt-right-column">
            <div className="card matrix-card">
              <h3 className="card-title">Port Constraints & Cost Comparison</h3>
              <div className="table-responsive">
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th>Vessel Class</th>
                      <th>Draft Feasible</th>
                      <th>LOA Feasible</th>
                      <th>Transit Days</th>
                      <th>Demurrage Cost</th>
                      <th>Freight Rate / t</th>
                    </tr>
                  </thead>
                  <tbody>
                    {optimizationResult.results.map(res => (
                      <tr key={res.vesselId} className={res.feasible ? '' : 'disabled-row'}>
                        <td className="m-vessel-name">{res.vesselName}</td>
                        <td>
                          {res.constraints.draft.ok ? (
                            <span className="txt-success">OK ({res.constraints.draft.required}m)</span>
                          ) : (
                            <span className="txt-danger">Exceeds ({res.constraints.draft.required}m)</span>
                          )}
                        </td>
                        <td>
                          {res.constraints.loa.ok ? (
                            <span className="txt-success">OK ({res.constraints.loa.required}m)</span>
                          ) : (
                            <span className="txt-danger">Exceeds ({res.constraints.loa.required}m)</span>
                          )}
                        </td>
                        <td>{res.transitDays} d</td>
                        <td>
                          {res.feasible ? (
                            <span>${(res.waitingDays * 18000 * (res.costPerTon / 10)).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                          ) : 'N/A'}
                        </td>
                        <td className="m-cost">
                          {res.feasible ? (
                            <strong>${res.costPerTon}</strong>
                          ) : (
                            <span className="txt-muted">Blocked</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

      <style>{`
        .vessel-optimization-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .optimization-controls {
          background-color: var(--bg-secondary);
          padding: 1.5rem;
        }

        .controls-form {
          display: flex;
          gap: 1.5rem;
          align-items: flex-end;
          flex-wrap: wrap;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex-grow: 1;
          min-width: 200px;
        }

        .form-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .btn-submit {
          padding: 0.75rem 1.5rem;
          font-size: 0.9rem;
          height: 38px;
        }

        .loading-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: var(--text-secondary);
          gap: 1rem;
        }

        .loading-panel .loader {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border-color);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Results Layout */
        .optimization-results-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 1200px) {
          .optimization-results-grid {
            grid-template-columns: 1fr;
          }
        }

        .opt-left-column {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .recommendation-highlight-card {
          border-color: var(--color-success);
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(15, 21, 36, 0.9) 100%);
        }

        .highlight-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--color-success);
          margin-bottom: 0.75rem;
        }

        .spark-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        .highlight-header h3 {
          font-size: 1.15rem;
          font-weight: 700;
        }

        .highlight-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 1.25rem;
        }

        .highlights-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.25rem;
        }

        .h-metric {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .hm-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .hm-icon {
          width: 0.75rem;
          height: 0.75rem;
          color: var(--color-primary);
        }

        .hm-value {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .constraints-checker {
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
        }

        .constraints-checker h4 {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .checker-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          margin-bottom: 0.4rem;
        }

        .ch-label {
          color: var(--text-muted);
        }

        .ch-status {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 600;
        }

        .ch-icon {
          width: 0.85rem;
          height: 0.85rem;
        }

        .vessels-spec-list {
          margin-top: 0.5rem;
        }

        /* Matrix Card & Table Styles */
        .matrix-card {
          padding: 1.5rem;
        }

        .matrix-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.8rem;
          margin-top: 1rem;
        }

        .matrix-table th {
          color: var(--text-muted);
          font-weight: 600;
          padding: 0.75rem 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .matrix-table td {
          padding: 1rem 0.5rem;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-primary);
        }

        .disabled-row {
          opacity: 0.4;
        }

        .m-vessel-name {
          font-weight: 600;
          font-family: var(--font-display);
          font-size: 0.85rem;
        }

        .txt-success { color: var(--color-success); font-weight: 600; }
        .txt-danger { color: var(--color-danger); font-weight: 600; }
        .txt-muted { color: var(--text-muted); }

        .m-cost {
          color: var(--color-success);
        }

        .alert-card {
          border-color: var(--color-danger);
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(15, 21, 36, 0.9) 100%);
        }

        .error-text {
          color: var(--color-danger);
        }

        .suggestion-box {
          background-color: var(--bg-card);
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }
      `}</style>
    </div>
  );
}
