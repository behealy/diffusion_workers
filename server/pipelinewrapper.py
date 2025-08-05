from abc import ABC, abstractmethod
import os
from typing import Any, Callable, Dict, List, Optional
from regex import R
import torch
from attr import dataclass
from itsdangerous import NoneAlgorithm
from pydantic import NonNegativeFloat
from models import ControlNetParams, LoraParams, ImageGenerationParams
from diffusers import (
    AutoPipelineForText2Image,
    ControlNetUnionModel,
    DDIMScheduler,
    AutoPipelineForImage2Image,
    AutoPipelineForInpainting,
)
from models import OpResult, OpStatus
from utils import resolve_device
from dataclasses import dataclass

class PipelineWrapper(ABC):
    @abstractmethod
    def get_pipeline_for_inputs(self, params: ImageGenerationParams) -> Callable:
        pass
  
    @abstractmethod
    def load_loras(self, loras: List[LoraParams]) -> OpResult:
        pass

    @abstractmethod
    def unload_loras(self):
        pass

@dataclass
class PipelineVariants:
    base_pipeline: Any
    i2i_pipeline: Any
    inpaint_pipeline: Any
    t2i_cn_pipeline: Any
    i2i_cn_pipeline: Any
    inpaint_cn_pipeline: Any
    controlnet_union_model: ControlNetUnionModel


class SdxlControlnetUnionPipelineWrapper(PipelineWrapper):
    def __init__(
        self, 
        base_model: str,
        pipelines: Optional[PipelineVariants] = None,
    ):
        device = resolve_device()
        if pipelines is None:
            cn_union = ControlNetUnionModel.from_pretrained(
                "xinsir/controlnet-union-sdxl-1.0", 
                torch_dtype=torch.float16
            )
            base = AutoPipelineForText2Image.from_pretrained(
                    base_model,
                    torch_dtype=torch.float16,
                    variant="fp16",
                    safety_checker=None,
                    requires_safety_checker=False,
            ).to(device)
            self.pipelines = PipelineVariants(
                controlnet_union_model = cn_union,
                base_pipeline=base,
                i2i_pipeline=AutoPipelineForImage2Image.from_pipe(
                    base,
                    torch_dtype=torch.float16,
                    variant="fp16"
                ).to(device),
                inpaint_pipeline=AutoPipelineForInpainting.from_pipe(
                    base,
                    torch_dtype=torch.float16,
                    variant="fp16"
                ).to(device),
                t2i_cn_pipeline=AutoPipelineForText2Image.from_pipe(
                    base,
                    torch_dtype=torch.float16,
                    variant="fp16",
                    controlnet = cn_union
                ).to(device),
                i2i_cn_pipeline = AutoPipelineForImage2Image.from_pipe(
                    base,
                    torch_dtype=torch.float16,
                    variant="fp16",
                    controlnet =cn_union
                ).to(device),
                inpaint_cn_pipeline=AutoPipelineForInpainting.from_pipe(
                    base,
                    torch_dtype=torch.float16,
                    variant="fp16",
                    controlnet=cn_union
                ).to(device)
            )
        else: 
            self.pipelines = pipelines
       
        self.pipelines.base_pipeline.scheduler = DDIMScheduler.from_config(self.pipelines.base_pipeline.scheduler.config)

        # Optimizations
        from DeepCache import DeepCacheSDHelper
        helper = DeepCacheSDHelper(pipe=self.pipelines.base_pipeline)
        helper.set_params(
            cache_interval=3,
            cache_branch_id=1,
        )
        helper.enable()

        # check env var DO_TORCH_COMPILE 
        if os.getenv("DO_TORCH_COMPILE") and torch.cuda.is_available(): 
            self.pipelines.base_pipeline.unet = torch.compile(self.pipelines.base_pipeline.unet, mode="reduce-overhead", fullgraph=True)
        

    def load_loras(self, loras: List[LoraParams]) -> OpResult:
        """Load LoRA weights into the pipeline."""
        for lora in loras:
            try:
                adapter_name=lora.weight_name.split(".")[0]
                self.pipelines.base_pipeline.load_lora_weights(
                    lora.model,
                    weight_name=lora.weight_name,
                    adapter_name=adapter_name
                )
                return OpResult(operation="LoRA Load", status=OpStatus.SUCCESS, message=f"LoRA {lora.model} loaded successfully", result=None)
            except Exception as e:
                message = f"Failed to load LoRA {lora.model}: {e}"
                print(message)
                return OpResult(operation="LoRA Load", status=OpStatus.FAILURE, message=message, result=None)
        return OpResult(operation="LoRA Load", status=OpStatus.FAILURE, message="no LoRAs to load",  result=None)

    def unload_loras(self):
        """Unload all LoRA weights from the pipeline to restore original model weights."""
        try:
            print(f"Unloading LORA weights")
            self.pipelines.base_pipeline.unload_lora_weights()
        except Exception as e:
            print(f"Warning: Failed to unload LoRA weights: {e}")
      

    def get_pipeline_for_inputs(self, params: ImageGenerationParams) -> Callable:
        need_i2i = params.starting_image is not None
        need_controlnet = params.controlnets is not None and len(params.controlnets) > 0
        if need_i2i:
            if need_controlnet:
                return self.pipelines.i2i_cn_pipeline
            else:
                return self.pipelines.i2i_pipeline
        if params.inpaint is not None:
            if params.inpaint.use_controlnet_union_inpaint or need_controlnet:
                return self.pipelines.inpaint_cn_pipeline
            else:
                return self.pipelines.inpaint_pipeline
        elif need_controlnet:
            return self.pipelines.t2i_cn_pipeline
        else: 
            return self.pipelines.base_pipeline

        