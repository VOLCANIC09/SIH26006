import React from 'react';
import { BarChart2, TrendingUp, HelpCircle, ArrowUpRight, Scale } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function Analytics() {
  // Mock monthly cargo totals discharged to East Coast India (MT x 10,000)
  const monthlyTotals = [
    { name: 'Mar 26', Coal: 120, Grains: 40, Ore: 80 },
    { name: 'Apr 26', Coal: 135, Grains: 45, Ore: 85 },
    { name: 'May 26', Coal: 140, Grains: 35, Ore: 95 },
    { name: 'Jun 26', Coal: 160, Grains: 50, Ore: 100 },
    { name: 'Jul 26', Coal: 155, Grains: 48, Ore: 110 },
    { name: 'Aug 26', Coal: 172, Grains: 55, Ore: 120 }
  ];

  // Port matrix suitability index
  const portSuitability = [
    { port: 'Paradip', handysize: 'Suitable (100%)', supramax: 'Suitable (100%)', panamax: 'Suitable (100%)', capesize: 'Suitable (92%)' },
    { port: 'Vizag', handysize: 'Suitable (100%)', supramax: 'Suitable (100%)', panamax: 'Suitable (100%)', capesize: 'Outer Only (80%)' },
    { port: 'Gangavaram', handysize: 'Suitable (100%)', supramax: 'Suitable (100%)', panamax: 'Suitable (100%)', capesize: 'Suitable (100%)' },
    { port: 'Gopalpur', handysize: 'Suitable (100%)', supramax: 'Suitable (100%)', panamax: 'Draft Cap (60%)', capesize: 'Unfeasible (0%)' },
    { port: 'Haldia', handysize: 'Suitable (100%)', supramax: 'Draft Cap (70%)', panamax: 'Unfeasible (0%)', capesize: 'Unfeasible (0%)' }
  ];

  return (
    <div className="analytics-view">
      <div className="page-header-desc">
        <p className="page-subtitle">Examine structural shipping metrics. Monitor cargo discharge distributions, correlation matrices, and regional demurrage logs.</p>
      </div>

      <div className="grid-cols-2 analytics-upper-grid">
        {/* Cargo discharge charts */}
        <div className="card chart-card">
          <h3 className="card-title"><BarChart2 className="c-title-icon" /> Monthly Cargo Allocation (MT)</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyTotals} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', marginTop: '10px' }} />
                <Bar dataKey="Coal" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Ore" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Grains" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Commodity Distribution metrics */}
        <div className="card share-card">
          <h3 className="card-title"><TrendingUp className="c-title-icon" /> Cargo Category Split (YTD)</h3>
          <div className="shares-list">
            <div className="share-row">
              <div className="share-info">
                <span className="sh-name">Metallurgical Coal</span>
                <span className="sh-val">42%</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: '42%' }} />
              </div>
            </div>
            <div className="share-row">
              <div className="share-info">
                <span className="sh-name">Thermal Coal</span>
                <span className="sh-val">38%</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: '38%', backgroundColor: 'var(--color-secondary)' }} />
              </div>
            </div>
            <div className="share-row">
              <div className="share-info">
                <span className="sh-name">Iron Ore</span>
                <span className="sh-val">12%</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: '12%', backgroundColor: 'var(--color-info)' }} />
              </div>
            </div>
            <div className="share-row">
              <div className="share-info">
                <span className="sh-name">Wheat / Grains</span>
                <span className="sh-val">8%</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: '8%', backgroundColor: 'var(--color-success)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suitability Matrix Grid */}
      <div className="card matrix-container-card">
        <h3 className="card-title"><Scale className="c-title-icon" /> Port Suitability & Allocation Correlation Matrix</h3>
        <div className="table-responsive">
          <table className="suitability-table">
            <thead>
              <tr>
                <th>Discharge Port</th>
                <th>Handysize</th>
                <th>Supramax</th>
                <th>Panamax</th>
                <th>Capesize</th>
              </tr>
            </thead>
            <tbody>
              {portSuitability.map((row, idx) => (
                <tr key={idx}>
                  <td className="port-cell">{row.port}</td>
                  <td className={row.handysize.includes('100%') ? 'suit-ok' : 'suit-limit'}>{row.handysize}</td>
                  <td className={row.supramax.includes('100%') ? 'suit-ok' : row.supramax.includes('0%') ? 'suit-blocked' : 'suit-limit'}>{row.supramax}</td>
                  <td className={row.panamax.includes('100%') ? 'suit-ok' : row.panamax.includes('0%') ? 'suit-blocked' : 'suit-limit'}>{row.panamax}</td>
                  <td className={row.capesize.includes('100%') ? 'suit-ok' : row.capesize.includes('0%') ? 'suit-blocked' : 'suit-limit'}>{row.capesize}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .analytics-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .analytics-upper-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 1024px) {
          .analytics-upper-grid {
            grid-template-columns: 1fr;
          }
        }

        .chart-wrapper {
          width: 100%;
          margin-top: 1rem;
        }

        /* Shares Card */
        .shares-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }

        .share-row {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .share-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .sh-val {
          font-weight: 700;
          color: var(--text-primary);
        }

        .progress-bar-track {
          height: 8px;
          background-color: var(--bg-card);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background-color: var(--color-primary);
          border-radius: 4px;
          transition: var(--transition-smooth);
        }

        .c-title-icon {
          width: 1.1rem;
          height: 1.1rem;
          color: var(--color-primary);
          display: inline-block;
          vertical-align: text-bottom;
          margin-right: 0.5rem;
        }

        /* Suitability Table */
        .matrix-container-card {
          margin-top: 0.5rem;
        }

        .suitability-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.8rem;
          margin-top: 1rem;
        }

        .suitability-table th {
          color: var(--text-muted);
          font-weight: 600;
          padding: 0.75rem 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .suitability-table td {
          padding: 1rem 0.5rem;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-primary);
        }

        .port-cell {
          font-weight: 700;
          font-family: var(--font-display);
          font-size: 0.85rem;
        }

        .suit-ok {
          color: var(--color-success);
          font-weight: 600;
        }

        .suit-limit {
          color: var(--color-warning);
          font-weight: 600;
        }

        .suit-blocked {
          color: var(--color-danger);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
