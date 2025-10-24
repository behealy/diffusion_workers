# ez_diffusion_client.ImageGenerationApi

All URIs are relative to *http://localhost:8000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**generate_image**](ImageGenerationApi.md#generate_image) | **POST** /image-gen | Generate image synchronously
[**get_image_gen_history**](ImageGenerationApi.md#get_image_gen_history) | **GET** /history | Get image generation history
[**image_to_image**](ImageGenerationApi.md#image_to_image) | **POST** /image-to-image | Alias of /image-gen with additional validation specific to image-to-image requests
[**inpaint**](ImageGenerationApi.md#inpaint) | **POST** /inpaint | Alias of /image-gen with additional validation specific to inpaint requests
[**text_to_image**](ImageGenerationApi.md#text_to_image) | **POST** /text-to-image | Alias of /image-gen with additional validation specific to text-to-image requests


# **generate_image**
> ImageGenerationResponse generate_image(image_generate_request)

Generate image synchronously

Generate an image from a text prompt with optional control inputs.

Supports multiple generation modes:
- **Text-to-Image**: Generate from prompt only
- **Image-to-Image**: Transform an existing image
- **Inpainting**: Fill masked areas of an image
- **ControlNet**: Use control images to guide generation
- **LoRA**: Apply fine-tuned model adapters


### Example


```python
import ez_diffusion_client
from ez_diffusion_client.models.image_generate_request import ImageGenerateRequest
from ez_diffusion_client.models.image_generation_response import ImageGenerationResponse
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
    api_instance = ez_diffusion_client.ImageGenerationApi(api_client)
    image_generate_request = {"input":{"prompt":"A beautiful landscape with mountains and lakes, highly detailed","negative_prompt":"blurry, low quality","dimensions":[1024,1024],"inference_steps":50,"guidance_scale":7.5,"seed":42}} # ImageGenerateRequest | 

    try:
        # Generate image synchronously
        api_response = api_instance.generate_image(image_generate_request)
        print("The response of ImageGenerationApi->generate_image:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ImageGenerationApi->generate_image: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **image_generate_request** | [**ImageGenerateRequest**](ImageGenerateRequest.md)|  | 

### Return type

[**ImageGenerationResponse**](ImageGenerationResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Image generated successfully |  -  |
**422** | Validation error |  -  |
**500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_image_gen_history**
> ImageGenerationHistoryResponse get_image_gen_history(index=index, length=length)

Get image generation history

### Example


```python
import ez_diffusion_client
from ez_diffusion_client.models.image_generation_history_response import ImageGenerationHistoryResponse
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
    api_instance = ez_diffusion_client.ImageGenerationApi(api_client)
    index = 0 # int | Starting index for pagination (optional) (default to 0)
    length = 10 # int | Number of entries to return (optional) (default to 10)

    try:
        # Get image generation history
        api_response = api_instance.get_image_gen_history(index=index, length=length)
        print("The response of ImageGenerationApi->get_image_gen_history:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ImageGenerationApi->get_image_gen_history: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **index** | **int**| Starting index for pagination | [optional] [default to 0]
 **length** | **int**| Number of entries to return | [optional] [default to 10]

### Return type

[**ImageGenerationHistoryResponse**](ImageGenerationHistoryResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful response |  -  |
**400** | Bad request (e.g., invalid parameters) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **image_to_image**
> ImageGenerationResponse image_to_image(image_generate_request)

Alias of /image-gen with additional validation specific to image-to-image requests

### Example


```python
import ez_diffusion_client
from ez_diffusion_client.models.image_generate_request import ImageGenerateRequest
from ez_diffusion_client.models.image_generation_response import ImageGenerationResponse
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
    api_instance = ez_diffusion_client.ImageGenerationApi(api_client)
    image_generate_request = ez_diffusion_client.ImageGenerateRequest() # ImageGenerateRequest | 

    try:
        # Alias of /image-gen with additional validation specific to image-to-image requests
        api_response = api_instance.image_to_image(image_generate_request)
        print("The response of ImageGenerationApi->image_to_image:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ImageGenerationApi->image_to_image: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **image_generate_request** | [**ImageGenerateRequest**](ImageGenerateRequest.md)|  | 

### Return type

[**ImageGenerationResponse**](ImageGenerationResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Image generated successfully |  -  |
**422** | Validation error |  -  |
**500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **inpaint**
> ImageGenerationResponse inpaint(image_generate_request)

Alias of /image-gen with additional validation specific to inpaint requests

### Example


```python
import ez_diffusion_client
from ez_diffusion_client.models.image_generate_request import ImageGenerateRequest
from ez_diffusion_client.models.image_generation_response import ImageGenerationResponse
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
    api_instance = ez_diffusion_client.ImageGenerationApi(api_client)
    image_generate_request = ez_diffusion_client.ImageGenerateRequest() # ImageGenerateRequest | 

    try:
        # Alias of /image-gen with additional validation specific to inpaint requests
        api_response = api_instance.inpaint(image_generate_request)
        print("The response of ImageGenerationApi->inpaint:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ImageGenerationApi->inpaint: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **image_generate_request** | [**ImageGenerateRequest**](ImageGenerateRequest.md)|  | 

### Return type

[**ImageGenerationResponse**](ImageGenerationResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Image generated successfully |  -  |
**422** | Validation error |  -  |
**500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **text_to_image**
> ImageGenerationResponse text_to_image(image_generate_request)

Alias of /image-gen with additional validation specific to text-to-image requests

### Example


```python
import ez_diffusion_client
from ez_diffusion_client.models.image_generate_request import ImageGenerateRequest
from ez_diffusion_client.models.image_generation_response import ImageGenerationResponse
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
    api_instance = ez_diffusion_client.ImageGenerationApi(api_client)
    image_generate_request = ez_diffusion_client.ImageGenerateRequest() # ImageGenerateRequest | 

    try:
        # Alias of /image-gen with additional validation specific to text-to-image requests
        api_response = api_instance.text_to_image(image_generate_request)
        print("The response of ImageGenerationApi->text_to_image:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ImageGenerationApi->text_to_image: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **image_generate_request** | [**ImageGenerateRequest**](ImageGenerateRequest.md)|  | 

### Return type

[**ImageGenerationResponse**](ImageGenerationResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Image generated successfully |  -  |
**422** | Validation error |  -  |
**500** | Internal server error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

