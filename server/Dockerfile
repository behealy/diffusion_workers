FROM nvidia/cuda:12.1.1-cudnn8-runtime-ubuntu22.04

RUN apt-get update && apt-get install -y wget

# Install uv
RUN wget -qO- https://astral.sh/uv/install.sh | sh && source $HOME/.local/bin/env

COPY pyproject.toml /pyproject.toml
COPY requirements.txt /requirements.txt
COPY src /src
RUN uv install -r /requirements.txt

# Start the serverless handler
CMD ["uv", "run", "/src/handler.py"]