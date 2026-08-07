if (!globalThis.crypto) {
  globalThis.crypto = require('crypto');
}
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();

// ---------------- 1. MIDDLEWARE & CORS CONFIGURATION ---------------- //

// Allow requests from local frontend and Render live static site domains
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

// Initialize Google Gen AI client with API Key from process.env
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

// ---------------- 4. HELPER FUNCTIONS & CROP DATA ---------------- //

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateGeminiResponse(message, systemInstruction) {
  const candidateModels = [
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash-lite-001',
    'gemini-2.0-flash',
    'gemini-2.0-flash-001'
  ];

  let lastError = null;

  for (const modelName of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: message,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          },
        });

        if (response && response.text) {
          console.log(`[SUCCESS] AI Response generated using model: ${modelName}`);
          return response.text;
        }
      } catch (err) {
        lastError = err;
        const status = err.status || err.code;

        if (status === 429) {
          console.warn(`[RATE LIMIT 429] Model ${modelName} hit quota limit. Waiting 3 seconds...`);
          await delay(3000);
        } else {
          console.warn(`[FALLBACK NOTICE] Model ${modelName} failed (${status || err.message}). Trying next...`);
          break;
        }
      }
    }
  }

  throw lastError || new Error('All model attempts failed.');
}

// Agronomic Plans with dual step structures for maximum UI safety
const CROP_PLANS = {
  rice: {
    crop: 'Rice (Paddy)',
    soilSuitability: 'Clayey / Clay Loam (pH: 5.5 - 7.0, High water retention)',
    waterRequirement: 'High (1200 - 1400 mm; Standing water 2-5 cm during tillering)',
    harvestDuration: '110 - 140 Days',
    seedRequirement: '15 - 20 kg/acre (Inbred) | 6 - 8 kg/acre (Hybrid)',
    npkFertilizer: '48 : 24 : 24 kg/acre (N : P2O5 : K2O)',
    steps: [
      'Stage 1 (Land Prep & Nursery): Puddle land 2-3 times in standing water. Prepare wet nursery bed. Treat seeds with Pseudomonas fluorescens @ 10g/kg.',
      'Stage 2 (Transplanting - Day 20-25): Transplant 20-25 day old seedlings at 20x15 cm spacing. Apply 100% P, K and 25% N as basal dose.',
      'Stage 3 (Tillering - Day 25-50): Top-dress 50% N dose at active tillering. Maintain 2-5 cm water level. Monitor for Stem Borer.',
      'Stage 4 (Panicle Initiation - Day 50-85): Apply remaining 25% N top-dressing. Keep soil flooded.',
      'Stage 5 (Harvesting - Day 85-130): Drain water completely 10-15 days prior to harvest when 80% grains turn golden yellow.'
    ],
    detailedSteps: [
      { stage: 'Stage 1: Land Preparation & Nursery', action: 'Puddle land 2-3 times in standing water. Prepare wet nursery bed (1/10th acre per acre main field). Treat seeds with Pseudomonas fluorescens @ 10g/kg.' },
      { stage: 'Stage 2: Transplanting (Day 20-25)', action: 'Transplant 20-25 day old seedlings at 20x15 cm spacing. Apply 100% Phosphorus, Potash, and 25% Nitrogen as basal fertilizer during final puddling.' },
      { stage: 'Stage 3: Vegetative Phase & Tillering (Day 25-50)', action: 'Top-dress 50% Nitrogen dose at active tillering. Maintain 2-5 cm water level. Monitor for Stem Borer and Leaf Folder.' },
      { stage: 'Stage 4: Reproductive & Panicle Initiation (Day 50-85)', action: 'Apply remaining 25% Nitrogen top-dressing at Panicle Initiation. Ensure continuous water availability to avoid yield penalty.' },
      { stage: 'Stage 5: Maturation & Harvest (Day 85-130)', action: 'Drain water completely 10-15 days prior to harvest when 80% grains turn golden yellow. Harvest at 20-22% grain moisture.' }
    ]
  },
  wheat: {
    crop: 'Wheat',
    soilSuitability: 'Well-drained Loam / Clay Loam (pH: 6.0 - 7.5)',
    waterRequirement: 'Moderate (400 - 500 mm across 5-6 critical stages)',
    harvestDuration: '120 - 145 Days',
    seedRequirement: '40 - 45 kg/acre',
    npkFertilizer: '48 : 24 : 16 kg/acre (N : P2O5 : K2O)',
    steps: [
      'Stage 1 (Field Prep & Sowing): Plough field to fine tilth. Sow seeds in lines 20-22.5 cm apart using seed drill. Apply 100% P, K and 50% N at sowing time.',
      'Stage 2 (Crown Root Initiation - CRI): Apply 1st Irrigation at CRI stage (Most Critical!). Top-dress remaining 50% Nitrogen right after irrigation.',
      'Stage 3 (Tillering & Jointing): 2nd irrigation at Tillering (40-45 DAS) and 3rd at Jointing (60-65 DAS). Spray Propiconazole if Yellow/Brown rust appears.',
      'Stage 4 (Flowering & Milk Stage): Provide 4th & 5th irrigations at Flowering and Milk development stages to maximize grain weight.',
      'Stage 5 (Harvesting): Harvest when leaves and stalks turn yellow-straw color and grains become hard.'
    ],
    detailedSteps: [
      { stage: 'Stage 1: Field Prep & Sowing', action: 'Plough field to fine tilth. Sow seeds in lines 20-22.5 cm apart using seed drill. Apply 100% P, K and 50% N at sowing time.' },
      { stage: 'Stage 2: Crown Root Initiation - CRI (Day 20-25)', action: 'Apply 1st Irrigation at CRI stage (Most Critical!). Top-dress remaining 50% Nitrogen right after irrigation.' },
      { stage: 'Stage 3: Tillering & Jointing (Day 40-65)', action: '2nd irrigation at Tillering (40-45 DAS) and 3rd at Jointing (60-65 DAS). Spray Propiconazole if Yellow/Brown rust symptoms appear.' },
      { stage: 'Stage 4: Flowering & Milk Stage (Day 80-105)', action: 'Provide 4th & 5th irrigations at Flowering and Milk development stages to maximize grain weight.' },
      { stage: 'Stage 5: Harvesting (Day 120-145)', action: 'Harvest when leaves and stalks turn yellow-straw color and grains become hard (moisture < 12%).' }
    ]
  },
  sugarcane: {
    crop: 'Sugarcane',
    soilSuitability: 'Deep, well-drained fertile Loams (pH: 6.5 - 7.5)',
    waterRequirement: 'Very High (1500 - 2500 mm across cycle)',
    harvestDuration: '10 - 14 Months',
    seedRequirement: '35,000 - 40,000 2-budded setts/acre',
    npkFertilizer: '110 : 32 : 48 kg/acre (N : P2O5 : K2O)',
    steps: [
      'Stage 1 (Planting & Germination): Make furrows 90-120 cm apart. Treat setts with Carbendazim. Apply full P + 25% N & K in furrows before laying setts.',
      'Stage 2 (Formative Phase & Tillering): Irrigate at 7-10 day intervals. Top-dress 25% Nitrogen + 25% Potash at 30 and 60 days. Monitor for Early Shoot Borer.',
      'Stage 3 (Grand Growth & Earthing Up): Apply final split of Nitrogen and Potash at 90-120 days. Perform partial/full earthing up to prevent crop lodging.',
      'Stage 4 (Maturation Phase): Withhold nitrogen fertilization. Reduce irrigation frequency to promote sucrose accumulation in stalks.',
      'Stage 5 (Harvesting): Harvest stalk close to ground level when brix hydrometer reading reaches 18-20%.'
    ],
    detailedSteps: [
      { stage: 'Stage 1: Planting & Germination (Month 0-2)', action: 'Make furrows 90-120 cm apart. Treat setts with Carbendazim. Apply full P + 25% N & K in furrows before laying setts.' },
      { stage: 'Stage 2: Formative Phase & Tillering (Month 2-4)', action: 'Irrigate at 7-10 day intervals. Top-dress 25% Nitrogen + 25% Potash at 30 and 60 days. Monitor for Early Shoot Borer.' },
      { stage: 'Stage 3: Grand Growth & Earthing Up (Month 5-8)', action: 'Apply final split of Nitrogen and Potash at 90-120 days. Perform partial/full earthing up to prevent crop lodging.' },
      { stage: 'Stage 4: Maturation Phase (Month 9-12)', action: 'Withhold nitrogen fertilization. Reduce irrigation frequency to promote sucrose accumulation in stalks.' },
      { stage: 'Stage 5: Harvest', action: 'Harvest stalk close to ground level when brix hydrometer reading reaches 18-20%.' }
    ]
  },
  corn: {
    crop: 'Corn (Maize)',
    soilSuitability: 'Deep Loam / Silt Loam with good drainage (pH: 5.8 - 7.2)',
    waterRequirement: 'Moderate (500 - 700 mm; highly sensitive to waterlogging)',
    harvestDuration: '90 - 110 Days',
    seedRequirement: '8 - 10 kg/acre (Hybrid seeds)',
    npkFertilizer: '48 : 24 : 24 kg/acre + 10 kg/acre Zinc Sulfate',
    steps: [
      'Stage 1 (Land Prep & Sowing): Create ridges and furrows at 60 cm spacing. Dibble seeds on side of ridges at 20 cm distance. Apply basal P, K, Zn + 25% N.',
      'Stage 2 (Knee-High Stage): Irrigate field. Top-dress 50% Nitrogen dose. Apply whorl spray of Emamectin Benzoate if Fall Armyworm damage is noticed.',
      'Stage 3 (Tasseling & Silking Stage): Provide critical irrigation during Tasseling (45 DAS) and Silking (60 DAS). Top-dress final 25% Nitrogen.',
      'Stage 4 (Grain Filling Stage): Maintain soil moisture to prevent poor grain filling and cob development.',
      'Stage 5 (Harvesting): Harvest when cob husk turns dry yellow and black layer forms at the base of the kernel.'
    ],
    detailedSteps: [
      { stage: 'Stage 1: Land Prep & Sowing', action: 'Create ridges and furrows at 60 cm spacing. Dibble seeds on side of ridges at 20 cm distance. Apply basal P, K, Zn + 25% N.' },
      { stage: 'Stage 2: Knee-High Stage (Day 25-30)', action: 'Irrigate field. Top-dress 50% Nitrogen dose. Apply whorl spray of Emamectin Benzoate if Fall Armyworm damage is noticed.' },
      { stage: 'Stage 3: Tasseling & Silking Stage (Day 45-65)', action: 'Provide critical irrigation during Tasseling (45 DAS) and Silking (60 DAS). Top-dress final 25% Nitrogen.' },
      { stage: 'Stage 4: Grain Filling Stage (Day 75-85)', action: 'Maintain soil moisture to prevent poor grain filling and cob development.' },
      { stage: 'Stage 5: Harvesting (Day 90-110)', action: 'Harvest when cob husk turns dry yellow and black layer forms at the base of the kernel.' }
    ]
  }
};

