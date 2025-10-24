# ImageInput


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**source** | **str** | either url or base64 string | 

## Example

```python
from ez_diffusion_client.models.image_input import ImageInput

# TODO update the JSON string below
json = "{}"
# create an instance of ImageInput from a JSON string
image_input_instance = ImageInput.from_json(json)
# print the JSON string representation of the object
print(ImageInput.to_json())

# convert the object into a dict
image_input_dict = image_input_instance.to_dict()
# create an instance of ImageInput from a dict
image_input_from_dict = ImageInput.from_dict(image_input_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


