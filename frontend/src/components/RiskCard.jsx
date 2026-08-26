import React from 'react';
import { AlertTriangle, ShieldAlert, Zap, Clock } from 'lucide-react';

export default function RiskCard({ risk }) {
  const isCritical = risk.severity === 'Critical';
  const isHigh = risk.severity === 'High';
  const isMedium = risk.severity === 'Medium';

  const getSeverityBadge = () => {
    if (isCritical) return 'badge-danger';
    if (isHigh) return 'badge-warning';
    return 'badge-success'; // Low/Medium is handled gracefully
  };

  return (
    <div className={`card risk-card ${isCritical ? 'critical-border' : ''}`}>
      <div className="risk-header">
        <div className="risk-meta">
          <span className={`badge ${getSeverityBadge()}`}>
            {risk.severity} Severity
          </span>
          <span className="risk-category">{risk.category}</span>
        </div>
        <div className="risk-time">
          <Clock className="time-icon" />
          <span>{risk.updatedAt}</span>
        </div>
      </div>

      <h4 className="risk-title-text">{risk.title}</h4>
      <p className="risk-impact">{risk.impact}</p>

      <div className="risk-footer">
        <div className="mitigation-block">
          <Zap className="mitigation-icon" />
          <div className="mitigation-text">
            <strong>Mitigation Strategy:</strong> Hold spot chartering. Consider scheduling short-term contract to bypass volatile index.
          </div>
        </div>
      </div>

      <style>{`
        .risk-card {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          background-color: var(--bg-secondary);
        }

        .risk-card.critical-border {
          border-left: 4px solid var(--color-danger);
        }

        .risk-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
        }

        .risk-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .risk-category {
          color: var(--text-muted);
          font-weight: 500;
          text-transform: uppercase;
        }

        .risk-time {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--text-muted);
        }

        .time-icon {
          width: 0.75rem;
          height: 0.75rem;
        }

        .risk-title-text {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .risk-impact {
          font-size: 0.825rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .risk-footer {
          border-top: 1px solid var(--border-color);
          padding-top: 0.75rem;
          margin-top: 0.25rem;
        }

        .mitigation-block {
          display: flex;
          gap: 0.5rem;
          align-items: flex-start;
          background-color: rgba(99, 102, 241, 0.05);
          border: 1px solid rgba(99, 102, 241, 0.1);
          padding: 0.6rem;
          border-radius: 6px;
        }

        .mitigation-icon {
          width: 1rem;
          height: 1rem;
          color: var(--color-secondary);
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .mitigation-text {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.3;
        }

        .mitigation-text strong {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}
