# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a diffusion workers project that provides serverless image generation workers using various diffusion models on the RunPod platform. The project processes text prompts to generate and return images, designed specifically for scalable GPU-based inference.

**Key Technologies:**
- Python 3.11+ with PyTorch and CUDA support
- HuggingFace Diffusers library for image generation pipelines
- RunPod serverless framework for deployment
- UV package manager for dependency management
- Docker containerization with NVIDIA CUDA runtime

## Architecture
### Server TODOs
0. [] Find a way to preserve types from the generated openapi client during dev
1. [] Load models at build time based on a config file containing lists of models. These will be YAML files.
2. [] Multiple base model swapping with maximal pipeline resource reuse when switching.
3. [] Full Runpod load-balancing serverless worker api 
4. [] Upscaler
5. [] Test and fix inpainting
6. [] Implement multiple controlnets. Test and fix controlnet. 
7. [] Prompt weighting
8. [] Have the usage and params of DeepCache in pipelinewrapper.py be influenced by request arguments

### Client TODOs
1. [] Build it.




### Core Components

The project follows a modular architecture with separate concerns:

## Development Commands

### Environment Setup
```bash
cd sdxl_worker
uv sync  # Install dependencies
```

### Local Development
```bash
# Run the diffusion service with FastAPI server for testing
uv run server/diffusion_service.py --host 0.0.0.0 --port 8000 --model "stabilityai/stable-diffusion-xl-base-1.0"

# Test RunPod handler locally (uses test_input.json format)
uv run src/handler.py
```

### Docker Operations
```bash
# Build container
docker build -t sdxl-worker .

# Run container with GPU support
docker run --gpus all -p 8000:8000 sdxl-worker
```

### Testing
- Use `test_input.json` for sample request format
- Local development server provides `/generate` and `/memory-info` endpoints
- No formal test suite currently implemented
- Manual testing through RunPod interface or local FastAPI server

## Key Development Patterns

### Pipeline Architecture
The system uses multiple pipeline variants to handle different generation modes:
- Text-to-Image (T2I)
- Image-to-Image (I2I)
- Inpainting
- Each with optional ControlNet support

### Memory Management
- Models use `torch.float16` and `variant="fp16"` for memory efficiency
- Pipeline variants are created from a base pipeline using `from_pipe()` to share weights
- Optional `torch.compile` optimization when `DO_TORCH_COMPILE` environment variable is set
- LoRAs are unloaded before each request to ensure clean state

### ControlNet Processing
- Supports both single ControlNet and Union ControlNet modes
- Union ControlNet allows multiple control types through mode selection
- Control image preprocessing handled by `ControlnetSetupHandler` (inherited by `DiffusionService`)

### Error Handling
All handlers return structured error responses rather than raising exceptions to maintain API compatibility with RunPod's serverless framework.
