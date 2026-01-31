import io
import os
import base64
import traceback
import json
import re
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from groq import Groq
from dotenv import load_dotenv

# Optional: suppress tensorflow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# Import TensorFlow
try:
    import tensorflow as tf
    from tensorflow.keras.layers import DepthwiseConv2D
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("⚠️ TensorFlow not installed. Using LLM-only mode.")

# Load environment variables from .env file
load_dotenv()

# --- FLASK APP SETUP ---
print("Starting Crop Disease Detection Server (Hybrid Local+LLM Mode)...")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Groq client
# You'll need to set your GROQ_API_KEY in environment variables
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("⚠️  WARNING: GROQ_API_KEY not found in environment variables!")
    print("Please set it using: set GROQ_API_KEY=your_api_key_here")

AI_READY = False
groq_client = None

# --- LOCAL MODEL SETUP ---
DISEASE_MODEL = None
MODEL_LOADED = False
# PlantVillage 38 Classes
CLASS_NAMES = [
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
    'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_', 'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy',
    'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot', 'Peach___healthy',
    'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy', 'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy',
    'Raspberry___healthy', 'Soybean___healthy', 'Squash___Powdery_mildew', 'Strawberry___Leaf_scorch', 'Strawberry___healthy',
    'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite', 'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus', 'Tomato___healthy'
]

# Patch for DepthwiseConv2D to handle version incompatibilities
class FixedDepthwiseConv2D(DepthwiseConv2D):
    def __init__(self, **kwargs):
        if 'groups' in kwargs:
            kwargs.pop('groups')
        super().__init__(**kwargs)

def initialize_ai_engine():
    """Initialize both the Local Model and Groq Vision API"""
    global groq_client, AI_READY, DISEASE_MODEL, MODEL_LOADED
    
    # 1. Load Local Model
    if TF_AVAILABLE:
        try:
            model_path = os.path.join(os.getcwd(), "network.h5")
            if os.path.exists(model_path):
                print(f"Loading local model from {model_path}...")
                DISEASE_MODEL = tf.keras.models.load_model(
                    model_path, 
                    custom_objects={'DepthwiseConv2D': FixedDepthwiseConv2D},
                    compile=False
                )
                MODEL_LOADED = True
                print("✅ LOCAL MODEL LOADED SUCCESSFUL")
            else:
                print("⚠️ network.h5 not found. Predicting with LLM only.")
        except Exception as e:
            print(f"❌ Error loading local model: {e}")
            traceback.print_exc()

    # 2. Initialize Groq
    try:
        if not GROQ_API_KEY:
            raise Exception("GROQ_API_KEY not set")
        
        print("Initializing Groq Llama Vision API...")
        groq_client = Groq(api_key=GROQ_API_KEY)
        
        AI_READY = True
        print("✅ AI ENGINE READY - Groq Llama Vision Initialized")
        
    except Exception as e:
        print(f"❌ AI ENGINE FAILURE: {e}")
        traceback.print_exc()
        AI_READY = False

# --- INITIALIZE ENGINE ON STARTUP ---
initialize_ai_engine()

def predict_disease_local(image_data):
    """Predict crop disease using local network.h5 model"""
    if not MODEL_LOADED or not TF_AVAILABLE:
        return None, 0
    
    try:
        # Preprocess image
        img = Image.open(io.BytesIO(image_data))
        img = img.convert('RGB')
        img = img.resize((224, 224))  # Standard input size for most MobileNet/VGG PV models
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        # Predict
        predictions = DISEASE_MODEL.predict(img_array, verbose=0)
        result_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][result_idx]) * 100
        
        predicted_class = CLASS_NAMES[result_idx]
        print(f"DEBUG: Local Prediction: {predicted_class} ({confidence:.2f}%)")
        
        return predicted_class, confidence
    except Exception as e:
        print(f"Local Prediction Error: {e}")
        return None, 0

def encode_image_to_base64(image_data):
    """Convert image bytes to base64 string"""
    return base64.b64encode(image_data).decode('utf-8')

