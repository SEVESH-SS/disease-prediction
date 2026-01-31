import os
import datetime
from sentinelhub import (
    SHConfig,
    SentinelHubRequest,
    MimeType,
    bbox_to_dimensions,
    BBox,
    CRS,
    DataCollection,
    SentinelHubDownloadClient,
)
from dotenv import load_dotenv

load_dotenv()

# Sentinel Hub Configuration
config = SHConfig()
config.sh_client_id = os.getenv("SH_CLIENT_ID")
config.sh_client_secret = os.getenv("SH_CLIENT_SECRET")

# Evalscript for NDVI calculation
# NDVI = (NIR - RED) / (NIR + RED)
# B08 is NIR, B04 is RED for Sentinel-2
EVALSCRIPT_NDVI = """
//VERSION=3

function setup() {
  return {
    input: ["B04", "B08", "dataMask"],
    output: [
      { id: "default", bands: 1 },
      { id: "dataMask", bands: 1 }
    ]
  };
}

function evaluatePixel(samples) {
  let ndvi = (samples.B08 - samples.B04) / (samples.B08 + samples.B04);
  return {
    default: [ndvi],
    dataMask: [samples.dataMask]
  };
}
"""

def get_ndvi_for_area(coords, size=(512, 512)):
    """
    Fetches NDVI data for a given bounding box.
    coords: [min_x, min_y, max_x, max_y] in WGS84 (lat/lon)
    """
    bbox = BBox(bbox=coords, crs=CRS.WGS84)
    resolution = 10 # 10 meters per pixel for Sentinel-2
    dimensions = bbox_to_dimensions(bbox, resolution=resolution)

    # Search for the latest image in the last 30 days
    now = datetime.datetime.now()
    month_ago = now - datetime.timedelta(days=30)
    time_interval = (month_ago.strftime("%Y-%m-%d"), now.strftime("%Y-%m-%d"))

    request = SentinelHubRequest(
        evalscript=EVALSCRIPT_NDVI,
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
            # For simplicity, we'll return the mean NDVI of the area
            import numpy as np
            ndvi_array = data[0]
            # Filter out NaN/invalid values if necessary
            mean_ndvi = np.nanmean(ndvi_array)
            return {
                "mean_ndvi": float(mean_ndvi),
                "status": "success",
                "message": "NDVI data retrieved successfully"
            }
        else:
            return {"status": "error", "message": "No data found for this period"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    # Test coordinates (example near a known farm area)
    test_coords = [12.9716, 77.5946, 12.9816, 77.6046]
    # print(get_ndvi_for_area(test_coords))
    print("Satellite Service Initialized")
