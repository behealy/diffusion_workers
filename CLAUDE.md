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

### Core Components

The project follows a modular architecture with separate concerns:

**`sdxl_worker/src/handler.py`** - Main RunPod serverless handler
- Loads SDXL model pipeline on container startup for efficiency
- Processes incoming requests with text prompts
- Returns base64-encoded PNG images
- Error handling for invalid inputs

**`sdxl_worker/src/piperunner.py`** - Advanced pipeline management
- `Generator` class for complex inference scenarios
- Support for multiple SDXL model variants
- ControlNet integration (single and union models)
- LoRA adapter support (currently commented out)
- Device detection (CUDA/MPS/CPU)

**`sdxl_worker/src/request.py`** - Request/response models
- Pydantic models for type-safe API contracts
- `ControlNetParams` for control image processing
- `LoraParams` for fine-tuned model adapters
- `InputParams` and `GenerateRequest` for request validation

### Model Support

- **Base Model**: Stable Diffusion XL (stabilityai/stable-diffusion-xl-base-1.0)
- **ControlNet**: Union ControlNet (xinsir/controlnet-union-sdxl-1.0) with 6 control modes:
  - 0: OpenPose
  - 1: Depth
  - 2: HED/Scribble/Ted
  - 3: Canny/Lineart/Anime Lineart/MLSD
  - 4: Normal
  - 5: Segmentation
- **Schedulers**: DDIM and Euler Discrete schedulers supported

## Development Commands

### Environment Setup
```bash
cd sdxl_worker
uv sync  # Install dependencies
```

### Local Development
```bash
# Run the basic handler locally
uv run main.py

# Run the advanced pipeline runner
uv run src/piperunner.py --sdxl_model_path "stabilityai/stable-diffusion-xl-base-1.0"

# Test with sample input
uv run src/handler.py  # Uses test_input.json format
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
- No formal test suite currently implemented
- Manual testing through RunPod interface or local execution

## Key Development Patterns

### Pipeline Initialization
Models are loaded once during container startup to minimize cold start times. The `AutoPipelineForText2Image.from_pretrained()` call is expensive and should remain outside request handlers.

### Memory Management
- Models use `torch.float16` and `variant="fp16"` for memory efficiency
- GPU memory is managed automatically by PyTorch
- Consider memory requirements when adding new model variants

### Error Handling
All handlers return structured error responses rather than raising exceptions to maintain API compatibility with RunPod's serverless framework.

### ControlNet Integration
The `Generator` class supports both single ControlNet and union ControlNet modes. Union mode allows multiple control types simultaneously but requires different parameter handling.

## Dependencies

Core dependencies managed in `pyproject.toml`:
- `diffusers[torch]>=0.34.0` - HuggingFace diffusion models
- `pydantic>=2.11.7` - Request/response validation
- `runpod>=1.7.13` - Serverless platform integration
- `transformers>=4.54.1` - Transformer models and utilities

## Documentation

Extensive HuggingFace Diffusers documentation is included in `docs/hf_diffusers/` covering:
- Pipeline usage and optimization
- Model loading and configuration
- ControlNet and adapter usage
- Training and fine-tuning guides
- Hardware acceleration options

Reference the `.continue/rules/CONTINUE.md` file for additional development context and documentation links.


# Clean code guide

## ✨ 1. **Meaningful Names**

* Use **descriptive, unambiguous names**.

  * ✅ `get_user_email()`
  * ❌ `getData()`
* Avoid abbreviations and encode no metadata (`user_age`, not `ua`).

---

## 📦 2. **Small Functions**

* Functions should be **small** and **do one thing**.
* Prefer **descriptive names** over long comments.
* Limit parameters (ideally ≤ 3).
* Extract logic into helper functions when needed.

---

## 🧱 3. **Single Responsibility Principle (SRP)**

* Each **function/class/module** should have **only one reason to change**.
* Don't mix concerns (e.g., don't fetch and format data in the same function).

---

## 📐 4. **Consistent Formatting**

* Use a linter/formatter (`black`, `prettier`, etc.).
* Maintain consistent **indentation, spacing, and brace styles**.
* Group related code visually.

---

## 🧹 5. **Avoid Code Smells**

* Don't use magic numbers or strings (use constants).
* Don’t repeat yourself (**DRY** principle).
* Don’t comment out code; use version control.

---

## 💬 6. **Comments (Use Sparingly)**

* Write code that **doesn’t need comments**.
* When used, comments should explain **why**, not what.
* Update or remove outdated comments.

---

## 🧪 7. **Write Tests**

* Write **unit tests** for logic-heavy code.
* Follow **Arrange-Act-Assert** pattern in tests.
* Test edge cases and failure modes.

---

## 🧰 8. **Use Exceptions, Not Error Codes**

* Handle errors with **exceptions**, not return values.
* Catch exceptions close to where they can be handled meaningfully.

---

## 🧼 9. **Keep Code Simple**

* Favor clarity over cleverness.
* Don’t over-abstract prematurely (YAGNI: *You Ain’t Gonna Need It*).
* Reduce nested blocks and deep indentation.

---

## 📦 10. **Organize Code Logically**

* Group related functions together.
* Keep public interfaces small and minimal.
* Use directories and modules to logically separate components.

---

## 🧠 Clean Code Philosophy

> "Clean code is simple and direct. Clean code reads like well-written prose." — *Robert C. Martin*