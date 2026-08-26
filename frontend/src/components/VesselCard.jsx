import React from 'react';
import { Shield, HelpCircle, Layers, ArrowUpRight } from 'lucide-react';

export default function VesselCard({ vessel, isRecommended = false }) {
  const efficiencyPercent = vessel.efficiencyScore || 80;

  return (
    <div className={`card vessel-card ${isRecommended ? 'recommended-border' : ''}`}>
      {isRecommended && (
        <div className="recommended-badge">
          <span>RECOMMENDED OPTION</span>
        </div>
      )}

      <div className="vessel-header">
        <div>
          <h4 className="vessel-name">{vessel.name}</h4>
          <span className="vessel-capacity">{vessel.capacity}</span>
        </div>
        <div className="vessel-icon-container">
          <Layers className="vessel-icon" />
        </div>
      </div>

      <div className="vessel-specs">
        <div className="spec-row">
          <span className="spec-label">Draft Requirement</span>
          <span className="spec-value">{vessel.draftLimit} m</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">Max LOA (Length)</span>
          <span className="spec-value">{vessel.loaLimit} m</span>
        </div>
        <div className="spec-row">
          <span className="spec-label">Max Beam (Width)</span>
          <span className="spec-value">{vessel.beamLimit} m</span>
        </div>
      </div>

      <div className="vessel-suitability">
        <span className="suitability-label">Port Fit Notes:</span>
        <p className="suitability-text">{vessel.suitability}</p>
      </div>

      <div className="vessel-efficiency">
        <div className="efficiency-header">
          <span className="efficiency-label">Route Efficiency Index</span>
          <span className="efficiency-value">{efficiencyPercent}%</span>
        </div>
        <div className="progress-bar-track">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${efficiencyPercent}%` }}
          />
        </div>
      </div>

      <style>{`
        .vessel-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          background-color: var(--bg-secondary);
        }

        .vessel-card.recommended-border {
          border-color: var(--color-success);
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.1);
        }

        .recommended-badge {
          position: absolute;
          top: 0;
          right: 0;
          background-color: var(--color-success);
          color: white;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.25rem 0.75rem;
          border-radius: 0 0 0 8px;
          letter-spacing: 0.05em;
        }

        .vessel-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-top: 0.25rem;
        }

        .vessel-name {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .vessel-capacity {
          font-size: 0.75rem;
          color: var(--color-primary);
          font-weight: 600;
        }

        .vessel-icon-container {
          background-color: var(--bg-card);
          padding: 0.4rem;
          border-radius: 6px;
        }

        .vessel-icon {
          width: 1.1rem;
          height: 1.1rem;
          color: var(--text-secondary);
        }

        .vessel-specs {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          padding: 0.75rem 0;
        }

        .spec-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
        }

        .spec-label {
          color: var(--text-secondary);
        }

        .spec-value {
          color: var(--text-primary);
          font-weight: 600;
        }

        .vessel-suitability {
          font-size: 0.8rem;
        }

        .suitability-label {
          display: block;
          color: var(--text-secondary);
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .suitability-text {
          color: var(--text-primary);
          line-height: 1.4;
        }

        .vessel-efficiency {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .efficiency-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
        }

        .efficiency-label {
          color: var(--text-secondary);
        }

        .efficiency-value {
          color: var(--color-success);
          font-weight: 700;
        }

        .progress-bar-track {
          height: 6px;
          background-color: var(--bg-card);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-primary), var(--color-success));
          border-radius: 3px;
          transition: var(--transition-smooth);
        }
      `}</style>
    </div>
  );
}
