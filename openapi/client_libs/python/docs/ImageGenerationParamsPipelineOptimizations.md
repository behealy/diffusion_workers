# ImageGenerationParamsPipelineOptimizations

List of diffusion pipeline optimization configurations

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**use_deepcache** | **bool** |  | [optional] [default to False]
**deepcache_interval** | **int** |  | [optional] [default to 3]
**deepcache_branch_id** | **int** |  | [optional] [default to 1]
**use_torch_compile** | **bool** |  | [optional] [default to False]

## Example

```python
from ez_diffusion_client.models.image_generation_params_pipeline_optimizations import ImageGenerationParamsPipelineOptimizations

# TODO update the JSON string below
json = "{}"
# create an instance of ImageGenerationParamsPipelineOptimizations from a JSON string
image_generation_params_pipeline_optimizations_instance = ImageGenerationParamsPipelineOptimizations.from_json(json)
# print the JSON string representation of the object
print(ImageGenerationParamsPipelineOptimizations.to_json())

# convert the object into a dict
image_generation_params_pipeline_optimizations_dict = image_generation_params_pipeline_optimizations_instance.to_dict()
# create an instance of ImageGenerationParamsPipelineOptimizations from a dict
image_generation_params_pipeline_optimizations_from_dict = ImageGenerationParamsPipelineOptimizations.from_dict(image_generation_params_pipeline_optimizations_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


