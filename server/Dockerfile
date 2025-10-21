FROM nvidia/cuda:12.1.1-cudnn8-runtime-ubuntu22.04

RUN apt-get update && apt-get install -y wget

# Install uv
RUN wget -qO- https://astral.sh/uv/install.sh | sh
ENV PATH="$PATH:/root/.local/bin"

COPY pyproject.toml /pyproject.toml
COPY .python-version /.python-version
# COPY src /src
COPY handler.py /handler.py

# Start the serverless handler
CMD ["uv", "run", "/handler.py"]