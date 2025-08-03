import datetime
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

            if input_params.seed is not None:
                seed = input_params.seed
            else: 
                seed = random.getrandbits(64)

            loras = input_params.loras
            prompt = input_params.prompt
            warnings = {}

            # Start fresh - unload any existing LoRAs from the base pipeline
            self.pipeline_wrapper.unload_loras()
            kwargs = {}
            if loras and len(loras) > 0:
                res = self.pipeline_wrapper.load_loras(loras)
                if (res["status"] == "error"):
                    warnings = {**res}
                kwargs = { **kwargs, "cross_attention_kwargs": {"scale": loras[0].scale}}
                for lora in loras:
                    if lora.tag is not None:
                         prompt += f"{prompt}, {lora.tag}"
               
            pipe = self.pipeline_wrapper.get_pipeline_for_inputs(input_params)
          
            # Controlnets config
            if controlnets and len(controlnets) > 0:
                kwargs = {**kwargs, **self._setup_single_controlnet(controlnets)}
                

            print_memory_info()

            # Set up generator for reproducibility
            generator = generator = torch.Generator(device=resolve_device()).manual_seed(seed)

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

            response = {"prompt": prompt, "seed": seed, "warnings": warnings}

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