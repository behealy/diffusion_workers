# SDXL Worker Project Guide

## 1. Project Overview
This project is a serverless image generation worker using Stable Diffusion XL (SDXL) model. It processes text prompts to generate and return images, designed to run on the RunPod serverless platform.

**Key Technologies:**
- Python 3.10
- PyTorch with CUDA support
- HuggingFace Diffusers library
- RunPod serverless framework
- Stable Diffusion XL model

**High-level Architecture:**
- Docker container running a single Python handler file
- GPU-accelerated image generation pipeline
- REST API interface for input/output

# Documentation

- [Diffusers Documentation](docs/hf_diffusers/_toctree.yml)
