import React, { useState, useEffect } from 'react';

// Initial default auctions if local storage is empty
const INITIAL_AUCTIONS = [
  {
    id: 1,
    sellerName: 'Farmer Ramesh',
    cropName: 'Premium Basmati Rice',
    quantity: '500 kg',
    startingBid: 45000,
    currentBid: 52000,
    bidCount: 7,
    timeLeft: '04h 25m',
    qualityGrade: 'Grade A+',
    qualityScan: {
      moisture: '12%',
      purity: '98.5%',
      defectRate: '0.8%'
    },
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600',
    status: 'Active'
  },
  {
    id: 2,
    sellerName: 'Suresh Kumar',
    cropName: 'Organic Durum Wheat',
    quantity: '1,200 kg',
    startingBid: 30000,
    currentBid: 34500,
    bidCount: 4,
    timeLeft: '12h 10m',
    qualityGrade: 'Grade A',
    qualityScan: {
      moisture: '10.5%',
      purity: '97.0%',
      defectRate: '1.2%'
    },
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600',
    status: 'Active'
  }
];

export default function AuctionHouse({ onClose, user }) {
  // 1. Load initial auctions from localStorage (or fallback to INITIAL_AUCTIONS)
  const [auctions, setAuctions] = useState(() => {
    const savedAuctions = localStorage.getItem('agricare_auctions');
    return savedAuctions ? JSON.parse(savedAuctions) : INITIAL_AUCTIONS;
  });

  // Modal and Form States
  const [showPostModal, setShowPostModal] = useState(false);
  const [biddingAuctionId, setBiddingAuctionId] = useState(null);
  const [bidAmountInput, setBidAmountInput] = useState('');

  // New Post Form Data
  const [newPost, setNewPost] = useState({
    cropName: '',
    quantity: '',
    startingBid: '',
    durationHours: '24',
    qualityGrade: 'Grade A',
    moisture: '12%',
    purity: '98%',
    defectRate: '1%',
    imagePreview: null
  });

  // 2. Persist auctions state to localStorage whenever `auctions` updates
  useEffect(() => {
    localStorage.setItem('agricare_auctions', JSON.stringify(auctions));
  }, [auctions]);

  // Handle Image Selection and Convert to Base64 for persistent localStorage saving
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPost({
          ...newPost,
          imagePreview: reader.result // Base64 string survives page refreshes
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit New Auction Listing (Saves persistently)
  const handleCreateAuction = (e) => {
    e.preventDefault();

    if (!newPost.cropName || !newPost.startingBid || !newPost.quantity) {
      alert('Please complete all required fields.');
      return;
    }

    const createdAuction = {
      id: Date.now(),
      sellerName: user?.name || 'Authorized Farmer',
      cropName: newPost.cropName,
      quantity: newPost.quantity,
      startingBid: parseFloat(newPost.startingBid),
      currentBid: parseFloat(newPost.startingBid),
      bidCount: 0,
      timeLeft: `${newPost.durationHours}h 00m`,
      qualityGrade: newPost.qualityGrade,
      qualityScan: {
        moisture: newPost.moisture,
        purity: newPost.purity,
        defectRate: newPost.defectRate
      },
      image: newPost.imagePreview || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=600',
      status: 'Active'
    };

    // Update state (which triggers localStorage effect automatically)
    setAuctions([createdAuction, ...auctions]);
    setShowPostModal(false);

    // Reset Form
    setNewPost({
      cropName: '',
      quantity: '',
      startingBid: '',
      durationHours: '24',
      qualityGrade: 'Grade A',
      moisture: '12%',
      purity: '98%',
      defectRate: '1%',
      imagePreview: null
    });
  };

  // Handle Placing a Bid (Updates bid persistently)
  const handlePlaceBid = (auctionId) => {
    const targetAuction = auctions.find((a) => a.id === auctionId);
    const amount = parseFloat(bidAmountInput);

    if (isNaN(amount) || amount <= targetAuction.currentBid) {
      alert(`Bid amount must be higher than current bid of ₹${targetAuction.currentBid.toLocaleString()}`);
      return;
    }

    const updatedAuctions = auctions.map((item) => {
      if (item.id === auctionId) {
        return {
          ...item,
          currentBid: amount,
          bidCount: item.bidCount + 1
        };
      }
      return item;
    });

    setAuctions(updatedAuctions);
    setBiddingAuctionId(null);
    setBidAmountInput('');
    alert('Bid placed and saved successfully!');
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      
      {/* HEADER NAVBAR */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#f39c12', color: '#fff', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
            <i className="fa-solid fa-gavel"></i>
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Digital Auction House</h1>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Verified Crop Marketplace with Persistent Storage</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setShowPostModal(true)} 
            style={{ backgroundColor: '#2ecc71', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <i className="fa-solid fa-plus"></i> Post Product for Auction
          </button>
          
          <button 
            onClick={onClose} 
            style={{ backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <i className="fa-solid fa-arrow-left"></i> Dashboard
          </button>
        </div>
      </header>

      {/* AUCTION FEED CONTAINER */}
      <main style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* Banner */}
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '1.4rem' }}>Live Bidding Arena</h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Posts and bids are saved automatically and preserved across sessions.</p>
          </div>
          <div style={{ display: 'flex', gap: '16px', textAlign: 'center' }}>
            <div style={{ background: '#f8fafc', padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 'bold', color: '#2ecc71' }}>{auctions.length}</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Active Saved Posts</span>
            </div>
          </div>
        </div>

        {/* AUCTION POSTS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {auctions.map((item) => (
            <div key={item.id} style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              
              {/* Product Image & Quality Badge */}
              <div style={{ position: 'relative', height: '200px', backgroundColor: '#e2e8f0' }}>
                <img src={item.image} alt={item.cropName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                
                <span style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#2ecc71', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <i className="fa-solid fa-award"></i> {item.qualityGrade}
                </span>

                <span style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(15, 23, 42, 0.75)', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  <i className="fa-regular fa-clock"></i> {item.timeLeft}
                </span>
              </div>

              {/* Card Body */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>{item.cropName}</h3>
                    <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}>
                      {item.quantity}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px 0' }}>
                    Listed by: <strong style={{ color: '#334155' }}>{item.sellerName}</strong>
                  </p>

                  {/* SCANNED YIELD QUALITY DETAILS */}
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#2ecc71', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                      <i className="fa-solid fa-microscope"></i> Scanned Yield Quality
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '0.8rem', textAlign: 'center' }}>
                      <div>
                        <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Moisture</div>
                        <strong style={{ color: '#1e293b' }}>{item.qualityScan.moisture}</strong>
                      </div>
                      <div>
                        <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Purity</div>
                        <strong style={{ color: '#1e293b' }}>{item.qualityScan.purity}</strong>
                      </div>
                      <div>
                        <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Defect Rate</div>
                        <strong style={{ color: '#1e293b' }}>{item.qualityScan.defectRate}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Bidding Summary */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid #f1f5f9' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Starting Price</span>
                      <span style={{ fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>₹{item.startingBid.toLocaleString()}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Current Highest Bid ({item.bidCount} bids)</span>
                      <span style={{ fontWeight: '800', color: '#e67e22', fontSize: '1.2rem' }}>₹{item.currentBid.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Bidding Controls */}
                <div style={{ marginTop: '16px' }}>
                  {biddingAuctionId === item.id ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="number" 
                        placeholder={`> ₹${item.currentBid}`}
                        value={bidAmountInput}
                        onChange={(e) => setBidAmountInput(e.target.value)}
                        style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                      />
                      <button 
                        onClick={() => handlePlaceBid(item.id)}
                        style={{ backgroundColor: '#2ecc71', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => setBiddingAuctionId(null)}
                        style={{ backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setBiddingAuctionId(item.id); setBidAmountInput(item.currentBid + 1000); }}
                      style={{ width: '100%', backgroundColor: '#f39c12', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                    >
                      <i className="fa-solid fa-gavel"></i> Place Bid
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      </main>

      {/* CREATE AUCTION MODAL */}
      {showPostModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '90%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>Post Crop for Auction</h2>
              <i className="fa-solid fa-xmark" onClick={() => setShowPostModal(false)} style={{ cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}></i>
            </div>

            <form onSubmit={handleCreateAuction} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '0.85rem' }}>Crop Name / Type *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Organic Wheat, Basmati Rice" 
                  value={newPost.cropName} 
                  onChange={(e) => setNewPost({ ...newPost, cropName: e.target.value })} 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '0.85rem' }}>Quantity *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 500 kg, 2 Tons" 
                    value={newPost.quantity} 
                    onChange={(e) => setNewPost({ ...newPost, quantity: e.target.value })} 
                    required 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '0.85rem' }}>Desired Min Bid (₹) *</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 25000" 
                    value={newPost.startingBid} 
                    onChange={(e) => setNewPost({ ...newPost, startingBid: e.target.value })} 
                    required 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* ATTACH SCANNED YIELD METRICS */}
              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#2ecc71', display: 'block', marginBottom: '10px' }}>
                  <i className="fa-solid fa-square-check"></i> Scanned Yield Quality Metrics
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Grade</label>
                    <select 
                      value={newPost.qualityGrade} 
                      onChange={(e) => setNewPost({ ...newPost, qualityGrade: e.target.value })}
                      style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="Grade A+">Grade A+</option>
                      <option value="Grade A">Grade A</option>
                      <option value="Grade B">Grade B</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Moisture</label>
                    <input 
                      type="text" 
                      value={newPost.moisture} 
                      onChange={(e) => setNewPost({ ...newPost, moisture: e.target.value })}
                      style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Purity</label>
                    <input 
                      type="text" 
                      value={newPost.purity} 
                      onChange={(e) => setNewPost({ ...newPost, purity: e.target.value })}
                      style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '0.85rem' }}>Upload Product / Harvest Image</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <button 
                type="submit" 
                style={{ backgroundColor: '#2ecc71', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px', cursor: 'pointer' }}
              >
                Save & Publish Auction Post
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}