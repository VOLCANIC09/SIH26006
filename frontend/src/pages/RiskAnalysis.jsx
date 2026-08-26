import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import RiskCard from '../components/RiskCard';
import { AlertTriangle, TrendingUp, Sliders, ShieldAlert, DollarSign, Calculator, HelpCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function RiskAnalysis() {
  const [risks, setRisks] = useState([]);
  const [filteredRisks, setFilteredRisks] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Demurrage Calculator State
  const [vesselType, setVesselType] = useState('panamax');
  const [waitingDaysInput, setWaitingDaysInput] = useState(4);
  const [dailyRateInput, setDailyRateInput] = useState(22000);

  // Mock Volatility Index Data for chart
  const volatilityData = [
    { week: 'Wk 27', bdi: 1450, volatility: 12 },
    { week: 'Wk 28', bdi: 1520, volatility: 14 },
    { week: 'Wk 29', bdi: 1590, volatility: 15 },
    { week: 'Wk 30', bdi: 1680, volatility: 18 },
    { week: 'Wk 31', bdi: 1820, volatility: 22 },
    { week: 'Wk 32', bdi: 1790, volatility: 25 },
    { week: 'Wk 33', bdi: 1880, volatility: 28 },
    { week: 'Wk 34', bdi: 1950, volatility: 34 }
  ];

  useEffect(() => {
    async function loadRisks() {
      try {
        const data = await apiService.getRisks();
        setRisks(data);
        setFilteredRisks(data);
      } catch (err) {
        console.error("Error loading risks", err);
      } finally {
        setLoading(false);
      }
    }
    loadRisks();
  }, []);

  // Filter risks by category
  useEffect(() => {
    if (categoryFilter === 'all') {
      setFilteredRisks(risks);
    } else {
      setFilteredRisks(risks.filter(r => r.category.toLowerCase().includes(categoryFilter)));
    }
  }, [categoryFilter, risks]);

  // Demurrage Risk Exposure Calculation
  const totalExposure = waitingDaysInput * dailyRateInput;

  // Sync daily rates based on vessel dropdown choice
  const handleVesselChange = (e) => {
    const type = e.target.value;
    setVesselType(type);
    if (type === 'capesize') {
      setDailyRateInput(38000);
    } else if (type === 'panamax') {
      setDailyRateInput(22000);
    } else if (type === 'supramax') {
      setDailyRateInput(18500);
    } else {
      setDailyRateInput(14000); // handysize
    }
  };

  return (
    <div className="risk-analysis-view">
      <div className="page-header-desc">
        <p className="page-subtitle">Track macroeconomic freight volatility (Baltic Dry Index), monsoons, canal bottlenecks, and estimate delay demurrage exposures.</p>
      </div>

      {/* Volatility Trend + Calculator Grid */}
      <div className="grid-cols-2 risk-upper-grid">
        
        {/* Volatility Chart */}
        <div className="card volatility-chart-card">
          <div className="chart-title-block">
            <h3 className="card-title"><TrendingUp className="c-title-icon" /> Baltic Dry Index (BDI) Volatility</h3>
            <span className="badge badge-danger">High Risk</span>
          </div>
          <div className="vol-chart-wrapper">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={volatilityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="week" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                  labelStyle={{ fontWeight: 'bold', color: 'var(--text-primary)' }}
                />
                <Area type="monotone" dataKey="bdi" stroke="var(--color-danger)" fill="url(#volGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-footer-caption">
            <span>Index represents generic bulk cargo demand. Current trend exhibits upward pressure (+34% over 8 weeks).</span>
          </div>
        </div>

        {/* Demurrage Cost Calculator */}
        <div className="card calculator-card">
          <h3 className="card-title">
            <Calculator className="c-title-icon" /> Demurrage Risk Calculator
          </h3>
          <div className="calculator-inputs">
            <div className="calc-group">
              <label className="calc-label">Vessel Class</label>
              <select 
                value={vesselType} 
                onChange={handleVesselChange}
                className="select-input"
              >
                <option value="capesize">Capesize ($38,000 / day)</option>
                <option value="panamax">Panamax ($22,000 / day)</option>
                <option value="supramax">Supramax ($18,500 / day)</option>
                <option value="handysize">Handysize ($14,000 / day)</option>
              </select>
            </div>

            <div className="calc-inputs-row">
              <div className="calc-group">
                <label className="calc-label">Est. Waiting Queue (Days)</label>
                <input 
                  type="number" 
                  value={waitingDaysInput}
                  onChange={(e) => setWaitingDaysInput(parseFloat(e.target.value) || 0)}
                  className="text-input"
                  min="0"
                  max="30"
                />
              </div>

              <div className="calc-group">
                <label className="calc-label">Charter Hire Rate ($/Day)</label>
                <input 
                  type="number" 
                  value={dailyRateInput}
                  onChange={(e) => setDailyRateInput(parseInt(e.target.value) || 0)}
                  className="text-input"
                  min="1000"
                />
              </div>
            </div>
          </div>

          <div className="calculator-result">
            <span className="res-label">Estimated Demurrage Exposure</span>
            <h2 className="res-value text-danger">${totalExposure.toLocaleString()}</h2>
            <p className="res-subtext">Demurrage represents loss penalty incurred due to port berthing delays exceeding standard laytime.</p>
          </div>
        </div>
      </div>

      {/* Filter and risk list section */}
      <section className="risk-listings-section">
        <div className="listing-header">
          <h3 className="section-title">
            <ShieldAlert className="sec-title-icon" /> Active Risk Incidents
          </h3>
          <div className="list-filters">
            <Sliders className="filter-icon" />
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="select-input category-select"
            >
              <option value="all">All Categories</option>
              <option value="weather">Weather</option>
              <option value="market">Market Volatility</option>
              <option value="port">Port Operations</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-card card">
            <div className="loader" />
            <p>Gathering regional forecasts and satellite sea trackers...</p>
          </div>
        ) : (
          <div className="grid-cols-2 risks-cards-grid">
            {filteredRisks.map(r => (
              <RiskCard key={r.id} risk={r} />
            ))}

            {filteredRisks.length === 0 && (
              <div className="card no-risks-card">
                <p>No active alerts matching category "{categoryFilter}".</p>
              </div>
            )}
          </div>
        )}
      </section>

      <style>{`
        .risk-analysis-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .volatility-chart-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .chart-title-block {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .vol-chart-wrapper {
          width: 100%;
        }

        .chart-footer-caption {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: 0.5rem;
          border-top: 1px solid var(--border-color);
          padding-top: 0.5rem;
        }

        .c-title-icon {
          width: 1.1rem;
          height: 1.1rem;
          color: var(--color-primary);
          display: inline-block;
          vertical-align: text-bottom;
          margin-right: 0.5rem;
        }

        /* Calculator Styles */
        .calculator-card {
          background-color: var(--bg-secondary);
        }

        .calculator-inputs {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .calc-inputs-row {
          display: flex;
          gap: 1rem;
        }

        .calc-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          flex-grow: 1;
        }

        .calc-label {
          font-size: 0.7rem;
          color: var(--text-secondary);
          font-weight: 500;
          text-transform: uppercase;
        }

        .calculator-result {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.85rem;
          margin-top: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          text-align: center;
        }

        .res-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .res-value {
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 800;
        }

        .res-subtext {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        /* Listing Header */
        .listing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          margin-top: 1rem;
        }

        .section-title {
          font-family: var(--font-display);
          font-size: 1.15rem;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sec-title-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: var(--color-primary);
        }

        .list-filters {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-icon {
          width: 0.95rem;
          height: 0.95rem;
          color: var(--text-muted);
        }

        .category-select {
          padding: 0.4rem 0.75rem;
          font-size: 0.8rem;
        }

        .loading-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
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

        .no-risks-card {
          grid-column: 1 / -1;
          padding: 2rem;
          text-align: center;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
