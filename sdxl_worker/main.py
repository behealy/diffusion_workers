"""
SDXL Worker Entry Point

This file serves as an alternative entry point for the SDXL worker.
The main functionality is now in src/piperunner.py

Usage:
  - For RunPod serverless: python -m src.handler
  - For local development: python -m src.piperunner --mode server
"""

def main():
    print("SDXL Worker - use 'python -m src.piperunner --help' for available options")

if __name__ == "__main__":
    main()
