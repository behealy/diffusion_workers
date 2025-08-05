from pipelinewrapper import SdxlControlnetUnionPipelineWrapper
import argparse

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Preload pipelines")
    parser.add_argument("--model", default="stable-diffusion-v1-5/stable-diffusion-v1-5", 
                       help="Base model path or identifier")
    
    args = parser.parse_args()
    SdxlControlnetUnionPipelineWrapper(args.model)