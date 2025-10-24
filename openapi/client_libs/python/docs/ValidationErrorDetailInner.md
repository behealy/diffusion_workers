# ValidationErrorDetailInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**loc** | [**List[ValidationErrorDetailInnerLocInner]**](ValidationErrorDetailInnerLocInner.md) |  | [optional] 
**msg** | **str** |  | [optional] 
**type** | **str** |  | [optional] 

## Example

```python
from ez_diffusion_client.models.validation_error_detail_inner import ValidationErrorDetailInner

# TODO update the JSON string below
json = "{}"
# create an instance of ValidationErrorDetailInner from a JSON string
validation_error_detail_inner_instance = ValidationErrorDetailInner.from_json(json)
# print the JSON string representation of the object
print(ValidationErrorDetailInner.to_json())

# convert the object into a dict
validation_error_detail_inner_dict = validation_error_detail_inner_instance.to_dict()
# create an instance of ValidationErrorDetailInner from a dict
validation_error_detail_inner_from_dict = ValidationErrorDetailInner.from_dict(validation_error_detail_inner_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