// ---------------- 5. API ROUTES ---------------- //

app.get('/', (req, res) => res.send('AgriCare Backend API running...'));

// Auth Routes
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length < 10) {
      return res.status(400).json({ success: false, message: 'Invalid phone number.' });
    }

    const existingUser = await User.findOne({ phone });
    if (!existingUser) {
      return res.status(404).json({ success: false, isRegistered: false, message: 'Phone not registered.' });
    }

    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    await Otp.deleteMany({ phone });
    await Otp.create({ phone, otp: generatedOtp });

    console.log(`[OTP] Phone: ${phone} | OTP: ${generatedOtp}`);
    return res.json({ success: true, isRegistered: true, devOtp: generatedOtp });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'OTP send error.' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const record = await Otp.findOne({ phone, otp });
    if (!record) return res.status(400).json({ success: false, message: 'Invalid OTP.' });

    await Otp.deleteMany({ phone });
    const user = await User.findOne({ phone });
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Verification error.' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, phone, location, crop } = req.body;
    const existing = await User.findOne({ phone });
    if (existing) return res.status(400).json({ success: false, message: 'User exists.' });

    const newUser = await User.create({ name, phone, location, crop });
    return res.json({ success: true, user: newUser });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Registration error.' });
  }
});

// AI Chat Route
app.post('/api/precare/ai-chat', async (req, res) => {
  try {
    const { message, userContext } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message required.' });

    const systemInstruction = `You are AgriCare AI, an expert agricultural assistant. Name: ${userContext?.name || 'Farmer'}, Location: ${userContext?.location || 'Unknown'}, Crop: ${userContext?.crop || 'General'}.`;
    const reply = await generateGeminiResponse(message, systemInstruction);

    return res.json({ success: true, response: reply, reply });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'AI Chat error.' });
  }
});

