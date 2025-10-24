# ImageGenerationParamsDimensions

Output image dimensions {width, height}

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**width** | **int** |  | [default to 512]
**height** | **int** |  | [default to 512]

## Example

```python
from ez_diffusion_client.models.image_generation_params_dimensions import ImageGenerationParamsDimensions

# TODO update the JSON string below
json = "{}"
# create an instance of ImageGenerationParamsDimensions from a JSON string
image_generation_params_dimensions_instance = ImageGenerationParamsDimensions.from_json(json)
# print the JSON string representation of the object
print(ImageGenerationParamsDimensions.to_json())

# convert the object into a dict
image_generation_params_dimensions_dict = image_generation_params_dimensions_instance.to_dict()
# create an instance of ImageGenerationParamsDimensions from a dict
image_generation_params_dimensions_from_dict = ImageGenerationParamsDimensions.from_dict(image_generation_params_dimensions_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


