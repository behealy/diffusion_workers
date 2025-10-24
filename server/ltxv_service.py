from huggingface_hub import hf_hub_download
import torch
from diffusers import LTXImageToVideoPipeline, LTXPipeline, LTXConditionPipeline, LTXLatentUpsamplePipeline
from diffusers.pipelines.ltx.modeling_latent_upsampler import LTXLatentUpsamplerModel
from diffusers.utils import export_to_video, load_image
from diffusers.hooks import apply_group_offloading
import datetime
from enum import Enum
import os
import torch
import random
from typing import List, Optional, Dict, Any
import numpy as np
from transformers import T5EncoderModel
from inference_service import RPWorkerInferenceService
from utils import get_memory_info, load_image_from_base64_or_url, print_memory_info, resolve_device
from pathlib import Path

class LTXVideoService(RPWorkerInferenceService):
    def __init__(
        self,
        local_debug: bool = False
    ):
        onload_device = torch.device("cuda")
        offload_device = torch.device("cpu")
        self.local_debug = local_debug

        self.pipe = LTXImageToVideoPipeline.from_pretrained("Lightricks/LTX-Video-0.9.8-13B-distilled", torch_dtype=torch.bfloat16)
        self.pipe.enable_model_cpu_offload()

        self.pipe.transformer.enable_group_offload(onload_device=onload_device, offload_device=offload_device, offload_type="leaf_level")
        self.pipe.vae.enable_group_offload(onload_device=onload_device, offload_type="leaf_level")

        # Use the apply_group_offloading method for other model components
        apply_group_offloading(self.pipe.text_encoder, onload_device=onload_device, offload_type="block_level", num_blocks_per_group=2)


        # path = Path(hf_hub_download("Lightricks/LTX-Video", filename="ltxv-spatial-upscaler-0.9.8.safetensors")).parent
        # print(f"LTX UPSAMPLE PATH: {path}")
        # upsampler = LTXLatentUpsamplerModel.from_pretrained(path)
        # self.pipe_upsample = LTXLatentUpsamplePipeline(latent_upsampler=upsampler , vae=self.pipe.vae)

    def warmup(self): 
        # self.pipe.to(resolve_device())
        # self.pipe_upsample.to(resolve_device())
        # self.pipe.vae.enable_tiling()

    def rp_worker_generate(self, job) -> Any:
        return self.generate(job.get("input"))

    def generate(
        self,
        input_params: Dict[str, Any],
    ) -> Dict[str, Any]:
        try:
            p = {**input_params}
            prompt: str = p.pop("prompt")
            start_image = p.pop("start_image")
            upscale = p.get("upscale", 1)
            height = p.get("height", 480)
            width = p.get("width", 720)
            num_frames = p.get("num_frames", 81)
            fps = p.get("fps", 16)
            num_inference_steps = p.get("num_inference_steps", 30)
            guidance_scale = p.get("guidance_scale", 3)
            negative_prompt = "worst quality, inconsistent motion, blurry, jittery, distorted"
            filename = p.get("filename", f"{prompt[:72]}_{datetime.datetime.now()}.mp4")

            video = self.pipe(
                prompt=prompt,
                image=start_image,
                negative_prompt=negative_prompt,
                height=height,
                width=width,
                num_frames=num_frames,
                guidance_scale=guidance_scale,
                num_inference_steps=num_inference_steps,
            ).frames[0]
            export_to_video(video, filename, fps=fps)

            if self.local_debug: 
                 return {"status": "success", "video": filename}
            else: 
                return {"status": "success"}
           
        except KeyError as e:
            if self.local_debug:
                print(f"KeyError: {str(e)}")
            raise e
        except Exception as e:
            if self.local_debug:
                print(f"Problem occured: {e}")
            raise e

# i2v or v2v, or iv2v with upscale
# import torch
# from diffusers import LTXConditionPipeline, LTXLatentUpsamplePipeline
# from diffusers.pipelines.ltx.pipeline_ltx_condition import LTXVideoCondition
# from diffusers.utils import export_to_video, load_image, load_video

# pipe = LTXConditionPipeline.from_pretrained("Lightricks/LTX-Video-0.9.8-dev", torch_dtype=torch.bfloat16)
# pipe_upsample = LTXLatentUpsamplePipeline.from_pretrained("Lightricks/ltxv-spatial-upscaler-0.9.8", vae=pipe.vae, torch_dtype=torch.bfloat16)
# pipe.to("cuda")
# pipe_upsample.to("cuda")
# pipe.vae.enable_tiling()

# def round_to_nearest_resolution_acceptable_by_vae(height, width):
#     height = height - (height % pipe.vae_spatial_compression_ratio)
#     width = width - (width % pipe.vae_spatial_compression_ratio)
#     return height, width

# image = load_image("https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/diffusers/penguin.png")
# video = load_video(export_to_video([image])) # compress the image using video compression as the model was trained on videos
# condition1 = LTXVideoCondition(video=video, frame_index=0)

# prompt = "A cute little penguin takes out a book and starts reading it"
# negative_prompt = "worst quality, inconsistent motion, blurry, jittery, distorted"
# expected_height, expected_width = 480, 832
# downscale_factor = 2 / 3
# num_frames = 96

# # Part 1. Generate video at smaller resolution
# downscaled_height, downscaled_width = int(expected_height * downscale_factor), int(expected_width * downscale_factor)
# downscaled_height, downscaled_width = round_to_nearest_resolution_acceptable_by_vae(downscaled_height, downscaled_width)
# latents = pipe(
#     conditions=[condition1],
#     prompt=prompt,
#     negative_prompt=negative_prompt,
#     width=downscaled_width,
#     height=downscaled_height,
#     num_frames=num_frames,
#     num_inference_steps=30,
#     generator=torch.Generator().manual_seed(0),
#     output_type="latent",
# ).frames

# # Part 2. Upscale generated video using latent upsampler with fewer inference steps
# # The available latent upsampler upscales the height/width by 2x
# upscaled_height, upscaled_width = downscaled_height * 2, downscaled_width * 2
# upscaled_latents = pipe_upsample(
#     latents=latents,
#     output_type="latent"
# ).frames

# # Part 3. Denoise the upscaled video with few steps to improve texture (optional, but recommended)
# video = pipe(
#     conditions=[condition1],
#     prompt=prompt,
#     negative_prompt=negative_prompt,
#     width=upscaled_width,
#     height=upscaled_height,
#     num_frames=num_frames,
#     denoise_strength=0.4,  # Effectively, 4 inference steps out of 10
#     num_inference_steps=10,
#     latents=upscaled_latents,
#     decode_timestep=0.05,
#     image_cond_noise_scale=0.025,
#     generator=torch.Generator().manual_seed(0),
#     output_type="pil",
# ).frames[0]

# # Part 4. Downscale the video to the expected resolution
# video = [frame.resize((expected_width, expected_height)) for frame in video]

# export_to_video(video, "output.mp4", fps=24)
