import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import StatCard from '../components/StatCard';
import RiskCard from '../components/RiskCard';
import RecommendationCard from '../components/RecommendationCard';
import { Ship, TrendingUp, AlertTriangle, ShieldAlert, Award, Globe, Navigation, ArrowRight, Play, Clock as ClockIcon, Activity } from 'lucide-react';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [risks, setRisks] = useState([]);
  const [routes, setRoutes] = useState([]);
  
  // Live clock state for video banner
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    // Update live clock
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' }) + ' UTC');
      setDateStr(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [recs, rsk, rte] = await Promise.all([
          apiService.getRecommendations(),
          apiService.getRisks(),
          apiService.getRoutes()
        ]);
        setRecommendations(recs.slice(0, 2));
        setRisks(rsk.slice(0, 2));
        setRoutes(rte);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader" />
        <p>Analyzing freight indices and port capacities...</p>
        <style>{`
          .dashboard-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 60vh;
            color: var(--text-secondary);
            gap: 1rem;
          }
          .loader {
            width: 40px;
            height: 40px;
            border: 3px solid var(--border-color);
            border-top-color: var(--color-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-view">
      
      {/* Premium Video Background Hero Banner */}
      <div className="hero-video-banner">
        {/* HTML5 video backdrop */}
        <video 
          className="hero-video-element" 
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src="/Video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Dark overlay mask */}
        <div className="hero-video-overlay" />
        
        {/* Banner Content */}
        <div className="hero-banner-content">
          <div className="hero-left-content">
            <span className="hero-tagline">
              <Activity className="ht-icon" /> Live Fleet Intelligence Terminal
            </span>
            <h2 className="hero-title">OceanFreight Intelligence</h2>
            <p className="hero-description">
              Seamlessly monitor port draft restrictions and freight spot indices. transition spot bookings into structured voyage charter agreements.
            </p>
          </div>
          
          <div className="hero-right-content">
            <div className="clock-widget">
              <ClockIcon className="clock-icon" />
              <div className="clock-time">{timeStr || '00:00:00 UTC'}</div>
              <div className="clock-date">{dateStr || 'Loading Date...'}</div>
            </div>
            <div className="hero-stats-row">
              <div className="hs-block">
                <span className="hs-val">24 Active</span>
                <span className="hs-lbl">Vessels Traced</span>
              </div>
              <div className="hs-divider" />
              <div className="hs-block">
                <span className="hs-val">99.8%</span>
                <span className="hs-lbl">Feasibility Accuracy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-header-desc">
        <p className="page-subtitle">Unified freight market intelligence and berthing restriction analysis for India's East Coast.</p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid-cols-4 dashboard-stats">
        <StatCard
          title="Avg Panamax Rate"
          value="$24.2 / t"
          icon={TrendingUp}
          change="-2.5%"
          changeType="down"
          subtext="Australia-Paradip route"
          sparkData={[26.4, 25.9, 25.1, 24.8, 24.3, 24.0, 24.2]}
        />
        <StatCard
          title="Congestion Waiting"
          value="3.2 Days"
          icon={AlertTriangle}
          change="+12.4%"
          changeType="up"
          subtext="Avg across East Coast"
          sparkData={[2.5, 2.7, 2.6, 2.9, 3.1, 3.0, 3.2]}
        />
        <StatCard
          title="Charter Savings"
          value="$497k"
          icon={Award}
          change="+18.2%"
          changeType="up"
          subtext="Against spot rate average"
          sparkData={[320, 350, 390, 410, 430, 460, 497]}
        />
        <StatCard
          title="Fleet Capacity Util"
          value="92.4%"
          icon={Ship}
          change="+0.8%"
          changeType="up"
          subtext="Optimized parcel matches"
          sparkData={[90.1, 91.0, 91.2, 91.5, 92.0, 92.1, 92.4]}
        />
      </div>

      {/* Main Panel Grid */}
      <div className="dashboard-grid">
        {/* Left Side: Recommendations & Routes */}
        <div className="dashboard-left-panel">
          <section className="dashboard-section">
            <h3 className="section-title">
              <Award className="sec-title-icon" />
              Top Chartering Opportunities
            </h3>
            <div className="rec-list">
              {recommendations.map(rec => (
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))}
            </div>
          </section>

          <section className="dashboard-section active-routes-section">
            <h3 className="section-title">
              <Globe className="sec-title-icon" />
              Active Procurement Corridors
            </h3>
            <div className="card routes-card">
              <div className="routes-grid">
                {routes.map(route => (
                  <div key={route.id} className="route-row">
                    <div className="route-ports">
                      <div className="port-point">
                        <span className="p-name">{route.originName}</span>
                        <span className="p-label">Loading Port</span>
                      </div>
                      <ArrowRight className="route-arrow-icon" />
                      <div className="port-point">
                        <span className="p-name">{route.destinationName}</span>
                        <span className="p-label">Discharge Port</span>
                      </div>
                    </div>
                    <div className="route-meta-info">
                      <div className="meta-block">
                        <span className="meta-l">Commodity</span>
                        <span className="meta-v">{route.commodity}</span>
                      </div>
                      <div className="meta-block">
                        <span className="meta-l">Distance</span>
                        <span className="meta-v">{route.distance} NM</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right Side: Risk monitor and fast actions */}
        <div className="dashboard-right-panel">
          <section className="dashboard-section">
            <h3 className="section-title">
              <ShieldAlert className="sec-title-icon" />
              Real-time Market & Route Risks
            </h3>
            <div className="risk-list">
              {risks.map(r => (
                <RiskCard key={r.id} risk={r} />
              ))}
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .dashboard-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Hero Video Banner */
        .hero-video-banner {
          position: relative;
          height: 320px;
          border-radius: var(--border-radius);
          overflow: hidden;
          box-shadow: 0 8px 35px rgba(0, 0, 0, 0.12);
          display: flex;
          align-items: center;
          background-color: #0f172a;
        }

        .hero-video-element {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 1;
        }

        .hero-video-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%);
          z-index: 2;
        }

        .hero-banner-content {
          position: relative;
          z-index: 3;
          width: 100%;
          padding: 2.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
          flex-wrap: wrap;
          gap: 2rem;
        }

        .hero-left-content {
          max-width: 550px;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .hero-tagline {
          font-family: var(--font-display);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-primary);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .ht-icon {
          width: 0.95rem;
          height: 0.95rem;
        }

        .hero-title {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.1;
        }

        .hero-description {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.4;
        }

        .hero-right-content {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1rem;
        }

        .clock-widget {
          text-align: right;
          background-color: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          min-width: 180px;
        }

        .clock-icon {
          width: 1.1rem;
          height: 1.1rem;
          color: var(--color-primary);
          display: inline-block;
          margin-bottom: 0.25rem;
        }

        .clock-time {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: #ffffff;
        }

        .clock-date {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .hero-stats-row {
          display: flex;
          gap: 1.25rem;
          align-items: center;
        }

        .hs-block {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .hs-val {
          font-family: var(--font-display);
          font-size: 0.95rem;
          font-weight: 700;
          color: #ffffff;
        }

        .hs-lbl {
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .hs-divider {
          width: 1px;
          height: 20px;
          background-color: rgba(255, 255, 255, 0.2);
        }

        .dashboard-stats {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.7fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .hero-right-content {
            align-items: flex-start;
          }
          .clock-widget {
            text-align: left;
          }
          .hero-stats-row {
            align-items: flex-start;
          }
        }

        .dashboard-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 600;
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

        .rec-list, .risk-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* Routes Card Styles */
        .routes-card {
          padding: 1.25rem;
        }

        .routes-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .route-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid var(--border-color);
          flex-wrap: wrap;
          gap: 1rem;
        }

        .route-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .route-ports {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .port-point {
          display: flex;
          flex-direction: column;
        }

        .p-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .p-label {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .route-arrow-icon {
          width: 1rem;
          height: 1rem;
          color: var(--text-muted);
        }

        .route-meta-info {
          display: flex;
          gap: 2rem;
        }

        .meta-block {
          display: flex;
          flex-direction: column;
        }

        .meta-l {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .meta-v {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
