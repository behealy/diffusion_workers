# MemoryInfoResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**info** | **Dict[str, str]** | Memory usage information | 

## Example

```python
from ez_diffusion_client.models.memory_info_response import MemoryInfoResponse

# TODO update the JSON string below
json = "{}"
# create an instance of MemoryInfoResponse from a JSON string
memory_info_response_instance = MemoryInfoResponse.from_json(json)
# print the JSON string representation of the object
print(MemoryInfoResponse.to_json())

# convert the object into a dict
memory_info_response_dict = memory_info_response_instance.to_dict()
# create an instance of MemoryInfoResponse from a dict
memory_info_response_from_dict = MemoryInfoResponse.from_dict(memory_info_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


