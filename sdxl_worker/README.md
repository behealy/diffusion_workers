# SDXL Worker

A RunPod serverless worker for Stable Diffusion XL image generation with support for LoRAs and ControlNet.

## Features

- **Text-to-Image Generation**: Generate high-quality images from text prompts using SDXL
- **LoRA Support**: Load multiple LoRA adapters dynamically per request
- **ControlNet Integration**: Support for single and multiple ControlNet inputs
- **Local Development Server**: Built-in FastAPI server for testing
- **RunPod Integration**: Ready for serverless deployment

## Usage

### Local Development

Start a local development server on port 8000:

```bash
cd sdxl_worker
uv run src/piperunner.py --mode server --port 8000
```

Test the API:

```bash
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "prompt": "A beautiful sunset over mountains, highly detailed, 8k",
      "negative_prompt": "blurry, low quality",
      "num_inference_steps": 25,
      "guidance_scale": 7.5,
      "seed": 12345
    }
  }'
```

### RunPod Deployment

The worker is designed to run as a RunPod serverless function:

```bash
uv run src/handler.py
```

### Request Format

The API accepts the following parameters:

```json
{
  "input": {
    "prompt": "Required text prompt",
    "negative_prompt": "Optional negative prompt",
    "guidance_scale": 7.5,
    "num_inference_steps": 25,
    "seed": 12345,
    "loras": [
      {
        "model": "huggingface-repo/lora-name",
        "weight_name": "lora_weights.safetensors"
      }
    ],
    "controlnets": [
      {
        "control_image": "base64_encoded_image",
        "model": "controlnet-model-path",
        "controlnet_conditioning_scale": 1.0,
        "control_guidance_start": 0.0,
        "control_guidance_end": 1.0,
        "union_control_mode": 0
      }
    ]
  }
}
```

### ControlNet Modes

When using Union ControlNet, specify the control mode:
- 0: OpenPose
- 1: Depth
- 2: HED/Scribble/Ted
- 3: Canny/Lineart/Anime Lineart/MLSD
- 4: Normal
- 5: Segmentation

## Architecture

- **`src/piperunner.py`**: Main pipeline runner with generator class and API endpoints
- **`src/handler.py`**: RunPod serverless handler wrapper
- **`src/request.py`**: Pydantic models for request/response validation

## Dependencies

- PyTorch with CUDA support
- HuggingFace Diffusers
- FastAPI and Uvicorn for local development
- RunPod SDK for serverless deployment
- Pydantic for request validation

## Development

Install dependencies:
```bash
uv sync
```

The system automatically:
- Unloads all LoRAs before each request to ensure clean state
- Loads new LoRAs as specified in the request
- Handles both single and multiple ControlNet configurations
- Provides proper error handling and validation