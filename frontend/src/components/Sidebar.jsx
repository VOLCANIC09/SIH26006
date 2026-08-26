import React from 'react';
import { LayoutGrid, LineChart, Ship, Anchor, Map, AlertTriangle, Sparkles, FileText, BarChart2, Bell, History } from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage }) {
  const menuItems = [
    { id: 'dashboard', label: '🏠 Dashboard', icon: LayoutGrid },
    { id: 'forecast', label: '📈 Freight Forecast', icon: LineChart },
    { id: 'vessel-optimization', label: '🚢 Vessel Optimization', icon: Ship },
    { id: 'port-intelligence', label: '⚓ Port Intelligence', icon: Anchor },
    { id: 'route-analysis', label: '🗺️ Route Analysis', icon: Map },
    { id: 'risk-monitor', label: '⚠️ Risk Monitor', icon: AlertTriangle },
    { id: 'ai-recommendation', label: '🎯 AI Recommendation', icon: Sparkles },
    { id: 'contract-strategy', label: '📋 Contract Strategy', icon: FileText },
    { id: 'analytics', label: '📊 Analytics', icon: BarChart2 },
    { id: 'alerts', label: '🔔 Alerts', icon: Bell },
    { id: 'history', label: '📜 History', icon: History }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo-container">
          <Ship className="brand-logo" />
        </div>
        <div className="brand-text">
          <h2>OceanFreight</h2>
          <span>INTELLIGENCE</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setCurrentPage(item.id)}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                  {isActive && <div className="active-indicator" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="system-status">
          <div className="status-indicator online" />
          <span>ML Core Engine: Active</span>
        </div>
        <span className="version-tag">v2.1.0-light</span>
      </div>

      <style>{`
        .sidebar {
          width: var(--sidebar-width);
          background-color: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: 100;
          transition: var(--transition-smooth);
        }

        .sidebar-brand {
          height: var(--navbar-height);
          display: flex;
          align-items: center;
          padding: 0 1.25rem;
          gap: 0.6rem;
          border-bottom: 1px solid var(--border-color);
        }

        .brand-logo-container {
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          border-radius: 8px;
          padding: 0.45rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(2, 132, 199, 0.25);
        }

        .brand-logo {
          width: 1.35rem;
          height: 1.35rem;
          color: #fff;
        }

        .brand-text h2 {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .brand-text span {
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: var(--color-primary);
        }

        .sidebar-nav {
          flex-grow: 1;
          padding: 1rem 0.5rem;
          overflow-y: auto;
        }

        .sidebar-nav ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .nav-link {
          width: 100%;
          display: flex;
          align-items: center;
          padding: 0.55rem 0.85rem;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-smooth);
          position: relative;
          text-align: left;
        }

        .nav-link:hover {
          color: var(--text-primary);
          background-color: var(--bg-card);
        }

        .nav-link.active {
          color: var(--color-primary);
          background-color: var(--color-primary-glow);
          font-weight: 600;
        }

        .nav-icon {
          width: 1.1rem;
          height: 1.1rem;
          margin-right: 0.75rem;
          color: var(--text-muted);
          transition: var(--transition-smooth);
        }

        .nav-link.active .nav-icon {
          color: var(--color-primary);
        }

        .active-indicator {
          position: absolute;
          left: 0;
          top: 15%;
          bottom: 15%;
          width: 3px;
          background-color: var(--color-primary);
          border-radius: 0 4px 4px 0;
        }

        .sidebar-footer {
          padding: 1rem 1.25rem;
          border-top: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .system-status {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.725rem;
          color: var(--text-secondary);
        }

        .status-indicator {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .status-indicator.online {
          background-color: var(--color-success);
          box-shadow: 0 0 6px var(--color-success);
        }

        .version-tag {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        @media (max-width: 1024px) {
          .sidebar-brand {
            padding: 0;
            justify-content: center;
          }
          .brand-text, .nav-label, .sidebar-footer {
            display: none;
          }
          .nav-link {
            justify-content: center;
            padding: 0.85rem 0;
          }
          .nav-icon {
            margin-right: 0;
          }
        }
      `}</style>
    </aside>
  );
}
