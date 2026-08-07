import os
import io
import numpy as np
import onnxruntime as ort
from PIL import Image

# Path to ONNX model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "rice_disease_model.onnx")

# Initialize ONNX Runtime Session
session = ort.InferenceSession(MODEL_PATH)

# Get input name and dimensions
input_name = session.get_inputs()[0].name

# Define your model's target classes (Update these to match your actual model classes)
CLASS_NAMES = [
    "Bacterial Blight",
    "Brown Spot",
    "Leaf Blast",
    "Healthy Rice"
]

# Database for disease details and treatment recommendations
DISEASE_INFO = {
    "Bacterial Blight": {
        "symptoms": "Water-soaked to yellowish stripes on leaf blades, wilting, and drying of leaves.",
        "treatment": [
            "Use resistant varieties.",
            "Avoid excessive nitrogen fertilization.",
            "Apply copper-based fungicides if recommended locally."
        ]
    },
    "Brown Spot": {
        "symptoms": "Oval or circular brown spots with yellow halos across the leaf surface.",
        "treatment": [
            "Apply balanced fertilizer containing Potassium.",
            "Treat seeds with fungicides before planting.",
            "Apply Mancozeb or Edifenphos sprays."
        ]
    },
    "Leaf Blast": {
        "symptoms": "Spindle-shaped lesions with gray/white centers and reddish-brown margins.",
        "treatment": [
            "Apply Tricyclazole 75 WP or Isoprothiolane.",
            "Avoid high nitrogen usage.",
            "Maintain proper field water levels."
        ]
    },
    "Healthy Rice": {
        "symptoms": "No visible lesions, spots, or discoloration.",
        "treatment": [
            "Continue regular monitoring and optimal fertilization."
        ]
    }
}

def preprocess_image(image_bytes: bytes, target_size=(224, 224)):
    """Preprocesses input image bytes to match ONNX model requirements."""
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize(target_size)
    
    # Convert to NumPy array
    img_array = np.array(image, dtype=np.float32)
    
    # Normalize pixel values to [0, 1] (or standardize if required by your training)
    img_array /= 255.0
    
    # Standardize with ImageNet mean/std (adjust if your model used different normalization)
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    img_array = (img_array - mean) / std

    # Reorder dimensions from (H, W, C) to (C, H, W) and add Batch dimension -> (1, C, H, W)
    img_array = np.transpose(img_array, (2, 0, 1))
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

def predict_rice_disease(image_bytes: bytes):
    """Runs inference on the ONNX model and returns diagnosis results."""
    processed_input = preprocess_image(image_bytes)
    
    # Run Inference
    outputs = session.run(None, {input_name: processed_input})
    logits = outputs[0][0]
    
    # Apply Softmax to calculate confidence scores
    exp_logits = np.exp(logits - np.max(logits))
    probabilities = exp_logits / np.sum(exp_logits)
    
    # Get top prediction
    predicted_class_idx = int(np.argmax(probabilities))
    confidence = float(probabilities[predicted_class_idx])
    
    disease_name = CLASS_NAMES[predicted_class_idx]
    info = DISEASE_INFO.get(disease_name, {
        "symptoms": "N/A",
        "treatment": ["Consult an agricultural expert for specific treatment."]
    })

    return {
        "diseaseName": disease_name,
        "confidence": f"{confidence * 100:.1f}%",
        "symptoms": info["symptoms"],
        "treatment": info["treatment"]
    }