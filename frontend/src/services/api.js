// OceanFreight Intelligence Mock API Service

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock Database
const mockDb = {
  vessels: [
    { id: 'capesize', name: 'Capesize', capacity: '120,000 - 180,000 DWT', draftLimit: 18.5, loaLimit: 290, beamLimit: 45, suitability: 'Heavy coal, iron ore. Best for Paradip & Gangavaram deep berths only.', costFactor: 1.0 },
    { id: 'panamax', name: 'Panamax', capacity: '60,000 - 80,000 DWT', draftLimit: 14.5, loaLimit: 225, beamLimit: 32.2, suitability: 'Coal, grains. Highly versatile, accepted at most East Coast ports.', costFactor: 1.3 },
    { id: 'supramax', name: 'Supramax / Ultramax', capacity: '50,000 - 60,000 DWT', draftLimit: 12.8, loaLimit: 200, beamLimit: 32.2, suitability: 'Bulk cargo, gears onboard. Excellent for smaller draft ports like Haldia.', costFactor: 1.5 },
    { id: 'handysize', name: 'Handysize', capacity: '15,000 - 35,000 DWT', draftLimit: 10.0, loaLimit: 170, beamLimit: 27, suitability: 'General dry bulk. Essential for Sagar-Sandheads lighterage and Haldia.', costFactor: 1.8 }
  ],

  ports: {
    discharge: [
      { id: 'paradip', name: 'Paradip Port', draft: 17.5, loa: 280, beam: 45, capacity: 150000, handlingRate: 25000, congestionIndex: 'Medium', waitingDays: 3, notes: 'Capesize vessels handled at deep berths. High demand.' },
      { id: 'vizag', name: 'Visakhapatnam (Vizag)', draft: 14.5, loa: 230, beam: 32.5, capacity: 80000, handlingRate: 18000, congestionIndex: 'High', waitingDays: 5, notes: 'Inner harbor restricted to Panamax. Outer harbor can take larger drafts.' },
      { id: 'gangavaram', name: 'Gangavaram Port', draft: 19.5, loa: 300, beam: 48, capacity: 200000, handlingRate: 30000, congestionIndex: 'Low', waitingDays: 1, notes: 'Deepest port on the East Coast. Capesize standard berthing.' },
      { id: 'gopalpur', name: 'Gopalpur Port', draft: 12.5, loa: 220, beam: 32, capacity: 70000, handlingRate: 12000, congestionIndex: 'Low', waitingDays: 2, notes: 'Mainly Supramax and Handysize. Upgrades in progress.' },
      { id: 'dhamra', name: 'Dhamra Port', draft: 18.0, loa: 290, beam: 45, capacity: 180000, handlingRate: 28000, congestionIndex: 'Medium', waitingDays: 2.5, notes: 'Deep draft. Well connected, handles Cape size and Panamax.' },
      { id: 'sandheads', name: 'Sagar-Sandheads', draft: 9.5, loa: 180, beam: 28, capacity: 30000, handlingRate: 8000, congestionIndex: 'Medium', waitingDays: 4, notes: 'Mainly lighterage operations. High swell risks.' },
      { id: 'haldia', name: 'Haldia Dock Complex', draft: 8.5, loa: 170, beam: 25, capacity: 25000, handlingRate: 10000, congestionIndex: 'Very High', waitingDays: 7, notes: 'Severe river draft restrictions. Requires tide assistance.' }
    ],
    load: [
      { id: 'newcastle', name: 'Newcastle (Australia)', draft: 16.5, loa: 290, beam: 45, handlingRate: 35000, transitDays: 18 },
      { id: 'baltimore', name: 'Baltimore (US)', draft: 15.2, loa: 270, beam: 42, handlingRate: 20000, transitDays: 32 },
      { id: 'nacala', name: 'Nacala (Mozambique)', draft: 14.0, loa: 230, beam: 32.5, handlingRate: 15000, transitDays: 14 },
      { id: 'vladivostok', name: 'Vladivostok (Russia)', draft: 13.5, loa: 225, beam: 32.2, handlingRate: 18000, transitDays: 12 },
      { id: 'samarinda', name: 'Samarinda (Indonesia)', draft: 12.0, loa: 200, beam: 32.2, handlingRate: 22000, transitDays: 9 }
    ]
  },

  routes: [
    { id: 'aus-par', origin: 'newcastle', destination: 'paradip', commodity: 'Metallurgical Coal', distance: 5400 },
    { id: 'us-viz', origin: 'baltimore', destination: 'vizag', commodity: 'Thermal Coal', distance: 9800 },
    { id: 'moz-gan', origin: 'nacala', destination: 'gangavaram', commodity: 'Thermal Coal', distance: 4100 },
    { id: 'rus-gop', origin: 'vladivostok', destination: 'gopalpur', commodity: 'Coking Coal', distance: 4500 },
    { id: 'ind-hal', origin: 'samarinda', destination: 'haldia', commodity: 'Thermal Coal', distance: 2200 }
  ],

  // Generate historical & forecast time-series data
  getFreightRates: (routeId, vesselId) => {
    const baseRates = {
      'aus-par': { capesize: 18.5, panamax: 24.2, supramax: 29.8, handysize: 38.0 },
      'us-viz': { capesize: 29.0, panamax: 36.5, supramax: 44.0, handysize: 58.0 },
      'moz-gan': { capesize: 16.2, panamax: 21.0, supramax: 26.5, handysize: 35.0 },
      'rus-gop': { capesize: 21.5, panamax: 28.0, supramax: 34.2, handysize: 45.0 },
      'ind-hal': { capesize: 11.0, panamax: 15.5, supramax: 19.8, handysize: 27.5 }
    };

    const base = baseRates[routeId]?.[vesselId] || 25.0;
    const history = [];
    const forecast = [];
    
    const months = ['Sep 25', 'Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26', 'Jul 26', 'Aug 26'];
    const forecastMonths = ['Sep 26', 'Oct 26', 'Nov 26', 'Dec 26', 'Jan 27', 'Feb 27'];

    // Generate simulated stable history with seasonal dips
    months.forEach((month, index) => {
      // Seasonal effect: higher in winter (Dec-Jan) and monsoon prep (May-Jun)
      const seasonal = Math.sin((index / 12) * Math.PI * 2) * 1.5;
      const trend = (index / 12) * 2.0; // Slow general inflation/demand trend
      const randomNoise = Math.sin(index * 2.3) * 0.8;
      const rate = parseFloat((base + seasonal + trend + randomNoise).toFixed(2));
      history.push({ month, rate, type: 'Historical' });
    });

    // Generate forecast (simulating a slight rise, then plateau, with bands)
    let lastRate = history[history.length - 1].rate;
    forecastMonths.forEach((month, index) => {
      const trend = (index + 1) * 0.6 - Math.pow(index, 1.2) * 0.15;
      const seasonal = Math.sin(((index + 12) / 12) * Math.PI * 2) * 1.2;
      const rate = parseFloat((lastRate + trend + seasonal).toFixed(2));
      // Confidence bands widen over time
      const deviation = (index + 1) * 0.8;
      const upper = parseFloat((rate + deviation).toFixed(2));
      const lower = parseFloat((rate - deviation).toFixed(2));
      
      forecast.push({
        month,
        rate,
        upper,
        lower,
        type: 'Forecast'
      });
    });

    return { history, forecast };
  },

  risks: [
    {
      id: 'r1',
      title: 'Bay of Bengal Monsoon Disruption',
      category: 'Weather',
      severity: 'High',
      routes: ['aus-par', 'moz-gan', 'ind-hal'],
      impact: 'Dwell times at Haldia and Paradip projected to increase by 4-6 days due to wind speed and tidal waves.',
      status: 'Active',
      updatedAt: '12 hrs ago'
    },
    {
      id: 'r2',
      title: 'Panamax Freight Market Volatility Spike',
      category: 'Market',
      severity: 'Critical',
      routes: ['aus-par', 'us-viz'],
      impact: 'Strong demand in South East Asian coal exports has triggered a 15% increase in Panamax spot rates over 10 days.',
      status: 'Active',
      updatedAt: '2 hrs ago'
    },
    {
      id: 'r3',
      title: 'Haldia Berthing Waiting Queue Congestion',
      category: 'Port Operational',
      severity: 'High',
      routes: ['ind-hal'],
      impact: 'Siltation in Hooghly river has cut max draft allowance to 8.2m this week, creating a backlog of 9 Handysize vessels.',
      status: 'Active',
      updatedAt: '1 day ago'
    },
    {
      id: 'r4',
      title: 'Panama Canal Transit Restraints',
      category: 'Geopolitical / Canal',
      severity: 'Medium',
      routes: ['us-viz'],
      impact: 'Transit quotas raised but daily vessel limit still caps US-East Coast India shipping routes via Cape of Good Hope.',
      status: 'Ongoing',
      updatedAt: '3 days ago'
    }
  ],

  recommendations: [
    {
      id: 'rec1',
      title: 'Lock 3-Month Panamax Contracts for Australia-Paradip Route',
      action: 'Secure Contract',
      routeId: 'aus-par',
      vesselId: 'panamax',
      confidence: 94,
      details: 'Freight rates are forecasted to rise by 14% over the next 60 days due to Australian output hikes. Securing a 3-month contract now avoids spot surges.',
      savings: '$135,000 per voyage',
      vesselAdvice: 'Utilize Panamax (75k DWT) to stay within Paradip draft limits while maximizing economy.'
    },
    {
      id: 'rec2',
      title: 'Optimize US-Vizag Shipments to Capesize (Part-Load) via Outer Harbor',
      action: 'Vessel Optimization',
      routeId: 'us-viz',
      vesselId: 'capesize',
      confidence: 87,
      details: 'Instead of two Panamax shipments, run a single Cape-size (150k DWT) vessel. Discharge 120k tons at Outer Harbor Vizag and the rest at Gopalpur to bypass inner draft caps.',
      savings: '$320,000 combined',
      vesselAdvice: 'Capesize offers a 20% lower freight per ton compared to Panamax, even with dual-port discharge charges.'
    },
    {
      id: 'rec3',
      title: 'Delay Spot Booking for Indonesia-Haldia route by 10 Days',
      action: 'Wait / Market Entry',
      routeId: 'ind-hal',
      vesselId: 'handysize',
      confidence: 82,
      details: 'Indonesia coal production is temporarily halted for local holiday celebrations. Short-term barge shipping rates will decline post-celebrations when backlog eases.',
      savings: '$42,000 per voyage',
      vesselAdvice: 'Stick to Handysize (28k DWT) with high-capacity grab unloaders to counter Haldia discharge delays.'
    }
  ]
};

