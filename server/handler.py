import runpod
import asyncio
from typing import Any, List
from pydantic import ValidationError
from ez_diffusion_client import ImageGenerateRequest, ImageGenerationParams
from imagegen_service import ImageGenService
from pipeline_factory import SDImagePipelineFactory
from controlnet_factory import SD15Fp16ControlNetGetter, SDXLFp16ControlNetUnionGetter
from controlnet_params_factory import MultiModelControlnetParamsFactory, ControlnetUnionParamsFactory
from ltxv_service import LTXVideoService
from wan_videogen_service import WanVideoGenService


def get_handler_type_from_manifest(manifest):
    handler_type = None
    if manifest:
        handler_type = manifest.get("base_model_type", None)
    return handler_type

def get_service_params_from_manifest(manifest):
    handler_type = get_handler_type_from_manifest(manifest)
    base_model = "Lykon/dreamshaper-8"
    if manifest: 
        pipes: List[Any] = manifest.get("pipelines", [])
        base_model = next((p.get("hf_repo") for p in pipes if p.get("hf_repo")), base_model)

    if handler_type == "sdxl":
        return { 
            "base_model": base_model,
            "pipeline_factory": SDImagePipelineFactory(
                base_model=base_model,
                get_controlnet=SDXLFp16ControlNetUnionGetter()
            ),
            "controlnet_params_factory": ControlnetUnionParamsFactory()
        }
    else:
        return {
            "base_model": base_model,
            "pipeline_factory": SDImagePipelineFactory(
                base_model=base_model,
                get_controlnet=SD15Fp16ControlNetGetter()
            ),
            "controlnet_params_factory": MultiModelControlnetParamsFactory()
        }
    
def get_service_from_manifest(manifest):
    params = get_service_params_from_manifest(manifest)
    try:
        return ImageGenService(
            pipeline_factory=params.pop("pipeline_factory"),
            controlnet_params_factory=params.pop("controlnet_params_factory")
        )
    except KeyError as e:
        return None



async def test_handler(job):
    input = job["input"]
    prompt = input.get("prompt")
    steps = input.get("steps")
    for i in range(steps):
        # Generate an asynchronous output token
        output = f"Generate step {i}"
        yield output
        
        # Simulate an asynchronous task
        await asyncio.sleep(1)

if __name__ == "__main__":
    import argparse
    import os
    import yaml
    parser = argparse.ArgumentParser(description="Run main handler")
    parser.add_argument("--manifest", default="basic", help="The manifest that defines what pipelines the service should run")
    args = parser.parse_args()

    manifests_folder = os.environ.get("WORKFLOW_MANIFESTS_FOLDER", "model_loading")

    manifest = None
    manifest_name = args.manifest
    manifest_path = f"{manifests_folder}/{manifest_name}.yaml"
    try: 
        print(f"Loading manifest from: {manifest_path}")
        with open(manifest_path, 'r') as file:
            manifest = yaml.safe_load(file)
    except Exception as e:
        print(f"Failed to load manifest file given path: {manifest_path}. Error: {e}")

    handler_type = get_handler_type_from_manifest(manifest)

    service = None
    if handler_type == "wan22":
        service = WanVideoGenService()
    if handler_type == "ltxv":
        service = LTXVideoService()
    else: 
        service = get_service_from_manifest(manifest)

    if service is not None:
        svc = service
        svc.warmup()
        def handler(job):
            """RunPod serverless handler function."""
            try:
                 # Validate input using Pydantic
                try:
                    # Generate image
                    return svc.rp_worker_generate(job)
                except ValidationError as e:    
                    return {"error": f"Invalid input: {str(e)}"}
            except Exception as e:
                return {"error": str(e)}
            
        runpod.serverless.start({
            "handler": handler,
            "return_aggregate_stream": True
        })
    else:
        runpod.serverless.start({
            "handler": test_handler,
            "return_aggregate_stream": True
        })




