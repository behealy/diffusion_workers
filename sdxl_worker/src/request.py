from pydantic import BaseModel, Field
from typing import List, Optional
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
    control_image: Image
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

@dataclass
class InputParams(BaseModel):
    """
    Parameters for the input.
    """
    prompt: str
    negative_prompt: Optional[str] = None
    model: Optional[str] = None
    guidance_scale: Optional[float] = None
    num_inference_steps: Optional[int] = None
    seed: Optional[int] = None
    dimensions: Optional[List[int]] = None
    controlnets: Optional[List[ControlNetParams]] = None
    loras: Optional[List[LoraParams]] = None

class GenerateRequest(BaseModel):
    """
    Request model for generation.
    """

    input: InputParams
