from functools import lru_cache
from mooove_server_api import ImageGenerationParams
import torch
import base64
from diffusers.utils import load_image as hf_load_image
from io import BytesIO
from PIL import Image

def resolve_device():
    if torch.cuda.is_available():
        return "cuda"
    elif torch.backends.mps.is_available():
        return "mps"
    else:
        return "cpu"
    
def bytes_to_megabytes(bytes):
    return bytes / 1024 / 1024

def get_memory_info():
    if torch.cuda.is_available():
        return f'''
            Using CUDA
            Current memory allocated: {bytes_to_megabytes(torch.cuda.memory_allocated())} MB (current GPU memory occupied by tensors in bytes for a given device)
            Max memory allocated: {bytes_to_megabytes(torch.cuda.max_memory_allocated())} MB (maximum GPU memory occupied by tensors in bytes for a given device)
            Current memory reserved: {bytes_to_megabytes(torch.cuda.memory_reserved())} MB
        '''
    elif torch.backends.mps.is_available(): 
        return f'''
            Using MPS
            Current memory allocated: {bytes_to_megabytes(torch.mps.current_allocated_memory())} MB (GPU memory occupied by tensors in bytes)
            Current driver allocated memory: {bytes_to_megabytes(torch.mps.driver_allocated_memory())} MB (total GPU memory allocated by Metal driver for the process in bytes)
        '''

def print_memory_info():
    print(get_memory_info())

def __loadim(image: str):
    if image.startswith("data:image"):
        try: 
            return Image.open(BytesIO(base64.b64decode(image.split(",")[1])))
        except Exception as e:
            print(f"Error loading image from data URL: {e}")
            raise e
    else:
        return hf_load_image(image)

def load_image_from_base64_or_url(image: str, resizedWidth: int | None = None, resizedHeight: int | None = None):
    img = __loadim(image)
    if resizedWidth and resizedHeight:
        return img.resize((resizedWidth, resizedHeight))
    if resizedWidth:
        (width, height) = img.size
        scale = resizedWidth/width
        return img.resize((resizedWidth, int(height * scale)))
    elif resizedHeight:
        (width, height) = img.size
        scale = resizedHeight/height
        return img.resize((int(width * scale), height))
    else:
        return img
    
    
            