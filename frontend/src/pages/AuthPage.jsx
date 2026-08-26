import React, { useState } from 'react';
import { Ship, Lock, Mail, User, Eye, EyeOff, ArrowRight, ShieldAlert, CheckCircle2, Briefcase } from 'lucide-react';

export default function AuthPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Logistics Lead');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-configured mock database initialization
  const getMockUsers = () => {
    const users = localStorage.getItem('mock_users');
    if (!users) {
      const defaultUsers = [
        {
          name: 'Ujjawal Bansal',
          email: 'demo@oceanfreight.com',
          password: 'password123',
          role: 'Logistics Lead'
        }
      ];
      localStorage.setItem('mock_users', JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(users);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const users = getMockUsers();
      const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);

      if (user) {
        localStorage.setItem('auth_user', JSON.stringify(user));
        onLoginSuccess(user);
      } else {
        setError('Invalid email or password. Try demo@oceanfreight.com / password123');
        setLoading(false);
      }
    }, 1000);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const users = getMockUsers();
      const userExists = users.some(u => u.email.toLowerCase() === email.trim().toLowerCase());

      if (userExists) {
        setError('An account with this email already exists.');
        setLoading(false);
        return;
      }

      const newUser = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        role: role
      };

      users.push(newUser);
      localStorage.setItem('mock_users', JSON.stringify(users));
      
      setSuccess('Account created successfully! Switching to login...');
      setLoading(false);
      
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setIsLogin(true);
        setSuccess('');
      }, 1500);
    }, 1000);
  };

  const handleDemoLogin = () => {
    setError('');
    setLoading(true);
    setTimeout(() => {
      const demoUser = {
        name: 'Ujjawal Bansal',
        email: 'demo@oceanfreight.com',
        password: 'password123',
        role: 'Logistics Lead'
      };
      localStorage.setItem('auth_user', JSON.stringify(demoUser));
      onLoginSuccess(demoUser);
    }, 600);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-background-mesh">
        <div className="mesh-circle circle-1"></div>
        <div className="mesh-circle circle-2"></div>
        <div className="mesh-circle circle-3"></div>
      </div>

      <div className="auth-card-container">
        {/* Brand/Logo Section */}
        <div className="auth-brand">
          <div className="brand-logo-glow">
            <Ship className="brand-logo-icon" />
          </div>
          <h1 className="brand-title">OceanFreight</h1>
          <p className="brand-subtitle">INTELLIGENCE TERMINAL</p>
        </div>

        {/* Auth Glassmorphism Card */}
        <div className="auth-glass-card">
          <div className="auth-tabs">
            <button 
              className={`auth-tab-btn ${isLogin ? 'active' : ''}`}
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              disabled={loading}
            >
              Sign In
            </button>
            <button 
              className={`auth-tab-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              disabled={loading}
            >
              Register
            </button>
          </div>

          <div className="auth-form-content">
            {error && (
              <div className="auth-alert error">
                <ShieldAlert className="alert-icon" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="auth-alert success">
                <CheckCircle2 className="alert-icon" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={isLogin ? handleLogin : handleSignup}>
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="name-input">Full Name</label>
                  <div className="input-with-icon">
                    <User className="input-icon" />
                    <input 
                      id="name-input"
                      type="text" 
                      placeholder="Enter your name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="auth-input-field"
                      required 
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email-input">Work Email</label>
                <div className="input-with-icon">
                  <Mail className="input-icon" />
                  <input 
                    id="email-input"
                    type="email" 
                    placeholder="name@company.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input-field"
                    required 
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password-input">Password</label>
                <div className="input-with-icon">
                  <Lock className="input-icon" />
                  <input 
                    id="password-input"
                    type={showPassword ? 'text' : 'password'} 
                    placeholder={isLogin ? '••••••••' : 'Create password (min 6 chars)'} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input-field"
                    required 
                    disabled={loading}
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff className="toggle-icon" /> : <Eye className="toggle-icon" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <>
                  <div className="form-group">
                    <label htmlFor="confirm-password-input">Confirm Password</label>
                    <div className="input-with-icon">
                      <Lock className="input-icon" />
                      <input 
                        id="confirm-password-input"
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="Confirm password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="auth-input-field"
                        required 
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="role-select">Corporate Role</label>
                    <div className="input-with-icon">
                      <Briefcase className="input-icon" />
                      <select 
                        id="role-select"
                        value={role} 
                        onChange={(e) => setRole(e.target.value)}
                        className="auth-input-field auth-select-field"
                        disabled={loading}
                      >
                        <option value="Logistics Lead">Logistics Lead</option>
                        <option value="Chartering Manager">Chartering Manager</option>
                        <option value="Supply Chain Officer">Supply Chain Officer</option>
                        <option value="Maritime Analyst">Maritime Analyst</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <button 
                type="submit" 
                className={`auth-submit-btn ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <div className="btn-spinner" />
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In to Terminal' : 'Create Account'}</span>
                    <ArrowRight className="btn-arrow-icon" />
                  </>
                )}
              </button>
            </form>

            {isLogin && (
              <div className="auth-divider-section">
                <div className="divider-line" />
                <span className="divider-text">OR SPEED ACCESS</span>
                <div className="divider-line" />
              </div>
            )}

            {isLogin && (
              <button 
                type="button" 
                onClick={handleDemoLogin} 
                className="demo-auth-btn"
                disabled={loading}
              >
                <span>Access Demo Account</span>
              </button>
            )}
          </div>
        </div>

        <div className="auth-footer-tag">
          <span>Secure OceanFreight Encryption &copy; {new Date().getFullYear()}</span>
        </div>
      </div>

      <style>{`
        .auth-page-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: #0b1329;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-sans);
          z-index: 9999;
          overflow: hidden;
        }

        /* Ambient glowing circles */
        .auth-background-mesh {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          z-index: 1;
        }

        .mesh-circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
          animation: pulse 12s infinite alternate ease-in-out;
        }

        .circle-1 {
          width: 400px;
          height: 400px;
          background-color: var(--color-primary);
          top: -10%;
          left: -10%;
        }

        .circle-2 {
          width: 500px;
          height: 500px;
          background-color: var(--color-secondary);
          bottom: -15%;
          right: -10%;
          animation-delay: -3s;
        }

        .circle-3 {
          width: 350px;
          height: 350px;
          background-color: var(--color-info);
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: -6s;
        }

        @keyframes pulse {
          0% { transform: scale(1) translate(0, 0); opacity: 0.12; }
          100% { transform: scale(1.15) translate(30px, 30px); opacity: 0.22; }
        }

        .auth-card-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .auth-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
          text-align: center;
        }

        .brand-logo-glow {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 30px rgba(2, 132, 199, 0.4);
          margin-bottom: 0.75rem;
        }

        .brand-logo-icon {
          width: 28px;
          height: 28px;
          color: white;
        }

        .brand-title {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.85rem;
          color: #ffffff;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .brand-subtitle {
          font-size: 0.675rem;
          font-weight: 800;
          color: var(--color-primary);
          letter-spacing: 0.22em;
          margin-top: 0.25rem;
        }

        .auth-glass-card {
          width: 100%;
          background: rgba(30, 41, 59, 0.45);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          transition: border-color 0.3s;
        }

        .auth-glass-card:hover {
          border-color: rgba(2, 132, 199, 0.25);
        }

        .auth-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .auth-tab-btn {
          flex: 1;
          padding: 1.1rem;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border-bottom: 2px solid transparent;
        }

        .auth-tab-btn:hover {
          color: rgba(255, 255, 255, 0.8);
          background-color: rgba(255, 255, 255, 0.02);
        }

        .auth-tab-btn.active {
          color: #ffffff;
          border-bottom-color: var(--color-primary);
          background-color: rgba(255, 255, 255, 0.04);
        }

        .auth-form-content {
          padding: 2.25rem 2rem;
        }

        .auth-alert {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.8rem;
          line-height: 1.4;
          animation: shake 0.4s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        .auth-alert.error {
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }

        .auth-alert.success {
          background-color: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #a7f3d0;
        }

        .alert-icon {
          width: 1.1rem;
          height: 1.1rem;
          flex-shrink: 0;
          margin-top: 0.05rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-bottom: 1.25rem;
        }

        .form-group label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 0.95rem;
          width: 0.95rem;
          height: 0.95rem;
          color: rgba(255, 255, 255, 0.35);
          pointer-events: none;
          transition: color 0.3s;
        }

        .auth-input-field {
          width: 100%;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #ffffff;
          padding: 0.65rem 0.9rem 0.65rem 2.4rem;
          font-size: 0.85rem;
          outline: none;
          transition: all 0.3s;
        }

        .auth-select-field {
          appearance: none;
          cursor: pointer;
        }

        .auth-input-field:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
          background-color: rgba(15, 23, 42, 0.6);
        }

        .auth-input-field:focus + .input-icon {
          color: var(--color-primary);
        }

        .password-toggle-btn {
          position: absolute;
          right: 0.85rem;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.35);
          cursor: pointer;
          padding: 0.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.3s;
        }

        .password-toggle-btn:hover {
          color: rgba(255, 255, 255, 0.7);
        }

        .toggle-icon {
          width: 0.95rem;
          height: 0.95rem;
        }

        .auth-submit-btn {
          width: 100%;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.75rem;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.2);
          margin-top: 1.75rem;
        }

        .auth-submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3);
          opacity: 0.95;
        }

        .auth-submit-btn:active {
          transform: translateY(0);
        }

        .btn-arrow-icon {
          width: 0.95rem;
          height: 0.95rem;
          transition: transform 0.3s;
        }

        .auth-submit-btn:hover .btn-arrow-icon {
          transform: translateX(3px);
        }

        .btn-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .auth-divider-section {
          display: flex;
          align-items: center;
          margin: 1.5rem 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
        }

        .divider-text {
          font-size: 0.65rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.3);
          padding: 0 0.8rem;
          letter-spacing: 0.05em;
        }

        .demo-auth-btn {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 0.65rem;
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .demo-auth-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.2);
        }

        .auth-footer-tag {
          margin-top: 1.5rem;
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.25);
          letter-spacing: 0.02em;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
