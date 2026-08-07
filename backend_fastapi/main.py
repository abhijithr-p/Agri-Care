import os
import io
import numpy as np
import onnxruntime as ort
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Union, List, Dict, Any

app = FastAPI(title="AgriCare - Rice Disease Detection & PreCare API")

# Enable CORS for React frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------
# 1. Model Setup & Configuration
# ------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "ai_models", "rice_disease_model.onnx")

disease_session = None
disease_input_name = None

CLASS_NAMES = [
    'Bacterial Blight', 'Bacterial Streak', 'Bakanae', 'Brown Spot', 
    'False Smut', 'Grassy Stunt Virus', 'Healthy', 'Hispa', 
    'Leaf Blast', 'Leaf Scald', 'Leaf Smut', 'Narrow Brown Spot', 
    'Neck Blast', 'Ragged Stunt Virus', 'Sheath Blight', 'Sheath Rot', 
    'Stem Rot', 'Tungro'
]

MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)

# Information dictionary matching all 18 class categories
DISEASE_DETAILS: Dict[str, Dict[str, Any]] = {
    "Bacterial Blight": {
        "symptoms": "Water-soaked lesions on leaf margins turning yellow to white with wavy margins.",
        "treatment": [
            "Use resistant rice varieties.",
            "Avoid excessive nitrogen fertilizer application.",
            "Maintain proper water levels and ensure field drainage."
        ]
    },
    "Bacterial Streak": {
        "symptoms": "Translucent, narrow streaks between leaf veins that turn brown as they age.",
        "treatment": [
            "Apply balanced fertilizers with adequate potassium.",
            "Use disease-free certified seeds.",
            "Remove and destroy infected crop residues."
        ]
    },
    "Bakanae": {
        "symptoms": "Abnormally tall, slender, and pale green to yellowish tillers.",
        "treatment": [
            "Perform seed treatment with recommended fungicides before sowing.",
            "Rogue out and destroy infected seedlings in nursery beds."
        ]
    },
    "Brown Spot": {
        "symptoms": "Oval or circular brown spots with yellow halos scattered on leaf blades.",
        "treatment": [
            "Apply balanced crop nutrition, especially Potassium and Silicon.",
            "Spray recommended fungicides like Mancozeb or Edifenphos."
        ]
    },
    "False Smut": {
        "symptoms": "Individual rice grains turn into velvety orange or yellow spore balls.",
        "treatment": [
            "Spray Copper Oxychloride or Propiconazole at early flowering stage.",
            "Avoid high nitrogen doses during reproductive stage."
        ]
    },
    "Grassy Stunt Virus": {
        "symptoms": "Severe stunting, excessive tillering, and erect yellowish leaves.",
        "treatment": [
            "Control planthopper vector population using systemic insecticides.",
            "Remove infected hills promptly."
        ]
    },
    "Healthy": {
        "symptoms": "Vigorous green foliage with no visible lesions or disease discoloration.",
        "treatment": [
            "Continue optimal water and nutrient management practices."
        ]
    },
    "Hispa": {
        "symptoms": "White streak parallel patches on leaves caused by beetle feeding.",
        "treatment": [
            "Clip leaf tips containing eggs prior to transplanting.",
            "Apply targeted insecticides if infestation exceeds economic threshold."
        ]
    },
    "Leaf Blast": {
        "symptoms": "Spindle-shaped lesions with gray/white centers and dark brown margins.",
        "treatment": [
            "Apply Tricyclazole 75 WP or Isoprothiolane at early symptom onset.",
            "Avoid excessive nitrogen applications."
        ]
    },
    "Leaf Scald": {
        "symptoms": "Large, zonate lesions beginning at leaf tips or margins with alternating dark brown zones.",
        "treatment": [
            "Use disease-free seeds and avoid field overcrowding.",
            "Apply foliar fungicides like Benomyl or Carbendazim if severe."
        ]
    },
    "Leaf Smut": {
        "symptoms": "Small, raised, black linear spots scattered on leaf surfaces.",
        "treatment": [
            "Practice crop rotation.",
            "Apply recommended copper-based foliar sprays."
        ]
    },
    "Narrow Brown Spot": {
        "symptoms": "Short, narrow, reddish-brown linear spots parallel to leaf veins.",
        "treatment": [
            "Apply balanced potassium fertilizers.",
            "Apply Propiconazole at heading stage if disease intensity is high."
        ]
    },
    "Neck Blast": {
        "symptoms": "Brown to black lesions at the neck node of the panicle causing empty grains.",
        "treatment": [
            "Apply preventative Tricyclazole sprays at boot and late heading stages.",
            "Avoid high late-season nitrogen applications."
        ]
    },
    "Ragged Stunt Virus": {
        "symptoms": "Stunted growth, ragged leaves with serrated edges, and twisted tillers.",
        "treatment": [
            "Control brown planthopper vectors with approved insecticides.",
            "Practice synchronous planting across neighboring fields."
        ]
    },
    "Sheath Blight": {
        "symptoms": "Oval greenish-gray lesions on leaf sheaths near water line expanding upwards.",
        "treatment": [
            "Apply Hexaconazole or Validamycin sprays at disease onset.",
            "Maintain wider plant spacing for better ventilation."
        ]
    },
    "Sheath Rot": {
        "symptoms": "Irregular greyish-brown lesions on upper leaf sheaths enclosing panicles.",
        "treatment": [
            "Apply Carbendazim or Mancozeb sprays at boot stage.",
            "Control insect vectors like stem borers."
        ]
    },
    "Stem Rot": {
        "symptoms": "Dark blackish lesions on outer leaf sheaths near water level leading to tiller lodging.",
        "treatment": [
            "Drain field water intermittently to dry soil.",
            "Avoid excessive nitrogen and boost potassium application."
        ]
    },
    "Tungro": {
        "symptoms": "Stunted growth, yellow-orange leaf discoloration, and delayed flowering.",
        "treatment": [
            "Control green leafhopper vectors using appropriate insecticides.",
            "Plant resistant rice varieties."
        ]
    }
}


