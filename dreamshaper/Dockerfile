FROM nvidia/cuda:12.1.1-cudnn8-runtime-ubuntu22.04

RUN apt-get update && apt-get install -y wget

# Install uv
RUN wget -qO- https://astral.sh/uv/install.sh | sh && source $HOME/.local/bin/env