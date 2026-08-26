import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Page Views
import Dashboard from './pages/Dashboard';
import Forecast from './pages/Forecast';
import VesselOptimization from './pages/VesselOptimization';
import PortAnalysis from './pages/PortAnalysis';
import RouteAnalysis from './pages/RouteAnalysis';
import RiskAnalysis from './pages/RiskAnalysis';
import Recommendation from './pages/Recommendation';
import ContractStrategy from './pages/ContractStrategy';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import History from './pages/History';
import AuthPage from './pages/AuthPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Map pages to page titles
  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return '🏠 Dashboard Terminal';
      case 'forecast':
        return '📈 Freight Forecast Horizons';
      case 'vessel-optimization':
        return '🚢 Vessel Capacity Optimizer';
      case 'port-intelligence':
        return '⚓ Port Infrastructure Limits';
      case 'route-analysis':
        return '🗺️ Sea Route Analysis';
      case 'risk-monitor':
        return '⚠️ Operational Risk Monitor';
      case 'ai-recommendation':
        return '🎯 AI Tonnage Recommendations';
      case 'contract-strategy':
        return '📋 Charter Contract Strategy Simulator';
      case 'analytics':
        return '📊 Freight Market Analytics';
      case 'alerts':
        return '🔔 System Alert Center';
      case 'history':
        return '📜 locked Contract Audit History';
      default:
        return 'OceanFreight Intelligence Terminal';
    }
  };

  // Render selected page content
  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'forecast':
        return <Forecast />;
      case 'vessel-optimization':
        return <VesselOptimization />;
      case 'port-intelligence':
        return <PortAnalysis />;
      case 'route-analysis':
        return <RouteAnalysis />;
      case 'risk-monitor':
        return <RiskAnalysis />;
      case 'ai-recommendation':
        return <Recommendation />;
      case 'contract-strategy':
        return <ContractStrategy />;
      case 'analytics':
        return <Analytics />;
      case 'alerts':
        return <Alerts />;
      case 'history':
        return <History />;
      default:
        return <Dashboard />;
    }
  };

  // Global Refresh Simulation (Sync with ML Engine)
  const handleSyncData = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1200);
  };

  if (!user) {
    return <AuthPage onLoginSuccess={setUser} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Workspace Area */}
      <div className="main-content">
        {/* Navbar Header */}
        <Navbar 
          pageTitle={getPageTitle()} 
          onRefresh={handleSyncData}
          isSyncing={isSyncing}
          user={user}
          onLogout={() => {
            localStorage.removeItem('auth_user');
            setUser(null);
          }}
        />

        {/* Dynamic Page Container */}
        <main className="page-container">
          {isSyncing ? (
            <div className="syncing-overlay">
              <div className="loader" />
              <p>Re-calibrating voyage routing vectors and hedging indices...</p>
            </div>
          ) : (
            renderPageContent()
          )}
        </main>
      </div>

      <style>{`
        .syncing-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 60vh;
          color: var(--text-secondary);
          gap: 1rem;
        }

        .syncing-overlay .loader {
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
