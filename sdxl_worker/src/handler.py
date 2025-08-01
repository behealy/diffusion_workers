import runpod
import torch
from diffusers.pipelines.auto_pipeline import AutoPipelineForText2Image
from PIL import Image
from io import BytesIO
import base64

# Load the Stable Diffusion XL model once outside the handler for efficiency
pipeline = AutoPipelineForText2Image.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16,
    variant="fp16"
).to("cuda")

def handler(event):
    """
    Handler function that processes incoming requests.
    
    Args:
        event (dict): Contains the input prompt and metadata.
    
    Returns:
        dict: Dictionary with base64 image data or an error message.
    """
    input_data = event.get("input", {})
    
    if not isinstance(input_data, dict):
        return {"error": "Input is not a dictionary."}
    
    prompt = input_data.get("prompt")
    
    if not prompt:
        return {"error": "Missing 'prompt' in input."}
    
    try:
        # Generate image
        image = pipeline(prompt).images[0]
        
        # Convert PIL Image to Base64 string
        buffer = BytesIO()
        image.save(buffer, format="PNG")
        img_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
        
        return {"image": img_str}
    
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    runpod.serverless.start({"handler": handler})