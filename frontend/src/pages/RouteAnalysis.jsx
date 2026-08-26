import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Map, Navigation, Compass, Globe, Info, Gauge } from 'lucide-react';

export default function RouteAnalysis() {
  const [ports, setPorts] = useState({ load: [], discharge: [] });
  const [loadPortId, setLoadPortId] = useState('');
  const [dischargePortId, setDischargePortId] = useState('');
  const [vesselSpeed, setVesselSpeed] = useState(12.5); // Knots

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const [portsData, routesData] = await Promise.all([
          apiService.getPorts(),
          apiService.getRoutes()
        ]);
        setPorts(portsData);
        setRoutes(routesData);
        if (portsData.load.length > 0) setLoadPortId(portsData.load[0].id);
        if (portsData.discharge.length > 0) setDischargePortId(portsData.discharge[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Compute live routing metrics
  const selectedLoadPort = ports.load.find(p => p.id === loadPortId);
  const selectedDischargePort = ports.discharge.find(p => p.id === dischargePortId);

  // Determine distance (check if route already exists in DB, otherwise mock based on generic distance)
  let distance = 4800; // default NM
  if (selectedLoadPort && selectedDischargePort) {
    const matchedRoute = routes.find(r => r.origin === loadPortId && r.destination === dischargePortId);
    if (matchedRoute) {
      distance = matchedRoute.distance;
    } else {
      // Mock distance based on ports
      const sumId = loadPortId.charCodeAt(0) + dischargePortId.charCodeAt(0);
      distance = 2000 + (sumId % 10) * 800;
    }
  }

  // Transit days = distance / (speed * 24)
  const transitDays = vesselSpeed > 0 ? parseFloat((distance / (vesselSpeed * 24)).toFixed(1)) : 0;

  // CO2 calculation: ~15 tons fuel/day for Panamax, ~3.11 tons CO2 per ton of marine gas oil fuel
  const fuelDaily = 18.2; // tons/day
  const co2Daily = fuelDaily * 3.11;
  const totalCo2 = parseFloat((transitDays * co2Daily).toFixed(1));

  // Draft feasibility restriction index (bottleneck)
  const draftLimit = selectedDischargePort ? selectedDischargePort.draft : 12.0;

  return (
    <div className="route-analysis-view">
      <div className="page-header-desc">
        <p className="page-subtitle">Interactive sea corridor mapping. Calculate marine transit timelines, average fuel burn rates, and carbon offset benchmarks.</p>
      </div>

      {loading ? (
        <div className="loading-card card">
          <div className="loader" />
          <p>Mapping global sea channels and marine coordinates...</p>
        </div>
      ) : (
        <div className="routing-grid">
          
          {/* Left panel: form settings */}
          <div className="routing-left-panel">
            <div className="card route-calc-card">
              <h3 className="card-title"><Compass className="c-title-icon" /> Sea Route Estimator</h3>
              
              <div className="calc-inputs">
                <div className="calc-group">
                  <label className="calc-label">Loading Origin Terminal</label>
                  <select 
                    value={loadPortId} 
                    onChange={(e) => setLoadPortId(e.target.value)} 
                    className="select-input"
                  >
                    {ports.load.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="calc-group">
                  <label className="calc-label">Indian Discharging Terminal</label>
                  <select 
                    value={dischargePortId} 
                    onChange={(e) => setDischargePortId(e.target.value)} 
                    className="select-input"
                  >
                    {ports.discharge.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="calc-group">
                  <div className="speed-label-row">
                    <label className="calc-label">Vessel Sailing Speed</label>
                    <span className="speed-value">{vesselSpeed} Knots</span>
                  </div>
                  <input 
                    type="range" 
                    min="10.0" 
                    max="16.0" 
                    step="0.5"
                    value={vesselSpeed}
                    onChange={(e) => setVesselSpeed(parseFloat(e.target.value))}
                    className="speed-range-slider"
                  />
                  <div className="speed-ticks">
                    <span>10 kts (Eco)</span>
                    <span>13 kts (Std)</span>
                    <span>16 kts (Max)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Environmental / Carbon Card */}
            <div className="card eco-card">
              <h3 className="card-title text-success"><Gauge className="c-title-icon text-success" /> Green Routing Metrics</h3>
              <div className="eco-metrics">
                <div className="eco-metric">
                  <span className="em-lbl">Voyage CO2 Emission</span>
                  <span className="em-val text-success">{totalCo2.toLocaleString()} Tons</span>
                </div>
                <div className="eco-metric">
                  <span className="em-lbl">Avg Daily Fuel Burn</span>
                  <span className="em-val">{fuelDaily} mt (MGO)</span>
                </div>
              </div>
              <p className="eco-disclaimer">Estimates are based on standard dry bulk vessel fuel models at stable draught conditions.</p>
            </div>
          </div>

          {/* Right panel: route summary details */}
          <div className="routing-right-panel">
            <div className="card summary-panel-card">
              <div className="summary-header">
                <Globe className="globe-icon" />
                <h3>Voyage Route Coordinates</h3>
              </div>

              {selectedLoadPort && selectedDischargePort && (
                <div className="summary-details">
                  
                  {/* Visual Route Line */}
                  <div className="route-visual-line">
                    <div className="point point-start">
                      <span className="p-dot" />
                      <span className="p-name">{selectedLoadPort.name}</span>
                    </div>
                    <div className="line-connector">
                      <span className="line-text">{distance.toLocaleString()} NM</span>
                    </div>
                    <div className="point point-end">
                      <span className="p-dot" />
                      <span className="p-name">{selectedDischargePort.name}</span>
                    </div>
                  </div>

                  <div className="stats-box-grid">
                    <div className="stat-box">
                      <span className="sb-lbl">Sailing Distance</span>
                      <span className="sb-val">{distance.toLocaleString()} NM</span>
                    </div>
                    <div className="stat-box">
                      <span className="sb-lbl">Transit Duration</span>
                      <span className="sb-val text-primary">{transitDays} Days</span>
                    </div>
                    <div className="stat-box">
                      <span className="sb-lbl">Discharge Draft Limit</span>
                      <span className="sb-val">{draftLimit} meters</span>
                    </div>
                    <div className="stat-box">
                      <span className="sb-lbl">Discharge Speed</span>
                      <span className="sb-val">{selectedDischargePort.handlingRate.toLocaleString()} t/d</span>
                    </div>
                  </div>

                  <div className="route-restrictions-block">
                    <div className="rest-title"><Info className="rest-icon" /> Corridor Feasibility Restrictions</div>
                    <p className="rest-desc">
                      Any vessel routing this corridor must not exceed a maximum summer draft load of <strong>{draftLimit}m</strong>. For Haldia deliveries, tide windows must be coordinated prior to crossing sandheads.
                    </p>
                  </div>

                </div>
              )}
            </div>
          </div>

        </div>
      )}

      <style>{`
        .route-analysis-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .loading-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: var(--text-secondary);
          gap: 1rem;
        }

        .loading-card .loader {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border-color);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .routing-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 1.5rem;
        }

        @media (max-width: 1024px) {
          .routing-grid {
            grid-template-columns: 1fr;
          }
        }

        .routing-left-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .route-calc-card {
          background-color: var(--bg-secondary);
        }

        .calc-inputs {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-top: 1rem;
        }

        .calc-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .calc-label {
          font-size: 0.725rem;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
        }

        .speed-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .speed-value {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--color-primary);
        }

        .speed-range-slider {
          width: 100%;
          accent-color: var(--color-primary);
          height: 5px;
          border-radius: 3px;
          cursor: pointer;
        }

        .speed-ticks {
          display: flex;
          justify-content: space-between;
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .eco-card {
          border-left: 3px solid var(--color-success);
        }

        .eco-metrics {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-top: 0.75rem;
        }

        .eco-metric {
          display: flex;
          flex-direction: column;
          background-color: var(--bg-primary);
          padding: 0.6rem;
          border-radius: 6px;
          border: 1px solid var(--border-color);
        }

        .em-lbl {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .em-val {
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .eco-disclaimer {
          font-size: 0.65rem;
          color: var(--text-muted);
          margin-top: 0.75rem;
          line-height: 1.3;
        }

        /* Summary Panel Card */
        .summary-panel-card {
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .summary-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--color-primary);
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.75rem;
        }

        .globe-icon {
          width: 1.3rem;
          height: 1.3rem;
        }

        .summary-header h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        /* Route Visual Line */
        .route-visual-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: var(--bg-primary);
          padding: 1.5rem 1rem;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          margin-bottom: 1.5rem;
        }

        .point {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          width: 120px;
          text-align: center;
        }

        .p-dot {
          width: 10px;
          height: 10px;
          background-color: var(--color-primary);
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 0 8px var(--color-primary);
        }

        .point-end .p-dot {
          background-color: var(--color-secondary);
          box-shadow: 0 0 8px var(--color-secondary);
        }

        .p-name {
          font-size: 0.775rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .line-connector {
          flex-grow: 1;
          height: 2px;
          background-color: var(--border-color);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 1rem;
        }

        .line-text {
          position: absolute;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 0.15rem 0.6rem;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        /* Stats Grid */
        .stats-box-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .stat-box {
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .sb-lbl {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .sb-val {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .sb-val.text-primary {
          color: var(--color-primary);
        }

        .route-restrictions-block {
          background-color: rgba(2, 132, 199, 0.03);
          border: 1px solid rgba(2, 132, 199, 0.08);
          border-radius: 8px;
          padding: 1rem;
          margin-top: auto;
        }

        .rest-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--color-primary);
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-bottom: 0.35rem;
        }

        .rest-icon {
          width: 0.95rem;
          height: 0.95rem;
        }

        .rest-desc {
          font-size: 0.775rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .rest-desc strong {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}
