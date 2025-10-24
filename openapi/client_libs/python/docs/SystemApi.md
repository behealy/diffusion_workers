# ez_diffusion_client.SystemApi

All URIs are relative to *http://localhost:8000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_memory_info**](SystemApi.md#get_memory_info) | **GET** /memory-info | Get memory information


# **get_memory_info**
> MemoryInfoResponse get_memory_info()

Get memory information

Returns current GPU and system memory usage information

### Example


```python
import ez_diffusion_client
from ez_diffusion_client.models.memory_info_response import MemoryInfoResponse
from ez_diffusion_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:8000
# See configuration.py for a list of all supported configuration parameters.
configuration = ez_diffusion_client.Configuration(
    host = "http://localhost:8000"
)


# Enter a context with an instance of the API client
with ez_diffusion_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = ez_diffusion_client.SystemApi(api_client)

    try:
        # Get memory information
        api_response = api_instance.get_memory_info()
        print("The response of SystemApi->get_memory_info:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling SystemApi->get_memory_info: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

### Return type

[**MemoryInfoResponse**](MemoryInfoResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Memory information retrieved successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

