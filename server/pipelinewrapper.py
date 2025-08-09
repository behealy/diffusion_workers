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
    DiffusionPipeline
)
from models import OpResult, OpStatus, PipeType
from utils import resolve_device
from dataclasses import dataclass
from mooove_server_api import LoraParams, ImageGenerationParams, ControlNetParams, CNProcessorType
from functools import lru_cache
from DeepCache import DeepCacheSDHelper



class PipelineWrapper(ABC):
    @abstractmethod
    def get_pipeline_for_inputs(self, params: ImageGenerationParams) -> Callable:
        pass

    def load_loras(self, pipeline, loras: List[LoraParams]) -> OpResult:
        """Load LoRA weights into the pipeline."""
        for lora in loras:
            try:
                adapter_name=lora.weight_name.split(".")[0]
                pipeline.load_lora_weights(
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

    def unload_loras(self, pipeline):
        """Unload all LoRA weights from the pipeline to restore original model weights."""
        try:
            print(f"Unloading LORA weights")
            pipeline.unload_lora_weights()
        except Exception as e:
            print(f"Warning: Failed to unload LoRA weights: {e}")
  
    @abstractmethod
    def setup(self, input: ImageGenerationParams, pipekwargs, response) -> tuple[dict, dict]:
        pass
   

@dataclass
class PipelineVariants:
    base_pipeline: Any
    i2i_pipeline: Any
    inpaint_pipeline: Any
    t2i_cn_pipeline: Any
    i2i_cn_pipeline: Any
    inpaint_cn_pipeline: Any
    controlnet_union_model: Optional[ControlNetUnionModel] = None
    controlnet_models: Optional[list[ControlNetModel]] = None

CNM = TypeVar("CNM")

class ControlNetGetter(ABC, Generic[CNM]):
    @abstractmethod
    def __call__(self, **args) -> CNM:
        pass

class SDXLFp16ControlNetUnionGetter(ControlNetGetter[ControlNetUnionModel]):
    def __call__(self, **args) -> ControlNetUnionModel:
        return self.__load_cn()
        
    def __load_cn(self): 
        return ControlNetUnionModel.from_pretrained(
            "xinsir/controlnet-union-sdxl-1.0",
            torch_dtype=torch.float16,
            variant="fp16"
        )

class SD15Fp16ControlNetGetter(ControlNetGetter[ControlNetModel]):
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
    
class DefaultPipelineWrapper(PipelineWrapper):
    def __init__(
        self, 
        base_model: str,
        use_fp16: bool = True,
        get_controlnet: ControlNetGetter = SD15Fp16ControlNetGetter()
    ):
        self.device = resolve_device()
        self.use_fp16 = use_fp16
        self.get_controlnet = get_controlnet
        self.deepcache_helper = DeepCacheSDHelper(pipe=self.base_pipeline)
        self.base_pipeline = AutoPipelineForText2Image.from_pretrained(
            base_model,
            safety_checker=None,
            requires_safety_checker=False,
            **self.__resolve_pipeline_precision()
        ).to(self.device)
       
        self.base_pipeline.scheduler = DDIMScheduler.from_config(self.base_pipeline.scheduler.config)

        # check env var DO_TORCH_COMPILE 
        if os.getenv("DO_TORCH_COMPILE") and torch.cuda.is_available(): 
            self.base_pipeline.unet = torch.compile(self.base_pipeline.unet, mode="reduce-overhead", fullgraph=True)

    def __resolve_pipeline_precision(self):
        if self.use_fp16:
            return {"torch_dtype": torch.float16, "variant": "fp16"}
        else:
            return {}
        
    def setup(self, input: ImageGenerationParams, pipekwargs, response):
        if input.pipeline_optimizations:
             # Optimizations
            if input.pipeline_optimizations.deepcache_branch_id and input.pipeline_optimizations.deepcache_interval:
                self.deepcache_helper.set_params(
                    cache_interval=input.pipeline_optimizations.deepcache_interval,
                    cache_branch_id=input.pipeline_optimizations.deepcache_branch_id,
                )
                self.deepcache_helper.enable()

        loras = input.loras
        if loras and len(loras) > 0:
            prompt = pipekwargs.prompt
            res = self.load_loras(self.base_pipeline, loras)
            if (res.status is OpStatus.FAILURE):
                response = {**response, "warnings": [*response.warnings, res]}
            for lora in loras:
                if lora.tag is not None:
                    prompt += f"{prompt}, {lora.tag}"
            pipekwargs = { **pipekwargs, "prompt": prompt, "cross_attention_kwargs": {"scale": loras[0].scale}}
        return (pipekwargs, response)    
    
    def cleanup(self):
        self.unload_loras(self.base_pipeline)
        self.deepcache_helper.disable()
    
    @lru_cache(maxsize=6)
    def __get_pipeline(self, pipetype: PipeType, *controlnet_models: CNProcessorType):
        cn_models = [self.get_controlnet(cn_type = controlnet) for controlnet in controlnet_models]

        if len(cn_models) > 0:
            kwargs = {
                "controlnet": cn_models,
                **self.__resolve_pipeline_precision()
            }
        else: 
            kwargs = {
                **self.__resolve_pipeline_precision()
            }

        if pipetype == PipeType.IMAGE2IMAGE:
            print("SD15PipelineWrapper __get_pipeline: using I2I Pipeline")
            return AutoPipelineForImage2Image.from_pipe(
                self.base_pipeline,
                **kwargs
            ).to(self.device)
        elif pipetype == PipeType.INPAINT:
            print("SD15PipelineWrapper __get_pipeline: using Inpaint Pipeline")
            return AutoPipelineForInpainting.from_pipe(
                self.base_pipeline,
                **kwargs
            ).to(self.device)
        else:
            print("SD15PipelineWrapper __get_pipeline: using T2I Pipeline")
            return AutoPipelineForText2Image.from_pipe(
                self.base_pipeline,
                **kwargs
            ).to(self.device)  

    def get_pipeline_for_inputs(self, params: ImageGenerationParams) -> Callable:
        if params.image_to_image:
            pipetype = PipeType.IMAGE2IMAGE
        elif params.inpaint:
            pipetype = PipeType.INPAINT
        else: 
            pipetype = PipeType.TEXT2IMGE
            
        if params.controlnets and len(params.controlnets) > 0:
            cn_model_names = [controlnet.processor_type for controlnet in params.controlnets]
        else:
            cn_model_names = []
        
        return self.__get_pipeline(pipetype, *cn_model_names)
        