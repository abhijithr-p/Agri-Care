import React, { useState } from 'react';
import axios from 'axios';

export default function PreCare() {
  // Navigation & Feature Selection
  const [selectedFeature, setSelectedFeature] = useState(null); // 'know'
  const [cropInput, setCropInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Sidebar Chat / Query State
  const [chatMessage, setChatMessage] = useState('');

  // Tracking Completed Stages & Verification Photos
  const [stageProgress, setStageProgress] = useState({});

  // Dynamic API URL for development and production (Render)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Feature switcher helper
  const handleSelectFeature = (feature) => {
    setPlanData(null);
    setSelectedFeature(feature);
  };

  // Fetch crop plan on "Validate My Crop"
  const handleFetchPlan = async (cropName) => {
    const cropToFetch = cropName || cropInput;
    if (!cropToFetch) return;

    setLoading(true);
    setErrorMsg('');
    setPlanData(null);
    setStageProgress({});

    try {
      const response = await axios.post(`${API_URL}/api/precare/validate-crop`, {
        crop: cropToFetch
      });

      if (response.data && response.data.success) {
        setPlanData(response.data.plan);
      } else {
        setErrorMsg('Failed to load crop plan.');
      }
    } catch (err) {
      console.error('API Error:', err);
      setErrorMsg('Could not connect to backend server. Ensure server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Stage image upload handler
  const handleStageImageUpload = (stageIndex, event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setStageProgress((prev) => ({
        ...prev,
        [stageIndex]: {
          completed: true,
          image: imageUrl,
          completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      }));
    }
  };

  return (
    <div style={styles.appWrapper}>
      {/* LEFT SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.robotAvatarContainer}>
          <div style={styles.avatarBorder}>
            <span style={{ fontSize: '32px' }}>🤖</span>
          </div>
          <h3 style={styles.aiName}>AgriCare Expert AI</h3>
          <div style={styles.langPills}>
            <span style={{ ...styles.langBadge, backgroundColor: '#20c997' }}>EN</span>
            <span style={{ ...styles.langBadge, backgroundColor: '#e9ecef', color: '#6c757d' }}>TH</span>
          </div>
        </div>

        <div style={styles.promptBubble}>
          Select a crop to see your plan, or ask me any farming question.
        </div>

        {/* Chat Input Box */}
        <div style={styles.chatBoxRow}>
          <input
            type="text"
            placeholder="Ask a question..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            style={styles.chatInput}
          />
          <button style={styles.sendBtn}>
            <span>➔</span>
          </button>
        </div>

        {/* Quick Tag Chips */}
        <div style={styles.chipRow}>
          <button 
            style={styles.chipRed}
            onClick={() => { window.location.href = '/disease'; }}
          >
            👾 Disease Expert
          </button>
          <button style={styles.chipLight}>Fertilizer tips</button>
          <button style={styles.chipLight}>Next task</button>
          <button style={styles.chipLight}>Soil health</button>
        </div>

        {/* Speak Button */}
        <button style={styles.speakBtn}>
          🎤 Speak to AI
        </button>

        <hr style={styles.divider} />

        {/* History Section */}
        <div style={styles.historySection}>
          <h4 style={styles.historyTitle}>⏱ Your Farming History</h4>
          <p style={styles.historyText}>No history found. Start your first plan!</p>
        </div>
      </aside>

      {/* MAIN DASHBOARD AREA */}
      <main style={styles.mainContent}>
        {/* Top Header */}
        <header style={styles.dashboardHeader}>
          <div>
            <h1 style={styles.dashTitle}>Farming Dashboard</h1>
            <p style={styles.dashSubtitle}>Your AI-powered roadmap to success.</p>
          </div>
          {(selectedFeature || planData) && (
            <button style={styles.closeBtn} onClick={() => handleSelectFeature(null)}>
              ✕
            </button>
          )}
        </header>

        {/* VIEW 1: Initial Options Grid */}
        {!selectedFeature && !planData && (
          <div style={styles.centralView}>
            <h2 style={styles.mainQuestion}>How would you like to start?</h2>
            <p style={styles.mainDesc}>Choose an option to let AI assist your farming journey.</p>

            <div style={styles.cardsGrid}>
              {/* Option A */}
              <div style={styles.optionCard} onClick={() => handleSelectFeature('know')}>
                <div style={{ ...styles.iconCircle, backgroundColor: '#eef2ff', color: '#3b82f6' }}>
                  🌱
                </div>
                <h3 style={styles.optionTitle}>I already know what I want to plant</h3>
                <p style={styles.optionDesc}>
                  Validate your crop choice against your land conditions and get a specialized care plan.
                </p>
                <div style={{ ...styles.optionLink, color: '#10b981' }}>Option A →</div>
              </div>

              {/* Option B: Redirect */}
              <div 
                style={styles.optionCard} 
                onClick={() => { window.location.href = '/recommendation'; }}
              >
                <div style={{ ...styles.iconCircle, backgroundColor: '#ecfdf5', color: '#10b981' }}>
                  🗺️
                </div>
                <h3 style={styles.optionTitle}>Recommend the best crop for my land</h3>
                <p style={styles.optionDesc}>
                  Let AI analyze your soil, weather, and terrain to find the most profitable and suitable.
                </p>
                <div style={{ ...styles.optionLink, color: '#10b981' }}>Option B →</div>
              </div>

              {/* Option C: Redirect */}
              <div 
                style={styles.optionCard} 
                onClick={() => { window.location.href = '/disease'; }}
              >
                <div style={{ ...styles.iconCircle, backgroundColor: '#fef2f2', color: '#ef4444' }}>
                  🦠
                </div>
                <h3 style={styles.optionTitle}>Plant Disease Prediction</h3>
                <p style={styles.optionDesc}>
                  Scan your crops for diseases and receive immediate expert treatment solutions.
                </p>
                <div style={{ ...styles.optionLink, color: '#10b981' }}>Option C →</div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Crop Input View (Option A) */}
        {selectedFeature === 'know' && !planData && (
          <div style={styles.centralView}>
            <div style={{ ...styles.iconCircleLarge, backgroundColor: '#ecfdf5', color: '#10b981' }}>
              🌿
            </div>
            <h2 style={styles.mainQuestion}>What crop are you planning to plant?</h2>
            <p style={styles.mainDesc}>Enter the crop name and we will validate its suitability for your location.</p>

            <div style={styles.inputFormBox}>
              <input
                type="text"
                placeholder="e.g., Rice, Sugarcane, Cassava..."
                value={cropInput}
                onChange={(e) => setCropInput(e.target.value)}
                style={styles.cropSearchInput}
              />

              <button
                style={{
                  ...styles.validateBtn,
                  backgroundColor: cropInput.trim() ? '#10b981' : '#cbd5e1'
                }}
                onClick={() => handleFetchPlan()}
                disabled={loading || !cropInput.trim()}
              >
                {loading ? 'Validating...' : 'Validate My Crop ✨'}
              </button>
            </div>

            {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}
          </div>
        )}

        {/* VIEW 3: Cultivation Plan & Stage Verification */}
        {selectedFeature === 'know' && planData && (
          <div style={styles.planResultsContainer}>
            <button style={styles.backLinkBtn} onClick={() => setPlanData(null)}>
              ← Back to Crop Input
            </button>

            <h2 style={styles.planHeaderTitle}>📋 Cultivation Plan: {planData.crop}</h2>

            <div style={styles.summaryGrid}>
              <div><strong>🌱 Soil:</strong> {planData.soilSuitability}</div>
              <div><strong>💧 Water:</strong> {planData.waterRequirement}</div>
              <div><strong>⏱️ Duration:</strong> {planData.harvestDuration}</div>
              <div><strong>🧪 NPK Dosage:</strong> {planData.npkFertilizer}</div>
            </div>

            <h3 style={styles.sectionSubTitle}>Stages & Progress Tracking</h3>

            <div style={styles.stagesList}>
              {planData.steps && planData.steps.map((stepItem, idx) => {
                const isObj = typeof stepItem === 'object' && stepItem !== null;
                const title = isObj ? stepItem.stage : `Stage ${idx + 1}`;
                const text = isObj ? stepItem.action : String(stepItem);

                const isCompleted = stageProgress[idx]?.completed;
                const uploadedImg = stageProgress[idx]?.image;

                return (
                  <div
                    key={idx}
                    style={{
                      ...styles.stageCard,
                      borderLeft: isCompleted ? '6px solid #10b981' : '6px solid #f59e0b',
                      backgroundColor: isCompleted ? '#f0fdf4' : '#ffffff'
                    }}
                  >
                    <div style={styles.stageCardHeader}>
                      <h4 style={styles.stageName}>{title}</h4>
                      <span style={{
                        ...styles.statusChip,
                        backgroundColor: isCompleted ? '#10b981' : '#f59e0b'
                      }}>
                        {isCompleted ? '✓ Completed' : 'In Progress'}
                      </span>
                    </div>

                    <p style={styles.stageText}>{text}</p>

                    <div style={styles.uploadBox}>
                      {!isCompleted ? (
                        <div style={styles.uploadFlex}>
                          <span style={styles.uploadNotice}>
                            📸 <strong>Action Required:</strong> Upload a photo of your field to finish this stage.
                          </span>
                          <label style={styles.uploadLabelBtn}>
                            Upload Photo
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleStageImageUpload(idx, e)}
                              style={{ display: 'none' }}
                            />
                          </label>
                        </div>
                      ) : (
                        <div style={styles.completedFlex}>
                          <span style={styles.completedSuccessMsg}>
                            ✅ Stage completed at {stageProgress[idx]?.completedAt}
                          </span>
                          {uploadedImg && (
                            <img
                              src={uploadedImg}
                              alt="Stage Verification"
                              style={styles.verificationImg}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  appWrapper: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f4f6f8',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#1e293b'
  },
  sidebar: {
    width: '280px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  robotAvatarContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px'
  },
  avatarBorder: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    border: '2px solid #10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4'
  },
  aiName: {
    fontSize: '16px',
    fontWeight: '700',
    margin: 0,
    color: '#0f172a'
  },
  langPills: {
    display: 'flex',
    gap: '4px'
  },
  langBadge: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#ffffff',
    padding: '2px 8px',
    borderRadius: '10px'
  },
  promptBubble: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '12px 14px',
    fontSize: '13px',
    color: '#475569',
    lineHeight: '1.4',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  chatBoxRow: {
    display: 'flex',
    gap: '8px'
  },
  chatInput: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    fontSize: '14px',
    outline: 'none'
  },
  sendBtn: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0 12px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  chipRed: {
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  chipLight: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '12px',
    padding: '4px 10px',
    fontSize: '11px',
    cursor: 'pointer'
  },
  speakBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'center'
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #f1f5f9',
    margin: '8px 0'
  },
  historySection: {
    marginTop: 'auto'
  },
  historyTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    margin: '0 0 6px 0'
  },
  historyText: {
    fontSize: '12px',
    color: '#94a3b8',
    margin: 0
  },
  mainContent: {
    flex: 1,
    padding: '40px 60px',
    display: 'flex',
    flexDirection: 'column'
  },
  dashboardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px'
  },
  dashTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 4px 0'
  },
  dashSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0
  },
  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '18px',
    color: '#94a3b8',
    cursor: 'pointer'
  },
  centralView: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginTop: '10px'
  },
  mainQuestion: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 8px 0'
  },
  mainDesc: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '32px'
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    maxWidth: '960px',
    width: '100%'
  },
  optionCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    cursor: 'pointer'
  },
  iconCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    marginBottom: '20px'
  },
  iconCircleLarge: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    marginBottom: '20px'
  },
  optionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 12px 0',
    lineHeight: '1.3'
  },
  optionDesc: {
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.5',
    marginBottom: '24px'
  },
  optionLink: {
    marginTop: 'auto',
    fontSize: '14px',
    fontWeight: '600'
  },
  inputFormBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '480px',
    width: '100%'
  },
  cropSearchInput: {
    width: '100%',
    padding: '16px 20px',
    borderRadius: '30px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  validateBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: 'none',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxSizing: 'border-box',
    transition: 'background-color 0.2s ease'
  },
  errorBox: {
    marginTop: '16px',
    color: '#ef4444',
    fontSize: '14px'
  },
  planResultsContainer: {
    maxWidth: '800px',
    width: '100%',
    margin: '0 auto'
  },
  backLinkBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#10b981',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '16px',
    padding: 0
  },
  planHeaderTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '16px'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '24px'
  },
  sectionSubTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '16px'
  },
  stagesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  stageCard: {
    padding: '20px',
    borderRadius: '12px'
  },
  stageCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  stageName: {
    fontSize: '16px',
    fontWeight: '700',
    margin: 0,
    color: '#0f172a'
  },
  statusChip: {
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '12px'
  },
  stageText: {
    fontSize: '14px',
    color: '#475569',
    lineHeight: '1.5',
    marginBottom: '16px'
  },
  uploadBox: {
    borderTop: '1px dashed #cbd5e1',
    paddingTop: '12px'
  },
  uploadFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  uploadNotice: {
    fontSize: '13px',
    color: '#d97706'
  },
  uploadLabelBtn: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  completedFlex: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  completedSuccessMsg: {
    fontSize: '13px',
    color: '#10b981',
    fontWeight: '600'
  },
  verificationImg: {
    width: '80px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '6px',
    border: '2px solid #10b981'
  }
};