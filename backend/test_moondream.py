import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
import os
import sys

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
MODEL_ID = "vikhyatk/moondream2"

print(f"Python: {sys.version}")
print(f"Torch: {torch.__version__}")
print(f"CUDA: {torch.cuda.is_available()}")

print("Step 1: Loading Tokenizer...")
try:
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
    print("✅ Tokenizer Loaded")
except Exception as e:
    print(f"❌ Tokenizer Failed: {e}")

print("Step 2: Loading Model (this might take a while)...")
try:
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using Device: {device}")
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_ID, 
        trust_remote_code=True,
        torch_dtype=torch.float32 # Use float32 for maximum compatibility
    ).to(device)
    print("✅ Model Loaded")
except Exception as e:
    print(f"❌ Model Failed: {e}")
    import traceback
    traceback.print_exc()

print("Step 3: Test Diagnosis...")
try:
    from PIL import Image
    import io
    # Create a blank image for testing
    img = Image.new('RGB', (224, 224), color = 'red')
    enc_image = model.encode_image(img)
    answer = model.answer_question(enc_image, "What color is this?", tokenizer)
    print(f"✅ Test Success: {answer}")
except Exception as e:
    print(f"❌ Test Failed: {e}")
