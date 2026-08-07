// frontend/src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import PreCare from './PreCare';
import DiseaseDetection from './DiseaseDetection';
import PostHarvest from './PostHarvest';
import AuctionHouse from './AuctionHouse';
import CropRecommendation from './CropRecommendation';
import { useAuth } from './context/AuthContext';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated, login } = useAuth();

  // Dynamic API URL for development and production (Render)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [pendingPath, setPendingPath] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('register');
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // Auth Inputs & States
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [serverOtp, setServerOtp] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Registration Form State
  const [registerData, setRegisterData] = useState({
    name: '',
    phone: '',
    location: '',
    crop: ''
  });

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleProtectedNavigate = (path) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      setPendingPath(path);
      setAuthError('');
      setAuthSuccess('');
      setAuthTab('register');
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = (userData) => {
    login(userData); 
    
    setShowAuthModal(false);
    setOtpSent(false);
    setOtpInput('');
    setServerOtp('');
    setRegisterData({ name: '', phone: '', location: '', crop: '' });

    if (pendingPath) {
      navigate(pendingPath);
      setPendingPath(null);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    try {
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobileNumber })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.isRegistered === false) {
          setAuthError('This phone number is not registered. Please switch to the Register tab.');
        } else {
          setAuthError(data.message || 'Failed to send OTP.');
        }
        return;
      }

      setOtpSent(true);
      setServerOtp(data.devOtp);
      setAuthSuccess(`OTP generated! Check console/banner. (OTP: ${data.devOtp})`);
    } catch (err) {
      console.error("Send OTP fetch error details:", err);
      setAuthError('Could not connect to authentication server. Check your connection.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setAuthError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobileNumber, otp: otpInput })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.message || 'OTP Verification failed.');
        return;
      }

      handleAuthSuccess(data.user);
    } catch (err) {
      console.error("Verify OTP fetch error details:", err);
      setAuthError('Error communicating with server.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.message || 'Registration failed.');
        return;
      }

      handleAuthSuccess(data.user);
    } catch (err) {
      console.error("Registration fetch error details:", err);
      setAuthError(`Connection error: ${err.message}`);
    }
  };

  const ProtectedRoute = ({ children, path }) => {
    if (!isAuthenticated) {
      setTimeout(() => handleProtectedNavigate(path), 0);
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <i className="fa-solid fa-leaf"></i> Agri<span>Care</span>
        </div>
        <div className="nav-links">
          <button 
            className={`nav-link-btn ${location.pathname === '/recommendation' ? 'active' : ''}`} 
            onClick={() => handleProtectedNavigate('/recommendation')}
          >
            Crop Recommendation
          </button>
          <button 
            className={`nav-link-btn ${location.pathname === '/precare' ? 'active' : ''}`} 
            onClick={() => handleProtectedNavigate('/precare')}
          >
            Pre-Care
          </button>
          <button 
            className={`nav-link-btn ${location.pathname === '/disease' ? 'active' : ''}`} 
            onClick={() => handleProtectedNavigate('/disease')}
          >
            Plant Disease Prediction
          </button>
          <button 
            className={`nav-link-btn ${location.pathname === '/postharvest' ? 'active' : ''}`} 
            onClick={() => handleProtectedNavigate('/postharvest')}
          >
            Post-Harvest
          </button>
          <button 
            className={`nav-link-btn ${location.pathname === '/auction' ? 'active' : ''}`} 
            onClick={() => handleProtectedNavigate('/auction')}
          >
            Auction House
          </button>

          {user ? (
            <button className="btn-hero btn-nav-reg" onClick={() => setShowAuthModal(true)}>
              <i className="fa-solid fa-user-check"></i> {user.name}
            </button>
          ) : (
            <button className="btn-hero btn-nav-reg" onClick={() => { setAuthTab('register'); setShowAuthModal(true); setAuthError(''); setAuthSuccess(''); }}>
              Register / Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Routes Configuration */}
      <Routes>
        <Route path="/" element={
          <main>
            {/* Hero Banner */}
            <header className="hero">
              <div className="hero-content">
                <div className="hero-badge">
                  <i className="fa-solid fa-seedling"></i> AI-Powered Smart Farming
                </div>
                <h1>End-to-End Agricultural Management Platform</h1>
                <p>Optimize your farm yields, track growth stages, diagnose plant diseases, and sell directly on the digital marketplace.</p>

                <div className="hero-btns">
                  <button className="btn-hero btn-green" onClick={() => handleProtectedNavigate('/recommendation')}>
                    <i className="fa-solid fa-wheat-awn"></i> Find Best Crop
                  </button>
                  <button className="btn-hero btn-green" style={{ backgroundColor: '#27ae60' }} onClick={() => handleProtectedNavigate('/precare')}>
                    <i className="fa-solid fa-compass"></i> Explore Pre-Care
                  </button>
                  <button className="btn-hero btn-orange" onClick={() => handleProtectedNavigate('/auction')}>
                    <i className="fa-solid fa-gavel"></i> Open Auction House
                  </button>
                  <button className="btn-hero btn-outline" onClick={() => setIsVoiceActive(!isVoiceActive)}>
                    <i className="fa-solid fa-microphone"></i> {isVoiceActive ? 'Stop Assistant' : 'Start Voice Assistant'}
                  </button>
                </div>
              </div>
            </header>

            {/* Farming Dashboard Section */}
            <section style={{ padding: '50px 20px', maxWidth: '1100px', margin: '0 auto' }}>
              <div style={{ textAlign: 'left', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0 0 6px 0', color: '#0f172a' }}>Farming Dashboard</h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Your AI-powered roadmap to success.</p>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '0 0 8px 0', color: '#0f172a' }}>How would you like to start?</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Choose an option to let AI assist your farming journey.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                
                {/* Option A -> Pre-Care */}
                <div 
                  className="dashboard-card" 
                  onClick={() => handleProtectedNavigate('/precare')}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '36px 24px 28px 24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    border: '1px solid #f1f5f9',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#edf9f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}>
                    <i className="fa-solid fa-seedling" style={{ fontSize: '1.8rem', color: '#22c55e' }}></i>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '12px', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
                    I already know what I want to plant
                  </h4>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: '1.5', flexGrow: 1, marginBottom: '24px' }}>
                    Validate your crop choice against your land conditions and get a specialized care plan.
                  </p>
                  <span style={{ color: '#22c55e', fontWeight: '600', fontSize: '0.95rem' }}>Option A &rarr;</span>
                </div>

                {/* Option B -> Crop Recommendation */}
                <div 
                  className="dashboard-card" 
                  onClick={() => handleProtectedNavigate('/recommendation')}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '36px 24px 28px 24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    border: '1px solid #f1f5f9',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#e0f2fe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}>
                    <i className="fa-solid fa-map-location-dot" style={{ fontSize: '1.8rem', color: '#0284c7' }}></i>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '12px', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
                    Recommend the best crop for my land
                  </h4>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: '1.5', flexGrow: 1, marginBottom: '24px' }}>
                    Let AI analyze your soil, weather, and terrain to find the most profitable and suitable crop.
                  </p>
                  <span style={{ color: '#22c55e', fontWeight: '600', fontSize: '0.95rem' }}>Option B &rarr;</span>
                </div>

                {/* Option C -> Plant Disease Prediction */}
                <div 
                  className="dashboard-card" 
                  onClick={() => handleProtectedNavigate('/disease')}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '36px 24px 28px 24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    border: '1px solid #f1f5f9',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#fef2f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}>
                    <i className="fa-solid fa-virus" style={{ fontSize: '1.8rem', color: '#ef4444' }}></i>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '12px', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
                    Plant Disease Prediction
                  </h4>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: '1.5', flexGrow: 1, marginBottom: '24px' }}>
                    Scan your crops for diseases and receive immediate expert treatment solutions.
                  </p>
                  <span style={{ color: '#22c55e', fontWeight: '600', fontSize: '0.95rem' }}>Option C &rarr;</span>
                </div>

              </div>
            </section>
          </main>
        } />

        {/* Protected Routes */}
        <Route path="/recommendation" element={
          <ProtectedRoute path="/recommendation">
            <CropRecommendation onClose={() => navigate('/')} user={user} />
          </ProtectedRoute>
        } />

        <Route path="/precare" element={
          <ProtectedRoute path="/precare">
            <PreCare onClose={() => navigate('/')} user={user} />
          </ProtectedRoute>
        } />

        <Route path="/disease" element={
          <ProtectedRoute path="/disease">
            <DiseaseDetection onClose={() => navigate('/')} user={user} />
          </ProtectedRoute>
        } />

        <Route path="/postharvest" element={
          <ProtectedRoute path="/postharvest">
            <PostHarvest onClose={() => navigate('/')} user={user} />
          </ProtectedRoute>
        } />

        <Route path="/auction" element={
          <ProtectedRoute path="/auction">
            <AuctionHouse onClose={() => navigate('/')} user={user} />
          </ProtectedRoute>
        } />
      </Routes>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="modal-overlay active">
          <div className="modal-content" style={{ maxWidth: '480px', width: '90%' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    color: authTab === 'register' ? '#2ecc71' : '#64748b',
                    borderBottom: authTab === 'register' ? '2px solid #2ecc71' : 'none'
                  }}
                  onClick={() => { setAuthTab('register'); setAuthError(''); setAuthSuccess(''); }}
                >
                  Register
                </button>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    color: authTab === 'signin' ? '#2ecc71' : '#64748b',
                    borderBottom: authTab === 'signin' ? '2px solid #2ecc71' : 'none'
                  }}
                  onClick={() => { setAuthTab('signin'); setAuthError(''); setAuthSuccess(''); }}
                >
                  Sign In (OTP)
                </button>
              </div>
              <div style={{ cursor: 'pointer' }} onClick={() => setShowAuthModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </div>
            </div>

            <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#64748b' }}>
              {pendingPath ? 'Please complete registration or sign in to access this feature.' : 'Welcome to AgriCare.'}
            </div>

            {authError && (
              <div style={{ background: '#fde8e8', color: '#e74c3c', padding: '10px 14px', borderRadius: '8px', marginTop: '15px', fontSize: '0.9rem' }}>
                <i className="fa-solid fa-circle-exclamation"></i> {authError}
              </div>
            )}

            {authSuccess && (
              <div style={{ background: '#eafaf1', color: '#27ae60', padding: '10px 14px', borderRadius: '8px', marginTop: '15px', fontSize: '0.9rem' }}>
                <i className="fa-solid fa-circle-check"></i> {authSuccess}
              </div>
            )}

            <div className="modal-inner-wrapper" style={{ marginTop: '20px' }}>
              {authTab === 'register' ? (
                <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. John Doe"
                      value={registerData.name}
                      onChange={handleRegisterChange}
                      required
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="e.g. 9876543210"
                      value={registerData.phone}
                      onChange={handleRegisterChange}
                      required
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Location</label>
                    <input
                      type="text"
                      name="location"
                      placeholder="e.g. Punjab"
                      value={registerData.location}
                      onChange={handleRegisterChange}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Primary Crop</label>
                    <input
                      type="text"
                      name="crop"
                      placeholder="e.g. Wheat"
                      value={registerData.crop}
                      onChange={handleRegisterChange}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <button type="submit" className="btn-hero btn-green" style={{ border: 'none', padding: '12px', marginTop: '10px' }}>
                    Complete Registration & Access
                  </button>
                </form>
              ) : (
                !otpSent ? (
                  <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Registered Mobile Number</label>
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                      />
                    </div>
                    <button type="submit" className="btn-hero btn-green" style={{ border: 'none', padding: '12px' }}>
                      Generate Real-Time OTP
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Enter Generated OTP</label>
                      <input
                        type="text"
                        placeholder="4-digit OTP"
                        maxLength={4}
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem' }}
                      />
                    </div>
                    <button type="submit" className="btn-hero btn-green" style={{ border: 'none', padding: '12px' }}>
                      Verify & Continue
                    </button>
                    <button type="button" onClick={() => { setOtpSent(false); setServerOtp(''); setAuthSuccess(''); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' }}>
                      Change Mobile Number
                    </button>
                  </form>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}