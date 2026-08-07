import React, { useState } from 'react';
import { getCropRecommendations } from './utils/cropRecommendationEngine';

export default function CropRecommendation({ onClose, user }) {
  const [inputs, setInputs] = useState({
    topography: 'plain',
    soilType: 'loamy',
    waterAvailability: 'moderate',
    season: 'kharif'
  });

  const [recommendations, setRecommendations] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleInputChange = (field, value) => {
    setInputs({ ...inputs, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const results = getCropRecommendations(inputs);
    setRecommendations(results);
    setHasSearched(true);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b' }}>🌾 Smart Crop Recommendation Engine</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Select your farm features to get tailored crop suggestions.</p>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}>
            Back to Dashboard
          </button>
        )}
      </div>

      {/* Inputs Form */}
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          
          {/* Topography Selection */}
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Land Topography</label>
            <select 
              value={inputs.topography} 
              onChange={(e) => handleInputChange('topography', e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            >
              <option value="plain">Plain Flat Land</option>
              <option value="terrace">Terrace Farming (Sloped Steps)</option>
              <option value="hilly">Hilly / Mountainous Region</option>
            </select>
          </div>

          {/* Soil Type Selection */}
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Soil Type</label>
            <select 
              value={inputs.soilType} 
              onChange={(e) => handleInputChange('soilType', e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            >
              <option value="loamy">Loamy Soil</option>
              <option value="clay">Clay Soil</option>
              <option value="black">Black Cotton Soil</option>
              <option value="red">Red Soil</option>
              <option value="sandy">Sandy Soil</option>
              <option value="alluvial">Alluvial Soil</option>
            </select>
          </div>

          {/* Water Availability */}
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Water / Rainfall Availability</label>
            <select 
              value={inputs.waterAvailability} 
              onChange={(e) => handleInputChange('waterAvailability', e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            >
              <option value="high">High (Heavy Rain / Abundant Canal Water)</option>
              <option value="moderate">Moderate (Regular Rainfall / Tube-wells)</option>
              <option value="low">Low (Drought-prone / Rainfed only)</option>
            </select>
          </div>

          {/* Season Selection */}
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Target Season</label>
            <select 
              value={inputs.season} 
              onChange={(e) => handleInputChange('season', e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            >
              <option value="kharif">Kharif (Monsoon / Summer)</option>
              <option value="rabi">Rabi (Winter)</option>
              <option value="zaid">Zaid (Spring / Late Summer)</option>
            </select>
          </div>

        </div>

        <button type="submit" style={{ backgroundColor: '#2ecc71', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: '100%', fontSize: '1rem' }}>
          Analyze Land & Get Recommendations
        </button>
      </form>

      {/* Results Display */}
      {hasSearched && (
        <div>
          <h3 style={{ marginBottom: '16px', color: '#0f172a' }}>Recommended Crops for Your Land</h3>
          
          {recommendations.length === 0 ? (
            <p style={{ color: '#64748b' }}>No direct matches found for this specific combination. Try adjusting water or season options.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {recommendations.map((crop, idx) => (
                <div key={idx} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>{crop.name}</h4>
                    <span style={{ backgroundColor: crop.matchPercentage > 80 ? '#eafaf1' : '#fef9c3', color: crop.matchPercentage > 80 ? '#27ae60' : '#854d0e', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {crop.matchPercentage}% Match
                    </span>
                  </div>

                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '12px' }}>{crop.description}</p>

                  <div style={{ fontSize: '0.8rem', borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>🌡️ Temp: {crop.idealTemp}</span>
                    <span>⏳ Duration: {crop.duration}</span>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}