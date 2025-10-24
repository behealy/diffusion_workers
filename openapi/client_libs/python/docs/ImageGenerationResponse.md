# ImageGenerationResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**input** | [**ImageGenerationParams**](ImageGenerationParams.md) |  | 
**job_id** | **str** | The id of this generation task. | 
**status** | [**OpStatus**](OpStatus.md) |  | [optional] 
**result** | [**ImageInput**](ImageInput.md) |  | [optional] 
**warnings** | [**List[OpResult]**](OpResult.md) | Any warnings or non-fatal errors during generation | [optional] 

## Example

```python
from ez_diffusion_client.models.image_generation_response import ImageGenerationResponse

# TODO update the JSON string below
json = "{}"
# create an instance of ImageGenerationResponse from a JSON string
image_generation_response_instance = ImageGenerationResponse.from_json(json)
# print the JSON string representation of the object
print(ImageGenerationResponse.to_json())

# convert the object into a dict
image_generation_response_dict = image_generation_response_instance.to_dict()
# create an instance of ImageGenerationResponse from a dict
image_generation_response_from_dict = ImageGenerationResponse.from_dict(image_generation_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


