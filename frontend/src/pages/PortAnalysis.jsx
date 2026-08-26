import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Anchor, Search, Shield, ChevronRight, Activity, Clock, Sliders } from 'lucide-react';

export default function PortAnalysis() {
  const [ports, setPorts] = useState({ load: [], discharge: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('discharge'); // discharge vs load
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPorts() {
      try {
        const data = await apiService.getPorts();
        setPorts(data);
      } catch (err) {
        console.error("Error fetching ports", err);
      } finally {
        setLoading(false);
      }
    }
    loadPorts();
  }, []);

  const getCongestionBadgeClass = (level) => {
    switch (level) {
      case 'Very High':
      case 'High':
        return 'badge-danger';
      case 'Medium':
        return 'badge-warning';
      default:
        return 'badge-success';
    }
  };

  const currentPortsList = activeTab === 'discharge' ? ports.discharge : ports.load;
  const filteredPorts = currentPortsList.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="port-analysis-view">
      <div className="page-header-desc">
        <p className="page-subtitle">Inspect maximum vessel sizes, average loading/unloading rates, and current berthing delays across global trade routes.</p>
      </div>

      {/* Tabs and Search Controls */}
      <div className="port-controls card">
        <div className="tab-buttons">
          <button 
            className={`tab-btn ${activeTab === 'discharge' ? 'active' : ''}`}
            onClick={() => { setActiveTab('discharge'); setSearchQuery(''); }}
          >
            <Anchor className="tab-icon" />
            <span>Discharge Ports (East Coast India)</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'load' ? 'active' : ''}`}
            onClick={() => { setActiveTab('load'); setSearchQuery(''); }}
          >
            <Sliders className="tab-icon" />
            <span>Origin Loading Ports (Global)</span>
          </button>
        </div>

        <div className="search-bar">
          <Search className="search-icon" />
          <input 
            type="text" 
            placeholder="Search ports by name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-input search-input"
          />
        </div>
      </div>

      {/* Grid of ports */}
      {loading ? (
        <div className="loading-card card">
          <div className="loader" />
          <p>Syncing terminal logistics records and marine draft logs...</p>
        </div>
      ) : (
        <div className="ports-grid">
          {filteredPorts.map(port => (
            <div key={port.id} className="card port-detail-card">
              <div className="port-card-header">
                <div>
                  <h3 className="port-title">{port.name}</h3>
                  <span className="port-type-tag">
                    {activeTab === 'discharge' ? 'Discharge Terminal' : 'Loading Terminal'}
                  </span>
                </div>
                <div className="port-anchor-bg">
                  <Anchor className="port-bg-icon" />
                </div>
              </div>

              <div className="port-specs-grid">
                <div className="port-spec">
                  <span className="ps-label">Max Draft Limit</span>
                  <span className="ps-value text-primary">{port.draft} meters</span>
                </div>
                {port.loa && (
                  <div className="port-spec">
                    <span className="ps-label">Max Length (LOA)</span>
                    <span className="ps-value">{port.loa} m</span>
                  </div>
                )}
                {port.beam && (
                  <div className="port-spec">
                    <span className="ps-label">Max Beam Limit</span>
                    <span className="ps-value">{port.beam} m</span>
                  </div>
                )}
                <div className="port-spec">
                  <span className="ps-label">Handling Speed</span>
                  <span className="ps-value">{port.handlingRate.toLocaleString()} t/day</span>
                </div>
              </div>

              {activeTab === 'discharge' && (
                <div className="port-congestion-metrics">
                  <div className="metric-row">
                    <div className="metric-cell">
                      <Clock className="cell-icon" />
                      <div>
                        <span className="cl-label">Queue Delay</span>
                        <span className="cl-val">{port.waitingDays} Days</span>
                      </div>
                    </div>
                    <div className="metric-cell">
                      <Activity className="cell-icon" />
                      <div>
                        <span className="cl-label">Congestion level</span>
                        <span className={`badge ${getCongestionBadgeClass(port.congestionIndex)}`}>
                          {port.congestionIndex}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {port.notes && (
                <div className="port-notes">
                  <strong>Berthing Notes:</strong>
                  <p>{port.notes}</p>
                </div>
              )}
            </div>
          ))}

          {filteredPorts.length === 0 && (
            <div className="card no-ports-card">
              <p>No ports match search term "{searchQuery}". Try searching for Haldia, Paradip, or Newcastle.</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        .port-analysis-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .port-controls {
          background-color: var(--bg-secondary);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .tab-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .tab-btn {
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          color: var(--text-secondary);
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          cursor: pointer;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: var(--transition-smooth);
        }

        .tab-btn:hover {
          color: var(--text-primary);
          border-color: var(--text-secondary);
        }

        .tab-btn.active {
          background-color: var(--color-primary-glow);
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        .tab-icon {
          width: 0.95rem;
          height: 0.95rem;
        }

        .search-bar {
          position: relative;
          width: 300px;
        }

        @media (max-width: 768px) {
          .search-bar {
            width: 100%;
          }
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          width: 0.95rem;
          height: 0.95rem;
          color: var(--text-muted);
        }

        .search-input {
          padding-left: 2.25rem;
          width: 100%;
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

        /* Ports Grid */
        .ports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 1.5rem;
        }

        .port-detail-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          height: 100%;
        }

        .port-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .port-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .port-type-tag {
          font-size: 0.7rem;
          color: var(--color-primary);
          font-weight: 600;
          text-transform: uppercase;
        }

        .port-anchor-bg {
          background-color: var(--bg-card);
          padding: 0.5rem;
          border-radius: 8px;
        }

        .port-bg-icon {
          width: 1.15rem;
          height: 1.15rem;
          color: var(--text-muted);
        }

        .port-specs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.85rem;
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
        }

        .port-spec {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .ps-label {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .ps-value {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .ps-value.text-primary {
          color: var(--color-primary);
        }

        .port-congestion-metrics {
          background-color: var(--bg-card);
          border-radius: 8px;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
        }

        .metric-row {
          display: flex;
          justify-content: space-around;
        }

        .metric-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .cell-icon {
          width: 1.1rem;
          height: 1.1rem;
          color: var(--text-muted);
        }

        .cl-label {
          display: block;
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .cl-val {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .port-notes {
          border-top: 1px solid var(--border-color);
          padding-top: 0.85rem;
          font-size: 0.8rem;
          line-height: 1.4;
          margin-top: auto;
        }

        .port-notes strong {
          color: var(--text-secondary);
          display: block;
          margin-bottom: 0.25rem;
        }

        .port-notes p {
          color: var(--text-primary);
        }

        .no-ports-card {
          grid-column: 1 / -1;
          padding: 2rem;
          text-align: center;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
