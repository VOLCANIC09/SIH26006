import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import RiskCard from '../components/RiskCard';
import { Bell, Sliders, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

export default function AlertsFeed() {
  const [risks, setRisks] = useState([]);
  const [filteredRisks, setFilteredRisks] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRisks() {
      try {
        const data = await apiService.getRisks();
        setRisks(data);
        setFilteredRisks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRisks();
  }, []);

  useEffect(() => {
    if (categoryFilter === 'all') {
      setFilteredRisks(risks);
    } else {
      setFilteredRisks(risks.filter(r => r.category.toLowerCase().includes(categoryFilter)));
    }
  }, [categoryFilter, risks]);

  const criticalCount = risks.filter(r => r.severity === 'Critical').length;
  const highCount = risks.filter(r => r.severity === 'High').length;

  return (
    <div className="alerts-feed-view">
      <div className="page-header-desc">
        <p className="page-subtitle">Real-time maritime warnings. Monitor Bay of Bengal weather anomalies, siltation draft reductions, and demurrage queue alerts.</p>
      </div>

      {/* Summary KPI panel */}
      <div className="grid-cols-3 alerts-summary">
        <div className="card alert-stat-card border-danger">
          <div className="as-label"><ShieldAlert className="as-icon text-danger" /> Critical Incidents</div>
          <h3 className="as-value text-danger">{criticalCount} Active</h3>
          <span className="as-sub">Immediate impact on spot chartering rates</span>
        </div>

        <div className="card alert-stat-card border-warning">
          <div className="as-label"><ShieldAlert className="as-icon text-warning" /> High Risk Alerts</div>
          <h3 className="as-value text-warning">{highCount} Active</h3>
          <span className="as-sub">Requires voyage draft recalculations</span>
        </div>

        <div className="card alert-stat-card">
          <div className="as-label"><Clock className="as-icon text-primary" /> Monitor Frequency</div>
          <h3 className="as-value">Every 15 mins</h3>
          <span className="as-sub">Synced with global shipping bulletins</span>
        </div>
      </div>

      {/* Alerts listings with search/filter toolbar */}
      <div className="alerts-feed-container">
        <div className="listing-header">
          <h3 className="section-title">
            <Bell className="sec-title-icon" /> Operational Warnings Feed
          </h3>
          <div className="list-filters">
            <Sliders className="filter-icon" />
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="select-input category-select"
            >
              <option value="all">All Warnings</option>
              <option value="weather">Weather Warnings</option>
              <option value="market">Market Volatility</option>
              <option value="port">Port Logistics</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-card card">
            <div className="loader" />
            <p>Syncing regional warning channels...</p>
          </div>
        ) : (
          <div className="grid-cols-2 alerts-grid">
            {filteredRisks.map(r => (
              <RiskCard key={r.id} risk={r} />
            ))}

            {filteredRisks.length === 0 && (
              <div className="card no-alerts-card">
                <CheckCircle className="check-icon" />
                <p>No active alerts recorded. All systems operational.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .alerts-feed-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .alerts-summary {
          margin-bottom: 0.5rem;
        }

        .alert-stat-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .alert-stat-card.border-danger {
          border-left: 3px solid var(--color-danger);
        }

        .alert-stat-card.border-warning {
          border-left: 3px solid var(--color-warning);
        }

        .as-label {
          font-size: 0.725rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .as-icon {
          width: 0.95rem;
          height: 0.95rem;
        }

        .as-value {
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .as-sub {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        /* Listings */
        .listing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
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

        .no-alerts-card {
          grid-column: 1 / -1;
          padding: 3rem;
          text-align: center;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .check-icon {
          width: 2rem;
          height: 2rem;
          color: var(--color-success);
        }
      `}</style>
    </div>
  );
}
