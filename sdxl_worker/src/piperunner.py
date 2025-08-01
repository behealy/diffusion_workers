from PIL.Image import Image
import torch
from typing import Any, List, Optional
from diffusers import StableDiffusionXLPipeline, DDIMScheduler, EulerDiscreteScheduler, DiffusionPipeline, AutoPipelineForText2Image, ControlNetUnionModel,StableDiffusionXLControlNetUnionPipeline,StableDiffusionXLControlNetPipeline
from diffusers.models.controlnets.controlnet import ControlNetModel
from typing import Dict, Optional
from io import BytesIO
import base64

from transformers import AutoModel

from sdxl_worker.src.request import ControlNetParams, LoraParams

def resolve_device():
    if torch.cuda.is_available():
        return "cuda"
    elif torch.backends.mps.is_available():
        return "mps"
    else:
        return "cpu"

def load_model(model_path: str, model_class):
    model = model_class.from_pretrained(model_path, torch_dtype=torch.float16)
    return model



"""
  "thibaud/controlnet-openpose-sdxl-1.0": ControlNetModel.from_pretrained("thibaud/controlnet-openpose-sdxl-1", torch_dtype=torch.float16),
            "https://huggingface.co/diffusers/controlnet-depth-sdxl-1.0": 
            "https://huggingface.co/xinsir/controlnet-scribble-sdxl-1.0":
            "https://huggingface.co/diffusers/controlnet-canny-sdxl-1.0":
            "https://huggingface.co/Eugeoter/noob-sdxl-controlnet-lineart_anime":
            "https://huggingface.co/Eugeoter/noob-sdxl-controlnet-manga_line": """
class Generator:
    def __init__(self, base_sxl_model_path: str, other_sdxl_unets: List[str], controlnet_models: List[str]):
        self.base_pipeline = AutoPipelineForText2Image.from_pretrained(base_sxl_model_path, torch_dtype=torch.float16, variant="fp16").to(resolve_device())
        def get_unet(unet_path): 
            try:
                return AutoPipelineForText2Image.from_pretrained(unet_path, torch_dtype=torch.float16, variant="fp16")
            except Exception as e:
                print(f"Failed to load unet {unet_path}: {e}")
                return None
        self.other_sdxl_unets_pool = [unet for unet in [get_unet(unet_path) for unet_path in other_sdxl_unets] if unet is not None]
        ControlNetUnionModel.from_pretrained("xinsir/controlnet-union-sdxl-1.0", torch_dtype=torch.float16)

    def generate(
        self,
        prompt: str,
        negative_prompt: Optional[str] = None,
        num_inference_steps: int = 25,
        guidance_scale: float = 8,
        controlnets: Optional[List[ControlNetParams]] = None,
        loras: Optional[List[LoraParams]] = None
    ):
        apply_loras = loras is not None and len(loras) > 0
        
        applied_pipeline = self.base_pipeline
        applying_controlnet = False
        if controlnets is not None and len(controlnets) > 0: 
            applying_controlnet = True
            if len(controlnets) > 1:
                active_controlnets = [ControlNetUnionModel.from_pretrained("xinsir/controlnet-union-sdxl-1.0", torch_dtype=torch.float16) for cn in controlnets]
                control_guidance_start = [cn.control_guidance_start for cn in controlnets]
                control_guidance_end = [cn.control_guidance_end for cn in controlnets]
                control_modes = [cn.union_control_mode for cn in controlnets]
                applied_pipeline = StableDiffusionXLControlNetUnionPipeline.from_pipe(self.base_pipeline, controlnets=active_controlnets, variant="fp16")
            else:
                applied_pipeline = StableDiffusionXLControlNetPipeline.from_pipe(self.base_pipeline, controlnets=controlnets[0], variant="fp16")
                control_guidance_start = controlnets[0].control_guidance_start
                control_guidance_end = controlnets[0].control_guidance_end
                control_modes = controlnets[0].union_control_mode 
                

        # if loras:
        #       for lora in loras:
        #         self.base_pipeline.load_lora_weights(
        #             lora.model,
        #             lora.weight_name,
        #             adapter_name=lora.weight_name,
        #         )
            
          # Configure noise scheduler (you can choose between DDIMScheduler and EulerDiscreteScheduler)
        self.base_pipeline.scheduler = DDIMScheduler.from_config(self.base_pipeline.scheduler.config)
        # Alternatively, you can use:
        # sdxl_pipeline.scheduler = EulerDiscreteScheduler.from_config(sdxl_pipeline.scheduler.config)                
        if applying_controlnet: 
            image: Image = applied_pipeline(
                prompt, 
                negative_prompt=negative_prompt,
                control_guidance_start=control_guidance_start,
                control_guidance_end=control_guidance_end,
                guidance_scale=guidance_scale
                num_inference_steps=num_inference_steps,
                control_modes=control_modes
            ).images[0]
        else:  
            image: Image = applied_pipeline(
                prompt, 
                negative_prompt=negative_prompt,
                guidance_scale=guidance_scale
                num_inference_steps=num_inference_steps,
            ).images[0]   

        buffer = BytesIO()
        image.save(buffer, format="PNG")
        img_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
        
        return {"image": img_str}

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Run SDXL inference pipeline with optional ControlNet and LoRA.")
    parser.add_argument("--sdxl_model_path", type=str, required=True, help="Path to the SDXL model.")
    parser.add_argument("--controlnet_model_path", type=str, default=None, help="Path to the ControlNet model.")
    parser.add_argument("--lora_model_path", type=str, default=None, help="Path to the LoRA model.")
    args = parser.parse_args()

    generator = Generator(args.sdxl_model_path, args.controlnet_model_path)

    lora_dict = {"model_path": args.lora_model_path, "weight_name": "example_weight"} if args.lora_model_path else None
    generator.generate(lora_dict)