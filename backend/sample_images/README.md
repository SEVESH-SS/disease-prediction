# Sample Crop Disease Images

This directory contains sample crop leaf images for testing the disease detection API.

## Available Test Images:

### 1. Tomato Early Blight (tomato_early_blight.png)
- **Disease**: Early Blight
- **Crop**: Tomato
- **Symptoms**: Dark brown circular spots with concentric rings, yellowing around spots

### 2. Corn Leaf Rust (corn_leaf_rust.png)
- **Disease**: Rust
- **Crop**: Corn/Maize
- **Symptoms**: Small reddish-brown pustules scattered across leaf surface

### 3. Potato Late Blight (potato_late_blight.png)
- **Disease**: Late Blight
- **Crop**: Potato
- **Symptoms**: Large irregular dark lesions, water-soaked areas, white mold growth

### 4. Healthy Wheat Leaf (healthy_wheat_leaf.png)
- **Status**: Healthy
- **Crop**: Wheat
- **Description**: No disease symptoms, vibrant green color

## How to Test:

### Using the Test Page (test_page.html):
1. Open `test_page.html` in your browser
2. Drag and drop one of these images or click to upload
3. Click "Analyze Disease"
4. View the AI-powered diagnosis

### Using Python Test Script:
```bash
python test_api.py
```
Then enter the path to one of these images when prompted.

### Using curl:
```bash
# Test with tomato early blight
curl -X POST http://localhost:8000/diagnose -F "file=@sample_images/tomato_early_blight.png"

# Test with healthy wheat leaf
curl -X POST http://localhost:8000/diagnose -F "file=@sample_images/healthy_wheat_leaf.png"
```

## Expected Results:

The Groq Llama Vision AI should:
- ✅ Identify the crop type
- ✅ Detect the disease (or confirm if healthy)
- ✅ List visible symptoms
- ✅ Provide confidence score
- ✅ Assess severity level
- ✅ Recommend treatment

These images were generated to demonstrate typical disease symptoms that the AI model should be able to identify and analyze.
