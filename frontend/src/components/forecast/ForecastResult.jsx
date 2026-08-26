import React from 'react';
import { TrendingDown, TrendingUp, ShieldCheck, DollarSign, Award } from 'lucide-react';

export default function ForecastResult({ result }) {
  if (!result) return null;

  const isDecrease = result.expectedChange < 0;
  const changeColorClass = isDecrease ? 'change-decrease' : 'change-increase';
  const ChangeIcon = isDecrease ? TrendingDown : TrendingUp;

  return (
    <div className="forecast-result-card card">
      <div className="result-success-badge">
        <ShieldCheck className="success-badge-icon" />
        <span>Forecast generated successfully</span>
      </div>

      <div className="result-grid">
        {/* Metric 1 */}
        <div className="result-metric-box">
          <span className="rm-label">Current Freight Rate</span>
          <div className="rm-value-container">
            <DollarSign className="rm-currency-icon" />
            <span className="rm-val">{result.currentRate.toFixed(2)}</span>
            <span className="rm-unit">/ MT</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="result-metric-box predicted-box">
          <span className="rm-label">Predicted Rate</span>
          <div className="rm-value-container">
            <DollarSign className="rm-currency-icon" />
            <span className="rm-val">{result.predictedRate.toFixed(2)}</span>
            <span className="rm-unit">/ MT</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="result-metric-box">
          <span className="rm-label">Expected Change</span>
          <div className={`rm-change-indicator ${changeColorClass}`}>
            <ChangeIcon className="change-arrow-icon" />
            <span>{result.expectedChange > 0 ? '+' : ''}{result.expectedChange.toFixed(2)}%</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="result-metric-box">
          <span className="rm-label">Model Confidence</span>
          <div className="rm-confidence-container">
            <Award className="rm-confidence-icon" />
            <span className="rm-val">{result.confidence}%</span>
          </div>
        </div>
      </div>

      <style>{`
        .forecast-result-card {
          margin-top: 1.5rem;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          color: white;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .result-success-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #10b981;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 1.25rem;
          width: fit-content;
        }

        .success-badge-icon {
          width: 0.95rem;
          height: 0.95rem;
        }

        .result-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.25rem;
        }

        .result-metric-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .result-metric-box.predicted-box {
          border-color: rgba(2, 132, 199, 0.2);
          background: rgba(2, 132, 199, 0.03);
        }

        .rm-label {
          font-size: 0.7rem;
          color: #94a3b8;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        .rm-value-container, .rm-confidence-container {
          display: flex;
          align-items: baseline;
          color: white;
        }

        .rm-currency-icon {
          width: 0.95rem;
          height: 0.95rem;
          color: #64748b;
          align-self: center;
          margin-right: 0.1rem;
        }

        .rm-val {
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 700;
        }

        .predicted-box .rm-val {
          color: #0284c7;
        }

        .rm-unit {
          font-size: 0.75rem;
          color: #64748b;
          margin-left: 0.2rem;
          font-weight: 500;
        }

        .rm-change-indicator {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
        }

        .change-arrow-icon {
          width: 1.1rem;
          height: 1.1rem;
        }

        .change-decrease {
          color: #10b981; /* Decreasing freight rate is positive for charterers */
        }

        .change-increase {
          color: #ef4444; /* Increasing freight rate is negative for charterers */
        }

        .rm-confidence-icon {
          width: 1.1rem;
          height: 1.1rem;
          color: #eab308;
          align-self: center;
          margin-right: 0.25rem;
        }
      `}</style>
    </div>
  );
}
