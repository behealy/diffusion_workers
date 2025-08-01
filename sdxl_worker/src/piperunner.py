import torch
from typing import List, Optional, Dict, Any
from diffusers import (
    AutoPipelineForText2Image,
    StableDiffusionXLPipeline,
    StableDiffusionXLControlNetPipeline,
    StableDiffusionXLControlNetUnionPipeline,
    ControlNetUnionModel,
    DDIMScheduler,
    EulerDiscreteScheduler
)
from diffusers.models.controlnets.controlnet import ControlNetModel
from PIL import Image
from io import BytesIO
import base64
import runpod
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import ValidationError

from .request import ControlNetParams, LoraParams, GenerateRequest, InputParams

def resolve_device():
    if torch.cuda.is_available():
        return "cuda"
    elif torch.backends.mps.is_available():
        return "mps"
    else:
        return "cpu"

class Generator:
    def __init__(self, base_model_path: str = "stabilityai/stable-diffusion-xl-base-1.0"):
        self.device = resolve_device()
        self.base_pipeline = AutoPipelineForText2Image.from_pretrained(
            base_model_path,
            torch_dtype=torch.float16,
            variant="fp16"
        ).to(self.device)

    def _unload_all_loras(self, pipeline):
        """Unload all LoRA weights from the pipeline to restore original model weights."""
        try:
            pipeline.unload_lora_weights()
        except Exception as e:
            print(f"Warning: Failed to unload LoRA weights: {e}")

    def _load_loras(self, loras: List[LoraParams], pipeline):
        """Load LoRA weights into the pipeline."""
        for lora in loras:
            try:
                if lora.weight_name:
                    pipeline.load_lora_weights(
                        lora.model,
                        weight_name=lora.weight_name,
                        adapter_name=lora.weight_name
                    )
                else:
                    pipeline.load_lora_weights(lora.model)
            except Exception as e:
                print(f"Failed to load LoRA {lora.model}: {e}")

    def _setup_controlnet_pipeline(self, controlnets: List[ControlNetParams]):
        """Set up ControlNet pipeline based on the number of control inputs."""
        if len(controlnets) > 1:
            # Multiple ControlNets - use Union ControlNet
            union_controlnet = ControlNetUnionModel.from_pretrained(
                "xinsir/controlnet-union-sdxl-1.0", 
                torch_dtype=torch.float16
            )
            pipeline = StableDiffusionXLControlNetUnionPipeline.from_pipe(
                self.base_pipeline, 
                controlnet=union_controlnet
            )
            control_images = [cn.control_image for cn in controlnets]
            control_modes = [cn.union_control_mode for cn in controlnets]
            control_guidance_start = [cn.control_guidance_start for cn in controlnets]
            control_guidance_end = [cn.control_guidance_end for cn in controlnets]
            
            return pipeline, {
                "image": control_images,
                "control_mode": control_modes,
                "controlnet_conditioning_scale": [cn.controlnet_conditioning_scale for cn in controlnets],
                "control_guidance_start": control_guidance_start,
                "control_guidance_end": control_guidance_end
            }
        else:
            # Single ControlNet
            cn = controlnets[0]
            if cn.model:
                controlnet = ControlNetModel.from_pretrained(cn.model, torch_dtype=torch.float16)
            else:
                controlnet = ControlNetUnionModel.from_pretrained(
                    "xinsir/controlnet-union-sdxl-1.0", 
                    torch_dtype=torch.float16
                )
            
            pipeline = StableDiffusionXLControlNetPipeline.from_pipe(
                self.base_pipeline, 
                controlnet=controlnet
            )
            
            return pipeline, {
                "image": cn.control_image,
                "controlnet_conditioning_scale": cn.controlnet_conditioning_scale,
                "control_guidance_start": cn.control_guidance_start,
                "control_guidance_end": cn.control_guidance_end
            }

    def generate(
        self,
        prompt: str,
        negative_prompt: Optional[str] = None,
        num_inference_steps: int = 25,
        guidance_scale: float = 8.0,
        seed: Optional[int] = None,
        controlnets: Optional[List[ControlNetParams]] = None,
        loras: Optional[List[LoraParams]] = None
    ) -> Dict[str, Any]:
        """Generate an image based on the provided parameters."""
        try:
            # Start fresh - unload any existing LoRAs from the base pipeline
            self._unload_all_loras(self.base_pipeline)
            
            # Set up the pipeline
            if controlnets and len(controlnets) > 0:
                pipeline, control_kwargs = self._setup_controlnet_pipeline(controlnets)
                # Also unload LoRAs from the controlnet pipeline
                self._unload_all_loras(pipeline)
            else:
                pipeline = self.base_pipeline
                control_kwargs = {}

            # Load LoRAs if provided (after unloading previous ones)
            if loras and len(loras) > 0:
                self._load_loras(loras, pipeline)

            # Configure scheduler
            pipeline.scheduler = DDIMScheduler.from_config(pipeline.scheduler.config)

            # Set up generator for reproducibility
            generator = None
            if seed is not None:
                generator = torch.Generator(device=self.device).manual_seed(seed)

            # Generate image
            result = pipeline(
                prompt=prompt,
                negative_prompt=negative_prompt,
                num_inference_steps=num_inference_steps,
                guidance_scale=guidance_scale,
                generator=generator,
                **control_kwargs
            )

            image = result.images[0]

            # Convert to base64
            buffer = BytesIO()
            image.save(buffer, format="PNG")
            img_str = base64.b64encode(buffer.getvalue()).decode("utf-8")

            return {"image": img_str}

        except Exception as e:
            return {"error": str(e)}

