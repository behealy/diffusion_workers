import runpod
from .piperunner import runpod_handler

# Use the integrated handler from piperunner
handler = runpod_handler

if __name__ == "__main__":
    runpod.serverless.start({"handler": handler})