import torch
from transformers import AutoProcessor, LlavaForConditionalGeneration

MODEL_ID = "YuchengShi/LLaVA-v1.5-7B-Plant-Leaf-Diseases-Detection"

print("--- CONFIG DIAGNOSIS ---")
try:
    processor = AutoProcessor.from_pretrained(MODEL_ID)
    print(f"Processor type: {type(processor)}")
    if hasattr(processor, "image_processor"):
        ip = processor.image_processor
        print(f"Image Processor size: {ip.size}")
        print(f"Image Processor patch_size: {getattr(ip, 'patch_size', 'MISSING')}")
        print(f"Image Processor strategy: {getattr(ip, 'vision_feature_select_strategy', 'MISSING')}")
    
    model = LlavaForConditionalGeneration.from_pretrained(
        MODEL_ID, 
        torch_dtype=torch.float32, 
        device_map="cpu", 
        low_cpu_mem_usage=True
    )
    print(f"Model Vision Config: {model.config.vision_config}")
    
except Exception as e:
    print(f"Error: {e}")
