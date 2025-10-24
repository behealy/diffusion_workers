# ControlNetParams


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**guess_mode** | **bool** | generates an image from only the control input (canny edge, depth map, pose, etc.) and without guidance from a prompt. | [optional] [default to False]
**guide_image** | [**ImageInput**](ImageInput.md) |  | 
**needs_preprocess** | **bool** |  | [optional] [default to False]
**model** | **str** | ControlNet model identifier | [optional] 
**controlnet_conditioning_scale** | **float** | Strength of ControlNet influence | [optional] [default to 1.0]
**control_guidance_end** | **float** | When to stop applying ControlNet guidance (0.0-1.0) | [optional] [default to 1.0]
**control_guidance_start** | **float** | When to start applying ControlNet guidance (0.0-1.0) | [optional] [default to 0.0]
**strength** | **float** | Overall ControlNet strength | [optional] [default to 0.7]
**processor_type** | [**CNProcessorType**](CNProcessorType.md) |  | 

## Example

```python
from ez_diffusion_client.models.control_net_params import ControlNetParams

# TODO update the JSON string below
json = "{}"
# create an instance of ControlNetParams from a JSON string
control_net_params_instance = ControlNetParams.from_json(json)
# print the JSON string representation of the object
print(ControlNetParams.to_json())

# convert the object into a dict
control_net_params_dict = control_net_params_instance.to_dict()
# create an instance of ControlNetParams from a dict
control_net_params_from_dict = ControlNetParams.from_dict(control_net_params_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


