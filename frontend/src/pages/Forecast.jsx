import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import ForecastChart from '../components/ForecastChart';
import ForecastForm from '../components/forecast/ForecastForm';

export default function Forecast() {
  const [routes, setRoutes] = useState([]);
  const [vessels, setVessels] = useState([]);
  
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedVessel, setSelectedVessel] = useState('');
  const [horizon, setHorizon] = useState('6'); // Months

  const [chartData, setChartData] = useState({ history: [], forecast: [] });
  const [loading, setLoading] = useState(true);

  // Initialize filters
  useEffect(() => {
    async function loadFilters() {
      try {
        const [rList, vList] = await Promise.all([
          apiService.getRoutes(),
          apiService.getVessels()
        ]);
        setRoutes(rList);
        setVessels(vList);
        
        if (rList.length > 0) setSelectedRoute(rList[0].id);
        if (vList.length > 0) setSelectedVessel(vList[1].id); // Default to Panamax
      } catch (err) {
        console.error("Error loading filters", err);
      }
    }
    loadFilters();
  }, []);

  // Fetch forecast data when filters change
  useEffect(() => {
    if (!selectedRoute || !selectedVessel) return;

    async function loadForecast() {
      setLoading(true);
      try {
        const rates = await apiService.getRatesData(selectedRoute, selectedVessel);
        
        // Filter forecast based on selected horizon
        const filteredForecast = rates.forecast.slice(0, parseInt(horizon));
        
        setChartData({
          history: rates.history,
          forecast: filteredForecast
        });
      } catch (err) {
        console.error("Error fetching rates", err);
      } finally {
        setLoading(false);
      }
    }
    loadForecast();
  }, [selectedRoute, selectedVessel, horizon]);

  // Analytics for the selected forecast
  const currentRate = chartData.history.length > 0 ? chartData.history[chartData.history.length - 1].rate : 0;
  const targetForecast = chartData.forecast.length > 0 ? chartData.forecast[chartData.forecast.length - 1].rate : 0;
  const pctChange = currentRate ? (((targetForecast - currentRate) / currentRate) * 100).toFixed(1) : 0;
  
  const isUp = parseFloat(pctChange) > 0;
  const isNeutral = parseFloat(pctChange) === 0;

  // Peak month determination
  const combinedForecast = chartData.forecast;
  let peakItem = null;
  if (combinedForecast.length > 0) {
    peakItem = [...combinedForecast].sort((a, b) => b.rate - a.rate)[0];
  }

  return (
    <div className="forecast-view">
      <div className="page-header-desc">
        <p className="page-subtitle">Predictive models forecasting bulk freight index trends per voyage route, detailing upper/lower margin ranges.</p>
      </div>

      {/* Premium Input Panel */}
      <ForecastForm />

      {/* Main Analysis Panels */}
      {loading ? (
        <div className="chart-loading-block card">
          <div className="loader" />
          <p>Processing neural network predictions and freight differentials...</p>
        </div>
      ) : (
        <>
          <ForecastChart 
            historicalData={chartData.history} 
            forecastData={chartData.forecast} 
          />

          {/* Forecast Analysis Grid */}
          <div className="grid-cols-3 forecast-analytics-grid">
            {/* Metric Card 1 */}
            <div className="card metric-box">
              <div className="metric-header">
                <span className="box-title">Rate Trajectory (Horizon)</span>
                <TrendingUp className="box-icon" />
              </div>
              <div className="metric-body">
                <h4 className="metric-primary-val">${targetForecast}/ton</h4>
                <div className={`metric-change ${isUp ? 'bullish' : 'bearish'}`}>
                  <span>{isUp ? '▲' : '▼'} {Math.abs(pctChange)}%</span>
                  <span className="change-desc">over next {horizon} months</span>
                </div>
              </div>
            </div>

            {/* Metric Card 2 */}
            <div className="card metric-box">
              <div className="metric-header">
                <span className="box-title">Peak Estimated Cost</span>
                <DollarSign className="box-icon" />
              </div>
              <div className="metric-body">
                <h4 className="metric-primary-val">
                  {peakItem ? `$${peakItem.rate}/ton` : 'N/A'}
                </h4>
                <span className="metric-secondary-label">
                  Expected in: <strong>{peakItem ? peakItem.month : 'N/A'}</strong>
                </span>
              </div>
            </div>

            {/* Metric Card 3 */}
            <div className="card metric-box">
              <div className="metric-header">
                <span className="box-title">Market Sentiment Rating</span>
                <Activity className="box-icon" />
              </div>
              <div className="metric-body">
                <h4 className="metric-primary-val text-warning">
                  {isUp ? 'BULLISH' : 'BEARISH'}
                </h4>
                <span className="metric-secondary-label">
                  Volatility Indicator: <strong>Medium-High Risk</strong>
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .forecast-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .filter-toolbar {
          display: flex;
          gap: 2rem;
          padding: 1.25rem 1.75rem;
          flex-wrap: wrap;
          background-color: var(--bg-secondary);
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .toggle-group {
          display: flex;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.2rem;
        }

        .toggle-btn {
          border: none;
          background: transparent;
          color: var(--text-secondary);
          padding: 0.4rem 1rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .toggle-btn.active {
          background-color: var(--color-primary);
          color: white;
        }

        .chart-loading-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 350px;
          color: var(--text-secondary);
          gap: 1rem;
        }

        .chart-loading-block .loader {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border-color);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .forecast-analytics-grid {
          margin-top: 0.5rem;
        }

        .metric-box {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.25rem;
          height: 120px;
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .box-title {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .box-icon {
          width: 0.95rem;
          height: 0.95rem;
          color: var(--text-muted);
        }

        .metric-body {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .metric-primary-val {
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.1;
        }

        .metric-change {
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          gap: 0.4rem;
        }

        .metric-change.bullish { color: var(--color-danger); }
        .metric-change.bearish { color: var(--color-success); }
        
        .change-desc {
          color: var(--text-muted);
          font-weight: 400;
        }

        .metric-secondary-label {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .metric-secondary-label strong {
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
