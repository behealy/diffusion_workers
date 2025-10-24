import datetime
from enum import Enum
import os
import torch
import random
from typing import List, Optional, Dict, Any
import numpy as np
from inference_service import RPWorkerInferenceService
from utils import get_memory_info, load_image_from_base64_or_url, print_memory_info, resolve_device
from diffusers import WanPipeline, AutoencoderKLWan, WanTransformer3DModel, UniPCMultistepScheduler
from diffusers.utils import export_to_video, load_image

class WanVideoGenService(RPWorkerInferenceService):
    def __init__(
        self,
        local_debug: bool = False
    ):
        self.local_debug = local_debug
        dtype = torch.bfloat16
        model_id = "Wan-AI/Wan2.2-TI2V-5B-Diffusers"
        vae = AutoencoderKLWan.from_pretrained(model_id, subfolder="vae", torch_dtype=torch.float32)
        self.pipe = WanPipeline.from_pretrained(model_id, vae=vae, torch_dtype=dtype)

    def warmup(self): 
        self.pipe.to(resolve_device())

    def rp_worker_generate(self, job) -> Any:
        return self.generate(job.get("input"))

    def generate(
        self,
        input_params: Dict[str, Any],
    ) -> Dict[str, Any]:
        try:
            p = {**input_params}
            height = p.pop("height")
            width = p.pop("width")
            prompt = p.pop("prompt")
            num_frames = p.pop("num_frames")
            num_inference_steps = p.pop("num_inference_steps")
            guidance_scale = p.pop("guidance_scale")
            negative_prompt = "色调艳丽，过曝，静态，细节模糊不清，字幕，风格，作品，画作，画面，静止，整体发灰，最差质量，低质量，JPEG压缩残留，丑陋的，残缺的，多余的手指，画得不好的手部，画得不好的脸部，畸形的，毁容的，形态畸形的肢体，手指融合，静止不动的画面，杂乱的背景，三条腿，背景人很多，倒着走"

            self.pipe(
                prompt=prompt,
                negative_prompt=negative_prompt,
                height=height,
                width=width,
                num_frames=num_frames,
                guidance_scale=guidance_scale,
                num_inference_steps=num_inference_steps,
            ).frames[0]
            return {"status": "success", "image": filename, **response}
        except KeyError as e:
            if self.local_debug:
                print(f"KeyError: {str(e)}")
            raise e
        except Exception as e:
            if self.local_debug:
                print(f"Problem occured: {e}")
            raise e
