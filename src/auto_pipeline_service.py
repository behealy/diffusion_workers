import os
import torch
from diffusers import AutoPipelineForText2Image, ControlNetUnionModel

class AutoPipelineService:
    def __init__(self):
       self.main_pipeline = AutoPipelineForText2Image.from_pretrained(pretrained_model_or_path, torch_dtype = torch.float16)
       



def load_pipeline(pretrained_model_or_path):
    return 




if __name__ == "__main__":
    ControlNetUnionModel.from_pretrained("xinsir/controlnet-union-sdxl-1.0")
