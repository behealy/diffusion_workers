# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set working directory
WORKDIR /

# Install system dependencies (e.g., for GPU support)
RUN apt-get update && \
    apt-get install -y --no-install-recommends libgl1 libglib2.0-0

# Install Python dependencies
RUN pip install --no-cache-dir runpod diffusers torch torchvision pillow

# Copy your handler file to the container
COPY rp_handler.py /rp_handler.py
COPY test_input.json /test_input.json

# Start the serverless handler
CMD ["python3", "-u", "/rp_handler.py"]