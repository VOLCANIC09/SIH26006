import React from 'react';
import { ArrowUpRight, Award, DollarSign, HelpCircle } from 'lucide-react';

export default function RecommendationCard({ recommendation }) {
  const confidence = recommendation.confidence || 85;

  return (
    <div className="card recommendation-card">
      <div className="rec-header">
        <span className="badge badge-success action-badge">
          {recommendation.action}
        </span>
        <div className="confidence-score">
          <Award className="confidence-icon" />
          <span>{confidence}% Match Score</span>
        </div>
      </div>

      <div className="rec-body">
        <span className="rec-route">{recommendation.routeLabel}</span>
        <h4 className="rec-title">{recommendation.title}</h4>
        <p className="rec-details">{recommendation.details}</p>
        
        {recommendation.vesselAdvice && (
          <div className="vessel-advice">
            <strong>Optimal Fleet Specs:</strong> {recommendation.vesselAdvice}
          </div>
        )}
      </div>

      <div className="rec-footer">
        <div className="savings-container">
          <DollarSign className="savings-icon" />
          <div className="savings-info">
            <span className="savings-label">Est. Financial Savings</span>
            <span className="savings-value">{recommendation.savings}</span>
          </div>
        </div>
        <button className="btn btn-rec-action">
          <span>Apply Strategy</span>
          <ArrowUpRight className="btn-icon" />
        </button>
      </div>

      <style>{`
        .recommendation-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: linear-gradient(145deg, var(--bg-secondary) 0%, rgba(15, 21, 36, 0.9) 100%);
          border-left: 3px solid var(--color-primary);
        }

        .rec-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .action-badge {
          background-color: var(--color-primary-glow);
          color: var(--color-primary);
          border-color: rgba(14, 165, 233, 0.2);
        }

        .confidence-score {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--color-success);
          font-weight: 600;
        }

        .confidence-icon {
          width: 0.95rem;
          height: 0.95rem;
        }

        .rec-body {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .rec-route {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-primary);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .rec-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.3;
        }

        .rec-details {
          font-size: 0.825rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .vessel-advice {
          background-color: var(--bg-card);
          padding: 0.6rem 0.8rem;
          border-radius: 6px;
          font-size: 0.75rem;
          border: 1px solid var(--border-color);
          margin-top: 0.5rem;
          line-height: 1.3;
          color: var(--text-secondary);
        }

        .vessel-advice strong {
          color: var(--text-primary);
        }

        .rec-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          border-top: 1px solid var(--border-color);
          padding-top: 0.85rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .savings-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .savings-icon {
          width: 1.5rem;
          height: 1.5rem;
          color: var(--color-success);
          background-color: var(--color-success-glow);
          border-radius: 50%;
          padding: 0.2rem;
        }

        .savings-info {
          display: flex;
          flex-direction: column;
        }

        .savings-label {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .savings-value {
          font-family: var(--font-display);
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--color-success);
        }

        .btn-rec-action {
          padding: 0.45rem 0.9rem;
          font-size: 0.8rem;
        }

        .btn-icon {
          width: 0.9rem;
          height: 0.9rem;
        }
      `}</style>
    </div>
  );
}
