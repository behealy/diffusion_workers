import cmd
import os
from PIL.Image import Image

from controlnet_aux.processor import Processor
from models import ImageGenerationParams, OpResult, OpStatus, CNProcessorType, CNUnionControlMode, ControlNetParams
from utils import load_image


class ControlnetSetupHandler:
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

    op_tag="CN Preprocess"

    def map_processor_to_control_mode(self, processor_type: CNProcessorType) -> CNUnionControlMode:
        if processor_type in {CNProcessorType.OPENPOSE, CNProcessorType.OPENPOSE_FACE,
                          CNProcessorType.OPENPOSE_FACEONLY, CNProcessorType.OPENPOSE_FULL,
                          CNProcessorType.OPENPOSE_HAND, CNProcessorType.DWPOSE,
                          CNProcessorType.OPENPOSE_HAND_BODY}:
            return CNUnionControlMode.OPENPOSE
        elif processor_type in {CNProcessorType.DEPTH_LERES, CNProcessorType.DEPTH_LERES_PLUS,
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
        else:
            raise ValueError(f"Unknown processor type: {processor_type}")    

    def get_available_preprocessor_options(self):
        """Return a list of available ControlNet processors."""
        return ControlnetSetupHandler.processor_list

    def get_controlnet_args(self, input: ImageGenerationParams, **kwargs) -> OpResult:
        """Process an image using the selected ControlNet processor."""
        if not input.controlnets:
            return OpResult(operation=self.op_tag, status=OpStatus.SUCCESS, message="No controlnets provided.")

        controlnet_params = input.controlnets[0]
        preprocessor_type = controlnet_params.preprocess_with
        input_image = controlnet_params.guide_image
        (width, height) = input.dimensions
        img = load_image(input_image)
        (w, h) = img.size
        # scale image to nearest multiple of 64 in both width and height
        img = img.resize((w // 64 * 64, h // 64 * 64))

        result = {
            "controlnet_conditioning_scale": controlnet_params.controlnet_conditioning_scale,
            "control_guidance_start": controlnet_params.control_guidance_start,
            "control_guidance_end": controlnet_params.control_guidance_end
        }
        print(f"Processing image using ControlNet processor: {preprocessor_type}")
        if not preprocessor_type:
            return OpResult(operation=self.op_tag, status=OpStatus.FAILURE, message="Preprocessor type not provided.", result={
                **result,
                "control_image": img
            })

        #  Check if argument exists as key in processor_cache
        if preprocessor_type.name not in self.processor_list:
            message = f"Processor '{preprocessor_type}' is not available. Available processors: {', '.join(self.processor_list)}"
            print(message)
            return OpResult(operation=self.op_tag, status=OpStatus.FAILURE, message=message)
        
        if preprocessor_type not in self.processor_cache:
            print(f"'{preprocessor_type}' processor not initialized. Initializing and saving.")
            if preprocessor_type == "openpose_hand_body":
                processor = Processor('openpose', {'detect_resolution': width, 'image_resolution': width, 'include_body': True, 'include_hand': True, 'include_face': False})
            else: 
                processor = Processor(preprocessor_type.value, {'detect_resolution': width, 'image_resolution': width})
        
            self.processor_cache[preprocessor_type] = processor

        selected_processor = self.processor_cache[preprocessor_type]

        if selected_processor is not None:
            try:
                processor_class = selected_processor
                processed_img = processor_class(img, to_pil=True)
                return OpResult(operation=self.op_tag, status=OpStatus.SUCCESS, result={"control_image": processed_img, "control_mode": self.map_processor_to_control_mode(preprocessor_type).value, **result})
            except Exception as e:
                return OpResult(operation=self.op_tag, status=OpStatus.FAILURE, message=str(e))
        else:
            return OpResult(operation=self.op_tag, status=OpStatus.FAILURE, message="Processor not found")