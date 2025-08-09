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
from pipelinewrapper import PipelineWrapper, DefaultPipelineWrapper, SD15Fp16ControlNetGetter, SDXLFp16ControlNetUnionGetter
from controlnet_preprocessor import ControlnetSetupHandler, ControlnetUnionSetupHandler
from utils import get_memory_info, load_image_from_base64_or_url, print_memory_info, resolve_device
from mooove_server_api import ImageGenerateRequest, ImageGenerationParams
from models import OpStatus
# from preload import load_models_from_manifest

class DiffusionService:
    def __init__(
            self, 
            pipeline_wrapper: PipelineWrapper,
            local_debug: bool = False
        ):
       self.pipeline_wrapper = pipeline_wrapper
       self.local_debug = local_debug
       self.cnunion_handler = ControlnetUnionSetupHandler()
       self.cn_handler = ControlnetSetupHandler()

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

            (kwargs, response) = self.pipeline_wrapper.setup(input_params, kwargs, response)
            pipe = self.pipeline_wrapper.get_pipeline_for_inputs(input_params)
          
            if controlnets and len(controlnets) > 0:
                res = self.cn_handler.get_controlnet_args(input_params)
                if res.status is not OpStatus.FAILURE and res.result is not None:
                    kwargs = {**kwargs, **res.result}
                else: 
                    print(f"ControlNet error: {res.message}")
                    response = {**response, "warnings": [*response["warnings"], res]}   

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
    parser.add_argument("--sd_model_version", default="sd15")
    parser.add_argument("--default_controlnet_model", default="lllyasviel/sd-controlnet-openpose")
    parser.add_argument("--model", default="stable-diffusion-v1-5/stable-diffusion-v1-5", 
                       help="Base model path or identifier")
    
    args = parser.parse_args()

    # FastAPI app for local development
    app = FastAPI(title="SDXL Worker", description="SDXL Image Generation API")

    os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"

    if args.sd_model_version == "sdxl":
        pipe_wrapper = DefaultPipelineWrapper(base_model=args.model, get_controlnet=SDXLFp16ControlNetUnionGetter())
    else:
        pipe_wrapper = DefaultPipelineWrapper(base_model=args.model)

    diff_service = DiffusionService(
        pipeline_wrapper=pipe_wrapper,
        local_debug=True
    )

    @app.post("/generate-sync")
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