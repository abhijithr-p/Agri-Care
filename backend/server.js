if (!globalThis.crypto) {
  globalThis.crypto = require('crypto');
}
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenAI } = require('@google/genai');
const multer = require('multer'); // Required for image uploads
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// ---------------- 1. MIDDLEWARE & CORS CONFIGURATION ---------------- //

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        origin.includes('localhost') ||
        origin.endsWith('.onrender.com')
      ) {
        callback(null, true);
      } else {
        callback(new Error('CORS Policy: Access denied for this origin.'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GEMINI_KEY
});

// ---------------- 2. MONGODB ATLAS CONNECTION ---------------- //

const MONGO_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://abhijithrpillai12345_db_user:AgriCare2026@cluster0.vfh4vg1.mongodb.net/agricare?retryWrites=true&w=majority&appName=Cluster0';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ Successfully connected to MongoDB Atlas!'))
  .catch((err) => {
    console.error('❌ MongoDB Atlas connection error:', err.message);
  });

// ---------------- 3. SCHEMAS & MODELS ---------------- //

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  location: { type: String, default: '' },
  crop: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }
});

const Otp = mongoose.model('Otp', otpSchema);

// ---------------- 4. HELPER FUNCTIONS ---------------- //

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateGeminiResponse(message, systemInstruction) {
  const candidateModels = [
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
  ];

  let lastError = null;
  for (const modelName of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: message,
        config: { systemInstruction, temperature: 0.7 },
      });
      if (response && response.text) return response.text;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

// ---------------- 5. API ROUTES ---------------- //

app.get('/', (req, res) => res.send('AgriCare Backend API running...'));

// --- New Disease Detection Route ---
app.post('/api/disease-detection', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded.' });

    const imageBase64 = req.file.buffer.toString('base64');
    const prompt = "Analyze this plant leaf image. Identify the disease, explain symptoms, and provide treatment recommendations.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{
        inlineData: { mimeType: req.file.mimetype, data: imageBase64 }
      }, { text: prompt }]
    });

    return res.json({ success: true, diagnosis: response.text });
  } catch (err) {
    console.error("AI Error:", err);
    return res.status(500).json({ success: false, message: 'AI Analysis failed.' });
  }
});

// Auth & Existing Routes (Simplified for brevity)
app.post('/api/auth/send-otp', async (req, res) => { /* ... your existing code ... */ });
app.post('/api/auth/verify-otp', async (req, res) => { /* ... your existing code ... */ });
app.post('/api/auth/register', async (req, res) => { /* ... your existing code ... */ });
app.post('/api/precare/ai-chat', async (req, res) => { /* ... your existing code ... */ });
app.post('/api/precare/validate-crop', (req, res) => { /* ... your existing code ... */ });

// ---------------- 6. SERVER INITIALIZATION ---------------- //

const PORT = process.env.PORT || 7860;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));