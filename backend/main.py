import os
import io
import traceback
import uvicorn
import torch
import torch.nn.functional as F
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List

# --- SATELLITE & PLANNER IMPORTS ---
try:
    from npk import recommend_crop, recommend_crop_from_satellite
    from satellite_service import get_ndvi_for_area
    PLANNER_ACTIVE = True
except ImportError as e:
    print(f"⚠️ Planner modules warning: {e}")
    PLANNER_ACTIVE = False

# Load Environment Variables
load_dotenv()

# Prevent WinError 127/DLL Crashes by trusting KMP
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

# Initialize FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- GLOBAL AI VARIABLES ---
MODEL_ID = "wambugu71/crop_leaf_diseases_vit" 
processor = None
model = None
AI_READY = False
ENGINE_DEVICE = "cpu"

# --- EXPERT SYSTEM: TREATMENT LOGIC ---
def get_treatment(disease_name):
    d = disease_name.lower().replace("_", " ")
    if "healthy" in d:
        return "Plant is healthy. Maintain regular watering and monitoring."
    
    if "blight" in d:
        return "Apply copper-based fungicides (e.g., Mancozeb). Remove infected leaves immediately to prevent spread."
    if "rust" in d:
        return "Apply sulfur-based fungicides. Improve air circulation by pruning excess foliage."
    if "powdery mildew" in d:
        return "Apply neem oil or potassium bicarbonate. Avoid overhead watering."
    if "leaf spot" in d:
        return "Use chlorothalonil or copper sprays. Remove debris from around the plant base."
    if "mite" in d:
        return "Spray with miticide or neem oil. Increase humidity around the plant."
    if "virus" in d:
        return "No cure for viruses. Remove and destroy the infected plant to protect others. Control aphids."
    
    return "Consult a local agronomist for specific treatment. Ensure proper drainage and soil nutrition."

def initialize_ai_engine():
    global model, processor, ENGINE_DEVICE, AI_READY
    
    print("="*40)
    print("      🌱 AGROLENS AI ENGINE INITALIZATION      ")
    print("="*40)
    
    try:
        ENGINE_DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Selected Device: {ENGINE_DEVICE.upper()}")

        print(f"Downloading/Loading Real AI Model: {MODEL_ID}...")
        # Load Vision Transformer (Tiny & Fast)
        processor = AutoImageProcessor.from_pretrained(MODEL_ID)
        model = AutoModelForImageClassification.from_pretrained(MODEL_ID)
        model.to(ENGINE_DEVICE)
        
        AI_READY = True
        print(f"✅ REAL AI MODEL LOADED: {MODEL_ID}")
        print("Ready for live diagnosis.")

    except Exception as e:
        print(f"❌ AI ENGINE FAILURE: {e}")
        traceback.print_exc()

# Initialize on startup
initialize_ai_engine()

@app.get("/")
def home():
    return {"message": "AgroLens AI Backend Online (Real Mode)"}

@app.get("/health")
async def health_check_ep():
    return {
        "status": "online", 
        "ai_ready": AI_READY,
        "model": MODEL_ID,
        "device": ENGINE_DEVICE,
        "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "None"
    }

@app.post("/diagnose")
async def diagnose_crop(file: UploadFile = File(...)):
    if not AI_READY:
        raise HTTPException(status_code=503, detail="AI Engine is initializing or failed.")

    try:
        # 1. Read Image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        # 2. Preprocess
        inputs = processor(images=image, return_tensors="pt").to(ENGINE_DEVICE)
        
        # 3. Predict
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            
        # 4. Decode
        predicted_class_idx = logits.argmax(-1).item()
        disease_label = model.config.id2label[predicted_class_idx]
        confidence = float(F.softmax(logits, dim=1).max().item() * 100)
        
        # 5. Get Treatment
        treatment_advice = get_treatment(disease_label)

        print(f"🔍 DIAGNOSIS: {disease_label} ({confidence:.1f}%)")

        return {
            "disease": disease_label.replace("_", " "),
            "treatment": treatment_advice,
            "confidence": round(confidence, 1),
            "severity": "High" if confidence > 85 and "healthy" not in disease_label.lower() else "Low"
        }

    except Exception as e:
        print(f"Diagnosis Error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

class NPKSatelliteInput(BaseModel):
    coords: List[float]
    temperature: float
    humidity: float
    rainfall: float

@app.post("/api/planner/recommend_satellite")
async def get_satellite_recommendation(data: NPKSatelliteInput):
    if not PLANNER_ACTIVE:
         raise HTTPException(status_code=500, detail="Planner modules not loaded.")
    try:
        # Just pass through to service
        result = recommend_crop_from_satellite(data.coords, data.temperature, data.humidity, data.rainfall)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)