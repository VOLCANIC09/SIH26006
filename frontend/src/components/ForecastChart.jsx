import React from 'react';
import { ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function ForecastChart({ historicalData = [], forecastData = [] }) {
  // Combine datasets for composed rendering
  // Recharts needs unified objects mapping to the same X axis keys (month)
  const formattedHistorical = historicalData.map(d => ({
    month: d.month,
    rateHistory: d.rate,
    type: 'Historical'
  }));

  // Create a transition point (connect last historical item to first forecast item)
  const lastHistoryItem = historicalData[historicalData.length - 1];
  
  const formattedForecast = forecastData.map((d, index) => {
    // For the very first item, make it connect to the last historical rate to prevent a gap
    return {
      month: d.month,
      rateForecast: d.rate,
      band: [d.lower, d.upper],
      type: 'Forecast'
    };
  });

  const chartData = [
    ...formattedHistorical,
    // Add transition point
    ...(lastHistoryItem ? [{
      month: lastHistoryItem.month,
      rateForecast: lastHistoryItem.rate,
      band: [lastHistoryItem.rate, lastHistoryItem.rate],
      type: 'Forecast'
    }] : []),
    ...formattedForecast
  ];

  // Custom tooltips matching dark dashboard styling
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isForecast = data.type === 'Forecast';
      const historyVal = data.rateHistory;
      const forecastVal = data.rateForecast;
      const range = data.band;

      return (
        <div className="custom-chart-tooltip">
          <p className="tooltip-month">{data.month}</p>
          <div className="tooltip-content">
            {historyVal !== undefined && (
              <p className="tooltip-row text-history">
                <span className="dot history-dot" />
                Historical Rate: <strong>${historyVal}/ton</strong>
              </p>
            )}
            {forecastVal !== undefined && (
              <p className="tooltip-row text-forecast">
                <span className="dot forecast-dot" />
                Forecasted Rate: <strong>${forecastVal}/ton</strong>
              </p>
            )}
            {isForecast && range && (
              <p className="tooltip-row text-range">
                <span className="dot range-dot" />
                95% Confidence: <strong>${range[0]} - ${range[1]}/t</strong>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="forecast-chart-card card">
      <div className="chart-header">
        <h3 className="card-title">Freight Rate Trend & Projections</h3>
        <div className="chart-legend-custom">
          <div className="legend-item"><span className="indicator-dot hist" /> Historical</div>
          <div className="legend-item"><span className="indicator-dot fore" /> Forecasted</div>
          <div className="legend-item"><span className="indicator-dot band-dot" /> Confidence Interval</div>
        </div>
      </div>
      
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={chartData} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="forecastBandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.12} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="var(--text-muted)" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="var(--text-muted)" 
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
            
            {/* Confidence Band Area */}
            <Area 
              name="Confidence Band"
              dataKey="band" 
              stroke="none"
              fill="url(#forecastBandGrad)" 
            />

            {/* Historical rate line */}
            <Line 
              type="monotone" 
              dataKey="rateHistory" 
              stroke="var(--color-secondary)" 
              strokeWidth={3} 
              dot={{ r: 4, strokeWidth: 1, fill: 'var(--bg-secondary)' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />

            {/* Forecasted rate line */}
            <Line 
              type="monotone" 
              dataKey="rateForecast" 
              stroke="var(--color-primary)" 
              strokeWidth={3} 
              strokeDasharray="5 5"
              dot={{ r: 3, strokeWidth: 1, fill: 'var(--bg-secondary)' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <style>{`
        .forecast-chart-card {
          margin-top: 1.5rem;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .chart-legend-custom {
          display: flex;
          gap: 1.5rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .indicator-dot.hist { background-color: var(--color-secondary); }
        .indicator-dot.fore { background-color: var(--color-primary); }
        .indicator-dot.band-dot { background-color: rgba(14, 165, 233, 0.2); border-radius: 2px; width: 12px; height: 6px; }

        .chart-wrapper {
          width: 100%;
        }

        /* Tooltip styles */
        .custom-chart-tooltip {
          background-color: rgba(15, 21, 36, 0.95);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          padding: 0.75rem 1rem;
          box-shadow: 0 10px 20px rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
        }

        .tooltip-month {
          font-weight: 600;
          font-family: var(--font-display);
          font-size: 0.85rem;
          margin-bottom: 0.4rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.25rem;
          color: var(--text-primary);
        }

        .tooltip-content {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .tooltip-row {
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .history-dot { background-color: var(--color-secondary); }
        .forecast-dot { background-color: var(--color-primary); }
        .range-dot { background-color: rgba(14, 165, 233, 0.5); }

        .text-history { color: var(--color-secondary); }
        .text-forecast { color: var(--color-primary); }
        .text-range { color: var(--text-secondary); }
      `}</style>
    </div>
  );
}
