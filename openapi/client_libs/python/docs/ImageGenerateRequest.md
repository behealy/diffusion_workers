# ImageGenerateRequest

Request payload for image generation

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**input** | [**ImageGenerationParams**](ImageGenerationParams.md) |  | 

## Example

```python
from ez_diffusion_client.models.image_generate_request import ImageGenerateRequest

# TODO update the JSON string below
json = "{}"
# create an instance of ImageGenerateRequest from a JSON string
image_generate_request_instance = ImageGenerateRequest.from_json(json)
# print the JSON string representation of the object
print(ImageGenerateRequest.to_json())

# convert the object into a dict
image_generate_request_dict = image_generate_request_instance.to_dict()
# create an instance of ImageGenerateRequest from a dict
image_generate_request_from_dict = ImageGenerateRequest.from_dict(image_generate_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


