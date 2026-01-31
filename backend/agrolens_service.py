import os
import datetime
import numpy as np
import torch
from sentinelhub import (
    SHConfig,
    SentinelHubRequest,
    MimeType,
    bbox_to_dimensions,
    BBox,
    CRS,
    DataCollection,
)
from dotenv import load_dotenv

load_dotenv()

# Sentinel Hub Configuration
config = SHConfig()
config.sh_client_id = os.getenv("SH_CLIENT_ID")
config.sh_client_secret = os.getenv("SH_CLIENT_SECRET")

# Evalscript to fetch all 12 Sentinel-2 bands required by AgroLens
# BANDS: B01, B02, B03, B04, B05, B06, B07, B08, B8A, B09, B11, B12
EVALSCRIPT_ALL_BANDS = """
//VERSION=3
function setup() {
  return {
    input: ["B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B8A", "B09", "B11", "B12", "dataMask"],
    output: { bands: 12 }
  };
}

function evaluatePixel(samples) {
  return [
    samples.B01, samples.B02, samples.B03, samples.B04, 
    samples.B05, samples.B06, samples.B07, samples.B08, 
    samples.B8A, samples.B09, samples.B11, samples.B12
  ];
}
"""

def fetch_spectral_bands(coords):
    """
    Fetches the 12 spectral bands for a given coordinate.
    coords: [min_lat, min_lon, max_lat, max_lon]
    """
    if not config.sh_client_id or not config.sh_client_secret:
        print("⚠️ Sentinel Hub credentials missing. Using SMART SIMULATED spectral data...")
        
        # PRO MOCK: Generate deterministic variations based on location
        # This ensures "My Location" gives different results than "Vijay's Farm"
        # but stays consistent if you scan the same spot twice.
        
        lat_seed = int(abs(coords[0]) * 10000)
        lon_seed = int(abs(coords[1]) * 10000)
        np.random.seed(lat_seed + lon_seed)
        
        # Base healthy spectral signature (Vegetation)
        base_bands = np.array([0.12, 0.15, 0.14, 0.11, 0.25, 0.45, 0.55, 0.60, 0.62, 0.10, 0.22, 0.15])
        
        # Add random noise based on location (±20% variation)
        noise = np.random.uniform(0.8, 1.2, 12)
        simulated_bands = (base_bands * noise).tolist()

        return {
            "status": "success",
            "bands": simulated_bands,
            "band_names": ["B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B8A", "B09", "B11", "B12"],
            "is_mock": True,
            "mock_reason": "No API Keys found. Simulating local soil profile."
        }
    
    print(f"✅ EXECUTING REAL SATELLITE FETCH: {coords}")

    bbox = BBox(bbox=coords, crs=CRS.WGS84)
    # 10m resolution for the center area
    dimensions = bbox_to_dimensions(bbox, resolution=10)

    now = datetime.datetime.now()
    month_ago = now - datetime.timedelta(days=30)
    time_interval = (month_ago.strftime("%Y-%m-%d"), now.strftime("%Y-%m-%d"))

    request = SentinelHubRequest(
        evalscript=EVALSCRIPT_ALL_BANDS,
        input_data=[
            SentinelHubRequest.input_data(
                data_collection=DataCollection.SENTINEL2_L1C,
                time_interval=time_interval,
            )
        ],
        responses=[
            SentinelHubRequest.output_response("default", MimeType.TIFF),
        ],
        bbox=bbox,
        size=dimensions,
        config=config,
    )

    try:
        data = request.get_data()
        if data:
            # Get the mean value of each band across the area
            bands_data = data[0]
            mean_spectral_values = np.nanmean(bands_data, axis=(0, 1))
            return {
                "status": "success",
                "bands": mean_spectral_values.tolist(), # List of 12 values
                "band_names": ["B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B8A", "B09", "B11", "B12"]
            }
        else:
            return {"status": "error", "message": "No data found for this area"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def predict_nutrients(spectral_values):
    """
    Placeholder inference function until model weights are available.
    In a real scenario, this would load weights and call XGBoost/NN.
    """
    import numpy as np # Local import for robustness
    
    # TODO: Load pre-trained AgroLens weights here
    # For now, we'll return an estimation based on research-standard indices
    
    # B04=Red, B08=NIR
    # NDVI = (NIR - Red) / (NIR + Red)
    b04 = spectral_values[3]
    b08 = spectral_values[7]
    ndvi = (b08 - b04) / (b08 + b04) if (b08 + b04) > 0 else 0
    
    # Very rough regression-based estimations for demonstration
    # (Based on general soil spectral research indices)
    n_ppm = max(0, ndvi * 150 + (spectral_values[10] * 50)) # Nitrogen estimate
    p_ppm = max(0, (spectral_values[11] * 20) + (spectral_values[5] * 10)) # Phosphorus
    k_ppm = max(0, (spectral_values[7] * 40) - (spectral_values[3] * 10)) # Potassium
    ph = 6.5 + (spectral_values[1] - spectral_values[3]) * 5 # pH estimation
    ph = max(4.0, min(8.5, ph))

    return {
        "n": round(n_ppm, 2),
        "p": round(p_ppm, 2),
        "k": round(k_ppm, 2),
        "ph": round(ph, 2),
        "is_estimated": True
    }

if __name__ == "__main__":
    import datetime
    import os
    load_dotenv()
    print("AgroLens Service ready for Sentinel Hub integration.")
