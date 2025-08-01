# Diffusion Workers Project Guide

## 1. Project Overview
This project houses image generation workers using various diffusion models. It processes text prompts to generate and return images, designed to run on the RunPod serverless platform.

**Key Technologies:**
- Python 3.10
- PyTorch with CUDA support
- HuggingFace Diffusers library
- RunPod serverless framework
- Docker for containerization

# Documentation
## Diffusers Documentation Links
### Get started
- [Diffusers](docs/hf_diffusers/index.md)
- [Installation](docs/hf_diffusers/installation.md)
- [Quicktour](docs/hf_diffusers/quicktour.md)
- [Effective and efficient diffusion](docs/hf_diffusers/stable_diffusion.md)

### DiffusionPipeline
- [Load pipelines](docs/hf_diffusers/using-diffusers/loading.md)
- [AutoPipeline](docs/hf_diffusers/tutorials/autopipeline.md)
- [Load community pipelines and components](docs/hf_diffusers/using-diffusers/custom_pipeline_overview.md)
- [Pipeline callbacks](docs/hf_diffusers/using-diffusers/callback.md)
- [Reproducible pipelines](docs/hf_diffusers/using-diffusers/reusing_seeds.md)
- [Load schedulers and models](docs/hf_diffusers/using-diffusers/schedulers.md)
- [Scheduler features](docs/hf_diffusers/using-diffusers/scheduler_features.md)
- [Model files and layouts](docs/hf_diffusers/using-diffusers/other-formats.md)
- [Push files to the Hub](docs/hf_diffusers/using-diffusers/push_to_hub.md)

### Adapters
- [LoRA](docs/hf_diffusers/tutorials/using_peft_for_inference.md)
- [IP-Adapter](docs/hf_diffusers/using-diffusers/ip_adapter.md)
- [ControlNet](docs/hf_diffusers/using-diffusers/controlnet.md)
- [T2I-Adapter](docs/hf_diffusers/using-diffusers/t2i_adapter.md)
- [DreamBooth](docs/hf_diffusers/using-diffusers/dreambooth.md)
- [Textual inversion](docs/hf_diffusers/using-diffusers/textual_inversion_inference.md)

### Inference
- [Prompt techniques](docs/hf_diffusers/using-diffusers/weighted_prompts.md)
- [Create a server](docs/hf_diffusers/using-diffusers/create_a_server.md)
- [Batch inference](docs/hf_diffusers/using-diffusers/batched_inference.md)
- [Distributed inference](docs/hf_diffusers/training/distributed_inference.md)
- [Scheduler features](docs/hf_diffusers/using-diffusers/scheduler_features.md)
- [Pipeline callbacks](docs/hf_diffusers/using-diffusers/callback.md)
- [Reproducible pipelines](docs/hf_diffusers/using-diffusers/reusing_seeds.md)
- [Controlling image quality](docs/hf_diffusers/using-diffusers/image_quality.md)

### Inference optimization
- [Accelerate inference](docs/hf_diffusers/optimization/fp16.md)
- [Caching](docs/hf_diffusers/optimization/cache.md)
- [Reduce memory usage](docs/hf_diffusers/optimization/memory.md)
- [Compile and offloading quantized models](docs/hf_diffusers/optimization/speed-memory-optims.md)
- [Community optimizations](docs/hf_diffusers/optimization/pruna.md)

### Hybrid Inference
- [Overview](docs/hf_diffusers/hybrid_inference/overview.md)
- [VAE Decode](docs/hf_diffusers/hybrid_inference/vae_decode.md)
- [VAE Encode](docs/hf_diffusers/hybrid_inference/vae_encode.md)
- [API Reference](docs/hf_diffusers/hybrid_inference/api_reference.md)

### Modular Diffusers
- [Overview](docs/hf_diffusers/modular_diffusers/overview.md)
- [Modular Pipeline](docs/hf_diffusers/modular_diffusers/modular_pipeline.md)
- [Components Manager](docs/hf_diffusers/modular_diffusers/components_manager.md)
- [Modular Diffusers States](docs/hf_diffusers/modular_diffusers/modular_diffusers_states.md)
- [Pipeline Block](docs/hf_diffusers/modular_diffusers/pipeline_block.md)
- [Sequential Pipeline Blocks](docs/hf_diffusers/modular_diffusers/sequential_pipeline_blocks.md)
- [Loop Sequential Pipeline Blocks](docs/hf_diffusers/modular_diffusers/loop_sequential_pipeline_blocks.md)
- [Auto Pipeline Blocks](docs/hf_diffusers/modular_diffusers/auto_pipeline_blocks.md)
- [End-to-End Example](docs/hf_diffusers/modular_diffusers/end_to_end_guide.md)

