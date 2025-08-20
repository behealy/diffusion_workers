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
- FastAPI for local development server
- OpenAPI code generation for client libraries

## Architecture

### Core Components

The project follows a modular architecture with three main directories:

**`server/`** - Main diffusion service implementation
- `diffusion_service.py` - Core image generation service with FastAPI endpoints
- `handler.py` - RunPod serverless wrapper for the diffusion service
- `pipeline_factory.py` - Factory classes for creating diffusion pipelines (SDXL, SD1.5, Flux)
- `controlnet_params_factory.py` - ControlNet preprocessing and parameter handling
- `model_loading/` - YAML configuration files defining model loading manifests
- `test_inputs/` - Sample JSON files for testing different generation modes

**`openapi/`** - API specification and generated client libraries
- `ez_diffusion_api.yaml` - OpenAPI 3.0 specification
- `client_libs/python/` - Auto-generated Python client (`ez_diffusion_client`)
- `client_libs/typescript/` - Auto-generated TypeScript client

**`basic_client/` and `web_gen_client/`** - Client implementation directories

### Pipeline Architecture
The system uses multiple pipeline variants to handle different generation modes:
- Text-to-Image (T2I) 
- Image-to-Image (I2I)
- Inpainting
- Each with optional ControlNet support (single or Union ControlNet)
- Support for Stable Diffusion 1.5, SDXL, and Flux models

### Memory Management
- Models use `torch.float16` and `variant="fp16"` for memory efficiency
- Pipeline variants are created from a base pipeline using `from_pipe()` to share weights
- Optional `torch.compile` optimization when `DO_TORCH_COMPILE` environment variable is set
- LoRAs are unloaded before each request to ensure clean state
- DeepCache integration for optimization (configurable via request parameters)

## Development Commands

### Environment Setup
```bash
cd server
uv sync  # Install dependencies
```

### Local Development
```bash
# Run the diffusion service with FastAPI server for testing
./run_server.sh
# This runs: uv --directory server run diffusion_service.py --host 0.0.0.0 --port 8000 --model "Lykon/dreamshaper-8"

# Test RunPod handler locally (uses test_inputs/*.json format)
uv --directory server run handler.py
```

### OpenAPI Client Generation
```bash
# Build and install OpenAPI client libraries
./build.sh  # Default: installs in editable mode for development
./build.sh install_openapi_lib  # Builds wheel and installs for production
```

### Docker Operations
```bash
cd server
docker build -t sdxl-worker .
docker run --gpus all -p 8000:8000 sdxl-worker
```

### Testing
- Use `server/test_inputs/*.json` for sample request formats:
  - `test_data.json` - Basic text-to-image
  - `sd15_test.json` - SD1.5 specific
  - `sd15_test_cn.json` - SD1.5 with ControlNet
  - `sd15_i2i.json` - Image-to-image
- Local development server provides `/generate` and `/memory-info` endpoints
- Test with: `curl -X POST http://localhost:8000/generate -H "Content-Type: application/json" -d @server/test_inputs/test_data.json`

## Key Development Patterns

### ControlNet Processing
- Supports both single ControlNet and Union ControlNet modes
- Union ControlNet allows multiple control types through mode selection (0-5 for different control modes)
- Control image preprocessing handled by `ControlnetGuideImagePreprocessor` classes
- Automatic image preprocessing for various ControlNet types (canny, depth, pose, etc.)

### Model Loading Configuration
- YAML manifest files in `server/model_loading/` define model loading configurations
- Support for multiple base models with shared pipeline resources
- Dynamic LoRA loading/unloading per request

### Error Handling
All handlers return structured `OpResult` responses with `OpStatus` enum rather than raising exceptions to maintain API compatibility with RunPod's serverless framework.

### Code Generation Workflow
The project uses OpenAPI code generation to maintain type safety:
1. Edit `openapi/ez_diffusion_api.yaml` to modify API specification
2. Run `./build.sh` to regenerate client libraries
3. The generated `ez_diffusion_client` package provides typed models used throughout the server code