def analyze_crop_disease(image_data):
    """Hybrid approach: Local classification + LLM analysis"""
    try:
        image_base64 = encode_image_to_base64(image_data)
        
        # 🟢 STEP 1: Local Model Prediction
        local_prediction, local_confidence = predict_disease_local(image_data)
        
        # 🟢 STEP 2: Groq LLM Analysis (using prediction as hint)
        prompt_hint = ""
        if local_prediction:
            prompt_hint = f"\n\nContext: My local classification model predicted this as '{local_prediction}' with {local_confidence:.1f}% confidence. Please verify this prediction from the image."

        prompt = f"""You are an expert agricultural pathologist.
{prompt_hint}

Analyze this crop leaf image carefully and provide a detailed diagnosis and a day-wise recovery plan.

IMPORTANT: Return ONLY a valid JSON object with this exact structure:
{{
    "disease": "Predicted Name",
    "crop": "Crop Type",
    "confidence": 85,
    "severity": "low",
    "symptoms": ["symptom 1", "symptom 2"],
    "treatment": "Recommended treatment",
    "affected_area": "10-20%",
    "additional_notes": "Tips and cautions for the farmer",
    "recovery_plan": [
        {{ "day": 1, "action": "Immediate action to take", "expectation": "What you will see today" }},
        {{ "day": 3, "action": "Step to take after 48 hours", "expectation": "Visible difference to note" }},
        {{ "day": 7, "action": "Final treatment or inspection", "expectation": "Condition when disease is cleared" }}
    ]
}}

Rules:
- severity must be one of: "none", "low", "medium", "high", "critical"
- confidence should be a blend of your vision analysis and the provided context.
- Be precise and scientific.
- In 'additional_notes', include specific 'Tips' and 'Cautions'.
- The 'recovery_plan' MUST have exactly 3 timeline points (e.g., Day 1, Day 3, Day 7)."""

        # Call Groq Vision API
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}}
                    ]
                }
            ],
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            temperature=0.2,
            max_tokens=1024
        )
        
        # Extract the response
        response_text = chat_completion.choices[0].message.content
        print(f"Raw API Response: {response_text[:500]}...")  # Debug log
        
        # Llama 4 Scout specific: Remove thinking tags if they exist
        import re
        if "<thinking>" in response_text and "</thinking>" in response_text:
            response_text = re.sub(r'<thinking>.*?</thinking>', '', response_text, flags=re.DOTALL).strip()
            print("✨ Stripped thinking tags")
        
        # Try to parse JSON from response
        import json
        
        # Method 1: Try direct JSON parse after stripping thinking
        try:
            result = json.loads(response_text)
            if 'disease' in result and 'crop' in result:
                print("✅ Direct JSON parse successful")
                
                # Ensure additional_notes is a string (prevents frontend crash if it's an object)
                if isinstance(result.get('additional_notes'), dict):
                    notes_obj = result['additional_notes']
                    flattened_notes = " ".join([f"{k}: {v}" for k, v in notes_obj.items()])
                    result['additional_notes'] = flattened_notes
                
                result.setdefault('symptoms', [])
                result.setdefault('additional_notes', '')
                result.setdefault('recovery_plan', [])
                return result
        except json.JSONDecodeError:
            pass

        
        # Method 2: Extract from markdown code blocks
        if "```json" in response_text:
            try:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
                result = json.loads(json_str)
                if 'disease' in result and 'crop' in result:
                    print("✅ Extracted from ```json block")
                    
                    if isinstance(result.get('additional_notes'), dict):
                        notes_obj = result['additional_notes']
                        result['additional_notes'] = " ".join([f"{k}: {v}" for k, v in notes_obj.items()])
                        
                    result.setdefault('symptoms', [])
                    result.setdefault('additional_notes', '')
                    result.setdefault('recovery_plan', [])
                    return result
            except (IndexError, json.JSONDecodeError):
                pass
        
        # Method 3: Extract from any code block
        if "```" in response_text:
            try:
                json_str = response_text.split("```")[1].split("```")[0].strip()
                result = json.loads(json_str)
                if 'disease' in result and 'crop' in result:
                    print("✅ Extracted from ``` block")
                    
                    if isinstance(result.get('additional_notes'), dict):
                        notes_obj = result['additional_notes']
                        result['additional_notes'] = " ".join([f"{k}: {v}" for k, v in notes_obj.items()])
                        
                    result.setdefault('symptoms', [])
                    result.setdefault('additional_notes', '')
                    result.setdefault('recovery_plan', [])
                    return result
            except (IndexError, json.JSONDecodeError):
                pass
        
        # Method 4: Use improved regex to find complete JSON object
        json_pattern = r'\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}'
        matches = re.findall(json_pattern, response_text, re.DOTALL)
        
        for match in matches:
            try:
                result = json.loads(match)
                if 'disease' in result and 'crop' in result:
                    print(f"✅ Extracted using regex (length: {len(match)})")
                    
                    if isinstance(result.get('additional_notes'), dict):
                        notes_obj = result['additional_notes']
                        result['additional_notes'] = " ".join([f"{k}: {v}" for k, v in notes_obj.items()])
                        
                    result.setdefault('symptoms', [])
                    result.setdefault('additional_notes', '')
                    result.setdefault('recovery_plan', [])
                    return result
            except json.JSONDecodeError:
                continue
        
        # Method 5: Try to find JSON between curly braces more aggressively
        brace_start = response_text.find('{')
        brace_end = response_text.rfind('}')
        
        if brace_start != -1 and brace_end != -1 and brace_end > brace_start:
            try:
                json_str = response_text[brace_start:brace_end + 1]
                result = json.loads(json_str)
                if 'disease' in result and 'crop' in result:
                    print("✅ Extracted using brace position")
                    
                    if isinstance(result.get('additional_notes'), dict):
                        notes_obj = result['additional_notes']
                        result['additional_notes'] = " ".join([f"{k}: {v}" for k, v in notes_obj.items()])
                        
                    result.setdefault('symptoms', [])
                    result.setdefault('additional_notes', '')
                    result.setdefault('recovery_plan', [])
                    return result
            except json.JSONDecodeError:
                pass
        
        # If all methods fail, return a user-friendly error
        print("⚠️  All JSON parsing methods failed")
        print(f"Response preview: {response_text[:500]}")
        
        return {
            "disease": "Unable to analyze",
            "crop": "Unknown",
            "confidence": 50,
            "severity": "unknown",
            "symptoms": ["Could not parse AI response"],
            "treatment": "The AI model returned an unexpected format. Please try again with a different image or check the backend logs.",
            "affected_area": "N/A",
            "additional_notes": "Unable to parse the AI response. This may be a temporary issue with the model.",
            "recovery_plan": []
        }
    
    except Exception as e:
        print(f"Vision Analysis Error: {e}")
        traceback.print_exc()
        raise e

