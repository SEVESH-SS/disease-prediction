import torch
from transformers import AutoProcessor, LlavaForConditionalGeneration, BitsAndBytesConfig
import os

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
MODEL_ID = "YuchengShi/LLaVA-v1.5-7B-Plant-Leaf-Diseases-Detection"

print("Starting test load...")
try:
    device = "cuda"
    quant_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_use_double_quant=True,
        bnb_4bit_compute_dtype=torch.float16
    )
    
    print("Loading model...")
    model = LlavaForConditionalGeneration.from_pretrained(
        MODEL_ID, 
        quantization_config=quant_config,
        device_map="auto"
    )
    print("SUCCESS")
except Exception as e:
    print(f"FAILED: {e}")
