# AGENTS.md

## Build & Test Commands

### Environment Setup
```bash
cd server
uv sync  # Install dependencies
```

### Local Development
```bash
# Run FastAPI server for testing
uv --directory server run diffusion_service.py --host 0.0.0.0 --port 8000 --model "Lykon/dreamshaper-8"

# Test RunPod handler (uses server/test_inputs/*.json format)
uv --directory server run handler.py
```

### OpenAPI Client Generation
```bash
# Build and install in editable mode
./build.sh

# Production build with wheel installation
./build.sh install_openapi_lib
```

### Docker Operations
```bash
cd server
docker build -t sdxl-worker .
docker run --gpus all -p 8000:8000 sdxl-worker
```

## Running Tests

The project uses direct script execution for testing. Run specific tests by invoking handler.py with test input files:

```bash
# Run with specific test input
uv --directory server run handler.py --test_input server/test_inputs/test_data.json

# Test with SD1.5 specific parameters
uv --directory server run handler.py --test_input server/test_inputs/sd15_test.json

# Test with ControlNet
uv --directory server run handler.py --test_input server/test_inputs/sd15_test_cn.json
```

Local development server provides `/generate` and `/memory-info` endpoints for manual testing:
```bash
curl -X POST http://localhost:8000/image-to-image \
  -H "Content-Type: application/json" \
  -d @server/test_inputs/test_data.json
```

## Code Style Guidelines

### Imports
- Order: Standard library → Third-party → Local imports
- Use `from X import Y` instead of `import X; X.Y`
- Group imports alphabetically within sections
- Example:
```python
import datetime  # Standard library
import torch
from typing import List, Optional  # Third-party

from pipeline_factory import PipelineFactory  # Local
from server.utils import load_image  # Relative imports
```

### Type Annotations
- Use type hints for all function parameters and returns
- Prefer `typing` module over built-in generics (`list`, `dict`, `tuple`)
- Use `|` union operator for Python 3.10+: `str | None` instead of `Optional[str]`
- Use `Any` sparingly, prefer specific types

### Naming Conventions
- Classes: PascalCase (`ImageGenService`, `PipelineFactory`)
- Functions: snake_case (`load_image_from_base64_or_url`, `resolve_device`)
- Variables: snake_case with descriptive names
- Constants: UPPER_SNAKE_CASE for configuration values
- Enums: PascalCase (`OpStatus`, `OpResult`)

### Error Handling
```python
# Preferred pattern for RunPod serverless handlers
try:
    result = service.rp_worker_generate(job)
except ValidationError as e:
    return {"error": f"Invalid input: {str(e)}"}
except Exception as e:
    return {"error": str(e)}

# Alternative: FastAPI-style with HTTPException
@app.post("/text-to-image")
async def generate_image(request: ImageGenerateRequest):
    try:
        if not request.input.image_to_image:
            raise HTTPException(status_code=422, detail="Input required.")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### Formatting
- Use 4-space indentation (standard Python)
- Line length: ~88 characters (PEP 8 style)
- Maximum one argument per line; wrap with parentheses for continuation
- String literals in double quotes for easy escaping
- f-strings for string interpolation

### Pydantic Validation
```python
from pydantic import ValidationError, BaseModel

class ImageGenerationParams(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = None
    # ... other fields

# Validate via exception handling
try:
    params = ImageGenerationParams(**input_dict)
except ValidationError as e:
    return {"error": f"Invalid input: {str(e)}"}
```

### Error Result Patterns
- Use `OpResult` and `OpStatus` enum for structured responses
- Avoid returning dictionaries with error flags; use actual Exception objects locally
- Export errors to the caller via `runpod.serverless.start()` framework

## Architecture Notes

### Pipeline Factory Pattern
```python
# Service uses factory to create appropriate pipeline for inputs
pipe = self.pipeline_factory.get_pipeline_for_inputs(input_params)
result = pipe(prompt=prompt, **kwargs)
```

### ControlNet Processing
- Union ControlNet mode: select mode 0-5 via request parameter
- Preprocessing handled by `ControlnetGuideImagePreprocessor` classes
- Multiple ControlNets supported through factory pattern

### Memory Management
- Use `torch.float16` for model loading (`variant="fp16"`)
- Call `load_model()` and cleanup functions before each request
- Unload previous LoRAs before loading new ones

## Code Generation Workflow

When modifying API specification:
1. Edit `openapi/ez_diffusion_api.yaml`
2. Run `./build.sh` to regenerate Python client (`ez_diffusion_client`)
3. Update server code to use generated types from client library
4. Test with local development server before deploying

### Generated Client Location
- Python: `server/openapi/client_libs/python/ez_diffusion_client/`
- TypeScript: `openapi/client_libs/typescript/`
