from pydantic import BaseModel, ConfigDict, Field
from typing import Dict, List, Optional
from dataclasses import dataclass
from PIL.Image import Image

# 0 -- openpose
# 1 -- depth
# 2 -- hed/pidi/scribble/ted
# 3 -- canny/lineart/anime_lineart/mlsd
# 4 -- normal
# 5 -- segment
@dataclass
class ControlNetParams(BaseModel):
    control_image: str
    model: str | None = Field(default=None)
    controlnet_conditioning_scale: float = Field(default=0.0)
    control_guidance_end: float = Field(default=1.0)
    control_guidance_start: float = Field(default=0.0)
    strength: float = Field(default=0.7)
    union_control_mode: int = Field(default=0)

@dataclass
class LoraParams(BaseModel):
    model: str
    weight_name: str
    tag: Optional[str] = None
    scale: float | Dict[str, float] = Field(default=0.8)

@dataclass
class InpaintParams(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    starting_image: str
    mask_image: str
    use_controlnet_union_inpaint: bool = Field(default=False)

@dataclass
class ImageToImageParams(BaseModel):
    starting_image: str

@dataclass
class InputParams(BaseModel):
    """
    Parameters for the input.
    """
    prompt: str
    starting_image: str | None = None
    negative_prompt: Optional[str] = None
    base_model: Optional[str] = None
    guidance_scale: Optional[float] = None
    inference_steps: Optional[int] = None
    seed: Optional[int] = None
    dimensions: Optional[List[int]] = None
    inpaint: Optional[InpaintParams] = None 
    image_to_image: Optional[ImageToImageParams] = None
    controlnets: Optional[List[ControlNetParams]] = None
    loras: Optional[List[LoraParams]] = None

class WorkerRequest(BaseModel):
    """
    Request model for generation.
    """

    input: InputParams
