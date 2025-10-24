# InpaintParams


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**starting_image** | [**ImageInput**](ImageInput.md) |  | 
**mask_image** | [**ImageInput**](ImageInput.md) |  | 
**use_controlnet_union_inpaint** | **bool** | Whether to use ControlNet Union inpainting mode | [optional] [default to False]

## Example

```python
from ez_diffusion_client.models.inpaint_params import InpaintParams

# TODO update the JSON string below
json = "{}"
# create an instance of InpaintParams from a JSON string
inpaint_params_instance = InpaintParams.from_json(json)
# print the JSON string representation of the object
print(InpaintParams.to_json())

# convert the object into a dict
inpaint_params_dict = inpaint_params_instance.to_dict()
# create an instance of InpaintParams from a dict
inpaint_params_from_dict = InpaintParams.from_dict(inpaint_params_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


