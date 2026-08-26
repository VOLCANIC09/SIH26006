import React from 'react';
import { History, Award, ArrowUpRight, DollarSign, Calendar, ShieldCheck } from 'lucide-react';

export default function HistoryLog() {
  const historyRecords = [
    { id: 'COA-4890', date: 'Jun 12, 2026', route: 'Newcastle ➔ Paradip', vessel: 'Panamax (MV Cape Star)', cargo: 75000, lockedRate: 22.40, spotRate: 26.80, status: 'Completed', savings: 330000 },
    { id: 'COA-4672', date: 'Jul 04, 2026', route: 'Nacala ➔ Gangavaram', vessel: 'Capesize (MV Orion)', cargo: 140000, lockedRate: 15.80, spotRate: 18.50, status: 'Completed', savings: 378000 },
    { id: 'COA-4210', date: 'Jul 28, 2026', route: 'Samarinda ➔ Haldia', vessel: 'Handysize (MV Pioneer)', cargo: 28000, lockedRate: 26.50, spotRate: 28.20, status: 'Completed', savings: 47600 },
    { id: 'COA-3990', date: 'Aug 10, 2026', route: 'Baltimore ➔ Vizag', vessel: 'Panamax (MV Horizon)', cargo: 70000, lockedRate: 34.20, spotRate: 36.00, status: 'Completed', savings: 126000 },
    { id: 'COA-3801', date: 'Aug 18, 2026', route: 'Vladivostok ➔ Gopalpur', vessel: 'Supramax (MV Aurora)', cargo: 55000, lockedRate: 31.80, spotRate: 31.20, status: 'Sailing', savings: -33000 } // Slight spot drop
  ];

  // Calculate global summary stats
  const totalSavings = historyRecords.reduce((acc, curr) => acc + curr.savings, 0);
  const completedVoyages = historyRecords.filter(r => r.status === 'Completed').length;
  const totalCargoMT = historyRecords.reduce((acc, curr) => acc + curr.cargo, 0);

  return (
    <div className="history-view">
      <div className="page-header-desc">
        <p className="page-subtitle">Verify the performance of locked short-term charters. Compare locked Contract rates against historical Spot Index valuations.</p>
      </div>

      {/* Summary KPI grid */}
      <div className="grid-cols-3 history-summary">
        <div className="card h-stat-card">
          <div className="h-stat-label"><Award className="h-stat-icon text-success" /> Cumulative Contract Savings</div>
          <h3 className="h-stat-value text-success">${totalSavings.toLocaleString()}</h3>
          <span className="h-stat-sub">Compared to volatile spot bookings</span>
        </div>

        <div className="card h-stat-card">
          <div className="h-stat-label"><ShieldCheck className="h-stat-icon text-primary" /> Completed Contracts</div>
          <h3 className="h-stat-value">{completedVoyages} voyages</h3>
          <span className="h-stat-sub">100% operational fulfillment</span>
        </div>

        <div className="card h-stat-card">
          <div className="h-stat-label"><Calendar className="h-stat-icon text-secondary" /> Volume Discharged</div>
          <h3 className="h-stat-value">{(totalCargoMT / 1000).toFixed(0)}k MT</h3>
          <span className="h-stat-sub">Across all East Coast port terminals</span>
        </div>
      </div>

      {/* Table Audit Logs */}
      <div className="card audit-log-card">
        <h3 className="card-title"><History className="c-title-icon" /> Voyage Contract Log</h3>
        
        <div className="table-responsive">
          <table className="history-table">
            <thead>
              <tr>
                <th>Contract ID</th>
                <th>Execution Date</th>
                <th>Voyage Corridor</th>
                <th>Vessel Class Details</th>
                <th>Parcel Size</th>
                <th>Locked Rate</th>
                <th>Market Spot Rate</th>
                <th>Voyage Savings</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {historyRecords.map((rec) => {
                const isPositive = rec.savings > 0;
                return (
                  <tr key={rec.id}>
                    <td className="h-id">{rec.id}</td>
                    <td>{rec.date}</td>
                    <td className="h-route">{rec.route}</td>
                    <td>{rec.vessel}</td>
                    <td className="h-cargo">{rec.cargo.toLocaleString()} MT</td>
                    <td>${rec.lockedRate.toFixed(2)}/t</td>
                    <td>${rec.spotRate.toFixed(2)}/t</td>
                    <td className={isPositive ? 'txt-success' : 'txt-danger'}>
                      <strong>{isPositive ? '+' : ''}${rec.savings.toLocaleString()}</strong>
                    </td>
                    <td>
                      <span className={`badge ${rec.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .history-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .history-summary {
          margin-bottom: 0.5rem;
        }

        .h-stat-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .h-stat-label {
          font-size: 0.725rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .h-stat-icon {
          width: 0.95rem;
          height: 0.95rem;
        }

        .h-stat-value {
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .h-stat-sub {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .c-title-icon {
          width: 1.1rem;
          height: 1.1rem;
          color: var(--color-primary);
          display: inline-block;
          vertical-align: text-bottom;
          margin-right: 0.5rem;
        }

        /* History Table Audit */
        .audit-log-card {
          margin-top: 0.5rem;
        }

        .history-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.8rem;
          margin-top: 1rem;
        }

        .history-table th {
          color: var(--text-muted);
          font-weight: 600;
          padding: 0.75rem 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .history-table td {
          padding: 1rem 0.5rem;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-primary);
        }

        .h-id {
          font-weight: 700;
          font-family: var(--font-display);
          color: var(--color-primary);
        }

        .h-route {
          font-weight: 600;
        }

        .h-cargo {
          font-weight: 500;
        }

        .txt-success {
          color: var(--color-success);
        }

        .txt-danger {
          color: var(--color-danger);
        }
      `}</style>
    </div>
  );
}
