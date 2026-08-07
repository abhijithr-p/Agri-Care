import React, { useState } from 'react';
import axios from 'axios';

export default function DiseaseDetection() {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      analyzeImage(file);
    }
  };

  const analyzeImage = async (fileToAnalyze) => {
    const file = fileToAnalyze || selectedFile;
    if (!file) return;

    setLoading(true);
    setErrorMsg('');
    setResult(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('http://localhost:8000/api/disease-detection', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
    } catch (err) {
      console.error('Inference error:', err);
      setErrorMsg(
        err.response?.data?.detail || "We couldn't connect to the AI expert. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setErrorMsg('');
  };

  return (
    <div style={styles.centralView}>
      <div style={styles.iconBadge}>🧪</div>
      <h2 style={styles.mainQuestion}>Plant Disease Expert</h2>
      <p style={styles.mainDesc}>Upload a photo of the affected plant to get a diagnosis and solution.</p>

      {!previewUrl ? (
        <div style={styles.dropZoneContainer}>
          <div style={styles.cloudIcon}>☁️</div>
          <h4 style={styles.dropZoneTitle}>Upload or Take a Photo</h4>
          <div style={styles.uploadBtnRow}>
            <label style={styles.uploadOutlineBtn}>
              📁 Upload
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
            <label style={styles.takePhotoBtn}>
              📷 Take Photo
              <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          </div>
          <p style={styles.supportText}>Supports JPG, PNG, JFIF</p>
        </div>
      ) : (
        <div style={styles.splitGrid}>
          {/* LEFT: Uploaded Image Card */}
          <div style={styles.imageCard}>
            <img src={previewUrl} alt="Plant scan" style={styles.cardImage} />
            <div style={styles.overlayBar}>
              <button style={styles.darkOverlayBtn} onClick={handleReset}>🖼️ Change Photo</button>
              <label style={styles.greenOverlayBtn}>
                📷 Retake
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          {/* RIGHT: Dynamic Result Card */}
          <div style={styles.resultContainerCard}>
            {loading && (
              <div style={styles.statusState}>
                <div style={styles.spinner}></div>
                <h3 style={styles.statusHeading}>Analyzing Plant...</h3>
                <p style={styles.statusSubtext}>Running ONNX model inference.</p>
              </div>
            )}

            {!loading && errorMsg && (
              <div style={styles.statusState}>
                <div style={styles.errorIconBadge}>!</div>
                <h3 style={styles.statusHeading}>Analysis Failed</h3>
                <p style={styles.statusSubtext}>{errorMsg}</p>
                <button style={styles.retryBtn} onClick={() => analyzeImage()}>Retry Scan</button>
              </div>
            )}

            {!loading && result && (
              <div style={styles.resultDetails}>
                <div style={styles.resultHeader}>
                  <h3 style={styles.diseaseTitle}>🦠 {result.diseaseName}</h3>
                  <span style={styles.confidenceBadge}>Confidence: {result.confidence}</span>
                </div>
                <hr style={styles.resultDivider} />
                <div style={styles.sectionBlock}>
                  <h4 style={styles.sectionHeading}>📋 Symptoms</h4>
                  <p style={styles.symptomText}>{result.symptoms}</p>
                </div>
                <div style={styles.sectionBlock}>
                  <h4 style={styles.sectionHeading}>💊 Treatment</h4>
                  <ul style={styles.treatmentList}>
                    {result.treatment.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <button style={styles.backToOptionsBtn} onClick={handleReset}>← Back to Options</button>
    </div>
  );
}

const styles = {
  centralView: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  iconBadge: { fontSize: '28px', width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' },
  mainQuestion: { fontSize: '26px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px 0' },
  mainDesc: { fontSize: '14px', color: '#64748b', marginBottom: '32px' },
  dropZoneContainer: { width: '100%', maxWidth: '520px', backgroundColor: '#ffffff', border: '2px dashed #cbd5e1', borderRadius: '16px', padding: '36px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  cloudIcon: { fontSize: '36px', marginBottom: '12px' },
  dropZoneTitle: { fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 20px 0' },
  uploadBtnRow: { display: 'flex', gap: '12px', marginBottom: '16px' },
  uploadOutlineBtn: { backgroundColor: '#ffffff', color: '#475569', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: '1px solid #cbd5e1' },
  takePhotoBtn: { backgroundColor: '#22c55e', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  supportText: { fontSize: '12px', color: '#94a3b8', margin: 0 },
  splitGrid: { display: 'flex', gap: '24px', justifyContent: 'center', maxWidth: '720px', width: '100%', marginBottom: '24px' },
  imageCard: { flex: '1', maxWidth: '320px', height: '320px', borderRadius: '20px', overflow: 'hidden', position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
  cardImage: { width: '100%', height: '100%', objectFit: 'cover' },
  overlayBar: { position: 'absolute', bottom: '12px', left: '12px', right: '12px', display: 'flex', justifyContent: 'center', gap: '8px' },
  darkOverlayBtn: { backgroundColor: 'rgba(30, 41, 59, 0.85)', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  greenOverlayBtn: { backgroundColor: '#22c55e', color: '#ffffff', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  resultContainerCard: { flex: '1', maxWidth: '320px', minHeight: '320px', backgroundColor: '#ffffff', border: '2px dashed #cbd5e1', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  statusState: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  errorIconBadge: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#94a3b8', color: '#ffffff', fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' },
  statusHeading: { fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' },
  statusSubtext: { fontSize: '12px', color: '#64748b', lineHeight: '1.4', margin: '0 0 20px 0' },
  retryBtn: { backgroundColor: '#f1f5f9', color: '#1e293b', border: 'none', borderRadius: '12px', padding: '12px 28px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
  spinner: { width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTop: '3px solid #22c55e', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' },
  resultDetails: { textAlign: 'left', width: '100%' },
  resultHeader: { display: 'flex', flexDirection: 'column', gap: '4px' },
  diseaseTitle: { fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 },
  confidenceBadge: { display: 'inline-block', backgroundColor: '#d1fae5', color: '#065f46', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', width: 'fit-content' },
  resultDivider: { border: 'none', borderTop: '1px solid #f1f5f9', margin: '12px 0' },
  sectionBlock: { marginBottom: '12px' },
  sectionHeading: { fontSize: '12px', fontWeight: '700', color: '#334155', margin: '0 0 4px 0' },
  symptomText: { fontSize: '12px', color: '#475569', margin: 0 },
  treatmentList: { margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#475569' },
  backToOptionsBtn: { backgroundColor: 'transparent', border: 'none', color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginTop: '12px' }
};