from pydantic import ValidationError
import runpod

from models import ImageGenerateRequest, ImageGenerationParams
from .diffusion_service import DiffusionService
from .pipelinewrapper import SdxlControlnetUnionPipelineWrapper


def runpod_handler(job):
    """RunPod serverless handler function."""
    try:
        input_data = job.get("input", {})

        # Validate input using Pydantic
        try:
            request = ImageGenerateRequest(input=ImageGenerationParams(**input_data))
        except ValidationError as e:
            return {"error": f"Invalid input: {str(e)}"}

        params = request.input
        gen = DiffusionService(
            pipeline_wrapper=SdxlControlnetUnionPipelineWrapper(base_model=base_model)  # TODO use base model loaded from a config
        )

        # Generate image
        result = gen.generate(
            input_params=params
        )

        return result

    except Exception as e:
        return {"error": str(e)}

# Use the integrated handler from piperunner
handler = runpod_handler

if __name__ == "__main__":
    runpod.serverless.start({"handler": handler})