// Crop Plan Generator Route
app.post('/api/precare/validate-crop', (req, res) => {
  try {
    const { crop } = req.body;
    if (!crop) return res.status(400).json({ success: false, message: 'Crop required.' });

    const normalized = crop.toLowerCase().trim();
    let cropKey = null;

    if (normalized.includes('rice') || normalized.includes('paddy')) cropKey = 'rice';
    else if (normalized.includes('wheat')) cropKey = 'wheat';
    else if (normalized.includes('sugarcane') || normalized.includes('cane')) cropKey = 'sugarcane';
    else if (normalized.includes('corn') || normalized.includes('maize')) cropKey = 'corn';

    if (cropKey && CROP_PLANS[cropKey]) {
      return res.json({
        success: true,
        supported: true,
        plan: CROP_PLANS[cropKey]
      });
    }

    return res.json({
      success: true,
      supported: false,
      message: `Plan for "${crop}" is coming soon. Supported: Rice, Wheat, Sugarcane, Corn.`,
      plan: {
        crop: crop,
        soilSuitability: 'Standard soil with good organic matter (pH: 6.0 - 7.0)',
        waterRequirement: 'Moderate irrigation as required',
        harvestDuration: '90 - 120 Days',
        seedRequirement: 'Standard recommended seed density',
        npkFertilizer: 'Soil testing recommended',
        steps: [
          'Stage 1 (Prep): Deep ploughing and soil solarization.',
          'Stage 2 (Sowing): Treat seeds and sow at appropriate depth.',
          'Stage 3 (Care): Regular weed management and irrigation.',
          'Stage 4 (Harvest): Harvest at full maturity.'
        ]
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Crop plan server error.' });
  }
});

// ---------------- 6. SERVER INITIALIZATION ---------------- //

const PORT = process.env.PORT || 7860;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});