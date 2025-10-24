# ImageGenerationHistoryResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**prev** | **int** |  | 
**next** | **int** |  | 
**results** | [**List[ImageGenerationResponse]**](ImageGenerationResponse.md) |  | 

## Example

```python
from ez_diffusion_client.models.image_generation_history_response import ImageGenerationHistoryResponse

# TODO update the JSON string below
json = "{}"
# create an instance of ImageGenerationHistoryResponse from a JSON string
image_generation_history_response_instance = ImageGenerationHistoryResponse.from_json(json)
# print the JSON string representation of the object
print(ImageGenerationHistoryResponse.to_json())

# convert the object into a dict
image_generation_history_response_dict = image_generation_history_response_instance.to_dict()
# create an instance of ImageGenerationHistoryResponse from a dict
image_generation_history_response_from_dict = ImageGenerationHistoryResponse.from_dict(image_generation_history_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


