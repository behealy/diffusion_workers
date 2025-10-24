# LoraParams


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**model** | **str** | HuggingFace LoRA model identifier | 
**weight_name** | **str** | Specific weight file name within the model | 
**tag** | **str** | Optional trigger tag to append to prompt | [optional] 
**scale** | **float** | LoRA scaling factor (can be single value or per-layer dict) | [optional] [default to 0.8]

## Example

```python
from ez_diffusion_client.models.lora_params import LoraParams

# TODO update the JSON string below
json = "{}"
# create an instance of LoraParams from a JSON string
lora_params_instance = LoraParams.from_json(json)
# print the JSON string representation of the object
print(LoraParams.to_json())

# convert the object into a dict
lora_params_dict = lora_params_instance.to_dict()
# create an instance of LoraParams from a dict
lora_params_from_dict = LoraParams.from_dict(lora_params_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


