import React, { useState } from 'react';

export default function PostHarvest({ onClose, user }) {
  const [selectedCrop, setSelectedCrop] = useState('Rice');
  const [chatInput, setChatInput] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);

  // Default values for Recommendation Cards
  const recommendations = [
    {
      id: 'harvesting',
      title: 'Harvesting Guide',
      icon: 'fa-leaf',
      color: '#2ecc71',
      text: 'Checking...'
    },
    {
      id: 'cleaning',
      title: 'Cleaning & Sorting',
      icon: 'fa-robot',
      color: '#00cec9',
      text: 'Checking...'
    },
    {
      id: 'drying',
      title: 'Drying & Curing',
      icon: 'fa-sun',
      color: '#e67e22',
      text: 'Moisture: undefined'
    },
    {
      id: 'storage',
      title: 'Storage Specs',
      icon: 'fa-warehouse',
      color: '#6c5ce7',
      text: 'undefined, undefined'
    },
    {
      id: 'packaging',
      title: 'Packaging Guide',
      icon: 'fa-box-archive',
      color: '#e84393',
      text: 'Checking...'
    },
    {
      id: 'transport',
      title: 'Transport Guide',
      icon: 'fa-truck-fast',
      color: '#2d3436',
      text: 'Checking...'
    },
    {
      id: 'shelflife',
      title: 'Shelf Life',
      icon: 'fa-rotate-left',
      color: '#10ac84',
      text: 'undefined days'
    },
    {
      id: 'market',
      title: 'Market Decision',
      icon: 'fa-gavel',
      color: '#a29bfe',
      text: 'Checking...'
    }
  ];

  // Image Upload Handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
    }
  };

  // Text-to-speech handler for "Listen" buttons
  const handleSpeech = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      
      {/* LEFT SIDEBAR */}
      <aside style={{ width: '280px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '24px' }}>
            <i className="fa-solid fa-seedling" style={{ color: '#2ecc71' }}></i>
            <span style={{ color: '#2ecc71' }}>Agri</span>Care 
            <span style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#64748b', fontWeight: '500' }}>Post-Harvest</span>
          </div>

          {/* Active Crop Tag */}
          <div style={{ backgroundColor: '#f1f5f9', padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontWeight: '600', marginBottom: '20px' }}>
            <i className="fa-solid fa-seedling" style={{ color: '#2ecc71' }}></i>
            {selectedCrop}
          </div>

          {/* Expert AI Widget Card */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px' }}>
            <div style={{ backgroundColor: '#2ecc71', color: '#fff', minWidth: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-robot"></i>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#334155', margin: 0, lineHeight: '1.4', fontWeight: '500' }}>
              Welcome to Post-Harvest Expert AI. I'll help you minimize losses & maximize profit.
            </p>
          </div>
        </div>

        {/* Sidebar Footer Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Chat / Mic Input Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button style={{ border: '1px solid #cbd5e1', background: '#f8fafc', width: '38px', height: '38px', borderRadius: '8px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-microphone"></i>
            </button>
            <input 
              type="text" 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)} 
              placeholder="" 
              style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', height: '38px', boxSizing: 'border-box' }}
            />
            <button style={{ backgroundColor: '#2ecc71', border: 'none', width: '38px', height: '38px', borderRadius: '8px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>

          {/* Action Buttons */}
          <button style={{ backgroundColor: '#e67e22', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            Proceed to Auction Hall <i className="fa-solid fa-right-long"></i>
          </button>

          <button onClick={onClose} style={{ backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        
        {/* Main Title Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
            Post-Harvest Analysis Dashboard
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
            Comprehensive pipeline for your {selectedCrop} post-harvest.
          </p>
        </div>

        {/* SECTION 1: VISION ANALYSIS */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <i className="fa-solid fa-camera" style={{ color: '#3b82f6' }}></i> Vision Analysis
            </h2>

            <label style={{ backgroundColor: '#2ecc71', color: '#fff', padding: '10px 18px', borderRadius: '20px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-cloud-arrow-up"></i> Upload Harvest Image
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Vision Drag & Drop / Preview Box */}
          <div style={{ border: '2px dashed #cbd5e1', borderRadius: '16px', backgroundColor: '#ffffff', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#94a3b8' }}>
            {uploadedImage ? (
              <img src={uploadedImage} alt="Harvest Preview" style={{ maxHeight: '180px', borderRadius: '8px', objectFit: 'contain' }} />
            ) : (
              <>
                <i className="fa-solid fa-image" style={{ fontSize: '2.5rem', color: '#cbd5e1' }}></i>
                <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>Upload Harvest Image</span>
              </>
            )}
          </div>
        </section>

        {/* SECTION 2: CROP RECOMMENDATIONS */}
        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <i className="fa-solid fa-book-open" style={{ color: '#2ecc71' }}></i> Crop Recommendations
          </h2>

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {recommendations.map((card) => (
              <div key={card.id} style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: card.color, fontWeight: '700', fontSize: '0.95rem', marginBottom: '10px' }}>
                    <i className={`fa-solid ${card.icon}`}></i>
                    <span>{card.title}</span>
                  </div>
                  <div style={{ color: '#1e293b', fontWeight: '600', fontSize: '1rem', marginBottom: '16px' }}>
                    {card.text}
                  </div>
                </div>

                <button 
                  onClick={() => handleSpeech(`${card.title}: ${card.text}`)}
                  style={{ background: 'none', border: 'none', padding: 0, color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}
                >
                  <i className="fa-solid fa-volume-high"></i> Listen
                </button>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}