@app.on_event("startup")
async def load_model():
    """Loads ONNX inference model into memory when server starts."""
    global disease_session, disease_input_name
    if os.path.exists(MODEL_PATH):
        disease_session = ort.InferenceSession(MODEL_PATH)
        disease_input_name = disease_session.get_inputs()[0].name
        print(f"Loaded ONNX Model successfully from {MODEL_PATH}")
    else:
        print(f"Warning: Model file not found at {MODEL_PATH}")


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Resizes and normalizes uploaded image to (1, 3, 224, 224)."""
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize((224, 224))
    img_data = np.array(img, dtype=np.float32) / 255.0
    img_data = (img_data - MEAN) / STD
    img_data = np.transpose(img_data, (2, 0, 1))
    return np.expand_dims(img_data, axis=0)


# ------------------------------------------------------------------
# 2. Pydantic Models (Schemas)
# ------------------------------------------------------------------
class PreCareProfile(BaseModel):
    fullName: Union[str, None] = None
    phoneNumber: Union[str, None] = None
    landArea: Union[str, float, int, None] = None
    cropType: Union[str, None] = "rice"
    terrainType: Union[str, None] = None


# ------------------------------------------------------------------
# 3. API Routes
# ------------------------------------------------------------------
@app.get("/")
async def root():
    """Health-check endpoint."""
    return {"message": "AgriCare Backend API is up and running"}


@app.post("/api/disease-detection")
async def detect_disease(image: UploadFile = File(...)):
    """Receives an image and returns disease name, confidence score, symptoms, and treatments."""
    if not disease_session:
        raise HTTPException(status_code=500, detail="Disease model is not loaded on server.")
    
    try:
        contents = await image.read()
        input_tensor = preprocess_image(contents)
        
        # Run ONNX inference
        outputs = disease_session.run(None, {disease_input_name: input_tensor})[0][0]
        
        # Calculate softmax probabilities
        exp_logits = np.exp(outputs - np.max(outputs))
        probs = exp_logits / np.sum(exp_logits)
        
        top_idx = int(np.argmax(probs))
        confidence = round(float(probs[top_idx] * 100), 1)
        disease_name = CLASS_NAMES[top_idx] if top_idx < len(CLASS_NAMES) else "Unknown"
        
        # Fetch disease symptoms and remedies
        details = DISEASE_DETAILS.get(disease_name, {
            "symptoms": "Information not available for this condition.",
            "treatment": ["Consult an agricultural specialist."]
        })

        return {
            "diseaseName": disease_name,
            "confidence": f"{confidence}%",
            "symptoms": details["symptoms"],
            "treatment": details["treatment"],
            "filename": image.filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/api/precare/profile")
async def save_precare_profile(profile: PreCareProfile):
    """Receives and saves PreCare profile data sent from the frontend."""
    return {
        "status": "success",
        "message": "PreCare profile received successfully",
        "data": profile
    }