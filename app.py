import io
import os
import base64
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- FLASK APP SETUP ---
print("Starting Crop Disease Detection Server (Groq Llama Vision Edition)...")

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

def initialize_ai_engine():
    """Initialize the Groq Vision API client"""
    global groq_client, AI_READY
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

def encode_image_to_base64(image_data):
    """Convert image bytes to base64 string"""
    return base64.b64encode(image_data).decode('utf-8')

def analyze_crop_disease(image_base64):
    """Use Groq Llama Vision to analyze crop leaf image for disease"""
    try:
        # Create the vision prompt
        prompt = """You are an expert agricultural pathologist specializing in crop disease identification.

Analyze this crop leaf image carefully and provide a detailed diagnosis. IMPORTANT: Return ONLY a valid JSON object with this exact structure:

{
    "disease": "Name of the disease or 'Healthy' if no disease detected",
    "crop": "Type of crop identified",
    "confidence": 85,
    "severity": "low",
    "symptoms": ["symptom 1", "symptom 2"],
    "treatment": "Recommended treatment and prevention measures",
    "affected_area": "10-20%",
    "additional_notes": "Any additional observations"
}

Rules:
- Return ONLY the JSON object, no additional text
- confidence must be a number between 0-100
- severity must be one of: "none", "low", "medium", "high", "critical"
- symptoms must be an array of strings
- Be precise and scientific in your analysis"""

        # Call Groq Vision API
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ],
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            temperature=0.2,  # Lower temperature for more consistent output
            max_tokens=1024
        )
        
        # Extract the response
        response_text = chat_completion.choices[0].message.content
        print(f"Raw API Response: {response_text[:300]}...")  # Debug log
        
        # Try to parse JSON from response
        import json
        import re
        
        # Method 1: Try direct JSON parse
        try:
            result = json.loads(response_text)
            if 'disease' in result and 'crop' in result:
                print("✅ Direct JSON parse successful")
                # Ensure all required fields exist
                result.setdefault('symptoms', [])
                result.setdefault('additional_notes', '')
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
                    result.setdefault('symptoms', [])
                    result.setdefault('additional_notes', '')
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
                    result.setdefault('symptoms', [])
                    result.setdefault('additional_notes', '')
                    return result
            except (IndexError, json.JSONDecodeError):
                pass
        
        # Method 4: Use improved regex to find complete JSON object
        # This pattern handles nested objects and arrays better
        json_pattern = r'\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}'
        matches = re.findall(json_pattern, response_text, re.DOTALL)
        
        for match in matches:
            try:
                result = json.loads(match)
                # Validate it has required fields
                if 'disease' in result and 'crop' in result:
                    print(f"✅ Extracted using regex (length: {len(match)})")
                    result.setdefault('symptoms', [])
                    result.setdefault('additional_notes', '')
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
                    result.setdefault('symptoms', [])
                    result.setdefault('additional_notes', '')
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
            "additional_notes": "Unable to parse the AI response. This may be a temporary issue with the model."
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
        
        # Convert to base64
        image_base64 = encode_image_to_base64(image_data)
        
        # Analyze with Groq Vision
        result = analyze_crop_disease(image_base64)
        
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
        "model": "meta-llama/llama-4-scout-17b-16e-instruct",
        "api_configured": GROQ_API_KEY is not None
    }), 200

@app.route("/", methods=["GET"])
def home():
    """Home endpoint"""
    return jsonify({
        "service": "Crop Disease Detection API",
        "version": "1.0.0",
        "model": "Groq Llama Vision",
        "endpoints": {
            "/diagnose": "POST - Upload crop leaf image for disease analysis",
            "/health": "GET - Check API health status"
        }
    }), 200

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🌿 CROP DISEASE DETECTION API")
    print("="*60)
    print(f"AI Ready: {AI_READY}")
    print(f"Model: Groq Llama Vision")
    print(f"API Configured: {GROQ_API_KEY is not None}")
    print("="*60 + "\n")
    
    app.run(host="0.0.0.0", port=8000, debug=True)
    