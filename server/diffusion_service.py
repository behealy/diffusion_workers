import datetime
from enum import Enum
import os
import torch
import random
from typing import List, Optional, Dict, Any
from diffusers.models.controlnets.controlnet import ControlNetModel
from PIL import Image
from io import BytesIO
import base64
import runpod
import uvicorn
from fastapi import FastAPI, HTTPException, responses
from pipeline_factory import FluxFp16ControlNetUnionGetter, PipelineFactory, SDImagePipelineFactory, SD15Fp16ControlNetGetter, SDXLFp16ControlNetUnionGetter
from controlnet_preprocessor import MultiModelControlnetParamsFactory, ControlnetUnionParamsFactory, ControlnetParamsFactory
from utils import get_memory_info, load_image_from_base64_or_url, print_memory_info, resolve_device
from ez_diffusion_client import ImageGenerateRequest, ImageGenerationParams
from models import OpStatus
# from preload import load_models_from_manifest

class DiffusionService:
    def __init__(
            self, 
            pipeline_factory: PipelineFactory,
            controlnet_params_factory: ControlnetParamsFactory,
            local_debug: bool = False
        ):
       self.pipeline_factory = pipeline_factory
       self.local_debug = local_debug
       self.controlnet_params_factory = controlnet_params_factory

    def generate(
        self,
        input_params: ImageGenerationParams,
    ) -> Dict[str, Any]:
        """Generate an image based on the provided parameters."""
        try:
            controlnets = input_params.controlnets

            if input_params.seed is not None:
                seed = input_params.seed
            else: 
                seed = random.getrandbits(64)

            generator = torch.Generator(device=resolve_device()).manual_seed(seed)

            prompt = input_params.prompt
            kwargs = {**input_params.dimensions.to_dict(), "prompt": prompt}
            response = {"prompt": prompt, "seed": seed, "warnings": []}

            (kwargs, response) = self.pipeline_factory.setup(input_params, kwargs, response)
            (kwargs, response) = self.controlnet_params_factory.get_pipeline_controlnet_params(input_params, kwargs, response) 

            pipe = self.pipeline_factory.get_pipeline_for_inputs(input_params)

            print_memory_info()

            if input_params.image_to_image: 
                img = load_image_from_base64_or_url(input_params.image_to_image.starting_image.source, input_params.dimensions.width, input_params.dimensions.height)
                (width, height) = img.size
                buffer = BytesIO()
                img.save(buffer, format="JPEG")
                img_str = "data:image/jpeg;base64,"+ base64.b64encode(buffer.getvalue()).decode("utf-8")
                response = { "resized_preview": img_str, **response}
                kwargs = {"image": img, "width": width, "height": height, **kwargs}
            
            # Generate image
            result = pipe(
                prompt=prompt,
                negative_prompt=input_params.negative_prompt,
                num_inference_steps=input_params.inference_steps,
                guidance_scale=input_params.guidance_scale,
                generator=generator,
                **kwargs
            )

            image = result.images[0]

            if self.local_debug:
                print("Local debug enabled. Saving image to file.")
                print(kwargs)
                # image saved with output timestamp
                timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"output_{timestamp}.png"
                image.save(filename)
                return {"status": "success", "image": filename, **response}
            else: 
                # Convert to base64
                buffer = BytesIO()
                image.save(buffer, format="PNG")
                img_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
                return {"image": img_str, **response}

        except Exception as e:
            if self.local_debug:
                print(f"Problem occured: {e}")
            raise e




if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Run SDXL inference pipeline")
    parser.add_argument("--host", default="0.0.0.0", help="Host for local server")
    parser.add_argument("--port", default=8000, type=int, help="Port for local server")
    parser.add_argument("--diffusion_base_model", default="sd15")
    parser.add_argument("--default_controlnet_model", default="lllyasviel/sd-controlnet-openpose")
    parser.add_argument("--model", default="stable-diffusion-v1-5/stable-diffusion-v1-5", 
                       help="Base model path or identifier")
    
    args = parser.parse_args()

    # FastAPI app for local development
    app = FastAPI(title="SDXL Worker", description="SDXL Image Generation API")

    os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"

    if args.diffusion_base_model == "sdxl":
        pipe_wrapper = SDImagePipelineFactory(base_model=args.model, get_controlnet=SDXLFp16ControlNetUnionGetter())
        controlnet_params_factory = ControlnetUnionParamsFactory()
    # if args.diffusion_base_model == "flux":
    #     pipe_wrapper = SDImagePipelineFactory(base_model=args.model, get_controlnet=FluxFp16ControlNetUnionGetter())

    # if args.diffusion_base_model == "wan":
    #     pipe_wrapper = 
    else:
        # SD 1.5 default
        pipe_wrapper = SDImagePipelineFactory(base_model=args.model)
        controlnet_params_factory = MultiModelControlnetParamsFactory()

    diff_service = DiffusionService(
        pipeline_factory=pipe_wrapper,
        controlnet_params_factory=controlnet_params_factory,
        local_debug=True
    )

    @app.post("/image-to-image")
    async def image_to_image(request: ImageGenerateRequest):
        """Generate an image from text prompt."""
        try:
            if not request.input.image_to_image:
                raise HTTPException(status_code=422, detail="Input field `image_to_image` is required.")

            result = diff_service.generate(
                input_params=request.input,
            )
        
            if "error" in result:
                raise HTTPException(status_code=500, detail=result["error"])
            
            return result
        
        except Exception as e:
            print(str(e.with_traceback()))
            raise HTTPException(status_code=500, detail=str(e))
        
    @app.post("/inpaint")
    async def inpaint(request: ImageGenerateRequest):
        """Generate an image from text prompt."""
        try:
            if not request.input.inpaint:
                raise HTTPException(status_code=422, detail="Input field `inpaint` is required.")

            result = diff_service.generate(
                input_params=request.input,
            )
        
            if "error" in result:
                raise HTTPException(status_code=500, detail=result["error"])
            
            return result
        
        except Exception as e:
            print(str(e.with_traceback()))
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/text-to-image")
    async def generate_image(request: ImageGenerateRequest):
        """Generate an image from text prompt."""
        try:
            result = diff_service.generate(
                input_params=request.input,
            )
        
            if "error" in result:
                raise HTTPException(status_code=500, detail=result["error"])
            
            return result
        
        except Exception as e:
            print(str(e.with_traceback()))
            raise HTTPException(status_code=500, detail=str(e))
        
    @app.get("/memory-info")
    async def mem_info():
        """Get memory information."""
        return {"info": get_memory_info()}

    
    print(f"Starting local development server on {args.host}:{args.port}")
    uvicorn.run(app, host=args.host, port=args.port)