@app.route("/diagnose", methods=["POST"])
def diagnose_crop():
    """Endpoint to diagnose crop disease from uploaded image"""
    if not AI_READY:
        return jsonify({
            "error": "AI Engine is not ready. Please check GROQ_API_KEY configuration."
        }), 503
    
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    try:
        # Read image data
        image_data = file.read()
        
        # Validate it's a valid image
        try:
            img = Image.open(io.BytesIO(image_data))
            img.verify()  # Verify it's actually an image
        except Exception:
            return jsonify({"error": "Invalid image file"}), 400
        
        # 🟢 CALL HYBRID ANALYSIS (Local Classification + LLM Verification)
        # Note: We pass raw binary data because analyze_crop_disease needs it 
        # for BOTH the local model and for Groq encoding.
        result = analyze_crop_disease(image_data)
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Diagnosis Error: {e}")
        traceback.print_exc()
        return jsonify({
            "error": str(e),
            "message": "Failed to analyze image"
        }), 500


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "online",
        "ai_ready": AI_READY,
        "local_model_ready": MODEL_LOADED,
        "hybrid_mode": MODEL_LOADED and AI_READY,
        "model": "Hybrid (Local network.h5 + Groq Llama Scout)",
        "api_configured": GROQ_API_KEY is not None
    }), 200

@app.route("/", methods=["GET"])
def home():
    """Home endpoint"""
    return jsonify({
        "service": "Crop Disease Detection API (Hybrid Edition)",
        "version": "1.1.0",
        "local_engine": "TensorFlow network.h5 (38 Classes)",
        "cloud_engine": "Groq Llama 4 Scout",
        "endpoints": {
            "/diagnose": "POST - Upload crop leaf image for hybrid analysis",
            "/health": "GET - Check API and Model health status",
            "/api/planner/recommend_satellite": "POST - Get AI-powered crop recommendations"
        }
    }), 200


@app.route("/api/planner/recommend_satellite", methods=["POST", "OPTIONS"])
def recommend_satellite():
    """Endpoint for satellite-based crop recommendations using Groq AI"""
    
    # Handle CORS preflight request
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    
    try:
        data = request.get_json()
        
        # Extract data from request
        coords = data.get('coords', [11.0168, 76.9558, 11.0268, 76.9658])
        soil_type = data.get('soil_type', 'Red Loam')
        temperature = data.get('temperature', 28)
        humidity = data.get('humidity', 65)
        rainfall = data.get('rainfall', 120)
        
        # Use Groq AI to generate intelligent recommendations
        prompt = f"""You are an agricultural expert system. Based on the following field data, recommend the top 3 best crops to plant.

Field Data:
- Location GPS: {coords}
- Soil Type: {soil_type}
- Avg Temperature: {temperature}°C
- Avg Humidity: {humidity}%
- Est Rainfall: {rainfall}mm/month

Return ONLY a JSON object with this structure:
{{
    "status": "success",
    "soil_data": {{
        "ph": 6.8,
        "n": 120,
        "p": 45,
        "k": 35,
        "type": "{soil_type}"
    }},
    "recommendations": [
        {{
            "crop": "Crop Name",
            "suitability": 95,
            "reason": "Explain why this crop is ideal for this location and {soil_type} soil."
        }}
    ]
}}"""

        chat_completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            temperature=0.3,
            max_tokens=800
        )
        
        response_text = chat_completion.choices[0].message.content
        
        # Clean response if it contains thinking tags or markdown
        if "<thinking>" in response_text:
            response_text = re.sub(r'<thinking>.*?</thinking>', '', response_text, flags=re.DOTALL).strip()
        
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        # Parse JSON
        result = json.loads(response_text)
        
        # Add location metadata back
        result['location'] = {
            "coords": coords,
            "temperature": temperature,
            "humidity": humidity,
            "rainfall": rainfall
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Recommendation Error: {e}")
        traceback.print_exc()
        return jsonify({
            "error": str(e),
            "message": "Failed to generate crop recommendations"
        }), 500



if __name__ == "__main__":
    print("\n" + "="*60)
    print("🌿 CROP DISEASE DETECTION API")
    print("="*60)
    print(f"AI Ready: {AI_READY}")
    print(f"Model: Groq Llama Vision")
    print(f"API Configured: {GROQ_API_KEY is not None}")
    print("="*60 + "\n")
    
    app.run(host="0.0.0.0", port=8000, debug=True)