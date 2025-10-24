def load_models_from_manifest(config):
    from huggingface_hub import hf_hub_download
    import torch
    from diffusers import ControlNetModel, AutoPipelineForText2Image

    """
    Load a YAML config file and process base models and controlnets.
    Args:
        config file
        
    Returns:
        dict: Dictionary containing processed models and data
    """

    if 'pipelines' in config and config['pipelines']:
        for model_config in config['pipelines']:
            hf_repo = model_config.get('hf_repo')
            if hf_repo:
                try:
                    print(f"Loading base model pipeline components for {hf_repo}")
                    pipeline = AutoPipelineForText2Image.from_pretrained(hf_repo,
                        torch_dtype=torch.float16,
                        variant="fp16",
                        safety_checker=None,
                        requires_safety_checker=False,)  
                    print(f"Loaded base model pipeline components for {hf_repo}")
                except Exception as e:
                    print(f"Failed to load base model from {hf_repo}: {e}")
    
    controlnets = {}
    if 'controlnets' in config and config['controlnets']:
        for controlnet_config in config['controlnets']:
            hf_repo = controlnet_config.get('hf_repo')
            if hf_repo:
                try:
                     # Load controlnet for each entry
                    print(f"Loading controlnet: {hf_repo}")
                    controlnet = ControlNetModel.from_pretrained(hf_repo, torch_dtype=torch.float16)
                    controlnets[hf_repo] = controlnet 
                    print(f"Loaded controlnet: {hf_repo}")
                except Exception as e:
                    print(f"Failed to load controlnet: {hf_repo}: {e}")

    loras = {}
    if 'loras' in config and config['loras']:
        for lora_config in config['loras']:
            hf_repo = lora_config.get('hf_repo')
            filename = lora_config.get('weight_name')
            if hf_repo and filename:
                fullpath = f"{hf_repo}/{filename}"
                try:
                    print(f"Loading LoRA: {fullpath}")
                    hf_hub_download(repo_id=hf_repo, filename=filename)
                    print(f"Successfully Loaded LoRA: {fullpath}")
                except Exception as e:
                    print(f"Failed to load LoRA {fullpath}: {e}")


if __name__ == "__main__":
    import os
    import yaml
    import argparse

    manifests_folder = os.environ.get("WORKFLOW_MANIFESTS_FOLDER", "model_loading")

    parser = argparse.ArgumentParser(description="Preload pipelines")
    parser.add_argument("--manifest", default="sdxl_extended")
    parser.add_argument("--forced_handler_type", default=None)
    args = parser.parse_args()

    manifest = None
    manifest = args.manifest
    manifest_path = f"{manifests_folder}/{manifest}.yaml"
    try: 
        print(f"Loading manifest from: {manifest_path}")
        with open(manifest_path, 'r') as file:
            manifest = yaml.safe_load(file)
    except Exception as e:
        print(f"Failed to load manifest file given path: {manifest_path}. Error: {e}")   
    
    handler_type = args.forced_handler_type

    if manifest is not None: 
        base_model_type = manifest.get("base_model_type")
        if base_model_type is not None: 
            handler_type = base_model_type

        print(f"Preload model manifest. Handler type: {handler_type}. Manifest: {manifest_path}")
        
        if handler_type == "sdxl":    
            try:
                load_models_from_manifest(manifest)
            except Exception as e:
                print(f"Failed to load models from manifest for given path: {manifest_path}. Error: {e}")   
        elif handler_type == "wan22":
            from wan_videogen_service import WanVideoGenService
            video_gen_service = WanVideoGenService()
        elif handler_type == "ltxv":
            from ltxv_service import LTXVideoService
            video_gen_service = LTXVideoService()
        else:
            print(f"Preload no-op: {args.forced_handler_type}, {manifest_path}")


    

  
   