const API_BASE = (import.meta.env?.VITE_API_URL || '/api').replace(/\/$/, '');

/**
 * Helper to execute API requests with offline network-failure fallback.
 * Only network/connection errors (e.g. backend server offline, connection refused)
 * fall back to mock data. HTTP response errors (4xx/5xx) throw explicitly.
 */
async function requestWithFallback(endpoint, mockFallbackFn, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, options);
  } catch (networkError) {
    // Network / connection failure (e.g. backend server offline, connection refused)
    console.warn(`[FreightIQ API] Network connection failed for ${endpoint}. Using offline fallback:`, networkError.message);
    return await mockFallbackFn();
  }

  // If the server answered, validate the HTTP status
  if (!response.ok) {
    let errorDetail = `HTTP ${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      if (body) {
        errorDetail = body.detail || body.message || JSON.stringify(body);
      }
    } catch {
      // Body is not JSON
    }
    throw new Error(`API Error [${response.status}] for ${endpoint}: ${typeof errorDetail === 'object' ? JSON.stringify(errorDetail) : errorDetail}`);
  }

  return await response.json();
}

// API Services object
export const apiService = {
  getVessels: async () => {
    return requestWithFallback('/vessels', async () => {
      await sleep(200);
      return mockDb.vessels;
    });
  },

  getPorts: async () => {
    return requestWithFallback('/ports', async () => {
      await sleep(200);
      return mockDb.ports;
    });
  },

  getRoutes: async () => {
    return requestWithFallback('/routes', async () => {
      await sleep(200);
      return mockDb.routes.map(r => ({
        ...r,
        originName: mockDb.ports.load.find(p => p.id === r.origin)?.name || r.origin,
        destinationName: mockDb.ports.discharge.find(p => p.id === r.destination)?.name || r.destination
      }));
    });
  },

  getRatesData: async (routeId, vesselId) => {
    const query = `?routeId=${encodeURIComponent(routeId)}&vesselId=${encodeURIComponent(vesselId)}`;
    return requestWithFallback(`/forecast${query}`, async () => {
      await sleep(250);
      return mockDb.getFreightRates(routeId, vesselId);
    });
  },

  getRisks: async () => {
    return requestWithFallback('/risks', async () => {
      await sleep(200);
      return mockDb.risks;
    });
  },

  getRecommendations: async () => {
    return requestWithFallback('/recommendations', async () => {
      await sleep(200);
      return mockDb.recommendations.map(rec => {
        const route = mockDb.routes.find(r => r.id === rec.routeId);
        const origin = mockDb.ports.load.find(p => p.id === route?.origin)?.name || '';
        const dest = mockDb.ports.discharge.find(p => p.id === route?.destination)?.name || '';
        return {
          ...rec,
          routeLabel: route ? `${origin} ➔ ${dest}` : 'Global Route'
        };
      });
    });
  },

  // Interactive Vessel Optimizer Simulator
  optimizeVessel: async (originId, destId, parcelSize) => {
    const query = `?originId=${encodeURIComponent(originId)}&destId=${encodeURIComponent(destId)}&parcelSize=${encodeURIComponent(parcelSize)}`;
    return requestWithFallback(`/vessels/optimize${query}`, async () => {
      await sleep(300);
      const size = parseFloat(parcelSize) || 50000;
      const dest = mockDb.ports.discharge.find(p => p.id === destId);
      const origin = mockDb.ports.load.find(p => p.id === originId);
      
      if (!dest || !origin) {
        throw new Error("Invalid ports selected");
      }

      const transitDays = origin.transitDays;
      
      // Evaluate options
      const results = mockDb.vessels.map(v => {
        // Check physical draft constraints at both load and discharge port
        const draftOk = (v.draftLimit <= dest.draft) && (v.draftLimit <= origin.draft);
        const loaOk = (v.loaLimit <= dest.loa);
        const beamOk = (v.beamLimit <= dest.beam);
        const feasible = draftOk && loaOk && beamOk;

        // Calculate days in port based on cargo size and discharge handling rate
        const dischargeDays = parseFloat((size / dest.handlingRate).toFixed(1));
        const loadDays = parseFloat((size / origin.handlingRate).toFixed(1));
        const totalDays = transitDays + dischargeDays + loadDays + dest.waitingDays;

        // Base freight cost per ton (simulated)
        const baseFreightPerTon = 22.0 * v.costFactor * (transitDays / 15);
        const demurrageRate = 18000 * v.costFactor; // $/day
        const demurrageCost = dest.waitingDays * demurrageRate;
        
        const totalFreightCost = size * baseFreightPerTon;
        const totalCost = totalFreightCost + demurrageCost;
        const costPerTon = parseFloat((totalCost / size).toFixed(2));

        return {
          vesselId: v.id,
          vesselName: v.name,
          feasible,
          constraints: {
            draft: { allowed: dest.draft, required: v.draftLimit, ok: v.draftLimit <= dest.draft },
            loa: { allowed: dest.loa, required: v.loaLimit, ok: v.loaLimit <= dest.loa },
            beam: { allowed: dest.beam, required: v.beamLimit, ok: v.beamLimit <= dest.beam }
          },
          efficiencyScore: feasible ? Math.round(100 / v.costFactor) : 0,
          loadDays,
          dischargeDays,
          transitDays,
          waitingDays: dest.waitingDays,
          totalDays: parseFloat(totalDays.toFixed(1)),
          costPerTon,
          totalCost: Math.round(totalCost)
        };
      });

      // Find recommended vessel
      const feasibleSorted = results
        .filter(r => r.feasible)
        .sort((a, b) => a.totalCost - b.totalCost);

      const recommended = feasibleSorted[0] || null;

      return {
        results,
        recommendedVessel: recommended,
        destPort: dest,
        originPort: origin
      };
    });
  },

  simulateRisk: async (params = {}) => {
    const {
      baseRate = 25.0,
      volatility = 0.15,
      demurrageRate = 22000.0,
      waitingDays = 4.0,
      parcelSize = 70000.0
    } = params;
    const query = `?baseRate=${encodeURIComponent(baseRate)}&volatility=${encodeURIComponent(volatility)}&demurrageRate=${encodeURIComponent(demurrageRate)}&waitingDays=${encodeURIComponent(waitingDays)}&parcelSize=${encodeURIComponent(parcelSize)}`;
    return requestWithFallback(`/risks/simulate${query}`, async () => {
      await sleep(200);
      return {
        simulations: 1000,
        meanTotalCost: Math.round(parcelSize * baseRate + demurrageRate * waitingDays),
        p10: Math.round((parcelSize * baseRate + demurrageRate * waitingDays) * 0.9),
        p90: Math.round((parcelSize * baseRate + demurrageRate * waitingDays) * 1.15)
      };
    });
  }
};

// Production quantitative engines (FastAPI). These use the same API_BASE as the
// team's live frontend integration, so VITE_API_URL/proxy configuration is shared.
export const quantitativeApi = {
  decisionEngine: async (routeId = 'aus-par', parcelSize = 70000, horizonMonths = 1, simulations = 20000, riskAversion = 0.35) => {
    const q = new URLSearchParams({ routeId, parcelSize, horizonMonths, simulations, riskAversion });
    return requestWithFallback(`/decision-engine?${q}`, async () => {
      throw new Error('Quantitative decision engine is unavailable while the backend is offline.');
    });
  },

  monteCarlo: async (vesselId = 'panamax', parcelSize = 70000, baseRate = 22, simulations = 20000) => {
    const q = new URLSearchParams({ vesselId, parcelSize, baseRate, simulations });
    return requestWithFallback(`/risks/monte-carlo?${q}`, async () => {
      throw new Error('Monte Carlo engine is unavailable while the backend is offline.');
    });
  },

  overview: async () => {
    return requestWithFallback('/quant/overview', async () => {
      throw new Error('Quantitative overview is unavailable while the backend is offline.');
    });
  },

  sensitivity: async (parcelSize = 70000, simulations = 5000) => {
    const q = new URLSearchParams({ parcelSize, simulations });
    return requestWithFallback(`/quant/sensitivity?${q}`, async () => {
      throw new Error('Sensitivity analysis is unavailable while the backend is offline.');
    });
  },

  stress: async (parcelSize = 70000, simulations = 10000) => {
    const q = new URLSearchParams({ parcelSize, simulations });
    return requestWithFallback(`/quant/stress?${q}`, async () => {
      throw new Error('Stress analysis is unavailable while the backend is offline.');
    });
  },

  optimize: async (parcelSize = 70000, riskAversion = 0.35, simulations = 5000, stepT = 5000) => {
    const q = new URLSearchParams({ parcelSize, riskAversion, simulations, stepT });
    return requestWithFallback(`/quant/optimize?${q}`, async () => {
      throw new Error('Quantitative optimization is unavailable while the backend is offline.');
    });
  }
};
