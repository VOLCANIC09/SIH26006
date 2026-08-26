import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, change, changeType, subtext, sparkData = [20, 25, 23, 28, 30, 27, 32] }) {
  const isUp = changeType === 'up';
  const isDown = changeType === 'down';

  // Helper to map values to SVG viewbox height (0 to 30)
  const max = Math.max(...sparkData);
  const min = Math.min(...sparkData);
  const range = max - min || 1;
  const points = sparkData.map((val, idx) => {
    const x = (idx / (sparkData.length - 1)) * 100;
    const y = 30 - ((val - min) / range) * 26 - 2; // Keep padding
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="card stat-card">
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <div className="stat-card-icon-container">
          <Icon className="stat-card-icon" />
        </div>
      </div>

      <div className="stat-card-body">
        <h3 className="stat-card-value">{value}</h3>
        
        <div className="stat-card-chart-container">
          {/* SVG Sparkline */}
          <svg className="sparkline" viewBox="0 0 100 30" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke={isUp ? 'var(--color-success)' : isDown ? 'var(--color-danger)' : 'var(--color-primary)'}
              strokeWidth="2"
              points={points}
            />
            {/* Gradient fill */}
            <path
              d={`M0,30 L${points} L100,30 Z`}
              fill={`url(#grad-${title.replace(/\s+/g, '-').toLowerCase()})`}
              opacity="0.1"
            />
            <defs>
              <linearGradient id={`grad-${title.replace(/\s+/g, '-').toLowerCase()}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isUp ? 'var(--color-success)' : isDown ? 'var(--color-danger)' : 'var(--color-primary)'} />
                <stop offset="100%" stopColor={isUp ? 'var(--color-success)' : isDown ? 'var(--color-danger)' : 'var(--color-primary)'} stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="stat-card-footer">
        <div className={`stat-card-change ${changeType}`}>
          {isUp && <ArrowUpRight className="change-icon" />}
          {isDown && <ArrowDownRight className="change-icon" />}
          <span>{change}</span>
        </div>
        <span className="stat-card-subtext">{subtext}</span>
      </div>

      <style>{`
        .stat-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 155px;
        }

        .stat-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-card-title {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .stat-card-icon-container {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          padding: 0.4rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-card-icon {
          width: 1rem;
          height: 1rem;
          color: var(--color-primary);
        }

        .stat-card-body {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-top: 0.5rem;
        }

        .stat-card-value {
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-card-chart-container {
          width: 80px;
          height: 30px;
        }

        .sparkline {
          width: 100%;
          height: 100%;
        }

        .stat-card-footer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: auto;
          font-size: 0.75rem;
        }

        .stat-card-change {
          display: flex;
          align-items: center;
          font-weight: 600;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
        }

        .stat-card-change.up {
          color: var(--color-success);
          background-color: var(--color-success-glow);
        }

        .stat-card-change.down {
          color: var(--color-danger);
          background-color: var(--color-danger-glow);
        }

        .stat-card-change.neutral {
          color: var(--text-secondary);
          background-color: var(--border-color);
        }

        .change-icon {
          width: 0.85rem;
          height: 0.85rem;
        }

        .stat-card-subtext {
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
