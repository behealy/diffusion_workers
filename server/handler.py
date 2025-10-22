from pydantic import ValidationError
import runpod

from ez_diffusion_client import ImageGenerateRequest, ImageGenerationParams
from imagegen_service import ImageGenService
from pipeline_factory import SDImagePipelineFactory
from controlnet_factory import SDXLFp16ControlNetUnionGetter
from controlnet_params_factory import MultiModelControlnetParamsFactory, ControlnetUnionParamsFactory


def sdxl_handler(job):
    """RunPod serverless handler function."""
    try:
        input_data = job.get("input", {})

        # Validate input using Pydantic
        try:
            request = ImageGenerateRequest(input=ImageGenerationParams(**input_data))
        except ValidationError as e:
            return {"error": f"Invalid input: {str(e)}"}

        params = request.input
        gen = ImageGenService(
            pipeline_factory=SDImagePipelineFactory(
                base_model="Lykon/dreamshaper-xl-1-0",
                get_controlnet=SDXLFp16ControlNetUnionGetter()
            ),  # TODO use base model loaded from a config
            controlnet_params_factory=ControlnetUnionParamsFactory()
        )

        # Generate image
        result = gen.generate(
            input_params=params
        )

        return result

    except Exception as e:
        return {"error": str(e)}

# # Use the integrated handler from piperunner
# handler = runpod_handler

# if __name__ == "__main__":
#     runpod.serverless.start({"handler": handler})

import runpod
import asyncio

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
    parser = argparse.ArgumentParser(description="Run main handler")
    parser.add_argument("--handler_type", default="test", help="The handler type that should be started")
    args = parser.parse_args()

    if args.handler_type == "test":
        runpod.serverless.start({
            "handler": test_handler,
            "return_aggregate_stream": True
        })
    elif args.handler_type == "sdxl":
        runpod.serverless.start({
            "handler": sdxl_handler,
            "return_aggregate_stream": True
        })




