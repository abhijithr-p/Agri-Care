const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function checkAvailableModels() {
  try {
    console.log('Fetching available models for your API Key...\n');
    const response = await ai.models.list();
    
    // Check if the response contains model data
    for await (const model of response) {
      console.log(`- Model ID: ${model.name}`);
    }
  } catch (error) {
    console.error('Failed to list models:', error.message);
  }
}

checkAvailableModels();