# OpResult


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**operation** | **str** | Name of the operation | 
**status** | [**OpStatus**](OpStatus.md) |  | 
**message** | **str** | Optional status message | [optional] 
**result** | **object** | Optional operation result data | [optional] 

## Example

```python
from ez_diffusion_client.models.op_result import OpResult

# TODO update the JSON string below
json = "{}"
# create an instance of OpResult from a JSON string
op_result_instance = OpResult.from_json(json)
# print the JSON string representation of the object
print(OpResult.to_json())

# convert the object into a dict
op_result_dict = op_result_instance.to_dict()
# create an instance of OpResult from a dict
op_result_from_dict = OpResult.from_dict(op_result_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


