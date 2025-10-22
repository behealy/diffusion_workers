from abc import ABC, abstractmethod
import os
from typing import Any, Callable, Dict, List, Optional, Generic, TypeVar
from jinja2 import pass_context
from regex import R
import torch
from attr import dataclass
from pydantic import NonNegativeFloat
from diffusers import (
    AutoPipelineForText2Image,
    ControlNetUnionModel,
    DDIMScheduler,
    AutoPipelineForImage2Image,
    AutoPipelineForInpainting,
    ControlNetModel,
    DiffusionPipeline,
    FluxControlNetModel
)
from models import OpResult, OpStatus, PipeType
from utils import resolve_device
from dataclasses import dataclass
from ez_diffusion_client import LoraParams, ImageGenerationParams, ControlNetParams, CNProcessorType
from functools import lru_cache
from DeepCache import DeepCacheSDHelper

CNM = TypeVar("CNM")

class ControlNetFactory(ABC, Generic[CNM]):
    @abstractmethod
    def __call__(self, **args) -> CNM:
        pass

class FluxFp16ControlNetUnionGetter(ControlNetFactory[FluxControlNetModel]):
    def __call__(self, **args) -> FluxControlNetModel:
        return self.__load_cn()
        
    def __load_cn(self): 
        return FluxControlNetModel.from_pretrained('Shakker-Labs/FLUX.1-dev-ControlNet-Union-Pro-2.0', torch_dtype=torch.bfloat16)
    
class SDXLFp16ControlNetUnionGetter(ControlNetFactory[ControlNetUnionModel]):
    def __call__(self, **args) -> ControlNetUnionModel:
        return self.__load_cn()
        
    def __load_cn(self): 
        return ControlNetUnionModel.from_pretrained(
            "xinsir/controlnet-union-sdxl-1.0",
            torch_dtype=torch.float16,
            variant="fp16"
        )

class SD15Fp16ControlNetGetter(ControlNetFactory[ControlNetModel]):
    SD15_FP16_CN_MODEL_MAPPINGS = {
            CNProcessorType.OPENPOSE: "lllyasviel/control_v11p_sd15_openpose",
            CNProcessorType.OPENPOSE_FACE: "lllyasviel/control_v11p_sd15_openpose",
            CNProcessorType.OPENPOSE_FACEONLY: "lllyasviel/control_v11p_sd15_openpose",
            CNProcessorType.OPENPOSE_FULL: "lllyasviel/control_v11p_sd15_openpose",
            CNProcessorType.OPENPOSE_HAND: "lllyasviel/control_v11p_sd15_openpose",
            CNProcessorType.DWPOSE: "lllyasviel/control_v11p_sd15_openpose",
            CNProcessorType.OPENPOSE_HAND_BODY: "lllyasviel/control_v11p_sd15_openpose",
            CNProcessorType.DEPTH_LERES: "lllyasviel/control_v11f1p_sd15_depth",
            CNProcessorType.DEPTH_LERES_PLUS_PLUS: "lllyasviel/control_v11f1p_sd15_depth",
            CNProcessorType.DEPTH_MIDAS: "lllyasviel/control_v11f1p_sd15_depth",
            CNProcessorType.DEPTH_ZOE: "lllyasviel/control_v11f1p_sd15_depth",
            CNProcessorType.SCRIBBLE_HED: "lllyasviel/control_v11p_sd15_scribble",
            CNProcessorType.SCRIBBLE_PIDINET: "lllyasviel/control_v11p_sd15_scribble",
            CNProcessorType.SOFTEDGE_HED: "lllyasviel/control_v11p_sd15_softedge",
            CNProcessorType.SOFTEDGE_PIDINET: "lllyasviel/control_v11p_sd15_softedge",
            CNProcessorType.SOFTEDGE_HEDSAFE: "lllyasviel/control_v11p_sd15_softedge",
            CNProcessorType.SOFTEDGE_PIDSAFE: "lllyasviel/control_v11p_sd15_softedge",
            CNProcessorType.CANNY: "lllyasviel/control_v11p_sd15_canny",
            CNProcessorType.LINEART_ANIME: "lllyasviel/control_v11p_sd15s2_lineart_anime",
            CNProcessorType.LINEART_COARSE: "lllyasviel/control_v11p_sd15_lineart",
            CNProcessorType.LINEART_REALISTIC: "lllyasviel/control_v11p_sd15_lineart",
            CNProcessorType.MLSD: "lllyasviel/control_v11p_sd15_mlsd",
            CNProcessorType.NORMAL_BAE: "lllyasviel/control_v11p_sd15_normalbae",
            CNProcessorType.INPAINT: "lllyasviel/control_v11p_sd15_inpaint",
            CNProcessorType.SEGMENTATION: "lllyasviel/control_v11p_sd15_segmentation",
        }
    
    def __call__(self, **args) -> ControlNetModel:
        cn_type = args.pop("cn_type")
        print(f"SD15ControlNetGetter invoke: {cn_type}")
        return self.__get_controlnet(
            model = self.SD15_FP16_CN_MODEL_MAPPINGS[cn_type],
        )
    
    @lru_cache(maxsize=4)
    def __get_controlnet(self, model: str):
        print(f"{self.__class__} get_controlnet")
        return ControlNetModel.from_pretrained(
            model, 
            variant="fp16", 
            torch_dtype=torch.float16
        )