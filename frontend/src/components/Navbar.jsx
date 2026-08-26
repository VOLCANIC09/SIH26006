import React, { useState } from 'react';
import { Bell, RefreshCw, Calendar, Search, Database, LogOut, Settings, User } from 'lucide-react';

export default function Navbar({ pageTitle, onRefresh, isSyncing, user, onLogout }) {
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New freight recommendation for Australia-Paradip route.", read: false },
    { id: 2, text: "Haldia Port draft reduced to 8.2m due to high silting.", read: false }
  ]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [timeframe, setTimeframe] = useState('6m');

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="navbar-header">
      <div className="navbar-left">
        <h1 className="navbar-title">{pageTitle}</h1>
        <div className="sync-badge">
          <Database className="sync-icon" />
          <span>Real-time Port Database Connected</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Date Selector */}
        <div className="timeframe-selector">
          <Calendar className="timeframe-icon" />
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)} 
            className="timeframe-select"
          >
            <option value="1m">Last 30 Days</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">6-Month Forecast</option>
            <option value="12m">1-Year Horizon</option>
          </select>
        </div>

        {/* Sync Button */}
        <button 
          onClick={onRefresh} 
          disabled={isSyncing} 
          className={`navbar-action-btn ${isSyncing ? 'spinning' : ''}`}
          title="Sync with ML Engine"
        >
          <RefreshCw className="action-icon" />
        </button>

        {/* Notifications */}
        <div className="notification-container">
          <button 
            className="navbar-action-btn" 
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <Bell className="action-icon" />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showDropdown && (
            <div className="notification-dropdown">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && <button onClick={markAllRead}>Mark read</button>}
              </div>
              <div className="dropdown-body">
                {notifications.map(n => (
                  <div key={n.id} className={`notification-item ${n.read ? 'read' : 'unread'}`}>
                    <p>{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="nav-divider" />

        {/* Profile Card */}
        <div className="user-profile-container">
          <div className="user-profile" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
            <div className="profile-avatar">{getInitials(user?.name)}</div>
            <div className="profile-info">
              <span className="profile-name">{user?.name || 'Ujjawal Bansal'}</span>
              <span className="profile-role">{user?.role || 'Logistics Lead'}</span>
            </div>
          </div>

          {showProfileDropdown && (
            <div className="profile-dropdown-menu">
              <div className="dropdown-user-header">
                <div className="avatar-large">{getInitials(user?.name)}</div>
                <div className="user-meta">
                  <h4 className="meta-name">{user?.name || 'Ujjawal Bansal'}</h4>
                  <p className="meta-email">{user?.email || 'demo@oceanfreight.com'}</p>
                  <span className="meta-badge">{user?.role || 'Logistics Lead'}</span>
                </div>
              </div>
              <div className="dropdown-divider" />
              <button className="dropdown-menu-item" onClick={() => alert('Profile settings are read-only in demo mode.')}>
                <User className="menu-item-icon" />
                <span>Account Settings</span>
              </button>
              <button className="dropdown-menu-item" onClick={() => alert('Terminal system alerts and logs connected.')}>
                <Settings className="menu-item-icon" />
                <span>System Preferences</span>
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-menu-item logout-item" onClick={onLogout}>
                <LogOut className="menu-item-icon" />
                <span>Disconnect Terminal</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .navbar-header {
          height: var(--navbar-height);
          background-color: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-color);
          box-shadow: var(--box-shadow-navbar);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          position: fixed;
          top: 0;
          right: 0;
          left: var(--sidebar-width);
          z-index: 99;
          transition: var(--transition-smooth);
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .navbar-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          font-family: var(--font-display);
        }

        .sync-badge {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background-color: var(--color-success-glow);
          color: var(--color-success);
          border: 1px solid rgba(16, 185, 129, 0.12);
          padding: 0.25rem 0.55rem;
          border-radius: 6px;
          font-size: 0.725rem;
          font-weight: 500;
        }

        .sync-icon {
          width: 0.8rem;
          height: 0.8rem;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .timeframe-selector {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.35rem 0.65rem;
        }

        .timeframe-icon {
          width: 0.85rem;
          height: 0.85rem;
          color: var(--text-secondary);
        }

        .timeframe-select {
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: 0.8rem;
          font-weight: 500;
          outline: none;
          cursor: pointer;
        }

        .navbar-action-btn {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          transition: var(--transition-smooth);
          position: relative;
        }

        .navbar-action-btn:hover {
          color: var(--text-primary);
          border-color: var(--text-muted);
          background-color: var(--bg-primary);
        }

        .action-icon {
          width: 0.95rem;
          height: 0.95rem;
        }

        .spinning .action-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .notification-badge {
          position: absolute;
          top: -3px;
          right: -3px;
          background-color: var(--color-danger);
          color: white;
          font-size: 0.6rem;
          font-weight: 700;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .notification-container {
          position: relative;
        }

        .notification-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 320px;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          overflow: hidden;
          z-index: 101;
        }

        .dropdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .dropdown-header h3 {
          font-size: 0.85rem;
          font-weight: 600;
        }

        .dropdown-header button {
          background: transparent;
          border: none;
          color: var(--color-primary);
          font-size: 0.725rem;
          cursor: pointer;
        }

        .dropdown-body {
          max-height: 250px;
          overflow-y: auto;
        }

        .notification-item {
          padding: 0.8rem 1rem;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.775rem;
          line-height: 1.4;
          transition: var(--transition-smooth);
        }

        .notification-item.unread {
          background-color: rgba(2, 132, 199, 0.03);
          border-left: 3px solid var(--color-primary);
        }

        .notification-item.read {
          color: var(--text-secondary);
        }

        .nav-divider {
          width: 1px;
          height: 20px;
          background-color: var(--border-color);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          padding: 0.45rem 1.1rem;
          border-radius: 24px;
          transition: var(--transition-smooth);
          cursor: pointer;
          min-width: 170px;
        }

        .user-profile:hover {
          background-color: var(--bg-card);
          border-color: var(--border-color-hover);
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.08);
        }

        .profile-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          color: white;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(79, 70, 229, 0.2);
        }

        .profile-info {
          display: flex;
          flex-direction: column;
        }

        .profile-name {
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .profile-role {
          font-size: 0.675rem;
          color: var(--text-muted);
        }

        @media (max-width: 1024px) {
          .navbar-header {
            left: var(--sidebar-width);
          }
        }

        @media (max-width: 768px) {
          .profile-info, .sync-badge {
            display: none;
          }
        }

        .user-profile-container {
          position: relative;
        }

        .profile-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 260px;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          padding: 1.25rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          z-index: 102;
          animation: slideDownFade 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideDownFade {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-user-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .avatar-large {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          color: white;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(79, 70, 229, 0.2);
        }

        .user-meta {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .meta-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .meta-email {
          font-size: 0.7rem;
          color: var(--text-muted);
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .meta-badge {
          display: inline-block;
          font-size: 0.65rem;
          background-color: var(--color-primary-glow);
          color: var(--color-primary);
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          margin-top: 0.25rem;
          width: fit-content;
          font-weight: 500;
        }

        .dropdown-divider {
          height: 1px;
          background-color: var(--border-color);
          margin: 0.5rem 0;
        }

        .dropdown-menu-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          font-family: var(--font-sans);
          font-size: 0.8rem;
          font-weight: 500;
          width: 100%;
          text-align: left;
          transition: var(--transition-smooth);
        }

        .dropdown-menu-item:hover {
          background-color: var(--bg-card);
          color: var(--text-primary);
        }

        .menu-item-icon {
          width: 0.9rem;
          height: 0.9rem;
          color: var(--text-muted);
        }

        .dropdown-menu-item:hover .menu-item-icon {
          color: var(--text-primary);
        }

        .logout-item {
          color: var(--color-danger);
        }

        .logout-item:hover {
          background-color: var(--color-danger-glow);
          color: var(--color-danger);
        }

        .logout-item:hover .menu-item-icon {
          color: var(--color-danger);
        }
      `}</style>
    </header>
  );
}
