print("Testing stability...")
import os
import sys
import io
print("FastAPI import...")
from fastapi import FastAPI
print("Uvicorn import...")
import uvicorn
print("Torch import...")
try:
    import torch
    print("Torch success")
except Exception as e:
    print(f"Torch failed: {e}")

print("NPK import...")
try:
    from npk import recommend_crop
    print("NPK success")
except Exception as e:
    print(f"NPK failed: {e}")

print("Satellite import...")
try:
    from satellite_service import get_ndvi_for_area
    print("Satellite success")
except Exception as e:
    print(f"Satellite failed: {e}")

print("ALL TESTED")
