import pandas as pd
import numpy as np
from agrolens_service import fetch_spectral_bands, predict_nutrients

# A dictionary of crops and their ideal ranges for soil/environment
# Values are typically: (min, max)
# Data source: General agricultural guidelines for major crops
CROP_REQUIREMENTS = {
    'rice': {
        'n': (60, 99), 'p': (35, 60), 'k': (35, 45),
        'temp': (20, 27), 'humidity': (80, 85), 'ph': (5.0, 7.0), 'rainfall': (150, 300)
    },
    'maize': {
        'n': (60, 100), 'p': (35, 60), 'k': (15, 25),
        'temp': (18, 27), 'humidity': (55, 70), 'ph': (5.5, 7.0), 'rainfall': (60, 110)
    },
    'wheat': {
        'n': (70, 100), 'p': (30, 50), 'k': (25, 45),
        'temp': (15, 25), 'humidity': (40, 60), 'ph': (6.0, 7.5), 'rainfall': (50, 100)
    },
    'cotton': {
        'n': (100, 140), 'p': (40, 60), 'k': (15, 25),
        'temp': (22, 35), 'humidity': (30, 60), 'ph': (5.8, 8.0), 'rainfall': (60, 100)
    },
    'coffee': {
        'n': (80, 120), 'p': (15, 30), 'k': (25, 40),
        'temp': (15, 25), 'humidity': (50, 65), 'ph': (6.0, 6.5), 'rainfall': (150, 250)
    },
    'grapes': {
        'n': (20, 45), 'p': (10, 30), 'k': (15, 30),
        'temp': (12, 40), 'humidity': (30, 70), 'ph': (5.5, 7.0), 'rainfall': (40, 100)
    },
    'orange': {
        'n': (10, 40), 'p': (5, 25), 'k': (5, 20),
        'temp': (10, 40), 'humidity': (70, 95), 'ph': (6.0, 7.5), 'rainfall': (80, 150)
    },
    'banana': {
        'n': (80, 120), 'p': (70, 95), 'k': (45, 55),
        'temp': (20, 35), 'humidity': (75, 85), 'ph': (5.5, 7.5), 'rainfall': (180, 250)
    },
    'tomato': {
        'n': (70, 100), 'p': (40, 60), 'k': (20, 30),
        'temp': (20, 25), 'humidity': (60, 70), 'ph': (6.0, 7.0), 'rainfall': (60, 100)
    },
    'potato': {
        'n': (80, 120), 'p': (40, 60), 'k': (15, 25),
        'temp': (15, 20), 'humidity': (70, 80), 'ph': (5.0, 6.5), 'rainfall': (50, 80)
    },
    'sugarcane': {
        'n': (150, 250), 'p': (50, 80), 'k': (40, 60),
        'temp': (20, 35), 'humidity': (50, 80), 'ph': (6.0, 7.5), 'rainfall': (150, 250)
    },
    'tea': {
        'n': (100, 150), 'p': (20, 40), 'k': (30, 50),
        'temp': (15, 30), 'humidity': (70, 90), 'ph': (4.5, 5.5), 'rainfall': (200, 300)
    },
    'pomegranate': {
        'n': (20, 50), 'p': (10, 25), 'k': (10, 25),
        'temp': (25, 35), 'humidity': (30, 50), 'ph': (6.5, 8.0), 'rainfall': (40, 80)
    }
}

def recommend_crop(n, p, k, temp, humidity, ph, rainfall):
    """
    Suggests the best crop based on NPK and environmental parameters.
    Returns a list of potential crops sorted by match score.
    """
    scores = []
    
    input_data = {
        'n': n, 'p': p, 'k': k,
        'temp': temp, 'humidity': humidity, 'ph': ph, 'rainfall': rainfall
    }
    
    for crop, reqs in CROP_REQUIREMENTS.items():
        score = 0
        total_params = len(input_data)
        
        for param, val in input_data.items():
            min_val, max_val = reqs[param]
            # Simple scoring: check if value is within optimal range
            if min_val <= val <= max_val:
                score += 1
            else:
                # Add partial credit for being close (within 20%)
                diff = min(abs(val - min_val), abs(val - max_val))
                range_width = max_val - min_val if max_val > min_val else 1
                if diff < range_width * 0.2:
                    score += 0.5
        
        final_score = (score / total_params) * 100
        scores.append({'crop': crop, 'score': final_score})
    
    # Sort by score descending
    sorted_recommendations = sorted(scores, key=lambda x: x['score'], reverse=True)
    return [rec for rec in sorted_recommendations if rec['score'] > 0]

def recommend_crop_from_satellite(coords, temperature, humidity, rainfall):
    """
    Fetches NPK and pH from satellite data using AgroLens and recommends a crop.
    coords: [min_lat, min_lon, max_lat, max_lon]
    """
    # 1. Fetch spectral data
    spectral_data = fetch_spectral_bands(coords)
    if spectral_data["status"] == "error":
        return spectral_data
    
    # 2. Predict NPK and pH using AgroLens logic
    soil_data = predict_nutrients(spectral_data["bands"])
    
    # 3. Get crop recommendations based on predicted soil data
    recommendations = recommend_crop(
        soil_data["n"], 
        soil_data["p"], 
        soil_data["k"], 
        temperature, 
        humidity, 
        soil_data["ph"], 
        rainfall
    )
    
    return {
        "status": "success",
        "soil_data": soil_data,
        "recommendations": recommendations
    }

if __name__ == "__main__":
    # Example Test
    test_result = recommend_crop(90, 42, 43, 20, 82, 6.5, 202)
    print("Recommended Crops:")
    for crop in test_result:
        print(f"- {crop['crop'].capitalize()}: {crop['score']:.1f}% match")