# Global generator instance
generator = None

def get_generator():
    """Get or create the global generator instance."""
    global generator
    if generator is None:
        generator = Generator()
    return generator

def runpod_handler(job):
    """RunPod serverless handler function."""
    try:
        input_data = job.get("input", {})
        
        # Validate input using Pydantic
        try:
            request = GenerateRequest(input=InputParams(**input_data))
        except ValidationError as e:
            return {"error": f"Invalid input: {str(e)}"}
        
        params = request.input
        gen = get_generator()
        
        # Generate image
        result = gen.generate(
            prompt=params.prompt,
            negative_prompt=params.negative_prompt,
            guidance_scale=params.guidance_scale or 8.0,
            num_inference_steps=params.num_inference_steps or 25,
            seed=params.seed,
            controlnets=params.controlnets,
            loras=params.loras
        )
        
        return result
        
    except Exception as e:
        return {"error": str(e)}

# FastAPI app for local development
app = FastAPI(title="SDXL Worker", description="SDXL Image Generation API")

@app.post("/generate")
async def generate_image(request: GenerateRequest):
    """Generate an image from text prompt."""
    try:
        gen = get_generator()
        result = gen.generate(
            prompt=request.input.prompt,
            negative_prompt=request.input.negative_prompt,
            guidance_scale=request.input.guidance_scale or 8.0,
            num_inference_steps=request.input.num_inference_steps or 25,
            seed=request.input.seed,
            controlnets=request.input.controlnets,
            loras=request.input.loras
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import argparse
    import sys
    
    parser = argparse.ArgumentParser(description="Run SDXL inference pipeline")
    parser.add_argument("--mode", choices=["server", "runpod"], default="server", 
                       help="Run mode: server for local development, runpod for serverless")
    parser.add_argument("--host", default="0.0.0.0", help="Host for local server")
    parser.add_argument("--port", default=8000, type=int, help="Port for local server")
    parser.add_argument("--model", default="stabilityai/stable-diffusion-xl-base-1.0", 
                       help="Base model path or identifier")
    
    args = parser.parse_args()
    
    if args.mode == "server":
        print(f"Starting local development server on {args.host}:{args.port}")
        uvicorn.run(app, host=args.host, port=args.port)
    elif args.mode == "runpod":
        print("Starting RunPod serverless handler")
        runpod.serverless.start({"handler": runpod_handler})
    else:
        print("Invalid mode. Use --mode server or --mode runpod")
        sys.exit(1)