"""
Simple test script to verify the Crop Disease Detection API
"""

import requests
import json
import os

# API endpoints
BASE_URL = "http://localhost:8000"
HEALTH_URL = f"{BASE_URL}/health"
DIAGNOSE_URL = f"{BASE_URL}/diagnose"

def test_health():
    """Test the health endpoint"""
    print("\n" + "="*60)
    print("🏥 Testing Health Endpoint")
    print("="*60)
    
    try:
        response = requests.get(HEALTH_URL)
        data = response.json()
        
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if data.get("ai_ready"):
            print("✅ API is healthy and ready!")
        else:
            print("⚠️  API is running but AI engine is not ready")
            print("   Make sure GROQ_API_KEY is configured")
        
        return data.get("ai_ready", False)
    
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API server")
        print("   Make sure the server is running on port 8000")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_diagnose(image_path):
    """Test the diagnose endpoint with an image"""
    print("\n" + "="*60)
    print("🔬 Testing Diagnose Endpoint")
    print("="*60)
    
    if not os.path.exists(image_path):
        print(f"❌ Image file not found: {image_path}")
        print("   Please provide a valid image path")
        return False
    
    print(f"Uploading image: {image_path}")
    
    try:
        with open(image_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(DIAGNOSE_URL, files=files)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ Analysis Complete!")
            print("\n📊 RESULTS:")
            print("-" * 60)
            print(f"Disease:        {data.get('disease', 'N/A')}")
            print(f"Crop:           {data.get('crop', 'N/A')}")
            print(f"Confidence:     {data.get('confidence', 'N/A')}%")
            print(f"Severity:       {data.get('severity', 'N/A')}")
            print(f"Affected Area:  {data.get('affected_area', 'N/A')}")
            
            if data.get('symptoms'):
                print(f"\nSymptoms:")
                for symptom in data.get('symptoms', []):
                    print(f"  • {symptom}")
            
            print(f"\nTreatment:")
            print(f"  {data.get('treatment', 'N/A')}")
            
            if data.get('additional_notes'):
                print(f"\nNotes:")
                print(f"  {data.get('additional_notes', 'N/A')}")
            
            print("-" * 60)
            return True
        else:
            error_data = response.json()
            print(f"❌ Error: {error_data.get('error', 'Unknown error')}")
            print(f"   Message: {error_data.get('message', 'No message')}")
            return False
    
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API server")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Main test function"""
    print("\n" + "="*60)
    print("🌿 CROP DISEASE DETECTION API - TEST SCRIPT")
    print("="*60)
    
    # Test health endpoint
    is_healthy = test_health()
    
    if not is_healthy:
        print("\n⚠️  API is not ready. Please:")
        print("   1. Make sure the server is running (python main.py)")
        print("   2. Set your GROQ_API_KEY in the .env file")
        return
    
    # Test diagnose endpoint
    print("\n")
    image_path = input("Enter path to crop leaf image (or press Enter to skip): ").strip()
    
    if image_path:
        test_diagnose(image_path)
    else:
        print("\nSkipping image upload test")
        print("To test the diagnose endpoint:")
        print("  python test_api.py")
        print("  Then provide an image path when prompted")
    
    print("\n" + "="*60)
    print("✅ Testing Complete!")
    print("="*60)
    print("\nQuick Test Options:")
    print("  1. Open test_page.html in your browser for UI testing")
    print("  2. Use curl: curl -X POST http://localhost:8000/diagnose -F 'file=@image.jpg'")
    print("  3. Use Postman to test the API endpoints")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
