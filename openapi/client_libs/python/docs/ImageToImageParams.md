# ImageToImageParams


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**starting_image** | [**ImageInput**](ImageInput.md) |  | 

## Example

```python
from ez_diffusion_client.models.image_to_image_params import ImageToImageParams

# TODO update the JSON string below
json = "{}"
# create an instance of ImageToImageParams from a JSON string
image_to_image_params_instance = ImageToImageParams.from_json(json)
# print the JSON string representation of the object
print(ImageToImageParams.to_json())

# convert the object into a dict
image_to_image_params_dict = image_to_image_params_instance.to_dict()
# create an instance of ImageToImageParams from a dict
image_to_image_params_from_dict = ImageToImageParams.from_dict(image_to_image_params_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


