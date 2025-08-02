import datetime
import torch
from typing import List, Optional, Dict, Any
from diffusers import (
    AutoPipelineForText2Image,
    StableDiffusionXLPipeline,
    StableDiffusionXLControlNetPipeline,
    StableDiffusionXLControlNetUnionPipeline,
    ControlNetUnionModel,
    DDIMScheduler,
    EulerDiscreteScheduler,
    AutoPipelineForImage2Image,
    AutoPipelineForInpainting,
)
from diffusers.models.controlnets.controlnet import ControlNetModel
from PIL import Image
from io import BytesIO
import base64
import runpod
import uvicorn
from fastapi import FastAPI, HTTPException
from pipelinewrapper import PipelineWrapper, SdxlControlnetUnionPipelineWrapper
from utils import get_memory_info, print_memory_info, resolve_device

from models.worker_request import ControlNetParams, LoraParams, WorkerRequest, InputParams

class DiffusionService:
    def __init__(
            self, 
            pipeline_wrapper: PipelineWrapper,
            local_debug: bool = False
        ):
       self.pipeline_wrapper = pipeline_wrapper
       self.local_debug = local_debug

    def _unload_all_loras(self, pipeline):
        """Unload all LoRA weights from the pipeline to restore original model weights."""
        try:
            pipeline.unload_lora_weights()
        except Exception as e:
            print(f"Warning: Failed to unload LoRA weights: {e}")


    def _setup_single_controlnet(self, controlnets: List[ControlNetParams]):
          # Single ControlNet
            cn = controlnets[0]            
            return {
                "image": cn.control_image,
                "controlnet_conditioning_scale": cn.controlnet_conditioning_scale,
                "control_guidance_start": cn.control_guidance_start,
                "control_guidance_end": cn.control_guidance_end
            }

    def generate(
        self,
        input_params: InputParams,
    ) -> Dict[str, Any]:
        """Generate an image based on the provided parameters."""
        try:
            controlnets = input_params.controlnets
            seed = input_params.seed
            loras = input_params.loras
            # Start fresh - unload any existing LoRAs from the base pipeline
            self.pipeline_wrapper.unload_loras()
            if loras and len(loras) > 0:
                self.pipeline_wrapper.load_loras(loras)
            pipe = self.pipeline_wrapper.get_pipeline_for_inputs(input_params)
          
            # Controlnets config
            if controlnets and len(controlnets) > 0:
                controlnet_kwargs = self._setup_single_controlnet(controlnets)
            else:
                controlnet_kwargs = {}

            print_memory_info()

            # Set up generator for reproducibility
            generator = None
            if seed is not None:
                generator = torch.Generator(device=resolve_device()).manual_seed(seed)

            # Generate image
            result = pipe(
                prompt=input_params.prompt,
                negative_prompt=input_params.negative_prompt,
                num_inference_steps=input_params.inference_steps,
                guidance_scale=input_params.guidance_scale,
                generator=generator,
                **controlnet_kwargs
            )

            image = result.images[0]

            if self.local_debug:
                print("Local debug enabled. Saving image to file.")
                # image saved with output timestamp
                timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"output_{timestamp}.png"
                image.save(filename)
                return {"status": f"Output saved to {filename}"}
            else: 
                # Convert to base64
                buffer = BytesIO()
                image.save(buffer, format="PNG")
                img_str = base64.b64encode(buffer.getvalue()).decode("utf-8")

            return {"image": img_str}

        except Exception as e:
            if self.local_debug:
                print(f"Problem occured: {e}")
            raise e




if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Run SDXL inference pipeline")
    parser.add_argument("--host", default="0.0.0.0", help="Host for local server")
    parser.add_argument("--port", default=8000, type=int, help="Port for local server")
    parser.add_argument("--model", default="stable-diffusion-v1-5/stable-diffusion-v1-5", 
                       help="Base model path or identifier")
    
    args = parser.parse_args()

    # FastAPI app for local development
    app = FastAPI(title="SDXL Worker", description="SDXL Image Generation API")

    diff_service = DiffusionService(
        pipeline_wrapper=SdxlControlnetUnionPipelineWrapper(base_model=args.model),
        local_debug=True
    )

    @app.post("/generate")
    async def generate_image(request: WorkerRequest):
        """Generate an image from text prompt."""
        try:
            result = diff_service.generate(
                input_params=request.input,
            )
        
            if "error" in result:
                raise HTTPException(status_code=500, detail=result["error"])
            
            return result
        
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        
    @app.get("/memory-info")
    async def mem_info():
        """Get memory information."""
        return {"info": get_memory_info()}

    
    print(f"Starting local development server on {args.host}:{args.port}")
    uvicorn.run(app, host=args.host, port=args.port)