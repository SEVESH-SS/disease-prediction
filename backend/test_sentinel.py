import os
import datetime
from sentinelhub import SHConfig, SentinelHubRequest, DataCollection, MimeType, BBox, CRS, bbox_to_dimensions
from dotenv import load_dotenv

load_dotenv()

print("="*40)
print("🛰️ SENTINEL HUB DIAGNOSIS TOOL")
print("="*40)

CLIENT_ID = os.getenv("SH_CLIENT_ID")
CLIENT_SECRET = os.getenv("SH_CLIENT_SECRET")

print(f"Client ID present: {'✅' if CLIENT_ID else '❌'}")
print(f"Client Secret present: {'✅' if CLIENT_SECRET else '❌'}")

if not CLIENT_ID or not CLIENT_SECRET:
    print("❌ ERROR: Missing credentials in .env file!")
    exit(1)

config = SHConfig()
config.sh_client_id = CLIENT_ID
config.sh_client_secret = CLIENT_SECRET

# Test Coordinates (Coimbatore)
coords = [11.0168, 76.9558, 11.0268, 76.9658]
bbox = BBox(bbox=coords, crs=CRS.WGS84)
size = bbox_to_dimensions(bbox, resolution=30)

print(f"\nAttempting to connect to Sentinel Hub...")
print(f"Target: 30m resolution image for Coimbatore")

evalscript = """
//VERSION=3
function setup() {
  return {
    input: ["B04", "B08"],
    output: { bands: 2 }
  };
}
function evaluatePixel(sample) {
  return [sample.B04, sample.B08];
}
"""

try:
    print("Sending Request...")
    request = SentinelHubRequest(
        evalscript=evalscript,
        input_data=[
            SentinelHubRequest.input_data(
                data_collection=DataCollection.SENTINEL2_L1C,
                time_interval=('2023-01-01', '2023-01-30')
            )
        ],
        responses=[SentinelHubRequest.output_response("default", MimeType.TIFF)],
        bbox=bbox,
        size=size,
        config=config
    )
    
    data = request.get_data()
    print("✅ SUCCESS: Connection Established!")
    print(f"📥 Received Data Shape: {len(data)} tiles")
    if len(data) > 0:
        print(f"📊 Pixel Data Preview: {data[0][0][0]}")
    
except Exception as e:
    print(f"\n❌ CONNECTION FAILED")
    print(f"Error Type: {type(e).__name__}")
    print(f"Error Message: {e}")
    
    if "401" in str(e):
        print("\n💡 DIAGNOSIS: 401 Unauthorized")
        print("👉 Your Client ID or Secret is INCORRECT.")
        print("👉 Check for extra spaces or typoes in .env")
    elif "403" in str(e):
        print("\n💡 DIAGNOSIS: 403 Forbidden")
        print("👉 Your account creates token, but lacks PLAN access.")
        print("👉 You might need a trial plan active on Sentinel Hub.")
    else:
        print("\n💡 TIP: Use the output above to debug.")
