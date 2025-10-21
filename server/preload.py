from pipeline_factory import SDImagePipelineFactory
import argparse
import torch
import yaml
from diffusers import AutoPipeline, ControlNetModel


def load_models_from_manifest(file_path):
    """
    Load a YAML config file and process base models and controlnets.
    Args:
        file_path (str): Path to the local YAML file
        
    Returns:
        dict: Dictionary containing processed models and data
    """
    # 1. Read and parse YAML file    with open(file_path, 'r') as file:
    config = yaml.safe_load(file_path)
    
    # 2. Process base models    base_models = {}
    if 'base_models' in config and config['base_models']:
        for model_config in config['base_models']:
            hf_repo = model_config.get('hf_repo')
            if hf_repo:
                try:
                # Load pipeline for each base model
                    pipeline = AutoPipeline.from_pretrained(hf_repo,
                        torch_dtype=torch.float16,
                        variant="fp16",
                        safety_checker=None,
                        requires_safety_checker=False,)  
                    print(f"Loaded base model from {hf_repo}")
                except Exception as e:
                    print(f"Failed to load base model from {hf_repo}: {e}")
    
    # 3. Process controlnets
    controlnets = {}
    if 'controlnets' in config and config['controlnets']:
        for controlnet_config in config['controlnets']:
            hf_repo = controlnet_config.get('hf_repo')
            if hf_repo:
                try:
                     # Load controlnet for each entry
                    controlnet = ControlNetModel.from_pretrained(hf_repo, torch_dtype=torch.float16)
                    controlnets[hf_repo] = controlnet 
                    print(f"Loaded controlnet from {hf_repo}")
                except Exception as e:
                    print(f"Failed to load controlnet from {hf_repo}: {e}")

# Example usage:
# result = load_and_process_yaml_config('path/to/your/config.yaml')
# print(result['name'])
# print(f"Loaded {len(result['base_models'])} base models")
# print(f"Loaded {len(result['controlnets'])} controlnets")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Preload pipelines")
    # parser.add_argument("--manifest", default="model_loading/sd15_extended.yaml", help="manifest file")
    # args = parser.parse_args()
    # SdxlControlnetUnionPipelineWrapper(args.model)

    parser.add_argument("--handler_type", default="test", help="The handler type that should be started")
    args = parser.parse_args()
    if args.handler_type == "image":
        # TODO
        pass
    elif args.handler_type == "video":
        from videogen_service import VideoGenService
        video_gen_service = VideoGenService()
        result = video_gen_service.load_models()

