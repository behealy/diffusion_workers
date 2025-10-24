FROM nvidia/cuda:12.1.1-cudnn8-runtime-ubuntu22.04

RUN apt-get update && apt-get install -y wget

ARG PRELOAD_MANIFEST
ENV PRELOAD_MANIFEST=${PRELOAD_MANIFEST}
ENV WORKFLOW_MANIFESTS_FOLDER=model_loading

# Install uv
RUN wget -qO- https://astral.sh/uv/install.sh | sh
ENV PATH="$PATH:/root/.local/bin"

COPY pyproject.toml /pyproject.toml
COPY .python-version /.python-version
# COPY src /src
COPY handler.py /handler.py
COPY preload.py /preload.py

RUN uv run preload.py --manifest ${PRELOAD_MANIFEST} 

# Start the serverless handler
CMD ["uv", "run", "/handler.py", "--manifest", $PRELOAD_MANIFEST] 