### Training
- [Overview](docs/hf_diffusers/training/overview.md)
- [Create a dataset for training](docs/hf_diffusers/training/create_dataset.md)
- [Adapt a model to a new task](docs/hf_diffusers/training/adapt_a_model.md)
- [Train a diffusion model](docs/hf_diffusers/tutorials/basic_training.md)
- [Models](docs/hf_diffusers/training/unconditional_training.md)
- [Methods](docs/hf_diffusers/training/text_inversion.md)

### Quantization
- [Getting started](docs/hf_diffusers/quantization/overview.md)
- [bitsandbytes](docs/hf_diffusers/quantization/bitsandbytes.md)
- [gguf](docs/hf_diffusers/quantization/gguf.md)
- [torchao](docs/hf_diffusers/quantization/torchao.md)
- [quanto](docs/hf_diffusers/quantization/quanto.md)

### Model accelerators and hardware
- [JAX/Flax](docs/hf_diffusers/using-diffusers/stable_diffusion_jax_how_to.md)
- [ONNX](docs/hf_diffusers/optimization/onnx.md)
- [OpenVINO](docs/hf_diffusers/optimization/open_vino.md)
- [Core ML](docs/hf_diffusers/optimization/coreml.md)
- [Metal Performance Shaders (MPS)](docs/hf_diffusers/optimization/mps.md)
- [Intel Gaudi](docs/hf_diffusers/optimization/habana.md)
- [AWS Neuron](docs/hf_diffusers/optimization/neuron.md)

### Specific pipeline examples
- [ConsisID](docs/hf_diffusers/using-diffusers/consisid.md)
- [Stable Diffusion XL](docs/hf_diffusers/using-diffusers/sdxl.md)
- [SDXL Turbo](docs/hf_diffusers/using-diffusers/sdxl_turbo.md)
- [Kandinsky](docs/hf_diffusers/using-diffusers/kandinsky.md)
- [OmniGen](docs/hf_diffusers/using-diffusers/omnigen.md)
- [PAG](docs/hf_diffusers/using-diffusers/pag.md)
- [Latent Consistency Model](docs/hf_diffusers/using-diffusers/inference_with_lcm.md)
- [Shap-E](docs/hf_diffusers/using-diffusers/shap-e.md)
- [DiffEdit](docs/hf_diffusers/using-diffusers/diffedit.md)
- [Trajectory Consistency Distillation-LoRA](docs/hf_diffusers/using-diffusers/inference_with_tcd_lora.md)
- [Stable Video Diffusion](docs/hf_diffusers/using-diffusers/svd.md)
- [Marigold Computer Vision](docs/hf_diffusers/using-diffusers/marigold_usage.md)

### Resources
- [Task recipes](docs/hf_diffusers/using-diffusers/unconditional_image_generation.md)
- [Projects built with Diffusers](docs/hf_diffusers/community_projects.md)
- [Philosophy](docs/hf_diffusers/conceptual/philosophy.md)
- [Controlled generation](docs/hf_diffusers/using-diffusers/controlling_generation.md)
- [How to contribute?](docs/hf_diffusers/conceptual/contribution.md)
- [Diffusers' Ethical Guidelines](docs/hf_diffusers/conceptual/ethical_guidelines.md)
- [Evaluating Diffusion Models](docs/hf_diffusers/conceptual/evaluation.md)

### API
- [Main Classes](docs/hf_diffusers/api/configuration.md)
- [Loaders](docs/hf_diffusers/api/loaders/ip_adapter.md)
- [Models](docs/hf_diffusers/api/models/overview.md)
- [Pipelines](docs/hf_diffusers/api/pipelines/overview.md)
- [Schedulers](docs/hf_diffusers/api/schedulers/overview.md)
- [Internal classes](docs/hf_diffusers/api/internal_classes_overview.md)