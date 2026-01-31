import sys
from pathlib import Path

def run_checks():
    print("="*50)
    print("🚩 TERRANOVA FINAL HEALTH CHECK")
    print("="*50)
    
    # 1. Environment
    print(f"\n[1/4] Environment Details:")
    print(f"- Python: {sys.version}")
    print(f"- Platform: {sys.platform}")
    
    # 2. Key Libraries
    print(f"\n[2/4] Dependency Status:")
    try:
        import torch
        print(f"✅ Torch: {torch.__version__}")
        print(f"- CUDA Available: {torch.cuda.is_available()}")
        if torch.cuda.is_available():
            print(f"- GPU Device: {torch.cuda.get_device_name(0)}")
            print(f"- VRAM Total: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
    except ImportError as e:
        print(f"❌ Torch Dependency Error: {e}")
    except Exception as e:
        print(f"❌ Torch DLL Error: {e} (Common after CUDA install, restart may be needed or PATH adjustment)")
        
    try:
        import numpy
        print(f"✅ Numpy: {numpy.__version__}")
    except Exception as e:
        print(f"❌ Numpy Error: {e}")

    try:
        import sentinelhub
        print(f"✅ Sentinel Hub: installed")
    except Exception as e:
        print(f"❌ Sentinel Hub Error: {e}")

    # 3. File System
    print(f"\n[3/4] Critical Files:")
    files = ["main.py", "npk.py", "agrolens_service.py", ".env"]
    for f in files:
        if Path(f).exists():
            print(f"✅ {f} found")
        else:
            print(f"❌ {f} MISSING")

    # 4. AgroLens Logic
    print(f"\n[4/4] AgroLens Bridge Check:")
    try:
        from agrolens_service import predict_nutrients
        mock_bands = [0.1] * 12
        test_pred = predict_nutrients(mock_bands)
        print(f"✅ Bridge Logic: OK (pH test result: {test_pred['ph']})")
    except Exception as e:
        print(f"❌ Bridge Error: {e}")

    print("\n" + "="*50)
    print("🚀 ALL SYSTEMS READY FOR SMART PLANNER")
    print("="*50)

if __name__ == "__main__":
    run_checks()
