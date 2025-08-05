from pydantic import BaseModel
from enum import Enum
from pydantic import BaseModel, ConfigDict, Field
from typing import Any, Dict, List, Optional, TypeVar
from dataclasses import dataclass

class CNProcessorType(Enum):
    CANNY = "canny"
    DEPTH_LERES = "depth_leres"
    DEPTH_LERES_PLUS = "depth_leres++"
    DEPTH_MIDAS = "depth_midas"
    DEPTH_ZOE = "depth_zoe"
    LINEART_ANIME = "lineart_anime"
    LINEART_COARSE = "lineart_coarse"
    LINEART_REALISTIC = "lineart_realistic"
    MEDIAPIPE_FACE = "mediapipe_face"
    MLSD = "mlsd"
    NORMAL_BAE = "normal_bae"
    OPENPOSE = "openpose"
    OPENPOSE_FACE = "openpose_face"
    OPENPOSE_FACEONLY = "openpose_faceonly"
    OPENPOSE_FULL = "openpose_full"
    OPENPOSE_HAND = "openpose_hand"
    SCRIBBLE_HED = "scribble_hed"
    SCRIBBLE_PIDINET = "scribble_pidinet"
    SHUFFLE = "shuffle"
    SOFTEDGE_HED = "softedge_hed"
    SOFTEDGE_HEDSAFE = "softedge_hedsafe"
    SOFTEDGE_PIDINET = "softedge_pidinet"
    SOFTEDGE_PIDSAFE = "softedge_pidsafe"
    DWPOSE = "dwpose"
    OPENPOSE_HAND_BODY = "openpose_hand_body",

# 0 -- openpose
# 1 -- depth
# 2 -- hed/pidi/scribble/ted
# 3 -- canny/lineart/anime_lineart/mlsd
# 4 -- normal
# 5 -- segment
# 6 -- tile
# 7 -- repaint
class CNUnionControlMode(Enum):
    OPENPOSE = 0
    DEPTH = 1
    HED_PIDI_SCRIBBLE_TED = 2
    CANNY_LINEART_ANIME_LINEART_MLSD = 3
    NORMAL = 4
    SEGMENT = 5
    TILE = 6
    INPAINT = 7

@dataclass
class ControlNetParams(BaseModel):
     # image can be a url or base64 string
    guide_image: str
    preprocess_with: Optional[CNProcessorType] = Field(default = None)
    model: str | None = Field(default=None)
    controlnet_conditioning_scale: float = Field(default=0.0)
    control_guidance_end: float = Field(default=1.0)
    control_guidance_start: float = Field(default=0.0)
    strength: float = Field(default=0.7)
    union_control_mode: CNUnionControlMode = Field(default=CNUnionControlMode.CANNY_LINEART_ANIME_LINEART_MLSD)

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
class ImageGenerationParams(BaseModel):
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
    dimensions: List[int] = Field(default=[512, 512])
    inpaint: Optional[InpaintParams] = None 
    image_to_image: Optional[ImageToImageParams] = None
    controlnets: Optional[List[ControlNetParams]] = None
    loras: Optional[List[LoraParams]] = None

class ImageGenerateRequest(BaseModel):
    """
    Request model for generation.
    """

    input: ImageGenerationParams
