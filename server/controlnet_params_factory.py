from abc import ABC, abstractmethod
from functools import lru_cache
from typing import Tuple
from PIL.Image import Image

from controlnet_aux.processor import Processor
from ez_diffusion_client import ImageGenerationParams,  CNProcessorType
from paramiko import PasswordRequiredException
from models import OpResult, OpStatus, CNUnionControlMode
from utils import load_image_from_base64_or_url

class ImageProcessor(ABC):
    @abstractmethod
    def process_image(self, image: str, kwargs) -> Image:
        pass

class ControlnetGuideImagePreprocessor(ImageProcessor): 
    processor_list = [
        "canny", "depth_leres", "depth_leres++", "depth_midas",
        "depth_zoe", "lineart_anime", "lineart_coarse", "lineart_realistic",
        "mediapipe_face", "mlsd", "normal_bae",
        "openpose", "openpose_face", "openpose_faceonly",
        "openpose_full", "openpose_hand", "scribble_hed",
        "scribble_pidinet", "shuffle", "softedge_hed", "softedge_hedsafe",
        "softedge_pidinet", "softedge_pidsafe", "dwpose",

        #special
        'openpose_hand_body'
    ]

    processor_cache = {} 
    
    def process_image(self, image: str, kwargs) -> Image: 
        img = load_image_from_base64_or_url(image)
        (w, h) = img.size
        # scale image to nearest multiple of 64 in both width and height
        img = img.resize((w // 64 * 64, h // 64 * 64))
        preprocessor_type = kwargs.processor_to_use.value
        desired_width = kwargs.desired_width
        if preprocessor_type not in self.processor_cache:
            print(f"'{preprocessor_type}' processor not initialized. Initializing and saving.")
            if preprocessor_type == "openpose_hand_body":
                processor = Processor('openpose', {'detect_resolution': desired_width, 'image_resolution': desired_width, 'include_body': True, 'include_hand': True, 'include_face': False})
            else: 
                processor = Processor(preprocessor_type, {'detect_resolution': desired_width, 'image_resolution': desired_width})
            self.processor_cache[preprocessor_type] = processor
        
        selected_processor = self.processor_cache[preprocessor_type]
        print(f"Processing image using ControlNet processor: {preprocessor_type}")
        if selected_processor is not None:
            try:
                processed_img = selected_processor(img, to_pil=True)
                print(f"Preprocess with '{preprocessor_type}' succeeded: {processed_img}")
                return processed_img
            except Exception as e:
                raise e
        else:
            raise ValueError(f"Processor {preprocessor_type} not found")
        

        
class ControlnetParamsFactory(ABC):
    def __init__(
            self, 
            image_preprocessor: ImageProcessor = ControlnetGuideImagePreprocessor()
        ) -> None:
        super().__init__()
        self.image_preprocessor = image_preprocessor
       
    def __load_image(self, do_preprocess: bool, guide_image: str, kwargs):
        if do_preprocess:
            img = self.image_preprocessor.process_image(guide_image, kwargs)
        else:
            img = load_image_from_base64_or_url(guide_image)
        return img

    def preprocess_images(self, input: ImageGenerationParams):
        if not input.controlnets:
            raise ValueError(f"No controlnets in {input}")
    
        images = [self.__load_image(
            cn.needs_preprocess or False, 
            cn.guide_image.source, 
            { "processor_to_use": cn.processor_type, "desired_width": input.dimensions.width }
        ) for cn in input.controlnets]

        return images

    def get_pipeline_controlnet_params(self, input: ImageGenerationParams, pipekwargs, response) -> Tuple[dict, dict]:
        if not input.controlnets or len(input.controlnets) <= 0:
            return (pipekwargs, response)

        try:    
            kwargs = {**pipekwargs, **self._resolve_kwargs(input, self.preprocess_images(input))}
            return (kwargs, response)
        except Exception as e:
            print(f" {self.__class__}: Failed to resolve controlnet kwargs")
            res = {**response, "warnings": [*response.warnings, "There was an error loading some controlnets"]}
            return (pipekwargs, res)

    @abstractmethod
    def _resolve_kwargs(self, input: ImageGenerationParams, images: list[Image]) -> dict:
        pass


class ControlnetUnionParamsFactory(ControlnetParamsFactory):
    def map_processor_to_control_mode(self, processor_type: CNProcessorType) -> CNUnionControlMode:
        if processor_type in {CNProcessorType.OPENPOSE, CNProcessorType.OPENPOSE_FACE,
                          CNProcessorType.OPENPOSE_FACEONLY, CNProcessorType.OPENPOSE_FULL,
                          CNProcessorType.OPENPOSE_HAND, CNProcessorType.DWPOSE,
                          CNProcessorType.OPENPOSE_HAND_BODY}:
            return CNUnionControlMode.OPENPOSE
        elif processor_type in {CNProcessorType.DEPTH_LERES, CNProcessorType.DEPTH_LERES_PLUS_PLUS,
                            CNProcessorType.DEPTH_MIDAS, CNProcessorType.DEPTH_ZOE}:
            return CNUnionControlMode.DEPTH
        elif processor_type in {CNProcessorType.SCRIBBLE_HED, CNProcessorType.SCRIBBLE_PIDINET,
                            CNProcessorType.SOFTEDGE_HED, CNProcessorType.SOFTEDGE_PIDINET,
                            CNProcessorType.SOFTEDGE_HEDSAFE, CNProcessorType.SOFTEDGE_PIDSAFE}:
            return CNUnionControlMode.HED_PIDI_SCRIBBLE_TED
        elif processor_type in {CNProcessorType.CANNY, CNProcessorType.LINEART_ANIME,
                            CNProcessorType.LINEART_COARSE, CNProcessorType.LINEART_REALISTIC,
                            CNProcessorType.MLSD}:
            return CNUnionControlMode.CANNY_LINEART_ANIME_LINEART_MLSD
        elif processor_type == CNProcessorType.NORMAL_BAE:
            return CNUnionControlMode.NORMAL
        elif processor_type == CNProcessorType.SEGMENTATION:
            return CNUnionControlMode.SEGMENT
        elif processor_type == CNProcessorType.INPAINT:
            return CNUnionControlMode.INPAINT
        else:
            raise ValueError(f"Unknown processor type: {processor_type}")    
        
    def _resolve_kwargs(self, input: ImageGenerationParams, images: list[Image]) -> dict:
        if not input.controlnets or len(input.controlnets) <= 0:
            return {}
        
        return {
            "controlnet_conditioning_scale": [controlnet.controlnet_conditioning_scale for controlnet in input.controlnets],
            "control_guidance_start": [controlnet.control_guidance_start for controlnet in input.controlnets],
            "control_guidance_end": [controlnet.control_guidance_end for controlnet in input.controlnets],
            "guess_mode": [controlnet.guess_mode for controlnet in input.controlnets],
            "control_mode": [self.map_processor_to_control_mode(controlnet.processor_type).value for controlnet in input.controlnets],
            "control_image": images
        }


class MultiModelControlnetParamsFactory(ControlnetParamsFactory):
    def _resolve_kwargs(self, input: ImageGenerationParams, images: list[Image]) -> dict:
        if not input.controlnets or len(input.controlnets) <= 0:
            return {}
        
        if input.image_to_image is not None:
            im_kwarg = "control_image"
        else:
            im_kwarg = "image"

        return {
            "controlnet_conditioning_scale": [controlnet.controlnet_conditioning_scale for controlnet in input.controlnets],
            "control_guidance_start": [controlnet.control_guidance_start for controlnet in input.controlnets],
            "control_guidance_end": [controlnet.control_guidance_end for controlnet in input.controlnets],
            "guess_mode": [controlnet.guess_mode for controlnet in input.controlnets],
            im_kwarg: images,
        }
     